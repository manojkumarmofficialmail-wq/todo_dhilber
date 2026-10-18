// Draws the app icons (indigo-violet gradient with a white checkmark) as PNGs
// without any image library. Run with: node scripts/generate-icons.mjs
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';

const OUT = new URL('../public/icons/', import.meta.url);
mkdirSync(OUT, { recursive: true });

const FROM = [99, 102, 241]; // #6366f1
const TO = [124, 58, 237]; // #7c3aed

function crc32(buf) {
  let c = ~0;
  for (const byte of buf) {
    c ^= byte;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePNG(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // no filter
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}

/**
 * rounded: corner radius as a fraction of size (0 = full square, for maskable/iOS icons).
 * checkScale: how large the checkmark is relative to the icon.
 */
function drawIcon(size, { rounded, checkScale }) {
  const px = Buffer.alloc(size * size * 4);
  const r = rounded * size;
  const c = size / 2;
  const s = size * checkScale;
  const pts = [
    [c - 0.3 * s, c + 0.02 * s],
    [c - 0.08 * s, c + 0.24 * s],
    [c + 0.32 * s, c - 0.2 * s],
  ];
  const half = 0.055 * s;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const fx = x + 0.5;
      const fy = y + 0.5;
      // Coverage of the rounded square, antialiased over one pixel.
      let bg = 1;
      if (r > 0) {
        const qx = Math.max(Math.abs(fx - c) - (c - r), 0);
        const qy = Math.max(Math.abs(fy - c) - (c - r), 0);
        bg = Math.max(0, Math.min(1, r - Math.hypot(qx, qy) + 0.5));
      }
      const t = (fx + fy) / (2 * size);
      const base = FROM.map((v, i) => v + (TO[i] - v) * t);
      const d = Math.min(
        distToSegment(fx, fy, ...pts[0], ...pts[1]),
        distToSegment(fx, fy, ...pts[1], ...pts[2]),
      );
      const check = Math.max(0, Math.min(1, half - d + 0.5));
      const i = (y * size + x) * 4;
      for (let k = 0; k < 3; k++) px[i + k] = Math.round(base[k] + (255 - base[k]) * check);
      px[i + 3] = Math.round(255 * bg);
    }
  }
  return encodePNG(size, px);
}

const icons = [
  ['icon-192.png', 192, { rounded: 0.22, checkScale: 1 }],
  ['icon-512.png', 512, { rounded: 0.22, checkScale: 1 }],
  // Maskable icons get cropped to a circle/squircle, so keep the check inside the safe zone.
  ['maskable-512.png', 512, { rounded: 0, checkScale: 0.75 }],
  ['apple-touch-icon.png', 180, { rounded: 0, checkScale: 0.9 }],
];

for (const [name, size, opts] of icons) {
  writeFileSync(new URL(name, OUT), drawIcon(size, opts));
  console.log(`wrote public/icons/${name}`);
}
