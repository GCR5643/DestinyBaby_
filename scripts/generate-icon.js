const { createCanvas } = require('canvas');
const fs = require('fs');

// 512x512 앱 아이콘 생성
const size = 512;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

// 배경 그라데이션 (보라 → 핑크)
const gradient = ctx.createLinearGradient(0, 0, size, size);
gradient.addColorStop(0, '#6C5CE7');
gradient.addColorStop(0.5, '#8B7CF7');
gradient.addColorStop(1, '#FFB8C6');

// 둥근 사각형 배경
ctx.beginPath();
const radius = 100;
ctx.moveTo(radius, 0);
ctx.lineTo(size - radius, 0);
ctx.quadraticCurveTo(size, 0, size, radius);
ctx.lineTo(size, size - radius);
ctx.quadraticCurveTo(size, size, size - radius, size);
ctx.lineTo(radius, size);
ctx.quadraticCurveTo(0, size, 0, size - radius);
ctx.lineTo(0, radius);
ctx.quadraticCurveTo(0, 0, radius, 0);
ctx.closePath();
ctx.fillStyle = gradient;
ctx.fill();

// 별 이모지 ✨ 대체 - 별 모양 그리기
ctx.fillStyle = '#F9CA24';
ctx.shadowColor = 'rgba(249, 202, 36, 0.5)';
ctx.shadowBlur = 30;

function drawStar(cx, cy, outerR, innerR, points) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI * i) / points - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

// 큰 별
drawStar(256, 180, 60, 25, 4);
// 작은 별들
ctx.fillStyle = '#FFFFFF';
ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
ctx.shadowBlur = 15;
drawStar(150, 130, 20, 8, 4);
drawStar(370, 150, 15, 6, 4);
drawStar(320, 100, 12, 5, 4);

// 텍스트 "운명의 아이"
ctx.shadowColor = 'transparent';
ctx.shadowBlur = 0;
ctx.fillStyle = '#FFFFFF';
ctx.font = 'bold 72px "Apple SD Gothic Neo", sans-serif';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('운명의', 256, 310);
ctx.fillText('아이', 256, 400);

// 하단 작은 텍스트
ctx.font = '28px "Apple SD Gothic Neo", sans-serif';
ctx.fillStyle = 'rgba(255,255,255,0.7)';
ctx.fillText('AI 사주 작명', 256, 460);

// PNG로 저장
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('/Users/geonchanrhee/Desktop/destiny-baby/public/app-icon.png', buffer);
console.log('✅ 앱 아이콘 생성 완료: public/app-icon.png (512x512)');
