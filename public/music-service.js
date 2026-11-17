/* ================================================================== */
/*        MUSIC SERVICE – YOUTUBE PROVINCE ANTHEM SYSTEM             */
/* ================================================================== */
const MusicService = (function(){
  let ytPlayer = null;
  let isApiReady = false;
  let isApiLoading = false;
  let currentSong = null;
  let stopTimer = null;
  let fadeOutTimer = null;
  let isPlaying = false;
  let songsCatalog = [];
  let isMuted = false;
  let playPendingSong = null;

  // Load danh mục 30 bài hát từ file province-music.json
  async function loadCatalog(){
    try {
      const res = await fetch("/province-music.json");
      if(res.ok){
        songsCatalog = await res.json();
        console.log("[MusicService] Loaded " + songsCatalog.length + " province songs from province-music.json");
      }
    } catch(e){
      console.warn("[MusicService] Could not load province-music.json, using fallback", e);
    }
  }
  loadCatalog();
  // Khởi động sẵn YouTube Player ngay khi mở trang để luôn ở trạng thái sẵn sàng
  if(document.readyState === "complete" || document.readyState === "interactive"){
    loadYouTubeIframeApi();
  } else {
    window.addEventListener("DOMContentLoaded", () => loadYouTubeIframeApi());
  }

  // Lắng nghe tương tác đầu tiên của người dùng để mở khóa autoplay cho AudioContext & YouTube Player
  window.addEventListener("pointerdown", function unlockAudioOnFirstClick(){
    if(ytPlayer && typeof ytPlayer.unMute === "function"){
      try { ytPlayer.unMute(); } catch(e){}
    }
    window.removeEventListener("pointerdown", unlockAudioOnFirstClick);
  }, { once: true, passive: true });

  // Nạp thư viện YouTube IFrame Player API
  function loadYouTubeIframeApi(callback){
    if(window.YT && window.YT.Player){
      isApiReady = true;
      if(callback) callback();
      return;
    }
    if(isApiLoading){
      if(callback){
        const checkInterval = setInterval(() => {
          if(isApiReady){
            clearInterval(checkInterval);
            callback();
          }
        }, 100);
      }
      return;
    }
    isApiLoading = true;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    const oldCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function(){
      if(typeof oldCallback === "function") oldCallback();
      initPlayer(callback);
    };
  }

  function initPlayer(onReadyCallback){
    if(ytPlayer){
      isApiReady = true;
      if(onReadyCallback) onReadyCallback();
      return;
    }
    try {
      ytPlayer = new YT.Player("yt-bgm-player", {
        height: "1",
        width: "1",
        videoId: "uIVW6wXh2xo", // Video mặc định
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1
        },
        events: {
          onReady: function(event){
            isApiReady = true;
            event.target.setVolume(85);
            console.log("[MusicService] YouTube Player Ready");
            if(playPendingSong){
              const s = playPendingSong;
              playPendingSong = null;
              doPlaySong(s);
            }
            if(onReadyCallback) onReadyCallback();
          },
          onStateChange: onPlayerStateChange,
          onError: onPlayerError
        }
      });
    } catch(err){
      console.error("[MusicService] Init player error:", err);
    }
  }

  function onPlayerStateChange(event){
    const btn = document.getElementById("btn-music-toggle");
    const bar = document.getElementById("province-music-bar");
    if(event.data === YT.PlayerState.PLAYING){
      isPlaying = true;
      if(btn){
        btn.innerText = "🎶";
        btn.style.borderColor = "#facc15";
        btn.style.boxShadow = "0 0 12px rgba(250, 204, 21, 0.6)";
        btn.title = currentSong ? ("Đang phát: Nhạc vinh danh " + currentSong.provinceName) : "Đang phát nhạc";
      }
      if(bar && currentSong){
        bar.style.display = "flex";
        const titleEl = document.getElementById("province-music-title");
        if(titleEl) titleEl.innerText = "🎵 Đang vinh danh " + currentSong.provinceName.toUpperCase();
      }
      if(typeof window.addWarLog === "function" && currentSong){
        window.addWarLog("▶️ [ÂM THANH] YouTube đang phát thành công nhạc vinh danh " + currentSong.provinceName, "log-info");
      }

      // CHỈ bắt đầu đếm thời lượng dừng & fade-out khi YouTube ĐÃ THỰC SỰ PHÁT (tránh trừ hao lúc video buffer/tải chậm)
      if(currentSong && !currentSong._timersStarted){
        currentSong._timersStarted = true;
        const duration = Number(currentSong.durationSeconds) || 35;
        if(fadeOutTimer){ clearTimeout(fadeOutTimer); fadeOutTimer = null; }
        if(stopTimer){ clearTimeout(stopTimer); stopTimer = null; }

        const fadeDurationMs = Math.min(5000, duration * 1000 * 0.4);
        const fadeStartDelayMs = Math.max(0, (duration * 1000) - fadeDurationMs);
        fadeOutTimer = setTimeout(() => {
          console.log("[MusicService] 5s cuối: Giảm dần âm lượng (fade-out) cho " + currentSong.provinceName);
          fadeVolume(0, fadeDurationMs);
        }, fadeStartDelayMs);

        stopTimer = setTimeout(() => {
          console.log("[MusicService] Đã hết thời lượng (" + duration + "s) cho " + currentSong.provinceName + ", dừng nhạc.");
          stopMusic();
        }, (duration * 1000) + 400);
      }
    } else if(event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED){
      if(event.data === YT.PlayerState.ENDED){
        stopMusic();
      }
    }
  }

  function onPlayerError(event){
    const errCode = event ? event.data : "UNKNOWN";
    const songName = currentSong ? currentSong.provinceName : "Không xác định";
    const videoId = currentSong ? currentSong.youtubeVideoId : "";
    console.warn("[MusicService] YouTube Player LỖI (Mã " + errCode + ") cho bài hát:", currentSong);
    
    // Ghi nhật ký vào War Log chiến trường và gửi lên server
    if(typeof window.addWarLog === "function"){
      window.addWarLog("⚠️ [LỖI NHẠC] Không thể phát nhạc " + songName + " (Mã lỗi YouTube: " + errCode + ", Video: " + videoId + ")", "log-boss");
    }

    const bar = document.getElementById("province-music-bar");
    if(bar){
      bar.style.display = "flex";
      const titleEl = document.getElementById("province-music-title");
      if(titleEl) titleEl.innerHTML = "⚠️ Video bản quyền YouTube hạn chế nhúng. <a href='" + (currentSong ? currentSong.youtubeUrl : "#") + "' target='_blank' style='color:#facc15;text-decoration:underline;'>Xem trên YouTube</a>";
    }
    stopMusic();
  }

  function doPlaySong(config){
    if(!ytPlayer || !isApiReady){
      playPendingSong = config;
      loadYouTubeIframeApi();
      return;
    }

    try {
      currentSong = config;
      const startSec = Number(config.startTimeSeconds) || 0;
      const duration = Number(config.durationSeconds) || 35;
      const endSec = startSec + duration;

      console.log("[MusicService] Playing: " + config.provinceName + " [" + config.youtubeVideoId + "] from " + startSec + "s to " + endSec + "s (35s)");
      if(typeof window.addWarLog === "function"){
        window.addWarLog("🎶 [NHẠC VINH DANH] Bắt đầu phát bài ca chiến thắng " + config.provinceName.toUpperCase() + " (Giây " + startSec + " -> " + endSec + ")", "log-conquer");
      }

      // Tạm dừng bài cũ nếu có
      if(stopTimer){
        clearTimeout(stopTimer);
        stopTimer = null;
      }

      // Đảm bảo không bị mute và đặt âm lượng nền êm ái (35%) trong khi giọng đọc chúc mừng
      if(typeof ytPlayer.unMute === "function"){
        try { ytPlayer.unMute(); } catch(e){}
      }
      setVolume(35);

      // Nạp video theo startSeconds và endSeconds
      if(typeof ytPlayer.loadVideoById === "function"){
        ytPlayer.loadVideoById({
          videoId: config.youtubeVideoId,
          startSeconds: startSec,
          endSeconds: endSec
        });
      } else if(typeof ytPlayer.cueVideoById === "function"){
        ytPlayer.cueVideoById(config.youtubeVideoId, startSec, endSec);
        ytPlayer.playVideo();
      }

      // Tự động giảm dần âm lượng (Fade-out) trong 5 giây cuối trước khi dừng nhạc
      if(fadeOutTimer){
        clearTimeout(fadeOutTimer);
        fadeOutTimer = null;
      }
      const fadeDurationMs = Math.min(5000, duration * 1000 * 0.4);
      const fadeStartDelayMs = Math.max(0, (duration * 1000) - fadeDurationMs);
      fadeOutTimer = setTimeout(() => {
        console.log("[MusicService] 5s cuối: Giảm dần âm lượng (fade-out) cho " + config.provinceName);
        if(typeof window.showMatchFinishPopup === "function") window.showMatchFinishPopup();
        fadeVolume(0, fadeDurationMs);
      }, fadeStartDelayMs);

      // Bộ đếm thời lượng dừng nhạc độc lập
      stopTimer = setTimeout(() => {
        console.log("[MusicService] Đã hết thời lượng (" + duration + "s) cho " + config.provinceName + ", dừng nhạc.");
        stopMusic();
      }, (duration * 1000) + 400);

    } catch(err){
      console.error("[MusicService] Error in doPlaySong:", err);
      stopMusic();
    }
  }

  let localAudioPlayer = null;

  function stopMusic(){
    const hadActiveSong = isPlaying && !!currentSong;
    if(fadeOutTimer){
      clearTimeout(fadeOutTimer);
      fadeOutTimer = null;
    }
    if(stopTimer){
      clearTimeout(stopTimer);
      stopTimer = null;
    }
    if(localAudioPlayer){
      try {
        localAudioPlayer.pause();
        localAudioPlayer.src = "";
      } catch(e){}
      localAudioPlayer = null;
    }
    if(ytPlayer && typeof ytPlayer.stopVideo === "function"){
      try { ytPlayer.stopVideo(); } catch(e){}
    }
    isPlaying = false;
    currentSong = null;
    if(hadActiveSong && typeof window.isVictoryActive === "function" && window.isVictoryActive() && typeof window.showMatchFinishPopup === "function"){
      window.showMatchFinishPopup();
    }

    const btn = document.getElementById("btn-music-toggle");
    if(btn){
      btn.innerText = "🎵";
      btn.style.borderColor = "rgba(56, 189, 248, 0.35)";
      btn.style.boxShadow = "none";
      btn.title = "Bật/Tắt Nhạc Nền";
    }
    const bar = document.getElementById("province-music-bar");
    if(bar) bar.style.display = "none";
  }

  function playLocalAudio(src, config, onEnd){
    stopMusic();
    // Preload only the selected victory track; do not load the whole catalog at startup.
    localAudioPlayer = new Audio();
    localAudioPlayer.preload = "auto";
    localAudioPlayer.src = src;
    localAudioPlayer.load();
    const startSec = Number(config.startTimeSeconds) || 0;
    if(startSec > 0){
      localAudioPlayer.currentTime = startSec;
    }
    currentSong = config;
    isPlaying = true;
    const factor = Number(config.volumeFactor) || 1.0;
    // Bắt đầu từ 2% âm lượng (gần như im lặng) rồi tăng êm dịu lên mức nền
    const startVolPct = (typeof config.initialVolume === 'number') ? config.initialVolume : 0.02;
    localAudioPlayer.volume = startVolPct; // Bắt đầu ở mức siêu nhẹ
    const baseTargetNum = (typeof config.targetBaseVolume === 'number') ? config.targetBaseVolume : 25;
    const targetBaseVol = Math.round(baseTargetNum * factor);
    // Tăng âm lượng rõ dần mượt mà theo đường cong (mặc định 3.5s - 4.5s)
    const introFadeMs = Number(config.fadeInMs) || 3500;
    fadeVolume(targetBaseVol, introFadeMs);

    const btn = document.getElementById("btn-music-toggle");
    const bar = document.getElementById("province-music-bar");
    if(btn){
      btn.innerText = "🎶";
      btn.style.borderColor = "#facc15";
      btn.style.boxShadow = "0 0 12px rgba(250, 204, 21, 0.6)";
      btn.title = "Đang phát: Nhạc vinh danh " + config.provinceName;
    }
    if(bar){
      bar.style.display = "flex";
      const titleEl = document.getElementById("province-music-title");
      if(titleEl) titleEl.innerText = "🎵 Đang vinh danh " + config.provinceName.toUpperCase() + " (35s)";
    }
    if(typeof window.addWarLog === "function"){
      window.addWarLog("🎶 [NHẠC VINH DANH] Phát file bài ca chiến thắng cục bộ cho " + config.provinceName.toUpperCase(), "log-conquer");
    }

    localAudioPlayer.play().catch(e => {
      console.warn("[MusicService] Local audio autoplay error, falling back to YouTube:", e);
      if(ytPlayer && config.youtubeVideoId){
        doPlaySong(config);
      }
    });

    const configDuration = Number(config.durationSeconds) || 35;

    // Tính toán thời điểm fade-out chính xác dựa trên độ dài thực tế của file âm thanh
    function scheduleLocalFadeOut(actualDuration){
      const effectiveDuration = Math.min(configDuration, actualDuration);
      const fadeDurationSec = Math.min(5, effectiveDuration * 0.35); // Giảm dần trong 4-5s cuối
      const fadeStartDelay = Math.max(0, effectiveDuration - fadeDurationSec);

      if(fadeOutTimer){
        clearTimeout(fadeOutTimer);
        fadeOutTimer = null;
      }
      fadeOutTimer = setTimeout(() => {
        console.log("[MusicService] 5s cuối: Bắt đầu giảm dần âm lượng êm ái (fade-out) cho " + config.provinceName);
        if(typeof window.showMatchFinishPopup === "function") window.showMatchFinishPopup();
        fadeVolume(0, fadeDurationSec * 1000);
      }, fadeStartDelay * 1000);

      if(stopTimer){
        clearTimeout(stopTimer);
        stopTimer = null;
      }
      stopTimer = setTimeout(() => {
        console.log("[MusicService] Hết thời lượng bài hát: Dừng nhạc vinh danh cho " + config.provinceName);
        stopMusic();
        if(onEnd) onEnd();
      }, (effectiveDuration * 1000) + 300);
    }

    localAudioPlayer.addEventListener('loadedmetadata', () => {
      if(localAudioPlayer && localAudioPlayer.duration && !isNaN(localAudioPlayer.duration)){
        scheduleLocalFadeOut(localAudioPlayer.duration);
      }
    }, { once: true });

    // Fallback nếu loadedmetadata đã kích hoạt trước đó
    scheduleLocalFadeOut(configDuration);

    localAudioPlayer.onended = () => {
      stopMusic();
      if(onEnd) onEnd();
    };
  }

  function playProvinceMusic(provinceId){
    if(!provinceId) return false;
    const cleanId = String(provinceId).toLowerCase().trim();

    // Tìm cấu hình bài hát theo provinceId hoặc aliasProvinceId
    let found = songsCatalog.find(s => 
      s.provinceId === cleanId || 
      (s.aliasProvinceId && s.aliasProvinceId === cleanId) ||
      (s.provinceName && s.provinceName.toLowerCase() === cleanId)
    );

    // Fallback nếu tỉnh chưa có bài cấu hình riêng trong danh mục 30 bài: Dùng bài Quốc Gia Hào Khí Việt Nam (video độc lập, KHÔNG lấy ID bài An Giang)
    if(!found){
      const pObj = (typeof provinces !== 'undefined') ? provinces.find(p => p.id === cleanId) : null;
      const pName = pObj ? pObj.name : provinceId.toUpperCase();
      found = {
        provinceId: cleanId,
        provinceName: pName,
        youtubeVideoId: "P_z_y36wJyo", // Video Hào Khí Việt Nam (bản hùng tráng kỷ niệm quốc gia)
        youtubeUrl: "https://www.youtube.com/watch?v=P_z_y36wJyo",
        startTimeSeconds: 10,
        durationSeconds: 35,
        isFallback: true
      };
      console.log("[MusicService] Tỉnh " + cleanId + " (" + pName + ") dùng bài ca Hào Khí Việt Nam vinh danh thống nhất non sông");
    }

    currentSong = found;
    // Ưu tiên phát file âm thanh cục bộ tức thì nếu đã có cấu hình (tránh phụ thuộc YouTube buffer)
    if(found.localAudioUrl){
      console.log("[MusicService] Phát ngay lập tức qua file âm thanh cục bộ:", found.localAudioUrl);
      playLocalAudio(found.localAudioUrl, found);
      return true;
    }

    // Nếu chưa có file cục bộ -> Phát qua YouTube Player
    if(!isApiReady || !ytPlayer){
      playPendingSong = found;
      loadYouTubeIframeApi();
    } else {
      doPlaySong(found);
    }

    return true;
  }

  function setVolume(vol){
    if(ytPlayer && typeof ytPlayer.setVolume === "function"){
      try { ytPlayer.setVolume(Math.max(0, Math.min(100, vol))); } catch(e){}
    }
  }

  let activeFadeInterval = null;

  function fadeVolume(targetVol, durationMs = 1200){
    if(activeFadeInterval){
      clearInterval(activeFadeInterval);
      activeFadeInterval = null;
    }
    const factor = (currentSong && Number(currentSong.volumeFactor)) || 1.0;
    const adjustedVol = targetVol === 0 ? 0 : Math.round(targetVol * factor);
    const targetPct = Math.max(0, Math.min(100, adjustedVol)) / 100;
    if(localAudioPlayer){
      try {
        const start = localAudioPlayer.volume;
        const diff = targetPct - start;
        const steps = 30; // 30 bước chuyển âm lượng cực mượt
        const stepTime = Math.max(20, Math.floor(durationMs / steps));
        let s = 0;
        activeFadeInterval = setInterval(() => {
          s++;
          const progress = s / steps;
          const eased = progress * (2 - progress); // Ease-out mượt mà
          if(localAudioPlayer){
            localAudioPlayer.volume = Math.max(0, Math.min(1, start + diff * eased));
          }
          if(s >= steps){
            clearInterval(activeFadeInterval);
            activeFadeInterval = null;
            if(localAudioPlayer) localAudioPlayer.volume = targetPct;
          }
        }, stepTime);
      } catch(e){}
      return;
    }

    if(!ytPlayer || typeof ytPlayer.setVolume !== "function") return;
    try {
      const startVol = (typeof ytPlayer.getVolume === "function" ? ytPlayer.getVolume() : 35) || 35;
      const steps = 8;
      const stepTime = durationMs / steps;
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const vol = Math.round(startVol + (targetVol - startVol) * (currentStep / steps));
        setVolume(vol);
        if(currentStep >= steps){
          clearInterval(timer);
          setVolume(targetVol);
        }
      }, stepTime);
    } catch(e){}
  }



  function toggleMusic(){
    if(isPlaying){
      stopMusic();
    } else {
      if(currentSong){
        doPlaySong(currentSong);
      } else if(songsCatalog.length > 0){
        // Mặc định phát bài đầu tiên (An Giang)
        doPlaySong(songsCatalog[0]);
      } else {
        loadYouTubeIframeApi();
      }
    }
  }

  return {
    PlayProvinceMusic: playProvinceMusic,
    playProvinceMusic: playProvinceMusic,
    StopMusic: stopMusic,
    stopMusic: stopMusic,
    toggleMusic: toggleMusic,
    init: loadYouTubeIframeApi,
    getCatalog: () => songsCatalog,
    getCurrentSong: () => currentSong,
    isPlaying: () => isPlaying,
    setVolume: setVolume,
    fadeVolume: fadeVolume
  };
})();

window.MusicService = MusicService;
