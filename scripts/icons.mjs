// Genera los íconos de la app a partir de un SVG (requiere sharp, dev dependency).
import sharp from 'sharp'
import { writeFileSync } from 'node:fs'

const svg = (rounded) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#5b8cff"/>
      <stop offset="1" stop-color="#8b5cf6"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.3" cy="0.2" r="0.9">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="0.6" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#dfe6ff"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="${rounded ? 22 : 0}" fill="url(#bg)"/>
  <rect width="100" height="100" rx="${rounded ? 22 : 0}" fill="url(#glow)"/>
  <g transform="rotate(-35 50 50) translate(0 1.5)" fill="#000" opacity="0.22">
    <rect x="30" y="46.5" width="40" height="7" rx="3.5"/>
    <rect x="21" y="35" width="10" height="30" rx="4"/><rect x="69" y="35" width="10" height="30" rx="4"/>
    <rect x="12" y="40" width="8" height="20" rx="3.5"/><rect x="80" y="40" width="8" height="20" rx="3.5"/>
  </g>
  <g transform="rotate(-35 50 50)" fill="url(#metal)">
    <rect x="30" y="46.5" width="40" height="7" rx="3.5"/>
    <rect x="21" y="35" width="10" height="30" rx="4"/><rect x="69" y="35" width="10" height="30" rx="4"/>
    <rect x="12" y="40" width="8" height="20" rx="3.5"/><rect x="80" y="40" width="8" height="20" rx="3.5"/>
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
