with open('public/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Update CSS top for banner-box and top-row
css_fix = '''
    .tiktok-banner-box {
      position: absolute;
      top: 54px;
      left: 10px;
      right: 10px;
      z-index: 35;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
    }
    .tiktok-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      background: rgba(9, 14, 28, 0.88);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(250, 204, 21, 0.45);
      border-radius: 20px;
      padding: 3px 10px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.6);
    }
    .tiktok-channel-tag {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 900;
      font-size: 11px;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 5px;
      letter-spacing: 0.5px;
      text-shadow: 0 0 10px rgba(239,68,68,0.8);
    }
    .tiktok-viewers-pill {
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(56, 189, 248, 0.6);
      border-radius: 14px;
      padding: 1px 8px;
      font-size: 10px;
      font-weight: 800;
      font-family: 'Chakra Petch', sans-serif;
      color: #38bdf8;
      display: flex;
      align-items: center;
      gap: 4px;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
    }
    .tiktok-viewers-pill strong {
      color: #fef08a;
    }
    .tiktok-guide-hint {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 10px;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.92);
      background: rgba(15, 23, 42, 0.75);
      padding: 2px 10px;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      letter-spacing: 0.2px;
      backdrop-filter: blur(8px);
      text-align: center;
    }
    .tiktok-guide-hint strong {
      color: #facc15;
    }

    /* GIFT MULTIPLIER BAR (3-4 QUÀ TẶNG LIVE) */
    .tiktok-gift-bar {
      display: flex;
      gap: 5px;
      justify-content: center;
      width: 100%;
      pointer-events: auto;
    }
    .tiktok-gift-card {
      flex: 1;
      max-width: 80px;
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(10px);
      border: 1.5px solid rgba(255,255,255,0.15);
      border-radius: 10px;
      padding: 3px 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 14px rgba(0,0,0,0.5);
    }
    .tiktok-gift-card:hover {
      transform: translateY(-2px) scale(1.05);
    }
    .tiktok-gift-card.gift-rose {
      border-color: #f43f5e;
      box-shadow: 0 0 12px rgba(244, 63, 94, 0.35);
    }
    .tiktok-gift-card.gift-donut {
      border-color: #c084fc;
      box-shadow: 0 0 12px rgba(192, 132, 252, 0.35);
    }
    .tiktok-gift-card.gift-dragon {
      border-color: #facc15;
      box-shadow: 0 0 12px rgba(250, 204, 21, 0.4);
    }
    .tiktok-gift-card.gift-lion {
      border-color: #ef4444;
      box-shadow: 0 0 12px rgba(239, 68, 68, 0.45);
    }
    .gift-card-icon {
      font-size: 15px;
      line-height: 1.1;
      filter: drop-shadow(0 0 5px rgba(255,255,255,0.4));
    }
    .gift-card-val {
      font-size: 9px;
      font-weight: 800;
      color: #94a3b8;
      font-family: 'Chakra Petch', sans-serif;
    }
    .gift-card-buff {
      font-size: 9px;
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
      top: 150px;
      right: 8px;
      width: 126px;
      z-index: 30;
      pointer-events: auto;
      background: rgba(10, 15, 30, 0.88);
      backdrop-filter: blur(14px);
      border: 1.5px solid rgba(56, 189, 248, 0.35);
      border-radius: 12px;
      padding: 6px 8px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.6);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
    }
    .tiktok-leaderboard-hud.collapsed {
      transform: translateX(98px);
      opacity: 0.45;
    }
    .tiktok-lb-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: 'Chakra Petch', sans-serif;
      font-size: 10px;
      font-weight: 900;
      color: #facc15;
      letter-spacing: 0.8px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding-bottom: 4px;
      margin-bottom: 5px;
    }
    .tiktok-lb-toggle {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 10px;
      cursor: pointer;
      padding: 0 2px;
    }
    .tiktok-lb-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .tiktok-lb-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 10px;
      font-weight: 700;
      color: #e2e8f0;
      font-family: 'Plus Jakarta Sans', sans-serif;
      line-height: 1.2;
    }
    .tiktok-lb-rank {
      font-family: 'Chakra Petch', sans-serif;
      font-size: 10px;
      font-weight: 900;
      width: 15px;
      flex-shrink: 0;
    }
    .tiktok-lb-row:nth-child(1) .tiktok-lb-rank { color: #facc15; }
    .tiktok-lb-row:nth-child(2) .tiktok-lb-rank { color: #cbd5e1; }
    .tiktok-lb-row:nth-child(3) .tiktok-lb-rank { color: #f97316; }
    .tiktok-lb-info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 3px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      margin: 0 3px;
    }
    .tiktok-lb-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 10px;
    }
    .tiktok-lb-plate {
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(56, 189, 248, 0.5);
      border-radius: 4px;
      font-size: 8.5px;
      font-weight: 800;
      font-family: 'Chakra Petch', sans-serif;
      padding: 1px 3px;
      color: #38bdf8;
    }
    .tiktok-lb-hp {
      font-family: 'Chakra Petch', sans-serif;
      font-size: 10px;
      font-weight: 800;
      color: #38bdf8;
      flex-shrink: 0;
    }
'''

start_css = html.find('.tiktok-banner-box {')
end_css = html.find('/* VIEWER ACTIVITY POPUP NOTIFICATION')
if start_css != -1 and end_css != -1:
    html = html[:start_css] + css_fix + '\n' + html[end_css:]
    with open('public/index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print('CSS adjusted perfectly!')
else:
    print('Could not find CSS boundaries!')
