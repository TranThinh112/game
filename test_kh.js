const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const pIdx = html.indexOf('VN_PROVINCE_POLYGONS');
const kIdx = html.indexOf('\ khanh_hoa\:[', pIdx);
const nextIdx = html.indexOf(',\ninh_thuan\:', kIdx);
const khStr = html.slice(kIdx + '\khanh_hoa\:'.length, nextIdx);
const rings = JSON.parse(khStr);
console.log('rings count:', rings.length);
rings.forEach((r, i) => {
  const avgLon = r.reduce((a, b) => a + b[0], 0) / r.length;
  const avgLat = r.reduce((a, b) => a + b[1], 0) / r.length;
  console.log('Ring', i, 'pts:', r.length, 'lon:', avgLon.toFixed(2), 'lat:', avgLat.toFixed(2));
});
