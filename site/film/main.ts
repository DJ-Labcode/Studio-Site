import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

/*
 * "Blank screen to live product" — a deterministic film.
 * window.renderFrame(t) draws the frame at t in [0, 1]. No real clock or randomness is used,
 * so every render of the same t is identical (needed for scroll-scrubbed frames).
 */

const W = 1920, H = 1080
const INK = '#0B0B0F', ASH = '#F5F3EE', EMBER = '#FF5A1F', SPARK = '#FFB020', DIM = '#A6A3AE'

// ───────── helpers
const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1)
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a))
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3)
const back = (x: number) => { const c = 1.6; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2) }
let seed = 11
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)

// ───────── renderer, scene, camera
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
renderer.setSize(W, H)
renderer.setPixelRatio(1)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.05
renderer.outputColorSpace = THREE.SRGBColorSpace
document.getElementById('stage')!.prepend(renderer.domElement)

const scene = new THREE.Scene()
scene.background = new THREE.Color(INK)
scene.fog = new THREE.Fog(INK, 7, 16)
const camera = new THREE.PerspectiveCamera(32, W / H, 0.05, 60)

// ───────── desk
const deskTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 1024
  const g = c.getContext('2d')!
  g.fillStyle = '#121218'; g.fillRect(0, 0, 1024, 1024)
  g.strokeStyle = 'rgba(255,255,255,0.035)'; g.lineWidth = 2
  for (let i = 0; i <= 1024; i += 64) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 1024); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(1024, i); g.stroke() }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(8, 8); t.colorSpace = THREE.SRGBColorSpace
  return t
})()
const desk = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ map: deskTex, roughness: 0.38, metalness: 0.25 }))
desk.rotation.x = -Math.PI / 2
desk.receiveShadow = true
scene.add(desk)

// ───────── lights
scene.add(new THREE.AmbientLight('#8C8AA0', 0.25))
const key = new THREE.SpotLight('#FFF4E8', 60, 20, 0.55, 0.6, 1.6)
key.position.set(-3.5, 6, 3.5); key.target.position.set(0, 0.4, -0.3)
key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004; key.shadow.radius = 6
scene.add(key, key.target)
const rim = new THREE.DirectionalLight('#7F8CFF', 0.5); rim.position.set(4, 3, -5); scene.add(rim)
const screenGlow = new THREE.PointLight('#FFFFFF', 0, 5, 1.8); screenGlow.position.set(0, 1.0, -0.2); scene.add(screenGlow)
const ember = new THREE.PointLight(EMBER, 0, 9, 1.5); ember.position.set(1.2, 1.6, 0.8); scene.add(ember)

// ───────── screen canvases
function screenTexture(w: number, h: number) {
  const c = document.createElement('canvas'); c.width = w; c.height = h
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8
  return { c, g: c.getContext('2d')!, tex }
}
const LAP = screenTexture(1600, 1000)
const PH = screenTexture(620, 1280)

// ───────── laptop
const alu = new THREE.MeshStandardMaterial({ color: '#2A2A33', roughness: 0.35, metalness: 0.85 })
const bezel = new THREE.MeshStandardMaterial({ color: '#07070A', roughness: 0.25, metalness: 0.3 })
const laptop = new THREE.Group()
const base = new THREE.Mesh(new RoundedBoxGeometry(3.2, 0.1, 2.15, 4, 0.05), alu)
base.position.y = 0.05; base.castShadow = true; base.receiveShadow = true
const keyDeck = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 1.0), new THREE.MeshStandardMaterial({ color: '#141419', roughness: 0.7 }))
keyDeck.rotation.x = -Math.PI / 2; keyDeck.position.set(0, 0.101, -0.25)
const pad = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.62), new THREE.MeshStandardMaterial({ color: '#1F1F27', roughness: 0.4, metalness: 0.5 }))
pad.rotation.x = -Math.PI / 2; pad.position.set(0, 0.102, 0.6)
const lid = new THREE.Group()
lid.position.set(0, 0.1, -1.07)
const lidBody = new THREE.Mesh(new RoundedBoxGeometry(3.2, 2.05, 0.07, 4, 0.04), alu)
lidBody.position.set(0, 1.025, 0); lidBody.castShadow = true
const lidFace = new THREE.Mesh(new THREE.PlaneGeometry(3.14, 1.99), bezel)
lidFace.position.set(0, 1.025, 0.036)
const lapScreen = new THREE.Mesh(new THREE.PlaneGeometry(2.96, 1.85), new THREE.MeshBasicMaterial({ map: LAP.tex, toneMapped: false }))
lapScreen.position.set(0, 1.04, 0.038)
lid.add(lidBody, lidFace, lapScreen)
lid.rotation.x = -0.24
laptop.add(base, keyDeck, pad, lid)
scene.add(laptop)

