// Genera icon-192.png, icon-512.png, apple-touch-icon.png e icon.svg sin dependencias.
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

const crcTable = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c })
const crc32 = (buf) => { let c = -1; for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ -1) >>> 0 }
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td))
  return Buffer.concat([len, td, crc])
}
function png(size, draw) {
  const raw = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = draw(x / size, y / size)
      const o = y * (size * 4 + 1) + 1 + x * 4
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = a
    }
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
}
const inRoundRect = (x, y, x0, y0, x1, y1, r) => {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false
  const cx = Math.max(x0 + r, Math.min(x, x1 - r)), cy = Math.max(y0 + r, Math.min(y, y1 - r))
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r
}
// mancuerna: barra + 2 discos por lado
const draw = (u, v) => {
  const bg = [11, 15, 20]
  const blue = [79, 140, 255]
  const white = [232, 237, 243]
  if (!inRoundRect(u, v, 0, 0, 1, 1, 0.22)) return [0, 0, 0, 0]
  // gradient bg
  const t = (u + v) / 2
  const col = bg.map((c, i) => Math.round(c + ([28, 36, 48][i] - c) * t))
  const bar = inRoundRect(u, v, 0.18, 0.46, 0.82, 0.54, 0.04)
  const d1 = inRoundRect(u, v, 0.14, 0.30, 0.24, 0.70, 0.03) || inRoundRect(u, v, 0.76, 0.30, 0.86, 0.70, 0.03)
  const d2 = inRoundRect(u, v, 0.26, 0.36, 0.34, 0.64, 0.03) || inRoundRect(u, v, 0.66, 0.36, 0.74, 0.64, 0.03)
  if (d1 || d2) return [...blue, 255]
  if (bar) return [...white, 255]
  return [...col, 255]
}
for (const [name, size] of [['public/icon-192.png', 192], ['public/icon-512.png', 512], ['public/apple-touch-icon.png', 180]]) {
  writeFileSync(name, png(size, draw))
}
writeFileSync('public/icon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b0f14"/><stop offset="1" stop-color="#1c2430"/></linearGradient></defs><rect width="100" height="100" rx="22" fill="url(#g)"/><rect x="18" y="46" width="64" height="8" rx="4" fill="#e8edf3"/><rect x="14" y="30" width="10" height="40" rx="3" fill="#4f8cff"/><rect x="76" y="30" width="10" height="40" rx="3" fill="#4f8cff"/><rect x="26" y="36" width="8" height="28" rx="3" fill="#4f8cff"/><rect x="66" y="36" width="8" height="28" rx="3" fill="#4f8cff"/></svg>`)
console.log('icons ok')
