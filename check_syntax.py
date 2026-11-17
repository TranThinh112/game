import sys
with open('public/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Check unclosed tags or syntax
print('HTML Length:', len(html))
print('Has tiktok-banner-box:', 'tiktok-banner-box' in html)
print('Has tiktok-leaderboard-hud:', 'tiktok-leaderboard-hud' in html)
print('Has toggleTikTokLeaderboard:', 'toggleTikTokLeaderboard' in html)
print('Has updateTikTokHUD:', 'updateTikTokHUD' in html)
print('Has showTikTokActivity:', 'showTikTokActivity' in html)