// ───────── phone
const phone = new THREE.Group()
const phBody = new THREE.Mesh(new RoundedBoxGeometry(0.78, 1.6, 0.075, 6, 0.1), new THREE.MeshStandardMaterial({ color: '#1C1C24', roughness: 0.3, metalness: 0.8 }))
phBody.castShadow = true
const phFace = new THREE.Mesh(new RoundedBoxGeometry(0.74, 1.56, 0.01, 6, 0.09), bezel)
phFace.position.z = 0.035
const phScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 1.48), new THREE.MeshBasicMaterial({ map: PH.tex, toneMapped: false }))
phScreen.position.z = 0.042
phone.add(phBody, phFace, phScreen)
scene.add(phone)
const PHONE_REST = { p: new THREE.Vector3(2.35, 0.04, 0.55), r: new THREE.Euler(-Math.PI / 2, 0, -0.35) }
const PHONE_FLY = { p: new THREE.Vector3(1.75, 1.35, 1.3), r: new THREE.Euler(-0.12, -0.42, 0.06) }

// ───────── embers
const EMB = 160
const emberMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: SPARK, toneMapped: false }), EMB)
const embers = Array.from({ length: EMB }, () => ({
  x: (rnd() - 0.5) * 6, z: (rnd() - 0.5) * 3 + 0.2, start: 0.74 + rnd() * 0.24, speed: 0.6 + rnd() * 0.9, sway: rnd() * 6, size: 0.015 + rnd() * 0.03,
}))
scene.add(emberMesh)

// ───────── voxel logo (same grid as the brand mark)
const blk = (c0: number, c1: number, r0: number, r1: number) => { const o: [number, number][] = []; for (let c = c0; c <= c1; c++) for (let r = r0; r <= r1; r++) o.push([c, r]); return o }
const LOGO: { c: number; r: number; col: string }[] = [
  ...[...blk(0, 1, 2, 15), ...blk(2, 5, 2, 3), ...blk(2, 5, 14, 15), ...blk(6, 7, 4, 5), ...blk(6, 7, 12, 13)].map(([c, r]) => ({ c, r, col: ASH })),
  ...[...blk(8, 9, 2, 15), ...blk(10, 15, 2, 3), ...blk(10, 13, 8, 9)].map(([c, r]) => ({ c, r, col: EMBER })),
  ...[...blk(16, 17, 0, 1), [15, 5] as [number, number]].map(([c, r]) => ({ c, r, col: SPARK })),
]
const LU = 0.085
const logoMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.1, emissive: '#000000' }), LOGO.length * 2)
logoMesh.castShadow = true
const LOGO_CENTER = new THREE.Vector3(-0.1, 2.85, -1.1)
const logoVox = LOGO.flatMap((v) => [0, 1].map((z) => ({
  to: new THREE.Vector3((v.c - 9 + 0.5) * LU, (8 - v.r - 0.5) * LU, (z - 0.5) * LU).add(LOGO_CENTER),
  from: new THREE.Vector3((rnd() - 0.5) * 5, -0.2 + rnd() * 0.6, (rnd() - 0.5) * 3 + 0.5),
  col: new THREE.Color(v.col), lag: (v.c / 18) * 0.35 + rnd() * 0.25, spin: rnd() * 8,
})))
logoVox.forEach((v, i) => logoMesh.setColorAt(i, v.col))
scene.add(logoMesh)

