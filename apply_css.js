const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const tiktokCSS = 
    /* ========================================================================== */
    /*               TIKTOK LIVE INTERACTIVE OVERLAY HUD (NON-INVASIVE)           */
    /* ========================================================================== */
    .tiktok-banner-box {
      position: absolute;
      top: 10px;
      left: 12px;
      right: 12px;
      z-index: 35;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }
    .tiktok-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      background: rgba(9, 14, 28, 0.72);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(250, 204, 21, 0.35);
      border-radius: 30px;
      padding: 4px 14px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }
    .tiktok-channel-tag {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 900;
      font-size: 13px;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 6px;
      letter-spacing: 0.5px;
      text-shadow: 0 0 10px rgba(239,68,68,0.8);
    }
    .tiktok-viewers-pill {
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(56, 189, 248, 0.5);
      border-radius: 20px;
      padding: 2px 10px;
      font-size: 11px;
      font-weight: 800;
      font-family: 'Chakra Petch', sans-serif;
      color: #38bdf8;
      display: flex;
      align-items: center;
      gap: 5px;
      box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
    }
    .tiktok-viewers-pill strong {
      color: #fef08a;
    }
    .tiktok-guide-hint {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 11px;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.9);
      background: rgba(15, 23, 42, 0.65);
      padding: 3px 12px;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      letter-spacing: 0.3px;
      backdrop-filter: blur(8px);
      text-align: center;
    }
    .tiktok-guide-hint strong {
      color: #facc15;
    }

    /* GIFT MULTIPLIER BAR (3-4 QUÀ TẶNG LIVE) */
    .tiktok-gift-bar {
      display: flex;
      gap: 6px;
      justify-content: center;
      width: 100%;
      pointer-events: auto;
    }
    .tiktok-gift-card {
      flex: 1;
      max-width: 96px;
      background: rgba(15, 23, 42, 0.82);
      backdrop-filter: blur(10px);
      border: 1.5px solid rgba(255,255,255,0.15);
      border-radius: 12px;
      padding: 4px 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: all 0.25s ease;
      box-shadow: 0 4px 15px rgba(0,0,0,0.5);
    }
    .tiktok-gift-card:hover {
      transform: translateY(-2px) scale(1.05);
    }
    .tiktok-gift-card.gift-rose {
      border-color: #f43f5e;
      box-shadow: 0 0 14px rgba(244, 63, 94, 0.35);
    }
    .tiktok-gift-card.gift-donut {
      border-color: #c084fc;
      box-shadow: 0 0 14px rgba(192, 132, 252, 0.35);
    }
    .tiktok-gift-card.gift-dragon {
      border-color: #facc15;
      box-shadow: 0 0 14px rgba(250, 204, 21, 0.4);
    }
    .tiktok-gift-card.gift-lion {
      border-color: #ef4444;
      box-shadow: 0 0 14px rgba(239, 68, 68, 0.45);
    }
    .gift-card-icon {
      font-size: 18px;
      line-height: 1.1;
      filter: drop-shadow(0 0 6px rgba(255,255,255,0.4));
    }
    .gift-card-val {
      font-size: 10px;
      font-weight: 800;
      color: #94a3b8;
      font-family: 'Chakra Petch', sans-serif;
    }
    .gift-card-buff {
      font-size: 10px;
      font-weight: 900;
      font-family: 'Chakra Petch', sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .gift-rose .gift-card-buff { color: #fda4af; }
    .gift-donut .gift-card-buff { color: #e9d5ff; }
    .gift-dragon .gift-card-buff { color: #fef08a; }
    .gift-lion .gift-card-buff { color: #fca5a5; }

    /* FLOATING RIGHT LEADERBOARD (BẢNG XẾP HẠNG GỌN GÀNG) */
    .tiktok-leaderboard-hud {
      position: absolute;
      top: 112px;
      right: 12px;
      width: 148px;
      z-index: 30;
      pointer-events: auto;
      background: rgba(10, 15, 30, 0.82);
      backdrop-filter: blur(14px);
      border: 1.5px solid rgba(56, 189, 248, 0.35);
      border-radius: 14px;
      padding: 8px 10px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.6);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
    }
    .tiktok-leaderboard-hud.collapsed {
      transform: translateX(116px);
      opacity: 0.45;
    }
    .tiktok-lb-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: 'Chakra Petch', sans-serif;
      font-size: 11px;
      font-weight: 900;
      color: #facc15;
      letter-spacing: 0.8px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding-bottom: 5px;
      margin-bottom: 6px;
    }
    .tiktok-lb-toggle {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 11px;
      cursor: pointer;
      padding: 0 2px;
    }
    .tiktok-lb-list {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .tiktok-lb-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      font-weight: 700;
      color: #e2e8f0;
      font-family: 'Plus Jakarta Sans', sans-serif;
      line-height: 1.2;
    }
    .tiktok-lb-rank {
      font-family: 'Chakra Petch', sans-serif;
      font-size: 11px;
      font-weight: 900;
      width: 18px;
      flex-shrink: 0;
    }
    .tiktok-lb-row:nth-child(1) .tiktok-lb-rank { color: #facc15; }
    .tiktok-lb-row:nth-child(2) .tiktok-lb-rank { color: #cbd5e1; }
    .tiktok-lb-row:nth-child(3) .tiktok-lb-rank { color: #f97316; }
    .tiktok-lb-info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 4px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      margin: 0 4px;
    }
    .tiktok-lb-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 11px;
    }
    .tiktok-lb-plate {
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(56, 189, 248, 0.5);
      border-radius: 4px;
      font-size: 9px;
      font-weight: 800;
      font-family: 'Chakra Petch', sans-serif;
      padding: 1px 4px;
      color: #38bdf8;
    }
    .tiktok-lb-hp {
      font-family: 'Chakra Petch', sans-serif;
      font-size: 11px;
      font-weight: 800;
      color: #38bdf8;
      flex-shrink: 0;
    }

    /* VIEWER ACTIVITY POPUP NOTIFICATION (GÓC DƯỚI) */
    .tiktok-live-activity-stream {
      position: absolute;
      bottom: 24px;
      left: 12px;
      max-width: 260px;
      z-index: 30;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .tiktok-activity-chip {
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(56, 189, 248, 0.4);
      border-left: 3px solid #38bdf8;
      border-radius: 8px;
      padding: 4px 8px;
      font-size: 10.5px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #e2e8f0;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.5);
      animation: chipFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1), chipFadeOut 0.4s ease 3.6s forwards;
    }
    .tiktok-activity-chip.gift {
      border-color: rgba(250, 204, 21, 0.6);
      border-left-color: #facc15;
    }
    .tiktok-activity-chip.gift strong {
      color: #facc15;
    }
    @keyframes chipFadeIn {
      from { opacity: 0; transform: translateY(10px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes chipFadeOut {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(-8px); }
    }
;

const needle = '.log-navystrike{color:#2dd4bf;font-weight:800;\n                text-shadow:0 0 10px rgba(45,212,191,.6);}';
if (html.includes(needle)) {
  html = html.replace(needle, needle + '\n' + tiktokCSS);
  fs.writeFileSync('public/index.html', html, 'utf8');
  console.log('CSS successfully injected!');
} else {
  console.log('Needle not found!');
}
