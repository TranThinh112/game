const express = require('express');
const http = require('http');
const { Server } = require('ws');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new Server({ server });

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  next();
});
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Endpoint proxy phát âm tiếng Việt chuẩn Google TTS (100% tiếng Việt, không bị chặn CORS)
// Endpoint proxy phát âm tiếng Việt chuẩn Google TTS (tự động chia chunk nếu câu dài > 180 ký tự)
app.get('/api/tts', async (req, res) => {
  let text = (req.query.text || '').trim();
  if (!text) return res.status(400).send('No text provided');
  
  const https = require('https');

  // Phân chia thành các đoạn nhỏ dưới 180 ký tự theo dấu chấm / phẩy / khoảng trắng
  function splitText(str, maxLen = 170) {
    if (str.length <= maxLen) return [str];
    const parts = [];
    let cur = '';
    const tokens = str.split(/([,.;!?]+|\s+)/);
    for (const tok of tokens) {
      if ((cur + tok).length > maxLen) {
        if (cur.trim()) parts.push(cur.trim());
        cur = tok;
      } else {
        cur += tok;
      }
    }
    if (cur.trim()) parts.push(cur.trim());
    return parts.length > 0 ? parts : [str.slice(0, maxLen)];
  }

  const chunks = splitText(text, 170);

  function fetchAudioChunk(part) {
    return new Promise((resolve, reject) => {
      const url = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=' + encodeURIComponent(part);
      https.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }, (proxyRes) => {
        if (proxyRes.statusCode !== 200) {
          return reject(new Error('Google TTS returned ' + proxyRes.statusCode));
        }
        const data = [];
        proxyRes.on('data', chunk => data.push(chunk));
        proxyRes.on('end', () => resolve(Buffer.concat(data)));
      }).on('error', reject);
    });
  }

  try {
    const buffers = [];
    for (const c of chunks) {
      const buf = await fetchAudioChunk(c);
      buffers.push(buf);
    }
    const combined = Buffer.concat(buffers);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', combined.length);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(combined);
  } catch(err) {
    console.error('[TTS Proxy Error]:', err.message);
    res.status(500).send('TTS Error');
  }
});


function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(msg);
    }
  });
}

// ==================================================================
// HỆ THỐNG MATCH ID & LƯU TRỮ LOG TỪNG TRẬN
// ==================================================================
function generateMatchId() {
  // Match IDs are short and easy to read aloud: V + four digits.
  let id;
  do {
    id = 'V' + String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  } while (false);
  return id;
}

let currentMatchId = generateMatchId();
let currentMatchStartTime = Date.now();

// Map lưu trữ log theo từng matchId
const matchLogsMap = new Map();
matchLogsMap.set(currentMatchId, {
  matchId: currentMatchId,
  startTime: currentMatchStartTime,
  endTime: null,
  winner: null,
  logs: []
});

let liveMatchLogs = [];

// API lấy Match ID hiện tại
app.get('/api/match/current', (req, res) => {
  res.json({
    matchId: currentMatchId,
    startTime: currentMatchStartTime,
    startDateStr: new Date(currentMatchStartTime).toLocaleString('vi-VN', { timeZone: 'Asia/Saigon' })
  });
});

// API khởi tạo trận mới
app.post('/api/match/start', (req, res) => {
  currentMatchId = generateMatchId();
  currentMatchStartTime = Date.now();
  liveMatchLogs = [];
  matchLogsMap.set(currentMatchId, {
    matchId: currentMatchId,
    startTime: currentMatchStartTime,
    endTime: null,
    winner: null,
    logs: []
  });
  broadcast({ event: 'match_started', matchId: currentMatchId });
  console.log('[MATCH] Trận mới bắt đầu:', currentMatchId);
  res.json({ success: true, matchId: currentMatchId, startTime: currentMatchStartTime });
});

// API lấy log của một trận cụ thể theo matchId
app.get('/api/match/:id/logs', (req, res) => {
  const mid = req.params.id;
  const matchData = matchLogsMap.get(mid);
  if (!matchData) {
    return res.status(404).json({ error: 'Không tìm thấy trận đấu ' + mid });
  }
  res.json(matchData);
});

// API danh sách các trận đã lưu log
app.get('/api/match/list', (req, res) => {
  const list = [];
  matchLogsMap.forEach((val, key) => {
    list.push({
      matchId: key,
      startTime: val.startTime,
      endTime: val.endTime,
      logCount: val.logs.length,
      winner: val.winner
    });
  });
  list.sort((a, b) => b.startTime - a.startTime);
  res.json({ matches: list, total: list.length });
});

app.post('/api/log', (req, res) => {
  const { text, className, time, matchId } = req.body;
  const mid = matchId || currentMatchId;
  if (text) {
    const logItem = {
      matchId: mid,
      time: time || new Date().toTimeString().substr(0, 8),
      text,
      className: className || '',
      timestamp: Date.now()
    };
    liveMatchLogs.push(logItem);
    if (liveMatchLogs.length > 1000) liveMatchLogs.shift();

    if (!matchLogsMap.has(mid)) {
      matchLogsMap.set(mid, {
        matchId: mid,
        startTime: Date.now(),
        endTime: null,
        winner: null,
        logs: []
      });
    }
    const cur = matchLogsMap.get(mid);
    cur.logs.push(logItem);
    if (cur.logs.length > 2500) cur.logs.shift();
  }
  res.json({ success: true, count: liveMatchLogs.length, matchId: mid });
});