// ───────── camera path
const CAM = [
  { t: 0.0, p: [0.0, 1.06, 1.15], l: [0, 1.04, -1.25] },
  { t: 0.12, p: [0.05, 1.1, 1.9], l: [0, 1.02, -1.2] },
  { t: 0.32, p: [0.9, 1.5, 3.3], l: [0.05, 0.95, -1.0] },
  { t: 0.55, p: [-1.7, 1.9, 3.7], l: [0.3, 0.8, -0.5] },
  { t: 0.74, p: [1.4, 1.9, 4.2], l: [1.1, 0.7, 0.1] },
  { t: 0.88, p: [0.6, 2.4, 6.2], l: [0.5, 1.5, -0.1] },
  { t: 1.0, p: [0.0, 2.85, 8.1], l: [0.1, 1.95, -0.4] },
]
const pathP = new THREE.CatmullRomCurve3(CAM.map((k) => new THREE.Vector3(...(k.p as [number, number, number]))), false, 'centripetal')
const pathL = new THREE.CatmullRomCurve3(CAM.map((k) => new THREE.Vector3(...(k.l as [number, number, number]))), false, 'centripetal')
function camAt(t: number) {
  // map t to curve parameter so keyframes land on their t, eased per segment
  let i = 0
  while (i < CAM.length - 2 && t > CAM[i + 1].t) i++
  const a = CAM[i], b = CAM[i + 1]
  const u = (i + ease(seg(t, a.t, b.t))) / (CAM.length - 1)
  camera.position.copy(pathP.getPoint(u))
  camera.lookAt(pathL.getPoint(u))
}

// ───────── 2D drawing helpers
function rr(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath(); g.roundRect(x, y, w, h, r)
}
// draws a rect outline progressively (0..1 of its perimeter)
function strokeRectProgress(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, p: number) {
  if (p <= 0) return
  const per = 2 * (w + h); let len = per * p
  g.beginPath(); g.moveTo(x, y)
  const pts: [number, number][] = [[x + w, y], [x + w, y + h], [x, y + h], [x, y]]
  let cx = x, cy = y
  for (const [nx, ny] of pts) {
    const d = Math.hypot(nx - cx, ny - cy)
    if (len >= d) { g.lineTo(nx, ny); len -= d; cx = nx; cy = ny }
    else { g.lineTo(cx + ((nx - cx) * len) / d, cy + ((ny - cy) * len) / d); break }
  }
  g.stroke()
}

/* The product on screen: "Bloom" — a booking dashboard. Layout boxes shared by wireframe and final UI. */
const L = {
  nav: [0, 0, 1600, 86], side: [0, 86, 300, 914],
  hero: [340, 130, 820, 330], stat1: [1200, 130, 360, 155], stat2: [1200, 305, 360, 155],
  chart: [340, 500, 820, 450], list: [1200, 500, 360, 450],
}
type Box = number[]
const BARS = [0.42, 0.58, 0.5, 0.72, 0.64, 0.86, 0.7, 0.93, 0.8, 0.97]
const CODE = [
  ['const', ' booking = ', 'await', ' api.create({'], ['  guest', ': form.name,'], ['  slot', ': picked.time,'], ['  pay', ': ', 'upi', '(amount)'],
  ['});'], [''], ['export default', ' function ', 'Dashboard', '() {'], ['  const', ' { data } = ', 'useBookings', '()'], ['  return', ' <', 'Chart', ' data={data} />'],
  ['}'], [''], ['// ship it', ''], ['$ ', 'npm run build', ' ✓ 1.2s'], ['$ ', 'flutter build apk', ' ✓'], ['$ ', 'deploy --prod', ' → live'],
]

