// Generates Lumi's app icons: a white four-point sparkle on an indigo->violet gradient.
// Run with:  node make-icons.js
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); t[n] = c >>> 0; }
  return (buf) => { let c = 0xFFFFFFFF; for (let i = 0; i < buf.length; i++) c = t[(c ^ buf[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
})();

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(CRC(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePNG(W, H, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc(H * (1 + W * 4));
  for (let y = 0; y < H; y++) { raw[y * (1 + W * 4)] = 0; rgba.copy(raw, y * (1 + W * 4) + 1, y * W * 4, (y + 1) * W * 4); }
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

// Four-point sparkle: |x/a|^k + |y/a|^k <= 1 with k < 1 gives concave (star-like) arms.
function sparkle(dx, dy, r, k) {
  const ax = Math.abs(dx) / r, ay = Math.abs(dy) / r;
  return Math.pow(ax, k) + Math.pow(ay, k) <= 1;
}

function makeIcon(size, file) {
  const W = size, H = size, cx = W / 2, cy = H / 2;
  const big = W * 0.40, small = W * 0.13;
  const rgba = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      // diagonal gradient: indigo #5b6cff -> violet #8b5cf6
      const t = Math.min(1, Math.max(0, (x / W + y / H) / 2));
      let R = Math.round(91 + (139 - 91) * t);
      let G = Math.round(108 + (92 - 108) * t);
      let B = Math.round(255 + (246 - 255) * t);
      const dx = x - cx, dy = y - cy;
      // main sparkle
      if (sparkle(dx, dy, big, 0.55)) { R = 255; G = 255; B = 255; }
      // small accent sparkle, upper right
      const sx = x - (cx + W * 0.27), sy = y - (cy - H * 0.27);
      if (sparkle(sx, sy, small, 0.55)) { R = 255; G = 236; B = 170; }
      rgba[i] = R; rgba[i + 1] = G; rgba[i + 2] = B; rgba[i + 3] = 255;
    }
  }
  fs.writeFileSync(path.join(__dirname, file), encodePNG(W, H, rgba));
  console.log('wrote', file, size + 'x' + size);
}

makeIcon(512, 'icon-512.png');
makeIcon(192, 'icon-192.png');
makeIcon(180, 'apple-touch-icon.png');