app.get('/api/logs', (req, res) => {
  const mid = req.query.matchId || currentMatchId;
  const matchData = matchLogsMap.get(mid);
  res.json({
    logs: matchData ? matchData.logs : liveMatchLogs,
    total: matchData ? matchData.logs.length : liveMatchLogs.length,
    matchId: mid
  });
});

app.post('/api/logs/reset', (req, res) => {
  liveMatchLogs = [];
  if (matchLogsMap.has(currentMatchId)) {
    matchLogsMap.get(currentMatchId).logs = [];
  }
  res.json({ success: true });
});

app.post('/api/action', (req, res) => {
  const { user, provinceId, sourceProvinceId, type, giftValue, comment, attackType, sessionId } = req.body;
  broadcast({
    event: 'action',
    data: {
      id: Date.now() + Math.random().toString(36).substr(2, 5),
      user: user || 'Khách Ẩn Danh',
      provinceId: provinceId || null,
      sourceProvinceId: sourceProvinceId || null,
      type: type || 'comment',
      giftValue: Number(giftValue) || 1,
      comment: comment || '',
      attackType: attackType || null,
      sessionId: sessionId === 'pentest' ? 'pentest' : 'main-battle',
      timestamp: Date.now()
    }
  });
  res.json({ success: true });
});


// ==================================================================
// HỆ THỐNG DATABASE LƯU TRỮ LỊCH SỬ TRẬN ĐẤU (PERSISTENT DATABASE)
// ==================================================================
const MATCH_DB_FILE = path.join(__dirname, "match_history.json");

function loadMatchHistory() {
  try {
    if (fs.existsSync(MATCH_DB_FILE)) {
      const data = fs.readFileSync(MATCH_DB_FILE, "utf8");
      return JSON.parse(data) || [];
    }
  } catch (err) {
    console.error("[MATCH_DB] Error loading database:", err.message);
  }
  return [];
}

function saveMatchHistory(history) {
  try {
    fs.writeFileSync(MATCH_DB_FILE, JSON.stringify(history, null, 2), "utf8");
  } catch (err) {
    console.error("[MATCH_DB] Error saving database:", err.message);
  }
}

// API: Lay lich su va bang xep hang tran dau tu Database
app.get("/api/matches", (req, res) => {
  const history = loadMatchHistory();
  
  // Tinh toan thong ke so lan vo dich cua tung tinh
  const winCounts = {};
  history.forEach(m => {
    const name = m.winnerName || "Khong xac dinh";
    if (!winCounts[name]) {
      winCounts[name] = {
        name: name,
        plate: m.winnerPlate || "",
        color: m.color || "#facc15",
        wins: 0
      };
    }
    winCounts[name].wins += 1;
  });

  const leaderboards = Object.values(winCounts).sort((a, b) => b.wins - a.wins);

  res.json({
    history: history,
    leaderboards: leaderboards,
    totalMatches: history.length
  });
});

// API: Ghi nhan ket qua tran dau moi vao Database
app.post("/api/matches", (req, res) => {
  const { winnerName, winnerPlate, color, mapId } = req.body;
  if (!winnerName) return res.status(400).json({ error: "winnerName is required" });

  const history = loadMatchHistory();
  const matchId = req.body.matchId || currentMatchId || ("V" + String((history.length + 1) % 10000).padStart(4, "0"));
  if (matchLogsMap.has(matchId)) {
    const curMatch = matchLogsMap.get(matchId);
    curMatch.endTime = Date.now();
    curMatch.winner = { winnerName, winnerPlate, color };
  }
  
  const newMatch = {
    matchId: matchId,
    winnerName: winnerName,
    winnerPlate: winnerPlate || "",
    color: color || "#facc15",
    mapId: mapId || "vietnam_63",
    timestamp: Date.now(),
    dateStr: new Date().toLocaleString("vi-VN", { timeZone: "Asia/Saigon" })
  };

  // Idempotent victory recording: one history row per match ID.
  const existingIndex = history.findIndex(item => item.matchId === matchId);
  if (existingIndex >= 0) {
    history[existingIndex] = { ...history[existingIndex], ...newMatch };
  } else {
    history.unshift(newMatch);
  }
  saveMatchHistory(history);

  console.log("[MATCH_DB] Da luu ket qua duy nhat:", matchId, winnerName);
  res.json({ success: true, match: newMatch, totalMatches: history.length });
});

// API: Reset Database (khi can don dep sach se)
app.post("/api/matches/reset", (req, res) => {
  saveMatchHistory([]);
  res.json({ success: true, message: "Database da duoc reset ve 0 tran" });
});

wss.on('connection', (ws) => {
  console.log('[WS] Client connected to War Room');
  ws.send(JSON.stringify({ event: 'connected', message: 'Connected to 63 Provinces Battle' }));
});

const PORT = 5050;
server.listen(PORT, () => {
  console.log("[SERVER] Running at http://localhost:" + PORT);
});