function drawLaptop(t: number) {
  const g = LAP.g, w = 1600, h = 1000
  const glow = g.createRadialGradient(800, 500, 50, 800, 500, 900)
  glow.addColorStop(0, '#15151D'); glow.addColorStop(1, '#060608')
  g.fillStyle = glow; g.fillRect(0, 0, w, h)
  const wire = seg(t, 0.13, 0.33)   // wireframe draws
  const build = seg(t, 0.33, 0.58)  // colour + content snaps in
  const live = seg(t, 0.58, 0.8)    // data moves
  const brightness = 0.35 + 0.65 * Math.max(build, wire * 0.5)

  // 1. blank screen with a blinking cursor and a typed command
  if (t < 0.2) {
    const a = 1 - seg(t, 0.14, 0.2)
    g.globalAlpha = a
    g.font = '500 44px "JetBrains Mono", monospace'; g.fillStyle = DIM
    const cmd = '> forge new-product'
    const n = Math.floor(seg(t, 0.04, 0.11) * cmd.length)
    const cx0 = 800 - g.measureText(cmd).width / 2
    g.fillText(cmd.slice(0, n), cx0, 520)
    const blink = Math.floor(t * 24) % 2 === 0 || (t > 0.04 && t < 0.11)
    if (blink) { g.fillStyle = EMBER; g.fillRect(cx0 + g.measureText(cmd.slice(0, n)).width + 8, 482, 24, 48) }
    g.globalAlpha = 1
  }

  // 2. wireframe lines draw themselves
  if (wire > 0) {
    const fade = 1 - build * 0.85
    g.strokeStyle = `rgba(166,163,174,${0.85 * fade})`; g.lineWidth = 3; g.setLineDash([])
    const boxes = Object.values(L) as Box[]
    boxes.forEach((b, i) => strokeRectProgress(g, b[0] + 6, b[1] + 6, b[2] - 12, b[3] - 12, clamp01(wire * 1.6 - i * 0.09)))
    // placeholder lines and crosses inside boxes
    g.strokeStyle = `rgba(166,163,174,${0.45 * fade})`; g.lineWidth = 2
    const k = clamp01(wire * 1.4 - 0.4)
    if (k > 0) {
      const [hx, hy, hw, hh] = L.hero
      g.beginPath(); g.moveTo(hx + 6, hy + 6); g.lineTo(hx + 6 + (hw - 12) * k, hy + 6 + (hh - 12) * k); g.stroke()
      g.beginPath(); g.moveTo(hx + hw - 6, hy + 6); g.lineTo(hx + hw - 6 - (hw - 12) * k, hy + 6 + (hh - 12) * k); g.stroke()
      for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(40, 160 + i * 70); g.lineTo(40 + 200 * k, 160 + i * 70); g.stroke() }
    }
  }

  // 3. the real UI fades and snaps in, block by block
  if (build > 0) {
    const blocks: { box: Box; at: number; draw: (b: Box) => void }[] = [
      { box: L.nav, at: 0.0, draw: ([x, y, bw, bh]) => {
        g.fillStyle = '#101016'; g.fillRect(x, y, bw, bh)
        g.fillStyle = SPARK; g.font = '700 38px "Space Grotesk", sans-serif'; g.fillText('Bloom', 48, 56)
        g.fillStyle = DIM; g.font = '500 24px Inter, sans-serif'; ['Bookings', 'Menu', 'Guests', 'Payments'].forEach((s, i) => g.fillText(s, 360 + i * 170, 52))
        g.fillStyle = '#2A2A35'; rr(g, 1460, 22, 104, 44, 22); g.fill()
      } },
      { box: L.side, at: 0.1, draw: ([x, y, bw, bh]) => {
        g.fillStyle = '#0D0D12'; g.fillRect(x, y, bw, bh)
        ;['Overview', 'Calendar', 'Tables', 'Reports', 'Settings'].forEach((s, i) => {
          if (i === 0) { g.fillStyle = 'rgba(255,90,31,0.14)'; rr(g, 20, 120 + i * 70, 260, 52, 10); g.fill() }
          g.fillStyle = i === 0 ? EMBER : DIM; g.font = '500 24px Inter, sans-serif'; g.fillText(s, 46, 154 + i * 70)
        })
      } },
      { box: L.hero, at: 0.2, draw: ([x, y, bw, bh]) => {
        const gr = g.createLinearGradient(x, y, x + bw, y + bh); gr.addColorStop(0, '#E0440C'); gr.addColorStop(1, '#FFB020')
        g.fillStyle = gr; rr(g, x, y, bw, bh, 22); g.fill()
        g.fillStyle = INK; g.font = '700 58px "Space Grotesk", sans-serif'; g.fillText('Good evening, Asha', x + 44, y + 120)
        g.font = '500 28px Inter, sans-serif'; g.fillText('38 tables booked tonight · 6 waiting', x + 44, y + 172)
        g.fillStyle = INK; rr(g, x + 44, y + 220, 250, 64, 32); g.fill()
        g.fillStyle = ASH; g.font = '600 24px Inter, sans-serif'; g.fillText('New booking', x + 92, y + 260)
      } },
      { box: L.stat1, at: 0.3, draw: ([x, y, bw, bh]) => {
        g.fillStyle = '#15151C'; rr(g, x, y, bw, bh, 18); g.fill()
        g.fillStyle = DIM; g.font = '500 22px Inter, sans-serif'; g.fillText('Revenue today', x + 30, y + 50)
        const v = Math.round(18400 + 23800 * live)
        g.fillStyle = ASH; g.font = '700 50px "Space Grotesk", sans-serif'; g.fillText(`₹${v.toLocaleString('en-IN')}`, x + 30, y + 115)
      } },
      { box: L.stat2, at: 0.36, draw: ([x, y, bw, bh]) => {
        g.fillStyle = '#15151C'; rr(g, x, y, bw, bh, 18); g.fill()
        g.fillStyle = DIM; g.font = '500 22px Inter, sans-serif'; g.fillText('Guests', x + 30, y + 50)
        g.fillStyle = ASH; g.font = '700 50px "Space Grotesk", sans-serif'; g.fillText(`${Math.round(96 + 46 * live)}`, x + 30, y + 115)
        g.fillStyle = '#3DDC84'; g.font = '600 22px Inter, sans-serif'; g.fillText('▲ 18%', x + 230, y + 112)
      } },
      { box: L.chart, at: 0.44, draw: ([x, y, bw, bh]) => {
        g.fillStyle = '#15151C'; rr(g, x, y, bw, bh, 22); g.fill()
        g.fillStyle = ASH; g.font = '600 28px "Space Grotesk", sans-serif'; g.fillText('Bookings this week', x + 36, y + 58)
        const bwid = 52, gap = (bw - 72 - BARS.length * bwid) / (BARS.length - 1)
        BARS.forEach((v, i) => {
          const grow = clamp01(build * 2.2 - 1 - i * 0.05)
          const wobble = live > 0 ? 0.08 * Math.sin(t * 40 + i) * live : 0
          const bh2 = (bh - 140) * v * easeOut(grow) * (1 + wobble)
          g.fillStyle = i === BARS.length - 1 ? EMBER : 'rgba(255,90,31,0.45)'
          rr(g, x + 36 + i * (bwid + gap), y + bh - 40 - bh2, bwid, bh2, 8); g.fill()
        })
      } },
      { box: L.list, at: 0.52, draw: ([x, y, bw, bh]) => {
        g.fillStyle = '#15151C'; rr(g, x, y, bw, bh, 22); g.fill()
        g.fillStyle = ASH; g.font = '600 28px "Space Grotesk", sans-serif'; g.fillText('Up next', x + 30, y + 58)
        ;[['Rohan · 4', '7:30'], ['Meera · 2', '7:45'], ['Kabir · 6', '8:00'], ['Isha · 3', '8:15'], ['Dev · 2', '8:30']].forEach(([n, tm], i) => {
          g.fillStyle = '#1E1E27'; rr(g, x + 24, y + 90 + i * 68, bw - 48, 56, 12); g.fill()
          g.fillStyle = ASH; g.font = '500 22px Inter, sans-serif'; g.fillText(n, x + 44, y + 126 + i * 68)
          g.fillStyle = SPARK; g.fillText(tm, x + bw - 100, y + 126 + i * 68)
        })
      } },
    ]
    blocks.forEach((b) => {
      const k = clamp01((build - b.at) / 0.32)
      if (k <= 0) return
      const s = back(k)
      const [x, y, bw, bh] = b.box
      g.save()
      g.globalAlpha = clamp01(k * 1.6)
      g.translate(x + bw / 2, y + bh / 2); g.scale(0.92 + 0.08 * s, 0.92 + 0.08 * s); g.translate(-(x + bw / 2), -(y + bh / 2))
      b.draw(b.box)
      g.restore()
    })

    // code panel slides in over the left while it's being built, then out
    const codeIn = seg(t, 0.34, 0.4), codeOut = seg(t, 0.53, 0.59)
    const slide = easeOut(codeIn) - easeOut(codeOut)
    if (slide > 0.001) {
      const px = -720 + 760 * slide
      g.fillStyle = 'rgba(8,8,12,0.94)'; rr(g, px, 120, 700, 840, 20); g.fill()
      g.strokeStyle = '#26262F'; g.lineWidth = 2; g.stroke()
      g.font = '500 25px "JetBrains Mono", monospace'
      const scroll = seg(t, 0.36, 0.58) * 360
      g.save(); g.beginPath(); g.rect(px, 140, 700, 800); g.clip()
      CODE.forEach((line, i) => {
        let cx = px + 40; const cy = 200 + i * 46 - scroll
        line.forEach((part, j) => {
          g.fillStyle = part.startsWith('//') ? '#6E6B78' : part.startsWith('$') ? EMBER : j % 2 === 0 ? '#FF8A5C' : ASH
          if (/✓|live/.test(part)) g.fillStyle = '#3DDC84'
          g.fillText(part, cx, cy); cx += g.measureText(part).width
        })
      })
      g.restore()
    }
  }

  // 4. live: a toast slides in and a cursor clicks
  if (live > 0) {
    const toast = easeOut(seg(t, 0.62, 0.67)) * (1 - easeOut(seg(t, 0.9, 0.95)))
    if (toast > 0) {
      const tx = 1600 - 560 * toast
      g.fillStyle = '#1B1B23'; rr(g, tx, 820, 520, 120, 18); g.fill()
      g.strokeStyle = 'rgba(61,220,132,0.6)'; g.lineWidth = 2; g.stroke()
      g.fillStyle = '#3DDC84'; g.beginPath(); g.arc(tx + 60, 880, 24, 0, Math.PI * 2); g.fill()
      g.fillStyle = INK; g.font = '700 28px Inter, sans-serif'; g.fillText('✓', tx + 49, 890)
      g.fillStyle = ASH; g.font = '600 26px Inter, sans-serif'; g.fillText('Payment received', tx + 104, 870)
      g.fillStyle = DIM; g.font = '500 22px Inter, sans-serif'; g.fillText('₹2,400 · Table 7 · UPI', tx + 104, 906)
    }
    // cursor glides to the "New booking" button and clicks
    const m = ease(seg(t, 0.6, 0.7))
    const mx = 1000 + (L.hero[0] + 170 - 1000) * m, my = 900 + (L.hero[1] + 252 - 900) * m
    const click = seg(t, 0.7, 0.73)
    if (click > 0 && click < 1) { g.strokeStyle = `rgba(255,255,255,${1 - click})`; g.lineWidth = 3; g.beginPath(); g.arc(mx, my, 10 + 40 * click, 0, Math.PI * 2); g.stroke() }
    g.fillStyle = ASH; g.strokeStyle = INK; g.lineWidth = 3
    g.beginPath(); g.moveTo(mx, my); g.lineTo(mx, my + 46); g.lineTo(mx + 12, my + 34); g.lineTo(mx + 30, my + 34); g.closePath(); g.fill(); g.stroke()
  }
  LAP.tex.needsUpdate = true
  return brightness
}

