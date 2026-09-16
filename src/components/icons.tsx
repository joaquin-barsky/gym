import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }
const base = (size: number, rest: SVGProps<SVGSVGElement>) => ({
  viewBox: '0 0 24 24', width: size, height: size, fill: 'none', stroke: 'currentColor',
  strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, ...rest,
})

export const IconDumbbell = ({ size = 22, ...r }: P) => (
  <svg {...base(size, r)}><path d="M6 6v12M18 6v12M3 9v6M21 9v6M6 12h12" /></svg>
)
export const IconBall = ({ size = 22, ...r }: P) => (
  <svg {...base(size, r)}><circle cx="12" cy="12" r="9" /><path d="M12 7l4.5 3.3-1.7 5.4H9.2L7.5 10.3z" /><path d="M12 7V3.5M16.5 10.3l3.2-1M14.8 15.7l2 2.8M9.2 15.7l-2 2.8M7.5 10.3l-3.2-1" /></svg>
)
export const IconPlus = ({ size = 22, ...r }: P) => (
  <svg {...base(size, r)}><path d="M12 5v14M5 12h14" /></svg>
)
export const IconChevron = ({ size = 20, ...r }: P) => (
  <svg {...base(size, r)}><path d="M9 6l6 6-6 6" /></svg>
)
export const IconBack = ({ size = 22, ...r }: P) => (
  <svg {...base(size, r)}><path d="M15 6l-6 6 6 6" /></svg>
)
export const IconX = ({ size = 18, ...r }: P) => (
  <svg {...base(size, r)}><path d="M6 6l12 12M18 6L6 18" /></svg>
)
export const IconGrip = ({ size = 18, ...r }: P) => (
  <svg {...base(size, r)}><circle cx="9" cy="6" r="1.2" fill="currentColor" /><circle cx="15" cy="6" r="1.2" fill="currentColor" /><circle cx="9" cy="12" r="1.2" fill="currentColor" /><circle cx="15" cy="12" r="1.2" fill="currentColor" /><circle cx="9" cy="18" r="1.2" fill="currentColor" /><circle cx="15" cy="18" r="1.2" fill="currentColor" /></svg>
)
export const IconTrophy = ({ size = 16, ...r }: P) => (
  <svg {...base(size, r)}><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" /><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3" /></svg>
)
export const IconUp = ({ size = 14, ...r }: P) => <svg {...base(size, r)}><path d="M12 19V5M5 12l7-7 7 7" /></svg>
export const IconDown = ({ size = 14, ...r }: P) => <svg {...base(size, r)}><path d="M12 5v14M5 12l7 7 7-7" /></svg>
export const IconCheck = ({ size = 18, ...r }: P) => <svg {...base(size, r)}><path d="M5 12l5 5L20 7" /></svg>
export const IconSearch = ({ size = 18, ...r }: P) => <svg {...base(size, r)}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
export const IconFlame = ({ size = 22, ...r }: P) => (
  <svg {...base(size, r)}><path d="M12 3c1 3 4 5 4 9a4 4 0 0 1-8 0c0-1.5.5-2.5 1-3.5.5 1 1 1.5 2 1.5 0-3-1-5 1-7z" /></svg>
)
