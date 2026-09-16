// Genera los íconos de la app a partir de un SVG (requiere sharp, dev dependency).
import sharp from 'sharp'
import { writeFileSync } from 'node:fs'

// Marca: disco lima con mancuerna en negativo, sobre negro con aura.
const svg = (rounded) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="aura" cx="0.5" cy="0.55" r="0.6">
      <stop offset="0" stop-color="#c9f24d" stop-opacity="0.55"/>
      <stop offset="0.55" stop-color="#c9f24d" stop-opacity="0.12"/>
      <stop offset="1" stop-color="#c9f24d" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="disc" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e2ff7a"/>
      <stop offset="1" stop-color="#b6e239"/>
    </linearGradient>
    <linearGradient id="streak" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.10"/>
      <stop offset="0.5" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="${rounded ? 22 : 0}" fill="#0b0b0c"/>
  <rect width="100" height="100" rx="${rounded ? 22 : 0}" fill="url(#aura)"/>
  <rect width="100" height="100" rx="${rounded ? 22 : 0}" fill="url(#streak)"/>
  <circle cx="50" cy="50" r="40" fill="#c9f24d" opacity="0.12"/>
  <circle cx="50" cy="50" r="33" fill="url(#disc)"/>
  <g transform="rotate(-35 50 50)" fill="#0b0b0c">
    <rect x="35" y="47.2" width="30" height="5.6" rx="2.8"/>
    <rect x="28" y="39" width="8" height="22" rx="3.2"/><rect x="64" y="39" width="8" height="22" rx="3.2"/>
    <rect x="21.5" y="43" width="5.5" height="14" rx="2.75"/><rect x="73" y="43" width="5.5" height="14" rx="2.75"/>
  </g>
</svg>`

writeFileSync('public/icon.svg', svg(true))
const jobs = [
  ['public/icon-192.png', 192, true],
  ['public/icon-512.png', 512, true],
  ['public/icon-maskable-512.png', 512, false],
  ['public/apple-touch-icon.png', 180, false],
]
for (const [file, size, rounded] of jobs) {
  await sharp(Buffer.from(svg(rounded)), { density: 400 }).resize(size, size).png().toFile(file)
  console.log('ok', file)
}
