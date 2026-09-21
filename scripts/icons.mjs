// Genera los íconos de la app a partir de un SVG (requiere sharp, dev dependency).
// Marca: "g." geométrica blanca sobre negro, con el punto en lima. Mismo trazo que src/components/Logo.tsx.
import sharp from 'sharp'
import { writeFileSync } from 'node:fs'

const RING = { cx: 44, cy: 44, r: 15 }
const STEM = 'M59 29 V60 C59 70 52 76 43 76 C37.5 76 33.5 74.5 30.5 71.5'
const DOT = { cx: 72.5, cy: 71.5, r: 6 }
const W = 9.5

// El glifo ocupa aprox. x 26..79, y 24..81 → lo centramos en el lienzo 100×100.
const glyph = (scale) => `
  <g transform="translate(50 50) scale(${scale}) translate(-52.5 -52.5)">
    <circle cx="${RING.cx}" cy="${RING.cy}" r="${RING.r}" fill="none" stroke="#f5f5f6" stroke-width="${W}"/>
    <path d="${STEM}" fill="none" stroke="#f5f5f6" stroke-width="${W}" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${DOT.cx}" cy="${DOT.cy}" r="${DOT.r}" fill="#c9f24d"/>
  </g>`

const svg = ({ rounded, scale }) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="${rounded ? 22 : 0}" fill="#0b0b0c"/>
  ${glyph(scale)}
</svg>`

writeFileSync('public/icon.svg', svg({ rounded: true, scale: 1.05 }))
const jobs = [
  ['public/icon-192.png', 192, { rounded: true, scale: 1.05 }],
  ['public/icon-512.png', 512, { rounded: true, scale: 1.05 }],
  ['public/icon-maskable-512.png', 512, { rounded: false, scale: 0.8 }],
  ['public/apple-touch-icon.png', 180, { rounded: false, scale: 1.05 }],
]
for (const [file, size, opts] of jobs) {
  await sharp(Buffer.from(svg(opts)), { density: 400 }).resize(size, size).png().toFile(file)
  console.log('ok', file)
}