function drawPhone(t: number) {
  const g = PH.g, w = 620, h = 1280
  g.fillStyle = '#030305'; g.fillRect(0, 0, w, h)
  const wake = seg(t, 0.6, 0.64)
  if (wake <= 0) { PH.tex.needsUpdate = true; return 0 }
  g.globalAlpha = wake
  // app screen
  const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#16161E'); bg.addColorStop(1, '#0B0B0F')
  g.fillStyle = bg; g.fillRect(0, 0, w, h)
  g.fillStyle = DIM; g.font = '500 24px Inter, sans-serif'; g.fillText('9:41', 48, 64)
  g.fillStyle = SPARK; g.font = '700 46px "Space Grotesk", sans-serif'; g.fillText('Bloom', 48, 170)
  g.fillStyle = DIM; g.font = '500 26px Inter, sans-serif'; g.fillText('Book a table', 48, 214)
  ;['6:00', '7:30', '9:00'].forEach((s, i) => {
    const on = i === 1
    g.fillStyle = on ? EMBER : '#22222B'; rr(g, 48 + i * 180, 270, 160, 80, 40); g.fill()
    g.fillStyle = on ? INK : ASH; g.font = '600 28px Inter, sans-serif'; g.fillText(s + ' pm', 70 + i * 180, 320)
  })
  const gr = g.createLinearGradient(48, 400, 572, 760); gr.addColorStop(0, '#E0440C'); gr.addColorStop(1, '#FFB020')
  g.fillStyle = gr; rr(g, 48, 400, 524, 360, 30); g.fill()
  g.fillStyle = INK; g.font = '700 44px "Space Grotesk", sans-serif'; g.fillText('Table for 4', 84, 650)
  g.font = '500 26px Inter, sans-serif'; g.fillText('Saturday · 7:30 pm', 84, 700)
  // pay button -> success
  const paid = seg(t, 0.7, 0.74)
  g.fillStyle = paid > 0 ? '#3DDC84' : ASH; rr(g, 48, 1080, 524, 110, 55); g.fill()
  g.fillStyle = INK; g.font = '700 34px Inter, sans-serif'
  g.fillText(paid > 0 ? '✓  Paid ₹2,400' : 'Pay ₹2,400 with UPI', paid > 0 ? 180 : 120, 1148)
  // notification drops in
  const note = easeOut(seg(t, 0.64, 0.69)) * (1 - easeOut(seg(t, 0.76, 0.8)))
  if (note > 0) {
    const ny = -160 + 220 * note
    g.fillStyle = 'rgba(40,40,52,0.97)'; rr(g, 30, ny, 560, 130, 30); g.fill()
    g.fillStyle = EMBER; rr(g, 56, ny + 30, 70, 70, 16); g.fill()
    g.fillStyle = ASH; g.font = '600 26px Inter, sans-serif'; g.fillText('Bloom', 150, ny + 60)
    g.fillStyle = DIM; g.font = '500 24px Inter, sans-serif'; g.fillText('Your table is confirmed', 150, ny + 96)
  }
  g.globalAlpha = 1
  PH.tex.needsUpdate = true
  return wake
}

