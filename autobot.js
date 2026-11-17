const axios = require('http');

const users = {
  bac: [
    'Tuấn Hà Nội (29)', 'Linh Hải Phòng (15)', 'Đức Quảng Ninh (14)', 
    'Nam Định 18 Pro', 'Hưng Yên Phố Hiến', 'Bắc Ninh Quan Họ', 
    'Thái Nguyên Chè', 'Hà Giang 23 Cực Bắc', 'Phú Thọ Đất Tổ', 'Thái Bình Quê Lúa'
  ],
  trung: [
    'Thành Đà Nẵng (43)', 'Nghệ An 37 Bất Bại', 'Hà Tĩnh 38 Cày Cuốc', 
    'Huế Mộng Mơ (75)', 'Quảng Nam 92 Chiến', 'Khánh Hòa Nha Trang', 
    'Bình Định Võ Cổ Truyền', 'Quảng Bình Phong Nha', 'Gia Lai Phố Núi', 'Đắk Lắk Ban Mê'
  ],
  nam: [
    'Sài Gòn Quận 1 (51)', 'Bình Dương 61 Khét', 'Đồng Nai 60 Rực Lửa', 
    'Cần Thơ Gạo Trắng', 'An Giang Thất Sơn', 'Kiên Giang Phú Quốc', 
    'Tiền Giang Mỹ Tho', 'Vũng Tàu Biển Xanh (72)', 'Tây Ninh Núi Bà', 'Cà Mau Đất Mũi'
  ]
};

const factions = ['bac', 'trung', 'nam'];
let count = 0;
const totalDurationMs = 5 * 60 * 1000; // 5 phút
const startTime = Date.now();

console.log('[AUTO BOT] Bắt đầu đẩy dữ liệu tự động liên tục trong 5 phút...');

const interval = setInterval(() => {
  if (Date.now() - startTime > totalDurationMs) {
    clearInterval(interval);
    console.log('[AUTO BOT] Đã hoàn thành 5 phút mô phỏng!');
    return;
  }

  const faction = factions[Math.floor(Math.random() * factions.length)];
  const nameList = users[faction];
  const user = nameList[Math.floor(Math.random() * nameList.length)];
  
  // 18% cơ hội là quà tặng (Gift), còn lại là comment
  const isGift = Math.random() < 0.18;
  const isBigGift = isGift && Math.random() < 0.2; // 20% trong quà tặng là quà lớn (Boss)

  let type = isGift ? 'gift' : 'comment';
  let giftValue = isBigGift ? 100 : (isGift ? 1 : 0);
  let comment = '';

  if (isBigGift) {
    comment = '🚀 Ném Tên Lửa Khổng Lồ trợ chiến phe ' + (faction === 'bac' ? 'Bắc' : (faction === 'trung' ? 'Trung' : 'Nam')) + '!';
  } else if (isGift) {
    comment = '🌹 Tặng Hoa Hồng triệu hồi Kỵ Binh!';
  } else {
    const comments = [
      'Tiến lên anh em ơi!', 'Bắc Trung Nam sum họp!', 'Phe mình vô địch!',
      'Quét sạch đối thủ!', 'Giữ vững thành trì!', 'Bấm tim mạnh lên!'
    ];
    comment = comments[Math.floor(Math.random() * comments.length)];
  }

  const postData = JSON.stringify({
    user: user,
    faction: faction,
    type: type,
    giftValue: giftValue,
    comment: comment
  });

  const req = axios.request({
    hostname: 'localhost',
    port: 5050,
    path: '/api/action',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }, (res) => {});

  req.on('error', (e) => {});
  req.write(postData);
  req.end();

  count++;
  if (count % 30 === 0) {
    console.log(`[AUTO BOT] Đã bắn ${count} sự kiện... (${Math.round((Date.now() - startTime) / 1000)}s)`);
  }
}, 350); // Mỗi 350ms bắn 1 người comment/tặng quà -> Rất sôi động