// ───────── captions (preview version only)
const CAPS = [
  { a: 0.02, b: 0.14, k: '00%', h: 'Every product starts<br>as a <em>blank screen.</em>' },
  { a: 0.17, b: 0.32, k: '25%', h: 'We design it first.' },
  { a: 0.36, b: 0.56, k: '50%', h: 'Then we <em>build</em> it.' },
  { a: 0.6, b: 0.78, k: '75%', h: 'Web and mobile,<br>working together.' },
  { a: 0.84, b: 1.01, k: '100%', h: 'Forged by <em>DuoForge.</em>' },
]
const cap = document.getElementById('cap')!
function drawCaption(t: number) {
  const c = CAPS.find((c) => t >= c.a && t <= c.b)
  if (!c) { cap.style.opacity = '0'; return }
  const fin = seg(t, c.a, c.a + 0.025), fout = 1 - seg(t, c.b - 0.025, c.b)
  const o = Math.min(fin, c.b > 1 ? 1 : fout)
  cap.innerHTML = `<small>${c.k}</small>${c.h}`
  cap.style.opacity = String(o)
  cap.style.transform = `translateY(${(1 - fin) * 30}px)`
}

// ───────── one frame
const dummy = new THREE.Object3D()
function renderFrame(t: number) {
  camAt(t)
  const lb = drawLaptop(t)
  const pb = drawPhone(t)
  screenGlow.intensity = lb * 3.2
  screenGlow.color.set(t > 0.33 ? '#FFB27A' : '#C8C6D8')

  // phone lifts off the desk and turns to the viewer
  const lift = ease(seg(t, 0.78, 0.92))
  phone.position.lerpVectors(PHONE_REST.p, PHONE_FLY.p, lift)
  phone.position.y += Math.sin(seg(t, 0.92, 1) * Math.PI) * 0.04
  phone.rotation.set(
    THREE.MathUtils.lerp(PHONE_REST.r.x, PHONE_FLY.r.x, lift),
    THREE.MathUtils.lerp(PHONE_REST.r.y, PHONE_FLY.r.y, lift),
    THREE.MathUtils.lerp(PHONE_REST.r.z, PHONE_FLY.r.z, lift),
  )
  ember.intensity = 2 + 26 * seg(t, 0.76, 0.95) + pb * 2

  // embers rise
  embers.forEach((e, i) => {
    const age = (t - e.start) * 10 * e.speed
    if (age <= 0) { dummy.scale.setScalar(0) } else {
      dummy.position.set(e.x + Math.sin(age * 2 + e.sway) * 0.15, age * 1.1, e.z)
      dummy.scale.setScalar(e.size * Math.max(0, 1 - age / 3.2))
      dummy.rotation.set(age * 3, age * 2, 0)
    }
    dummy.updateMatrix(); emberMesh.setMatrixAt(i, dummy.matrix)
  })
  emberMesh.instanceMatrix.needsUpdate = true

  // logo forges from the embers
  const lg = seg(t, 0.82, 0.97)
  logoVox.forEach((v, i) => {
    const k = ease(clamp01((lg - v.lag * 0.5) / 0.6))
    dummy.position.lerpVectors(v.from, v.to, k)
    dummy.position.y += Math.sin(k * Math.PI) * 0.6
    dummy.rotation.set(v.spin * (1 - k), v.spin * 0.7 * (1 - k), 0)
    dummy.scale.setScalar(k <= 0 ? 0 : LU * 0.94 * (0.3 + 0.7 * k))
    dummy.updateMatrix(); logoMesh.setMatrixAt(i, dummy.matrix)
  })
  logoMesh.instanceMatrix.needsUpdate = true
  ;(logoMesh.material as THREE.MeshStandardMaterial).emissive.set('#3A1406').multiplyScalar(seg(t, 0.92, 1))

  drawCaption(t)
  renderer.render(scene, camera)
}

declare global { interface Window { renderFrame: (t: number) => void; filmReady: Promise<void> } }
window.renderFrame = renderFrame
window.filmReady = document.fonts.ready.then(() => { renderFrame(0) })
const q = new URLSearchParams(location.search)
if (q.has('clean')) document.body.classList.add('clean')
if (q.has('t')) window.filmReady.then(() => renderFrame(Number(q.get('t'))))
