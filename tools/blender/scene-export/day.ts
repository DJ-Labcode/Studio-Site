import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js'
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

/*
 * DuoForge film, daylight version: a sunny desk, colourful props, a product built from blank screen to live.
 * window.renderFrame(t) renders the frame at t in [0, 1] deterministically.
 */

const W = 1920, H = 1080
const INK = '#14141A', EMBER = '#FF5A1F', SPARK = '#FFB020', TEAL = '#14B8A6', BLUE = '#3D7BFF', PINK = '#FF5C8A', LIME = '#7BD35A'

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1)
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a))
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3)
const back = (x: number) => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2) }
let seed = 21
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
const canvas = (w: number, h: number) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return { c, g: c.getContext('2d')! } }
const tex = (c: HTMLCanvasElement, srgb = true) => { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t }

// ───────── renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
renderer.setSize(W, H); renderer.setPixelRatio(1)
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.AgXToneMapping; renderer.toneMappingExposure = 1.15
renderer.outputColorSpace = THREE.SRGBColorSpace
document.getElementById('stage')!.prepend(renderer.domElement)

const scene = new THREE.Scene()
const pmrem = new THREE.PMREMGenerator(renderer)
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
scene.environmentIntensity = 0.55
scene.background = new THREE.Color('#F6E9D8')
scene.fog = new THREE.Fog('#F6E9D8', 9, 22)
const camera = new THREE.PerspectiveCamera(30, W / H, 0.05, 60)

// ───────── room: oak desk + warm plaster wall
const oak = (() => {
  const { c, g } = canvas(2048, 2048)
  g.fillStyle = '#D9B98C'; g.fillRect(0, 0, 2048, 2048)
  for (let i = 0; i < 2600; i++) {
    const y = rnd() * 2048, a = 0.03 + rnd() * 0.07
    g.strokeStyle = rnd() > 0.5 ? `rgba(120,78,40,${a})` : `rgba(255,236,205,${a})`
    g.lineWidth = 1 + rnd() * 3
    g.beginPath(); g.moveTo(0, y)
    for (let x = 0; x <= 2048; x += 128) g.lineTo(x, y + Math.sin(x / 300 + y) * 6 + (rnd() - 0.5) * 3)
    g.stroke()
  }
  // board seams
  g.strokeStyle = 'rgba(90,60,30,0.25)'; g.lineWidth = 3
  for (let y = 0; y < 2048; y += 512) { g.beginPath(); g.moveTo(0, y); g.lineTo(2048, y); g.stroke() }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2.2, 2.2); return t
})()
const desk = new THREE.Mesh(new THREE.BoxGeometry(14, 0.3, 7), new THREE.MeshStandardMaterial({ map: oak, roughness: 0.55, metalness: 0 }))
desk.position.set(0, -0.15, -0.2); desk.receiveShadow = true; scene.add(desk)
const plaster = (() => {
  const { c, g } = canvas(1024, 1024)
  g.fillStyle = '#F3E3CF'; g.fillRect(0, 0, 1024, 1024)
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${rnd() > 0.5 ? '255,255,255' : '170,130,90'},${rnd() * 0.05})`; g.fillRect(rnd() * 1024, rnd() * 1024, 2, 2) }
  const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2); return t
})()
const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 14), new THREE.MeshStandardMaterial({ map: plaster, roughness: 0.95 }))
wall.position.set(0, 5, -3.7); wall.receiveShadow = true; scene.add(wall)
// a big soft-coloured shelf stripe on the wall for colour
const stripe = new THREE.Mesh(new THREE.PlaneGeometry(30, 1.1), new THREE.MeshStandardMaterial({ color: '#FFD2A6', roughness: 0.9 }))
stripe.position.set(0, 3.6, -3.69); stripe.receiveShadow = true; scene.add(stripe)

// ───────── sunlight through a window + leaf shadows
scene.add(new THREE.HemisphereLight('#CFE6FF', '#E8C79C', 0.9))
const sun = new THREE.DirectionalLight('#FFE7C2', 4.2)
sun.position.set(-6, 9, 6); sun.target.position.set(0.4, 0, -0.6)
sun.castShadow = true
sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.00025; sun.shadow.normalBias = 0.02; sun.shadow.radius = 5
Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 30 })
scene.add(sun, sun.target)
const fill = new THREE.DirectionalLight('#BFD8FF', 0.6); fill.position.set(6, 4, 5); scene.add(fill)

// leaves outside the frame, between the sun and the desk: only their shadows are seen
const leafTex = (() => {
  const { c, g } = canvas(1024, 1024)
  g.clearRect(0, 0, 1024, 1024)
  g.fillStyle = '#000'
  for (let i = 0; i < 70; i++) {
    const x = rnd() * 1024, y = rnd() * 1024, s = 30 + rnd() * 70, a = rnd() * Math.PI
    g.save(); g.translate(x, y); g.rotate(a)
    g.beginPath(); g.moveTo(-s, 0); g.quadraticCurveTo(0, -s * 0.45, s, 0); g.quadraticCurveTo(0, s * 0.45, -s, 0); g.fill()
    g.restore()
  }
  // a few branches
  g.strokeStyle = '#000'; g.lineWidth = 9
  for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(rnd() * 1024, 0); g.quadraticCurveTo(rnd() * 1024, 500, rnd() * 1024, 1024); g.stroke() }
  return tex(c, false)
})()
const leafCaster = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), new THREE.MeshBasicMaterial({ map: leafTex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, colorWrite: false, depthWrite: false }))
leafCaster.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: leafTex, alphaTest: 0.5 })
leafCaster.position.set(-3.6, 5.6, 3.2); leafCaster.lookAt(sun.position.clone().multiplyScalar(2)); leafCaster.castShadow = true
leafCaster.position.x -= 1.2
scene.add(leafCaster)

// ───────── materials
const alu = new THREE.MeshStandardMaterial({ color: '#D3D5DB', roughness: 0.28, metalness: 0.9 })
const glassBlack = new THREE.MeshStandardMaterial({ color: '#0C0C10', roughness: 0.08, metalness: 0.2 })

// ───────── screens
const LAP = canvas(1600, 1000), PH = canvas(620, 1280)
const lapTex = tex(LAP.c), phTex = tex(PH.c)

// ───────── laptop
const laptop = new THREE.Group()
const base = new THREE.Mesh(new RoundedBoxGeometry(3.2, 0.1, 2.15, 5, 0.05), alu); base.position.y = 0.05; base.castShadow = base.receiveShadow = true
const keys = (() => {
  const { c, g } = canvas(1400, 520)
  g.fillStyle = '#C2C5CC'; g.fillRect(0, 0, 1400, 520)
  for (let r = 0; r < 5; r++) for (let k = 0; k < 14; k++) {
    const x = 20 + k * 97, y = 20 + r * 98
    g.fillStyle = '#26272D'; g.beginPath(); g.roundRect(x, y, 88, 86, 10); g.fill()
  }
  g.fillStyle = '#26272D'; g.beginPath(); g.roundRect(330, 20 + 5 * 98 - 10, 700, 0, 10); g.fill()
  return tex(c)
})()
const deck = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.04), new THREE.MeshStandardMaterial({ map: keys, roughness: 0.6, metalness: 0.3 }))
deck.rotation.x = -Math.PI / 2; deck.position.set(0, 0.102, -0.28); deck.receiveShadow = true
const pad = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.64), new THREE.MeshStandardMaterial({ color: '#C8CBD2', roughness: 0.22, metalness: 0.85 }))
pad.rotation.x = -Math.PI / 2; pad.position.set(0, 0.102, 0.6)
const lid = new THREE.Group(); lid.position.set(0, 0.1, -1.07)
const lidBody = new THREE.Mesh(new RoundedBoxGeometry(3.2, 2.05, 0.07, 5, 0.04), alu); lidBody.position.y = 1.025; lidBody.castShadow = true
const lidFace = new THREE.Mesh(new THREE.PlaneGeometry(3.14, 1.99), glassBlack); lidFace.position.set(0, 1.025, 0.036)
const lapScreen = new THREE.Mesh(new THREE.PlaneGeometry(2.96, 1.85), new THREE.MeshBasicMaterial({ map: lapTex, toneMapped: false, color: '#E9E9E9' }))
lapScreen.position.set(0, 1.04, 0.038)
lid.add(lidBody, lidFace, lapScreen); lid.rotation.x = -0.24
laptop.add(base, deck, pad, lid); scene.add(laptop)

// ───────── phone (sky-blue back)
const phone = new THREE.Group()
const phBody = new THREE.Mesh(new RoundedBoxGeometry(0.78, 1.6, 0.075, 6, 0.1), new THREE.MeshStandardMaterial({ color: '#9CC7FF', roughness: 0.25, metalness: 0.55 }))
phBody.castShadow = true
const phFace = new THREE.Mesh(new RoundedBoxGeometry(0.74, 1.56, 0.01, 6, 0.09), glassBlack); phFace.position.z = 0.035
const phScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 1.48), new THREE.MeshBasicMaterial({ map: phTex, toneMapped: false, color: '#E9E9E9' })); phScreen.position.z = 0.042
phone.add(phBody, phFace, phScreen); scene.add(phone)
const PHONE_REST = { p: new THREE.Vector3(2.35, 0.04, 0.6), r: new THREE.Euler(-Math.PI / 2, 0, -0.35) }
const PHONE_FLY = { p: new THREE.Vector3(1.85, 1.3, 1.25), r: new THREE.Euler(-0.1, -0.45, 0.05) }

// ───────── props: mug, plant, sticky notes, notebook + pencil, headphones
function mug(color: string, x: number, z: number) {
  const g = new THREE.Group()
  const prof = [[0, 0], [0.26, 0], [0.29, 0.03], [0.3, 0.55], [0.27, 0.56], [0.26, 0.06], [0, 0.06]].map(([a, b]) => new THREE.Vector2(a, b))
  const m = new THREE.MeshStandardMaterial({ color, roughness: 0.25, metalness: 0 })
  const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 48), m); body.castShadow = body.receiveShadow = true
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.035, 16, 32, Math.PI * 1.2), m); handle.position.set(0.3, 0.3, 0); handle.rotation.z = -Math.PI * 0.6; handle.castShadow = true
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.255, 40), new THREE.MeshStandardMaterial({ color: '#5A3420', roughness: 0.15 })); coffee.rotation.x = -Math.PI / 2; coffee.position.y = 0.48
  g.add(body, handle, coffee); g.position.set(x, 0, z); g.rotation.y = 0.6; scene.add(g)
}
mug(EMBER, -2.35, 0.55)

const leafShape = (() => {
  const { c, g } = canvas(256, 512)
  const gr = g.createLinearGradient(0, 0, 256, 0); gr.addColorStop(0, '#2E8B3E'); gr.addColorStop(0.5, '#56C15A'); gr.addColorStop(1, '#2E8B3E')
  g.fillStyle = gr; g.beginPath(); g.moveTo(128, 0); g.quadraticCurveTo(256, 230, 128, 512); g.quadraticCurveTo(0, 230, 128, 0); g.fill()
  g.strokeStyle = 'rgba(220,255,200,0.6)'; g.lineWidth = 5; g.beginPath(); g.moveTo(128, 10); g.lineTo(128, 500); g.stroke()
  return tex(c)
})()
function plant(x: number, z: number, s = 1) {
  const g = new THREE.Group()
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.32, 0.7, 40), new THREE.MeshStandardMaterial({ color: '#E8774A', roughness: 0.8 }))
  pot.position.y = 0.35; pot.castShadow = pot.receiveShadow = true
  const rim2 = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.1, 40), new THREE.MeshStandardMaterial({ color: '#D9653A', roughness: 0.8 })); rim2.position.y = 0.72; rim2.castShadow = true
  const soil = new THREE.Mesh(new THREE.CircleGeometry(0.4, 32), new THREE.MeshStandardMaterial({ color: '#4A3020', roughness: 1 })); soil.rotation.x = -Math.PI / 2; soil.position.y = 0.76
  g.add(pot, rim2, soil)
  const lm = new THREE.MeshStandardMaterial({ map: leafShape, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.55 })
  for (let i = 0; i < 26; i++) {
    const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.75), lm)
    const a = i * 2.4, tilt = 0.35 + rnd() * 0.75, hgt = 0.95 + rnd() * 0.9
    leaf.position.set(Math.cos(a) * 0.18, hgt, Math.sin(a) * 0.18)
    leaf.rotation.set(0, -a, 0); leaf.rotateX(-tilt); leaf.rotateZ((rnd() - 0.5) * 0.4)
    leaf.translateY(0.3); leaf.castShadow = true; g.add(leaf)
  }
  g.position.set(x, 0, z); g.scale.setScalar(s); scene.add(g)
}
plant(-3.0, -1.5, 1.15)
plant(4.2, -2.4, 0.9)

function note(color: string, text: string, x: number, z: number, rot: number) {
  const { c, g } = canvas(256, 256)
  g.fillStyle = color; g.fillRect(0, 0, 256, 256)
  g.fillStyle = 'rgba(0,0,0,0.08)'; g.fillRect(0, 0, 256, 34)
  g.fillStyle = '#2A2A33'; g.font = '600 34px "Space Grotesk", sans-serif'
  text.split('\n').forEach((l, i) => g.fillText(l, 22, 92 + i * 46))
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.012, 0.62), [0, 0, new THREE.MeshStandardMaterial({ map: tex(c), roughness: 0.85 }), 0, 0, 0].map((v) => (v === 0 ? new THREE.MeshStandardMaterial({ color, roughness: 0.85 }) : v)) as THREE.Material[])
  m.position.set(x, 0.006, z); m.rotation.y = rot; m.castShadow = m.receiveShadow = true; scene.add(m)
}
note('#FFE066', 'login ✓\npayments ✓\nlaunch!', -1.95, 1.35, 0.25)
note('#FF9EC4', 'call\nclient\n4 pm', -1.25, 1.62, -0.18)
note('#A5F0D3', 'v1.0\nship\nfriday', 3.3, 1.45, -0.32)

function notebook(x: number, z: number) {
  const g = new THREE.Group()
  const cover = new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.09, 1.75, 3, 0.02), new THREE.MeshStandardMaterial({ color: TEAL, roughness: 0.6 }))
  cover.position.y = 0.045; cover.castShadow = cover.receiveShadow = true
  const band = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.095, 1.76), new THREE.MeshStandardMaterial({ color: '#0E7C70', roughness: 0.6 })); band.position.set(0.45, 0.046, 0)
  const pencil = new THREE.Group()
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.1, 6), new THREE.MeshStandardMaterial({ color: SPARK, roughness: 0.5 }))
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.12, 6), new THREE.MeshStandardMaterial({ color: '#F0D2A8', roughness: 0.7 })); tip.position.y = -0.61; tip.rotation.x = Math.PI
  const eraser = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.1, 12), new THREE.MeshStandardMaterial({ color: PINK, roughness: 0.6 })); eraser.position.y = 0.6
  pencil.add(shaft, tip, eraser); pencil.rotation.set(Math.PI / 2, 0, 0.5); pencil.position.set(-0.1, 0.13, 0.05)
  pencil.traverse((o) => { (o as THREE.Mesh).castShadow = true })
  g.add(cover, band, pencil); g.position.set(x, 0, z); g.rotation.y = -0.25; scene.add(g)
}
notebook(3.25, -0.75)

// headphones (simple arc + cups) in electric blue
;(() => {
  const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: BLUE, roughness: 0.35, metalness: 0.2 })
  const arc = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.045, 16, 48, Math.PI), m); arc.rotation.x = -Math.PI / 2; arc.position.y = 0.07
  const cupA = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.14, 32), m); cupA.position.set(0.42, 0.07, 0)
  const cupB = cupA.clone(); cupB.position.x = -0.42
  ;[arc, cupA, cupB].forEach((o) => { o.castShadow = true })
  g.add(arc, cupA, cupB); g.position.set(-3.6, 0, 0.9); g.rotation.y = 0.9; scene.add(g)
})()

// ───────── confetti burst + voxel logo
const CONF = 220, confColors = [EMBER, SPARK, TEAL, BLUE, PINK, LIME].map((c) => new THREE.Color(c))
const confetti = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ roughness: 0.4 }), CONF)
const confs = Array.from({ length: CONF }, (_, i) => {
  const a = rnd() * Math.PI * 2, el = 0.4 + rnd() * 1.0, sp = 2.2 + rnd() * 2.6
  confetti.setColorAt(i, confColors[i % confColors.length])
  return { v: new THREE.Vector3(Math.cos(a) * Math.cos(el) * sp, Math.sin(el) * sp * 1.4, Math.sin(a) * Math.cos(el) * sp * 0.6), spin: rnd() * 10, s: 0.03 + rnd() * 0.04 }
})
confetti.castShadow = true; scene.add(confetti)
const CONF_ORIGIN = new THREE.Vector3(1.85, 1.3, 1.25)

const blk = (c0: number, c1: number, r0: number, r1: number) => { const o: [number, number][] = []; for (let c = c0; c <= c1; c++) for (let r = r0; r <= r1; r++) o.push([c, r]); return o }
const LOGO_D = '#1E2BFF'
const LOGO = [
  ...[...blk(0, 1, 2, 15), ...blk(2, 5, 2, 3), ...blk(2, 5, 14, 15), ...blk(6, 7, 4, 5), ...blk(6, 7, 12, 13)].map(([c, r]) => ({ c, r, col: LOGO_D })),
  ...[...blk(8, 9, 2, 15), ...blk(10, 15, 2, 3), ...blk(10, 13, 8, 9)].map(([c, r]) => ({ c, r, col: EMBER })),
  ...[...blk(16, 17, 0, 1), [15, 5] as [number, number]].map(([c, r]) => ({ c, r, col: SPARK })),
]
const LU = 0.085, LOGO_C = new THREE.Vector3(-0.1, 2.85, -1.1)
const logo = new THREE.InstancedMesh(new RoundedBoxGeometry(1, 1, 1, 2, 0.12), new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0.05 }), LOGO.length * 2)
logo.castShadow = true
const logoVox = LOGO.flatMap((v) => [0, 1].map((z) => ({
  to: new THREE.Vector3((v.c - 9 + 0.5) * LU, (8 - v.r - 0.5) * LU, (z - 0.5) * LU).add(LOGO_C),
  from: new THREE.Vector3((rnd() - 0.5) * 2.4, 0.55 + rnd() * 1.4, -0.95 + rnd() * 0.1),
  col: new THREE.Color(v.col), lag: (v.c / 18) * 0.35 + rnd() * 0.25, spin: rnd() * 8,
})))
logoVox.forEach((v, i) => logo.setColorAt(i, v.col))
scene.add(logo)

// ───────── camera path
const CAM = [
  { t: 0.0, p: [2.6, 2.5, 6.4], l: [0.2, 0.85, -0.7] },
  { t: 0.14, p: [0.5, 1.5, 3.3], l: [0, 1.0, -1.15] },
  { t: 0.32, p: [1.0, 1.55, 3.0], l: [0.05, 0.95, -1.0] },
  { t: 0.55, p: [-2.4, 2.1, 4.3], l: [0.1, 0.75, -0.5] },
  { t: 0.74, p: [2.2, 2.0, 4.6], l: [1.2, 0.6, 0.1] },
  { t: 0.88, p: [0.8, 2.6, 6.6], l: [0.5, 1.5, -0.2] },
  { t: 1.0, p: [0.0, 3.0, 8.4], l: [0.1, 2.0, -0.5] },
]
const pathP = new THREE.CatmullRomCurve3(CAM.map((k) => new THREE.Vector3(...(k.p as [number, number, number]))), false, 'centripetal')
const pathL = new THREE.CatmullRomCurve3(CAM.map((k) => new THREE.Vector3(...(k.l as [number, number, number]))), false, 'centripetal')
const look = new THREE.Vector3()
function camAt(t: number) {
  let i = 0; while (i < CAM.length - 2 && t > CAM[i + 1].t) i++
  const u = (i + ease(seg(t, CAM[i].t, CAM[i + 1].t))) / (CAM.length - 1)
  camera.position.copy(pathP.getPoint(u)); look.copy(pathL.getPoint(u)); camera.lookAt(look)
}

// ───────── 2D UI (light theme)
const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => { g.beginPath(); g.roundRect(x, y, w, h, r) }
function strokeRectProgress(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, p: number) {
  if (p <= 0) return
  let len = 2 * (w + h) * p; g.beginPath(); g.moveTo(x, y)
  let cx = x, cy = y
  for (const [nx, ny] of [[x + w, y], [x + w, y + h], [x, y + h], [x, y]] as [number, number][]) {
    const d = Math.hypot(nx - cx, ny - cy)
    if (len >= d) { g.lineTo(nx, ny); len -= d; cx = nx; cy = ny } else { g.lineTo(cx + ((nx - cx) * len) / d, cy + ((ny - cy) * len) / d); break }
  }
  g.stroke()
}
const L = { nav: [0, 0, 1600, 86], side: [0, 86, 300, 914], hero: [340, 130, 820, 330], stat1: [1200, 130, 360, 155], stat2: [1200, 305, 360, 155], chart: [340, 500, 820, 450], list: [1200, 500, 360, 450] }
type Box = number[]
const BARS = [0.42, 0.58, 0.5, 0.72, 0.64, 0.86, 0.7, 0.93, 0.8, 0.97]
const BARC = [BLUE, TEAL, LIME, SPARK, EMBER, PINK, BLUE, TEAL, SPARK, EMBER]
const CODE = [
  ['const', ' booking = ', 'await', ' api.create({'], ['  guest', ': form.name,'], ['  slot', ': picked.time,'], ['  pay', ': ', 'upi', '(amount)'],
  ['});'], [''], ['export default', ' function ', 'Dashboard', '() {'], ['  const', ' { data } = ', 'useBookings', '()'], ['  return', ' <', 'Chart', ' data={data} />'],
  ['}'], [''], ['// ship it', ''], ['$ ', 'npm run build', ' ✓ 1.2s'], ['$ ', 'flutter build apk', ' ✓'], ['$ ', 'deploy --prod', ' → live'],
]

let BLINK: boolean | null = null
function drawLaptop(t: number) {
  const g = LAP.g
  g.fillStyle = '#FBFAF7'; g.fillRect(0, 0, 1600, 1000)
  const wire = seg(t, 0.13, 0.33), build = seg(t, 0.33, 0.58), live = seg(t, 0.58, 0.8)
  if (t < 0.2) {
    g.globalAlpha = 1 - seg(t, 0.14, 0.2)
    g.font = '500 46px "JetBrains Mono", monospace'
    const cmd = '> forge new-product', n = Math.floor(seg(t, 0.04, 0.11) * cmd.length), x0 = 800 - g.measureText(cmd).width / 2
    g.fillStyle = '#5B5966'; g.fillText(cmd.slice(0, n), x0, 520)
    if (BLINK ?? (Math.floor(t * 24) % 2 === 0 || (t > 0.04 && t < 0.11))) { g.fillStyle = EMBER; g.fillRect(x0 + g.measureText(cmd.slice(0, n)).width + 8, 482, 24, 48) }
    g.globalAlpha = 1
  }
  if (wire > 0) {
    const fade = 1 - build * 0.9
    g.strokeStyle = `rgba(37,99,235,${fade})`; g.lineWidth = 7
    ;(Object.values(L) as Box[]).forEach((b, i) => strokeRectProgress(g, b[0] + 6, b[1] + 6, b[2] - 12, b[3] - 12, clamp01(wire * 1.6 - i * 0.09)))
    g.strokeStyle = `rgba(37,99,235,${0.6 * fade})`; g.lineWidth = 4
    const k = clamp01(wire * 1.4 - 0.4)
    if (k > 0) {
      const [hx, hy, hw, hh] = L.hero
      g.beginPath(); g.moveTo(hx + 6, hy + 6); g.lineTo(hx + 6 + (hw - 12) * k, hy + 6 + (hh - 12) * k); g.stroke()
      g.beginPath(); g.moveTo(hx + hw - 6, hy + 6); g.lineTo(hx + hw - 6 - (hw - 12) * k, hy + 6 + (hh - 12) * k); g.stroke()
      for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(40, 160 + i * 70); g.lineTo(40 + 200 * k, 160 + i * 70); g.stroke() }
    }
  }
  if (build > 0) {
    const card = (x: number, y: number, w: number, h: number) => { g.fillStyle = '#FFFFFF'; g.shadowColor = 'rgba(20,20,40,0.10)'; g.shadowBlur = 24; g.shadowOffsetY = 6; rr(g, x, y, w, h, 20); g.fill(); g.shadowColor = 'transparent' }
    const blocks: { box: Box; at: number; draw: (b: Box) => void }[] = [
      { box: L.nav, at: 0, draw: ([x, y, w, h]) => {
        g.fillStyle = '#FFFFFF'; g.fillRect(x, y, w, h); g.fillStyle = '#EEECE7'; g.fillRect(x, y + h - 2, w, 2)
        g.fillStyle = EMBER; g.font = '700 38px "Space Grotesk", sans-serif'; g.fillText('Bloom', 48, 56)
        g.fillStyle = '#6B6977'; g.font = '500 24px Inter, sans-serif'; ['Bookings', 'Menu', 'Guests', 'Payments'].forEach((s, i) => g.fillText(s, 360 + i * 170, 52))
        ;[PINK, TEAL, SPARK].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(1450 + i * 34, 44, 20, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 4; g.stroke() })
      } },
      { box: L.side, at: 0.1, draw: ([x, y, w, h]) => {
        g.fillStyle = '#F5F3EE'; g.fillRect(x, y, w, h)
        ;['Overview', 'Calendar', 'Tables', 'Reports', 'Settings'].forEach((s, i) => {
          if (i === 0) { g.fillStyle = 'rgba(255,90,31,0.14)'; rr(g, 20, 120, 260, 52, 12); g.fill() }
          g.fillStyle = [EMBER, BLUE, TEAL, SPARK, PINK][i]; rr(g, 40, 132 + i * 70, 26, 26, 7); g.fill()
          g.fillStyle = i === 0 ? EMBER : '#4A4856'; g.font = '600 24px Inter, sans-serif'; g.fillText(s, 84, 154 + i * 70)
        })
      } },
      { box: L.hero, at: 0.2, draw: ([x, y, w, h]) => {
        const gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, '#FF6A2B'); gr.addColorStop(0.55, '#FF9A3C'); gr.addColorStop(1, '#FFC23D')
        g.fillStyle = gr; rr(g, x, y, w, h, 24); g.fill()
        g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.arc(x + w - 90, y + 70, 150, 0, Math.PI * 2); g.fill()
        g.fillStyle = '#FFFFFF'; g.font = '700 58px "Space Grotesk", sans-serif'; g.fillText('Good morning, Asha', x + 44, y + 120)
        g.font = '500 28px Inter, sans-serif'; g.fillText('38 tables booked today · 6 waiting', x + 44, y + 172)
        g.fillStyle = INK; rr(g, x + 44, y + 220, 250, 64, 32); g.fill()
        g.fillStyle = '#FFFFFF'; g.font = '600 24px Inter, sans-serif'; g.fillText('New booking', x + 92, y + 260)
      } },
      { box: L.stat1, at: 0.3, draw: ([x, y, w, h]) => {
        card(x, y, w, h); g.fillStyle = '#6B6977'; g.font = '500 22px Inter, sans-serif'; g.fillText('Revenue today', x + 30, y + 50)
        g.fillStyle = INK; g.font = '700 50px "Space Grotesk", sans-serif'; g.fillText(`₹${Math.round(18400 + 23800 * live).toLocaleString('en-IN')}`, x + 30, y + 115)
      } },
      { box: L.stat2, at: 0.36, draw: ([x, y, w, h]) => {
        card(x, y, w, h); g.fillStyle = '#6B6977'; g.font = '500 22px Inter, sans-serif'; g.fillText('Guests', x + 30, y + 50)
        g.fillStyle = INK; g.font = '700 50px "Space Grotesk", sans-serif'; g.fillText(`${Math.round(96 + 46 * live)}`, x + 30, y + 115)
        g.fillStyle = '#16A34A'; g.font = '600 22px Inter, sans-serif'; g.fillText('▲ 18%', x + 230, y + 112)
      } },
      { box: L.chart, at: 0.44, draw: ([x, y, w, h]) => {
        card(x, y, w, h); g.fillStyle = INK; g.font = '600 28px "Space Grotesk", sans-serif'; g.fillText('Bookings this week', x + 36, y + 58)
        const bw = 52, gap = (w - 72 - BARS.length * bw) / (BARS.length - 1)
        BARS.forEach((v, i) => {
          const grow = clamp01(build * 2.2 - 1 - i * 0.05), wob = live > 0 ? 0.08 * Math.sin(t * 40 + i) * live : 0
          const bh = (h - 140) * v * easeOut(grow) * (1 + wob)
          g.fillStyle = BARC[i]; rr(g, x + 36 + i * (bw + gap), y + h - 40 - bh, bw, bh, 10); g.fill()
        })
      } },
      { box: L.list, at: 0.52, draw: ([x, y, w, h]) => {
        card(x, y, w, h); g.fillStyle = INK; g.font = '600 28px "Space Grotesk", sans-serif'; g.fillText('Up next', x + 30, y + 58)
        ;[['Rohan · 4', '12:30', PINK], ['Meera · 2', '12:45', TEAL], ['Kabir · 6', '1:00', SPARK], ['Isha · 3', '1:15', BLUE], ['Dev · 2', '1:30', LIME]].forEach(([n, tm, c], i) => {
          g.fillStyle = '#F6F4F0'; rr(g, x + 24, y + 90 + i * 68, w - 48, 56, 12); g.fill()
          g.fillStyle = c; g.beginPath(); g.arc(x + 54, y + 118 + i * 68, 14, 0, Math.PI * 2); g.fill()
          g.fillStyle = INK; g.font = '500 22px Inter, sans-serif'; g.fillText(n, x + 80, y + 126 + i * 68)
          g.fillStyle = '#6B6977'; g.fillText(tm, x + w - 100, y + 126 + i * 68)
        })
      } },
    ]
    blocks.forEach((b) => {
      const k = clamp01((build - b.at) / 0.32); if (k <= 0) return
      const s = back(k), [x, y, w, h] = b.box
      g.save(); g.globalAlpha = clamp01(k * 1.6)
      g.translate(x + w / 2, y + h / 2); g.scale(0.92 + 0.08 * s, 0.92 + 0.08 * s); g.translate(-(x + w / 2), -(y + h / 2))
      b.draw(b.box); g.restore()
    })
    const slide = easeOut(seg(t, 0.34, 0.4)) - easeOut(seg(t, 0.53, 0.59))
    if (slide > 0.001) {
      const px = -720 + 760 * slide
      g.fillStyle = '#1E1E2A'; g.shadowColor = 'rgba(0,0,0,0.25)'; g.shadowBlur = 40; rr(g, px, 120, 700, 840, 22); g.fill(); g.shadowColor = 'transparent'
      ;[PINK, SPARK, LIME].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(px + 36 + i * 28, 150, 9, 0, Math.PI * 2); g.fill() })
      g.font = '500 25px "JetBrains Mono", monospace'
      const scroll = seg(t, 0.36, 0.58) * 360
      g.save(); g.beginPath(); g.rect(px, 175, 700, 770); g.clip()
      CODE.forEach((line, i) => {
        let cx = px + 40; const cy = 230 + i * 46 - scroll
        line.forEach((part, j) => {
          g.fillStyle = part.startsWith('//') ? '#7D7A8C' : part.startsWith('$') ? EMBER : j % 2 === 0 ? '#7CC7FF' : '#F4F1EA'
          if (/✓|live/.test(part)) g.fillStyle = LIME
          g.fillText(part, cx, cy); cx += g.measureText(part).width
        })
      })
      g.restore()
    }
  }
  if (live > 0) {
    const toast = easeOut(seg(t, 0.62, 0.67)) * (1 - easeOut(seg(t, 0.9, 0.95)))
    if (toast > 0) {
      const tx = 1600 - 560 * toast
      g.fillStyle = '#FFFFFF'; g.shadowColor = 'rgba(20,20,40,0.18)'; g.shadowBlur = 30; rr(g, tx, 820, 520, 120, 20); g.fill(); g.shadowColor = 'transparent'
      g.fillStyle = '#22C55E'; g.beginPath(); g.arc(tx + 60, 880, 26, 0, Math.PI * 2); g.fill()
      g.fillStyle = '#FFFFFF'; g.font = '700 28px Inter, sans-serif'; g.fillText('✓', tx + 49, 890)
      g.fillStyle = INK; g.font = '600 26px Inter, sans-serif'; g.fillText('Payment received', tx + 104, 870)
      g.fillStyle = '#6B6977'; g.font = '500 22px Inter, sans-serif'; g.fillText('₹2,400 · Table 7 · UPI', tx + 104, 906)
    }
    const m = ease(seg(t, 0.6, 0.7)), mx = 1000 + (L.hero[0] + 170 - 1000) * m, my = 900 + (L.hero[1] + 252 - 900) * m
    const click = seg(t, 0.7, 0.73)
    if (click > 0 && click < 1) { g.strokeStyle = `rgba(255,90,31,${1 - click})`; g.lineWidth = 4; g.beginPath(); g.arc(mx, my, 10 + 40 * click, 0, Math.PI * 2); g.stroke() }
    g.fillStyle = INK; g.strokeStyle = '#fff'; g.lineWidth = 3
    g.beginPath(); g.moveTo(mx, my); g.lineTo(mx, my + 46); g.lineTo(mx + 12, my + 34); g.lineTo(mx + 30, my + 34); g.closePath(); g.fill(); g.stroke()
  }
  lapTex.needsUpdate = true
}

function drawPhone(t: number) {
  const g = PH.g
  g.fillStyle = '#050507'; g.fillRect(0, 0, 620, 1280)
  const wake = seg(t, 0.6, 0.64)
  if (wake > 0) {
    g.globalAlpha = wake
    g.fillStyle = '#FBFAF7'; g.fillRect(0, 0, 620, 1280)
    g.fillStyle = INK; g.font = '600 24px Inter, sans-serif'; g.fillText('9:41', 48, 64)
    g.fillStyle = EMBER; g.font = '700 48px "Space Grotesk", sans-serif'; g.fillText('Bloom', 48, 170)
    g.fillStyle = '#6B6977'; g.font = '500 26px Inter, sans-serif'; g.fillText('Book a table', 48, 214)
    ;['12:00', '1:00', '2:00'].forEach((s, i) => {
      const on = i === 1; g.fillStyle = on ? EMBER : '#EFECE6'; rr(g, 48 + i * 180, 270, 160, 80, 40); g.fill()
      g.fillStyle = on ? '#fff' : INK; g.font = '600 28px Inter, sans-serif'; g.fillText(s + ' pm', 64 + i * 180, 320)
    })
    const gr = g.createLinearGradient(48, 400, 572, 760); gr.addColorStop(0, '#3D7BFF'); gr.addColorStop(1, '#14B8A6')
    g.fillStyle = gr; rr(g, 48, 400, 524, 360, 32); g.fill()
    g.fillStyle = 'rgba(255,255,255,0.2)'; g.beginPath(); g.arc(500, 470, 120, 0, Math.PI * 2); g.fill()
    g.fillStyle = '#fff'; g.font = '700 46px "Space Grotesk", sans-serif'; g.fillText('Table for 4', 84, 650)
    g.font = '500 26px Inter, sans-serif'; g.fillText('Saturday · 1:00 pm', 84, 700)
    ;[PINK, SPARK, LIME, BLUE].forEach((c, i) => { g.fillStyle = c; rr(g, 48 + i * 134, 800, 120, 120, 24); g.fill() })
    const paid = seg(t, 0.7, 0.74)
    g.fillStyle = paid > 0 ? '#22C55E' : INK; rr(g, 48, 1080, 524, 110, 55); g.fill()
    g.fillStyle = '#fff'; g.font = '700 34px Inter, sans-serif'
    g.fillText(paid > 0 ? '✓  Paid ₹2,400' : 'Pay ₹2,400 with UPI', paid > 0 ? 180 : 120, 1148)
    const note = easeOut(seg(t, 0.64, 0.69)) * (1 - easeOut(seg(t, 0.76, 0.8)))
    if (note > 0) {
      const ny = -160 + 220 * note
      g.fillStyle = 'rgba(255,255,255,0.98)'; g.shadowColor = 'rgba(0,0,0,0.2)'; g.shadowBlur = 30; rr(g, 30, ny, 560, 130, 30); g.fill(); g.shadowColor = 'transparent'
      g.fillStyle = EMBER; rr(g, 56, ny + 30, 70, 70, 16); g.fill()
      g.fillStyle = INK; g.font = '600 26px Inter, sans-serif'; g.fillText('Bloom', 150, ny + 60)
      g.fillStyle = '#6B6977'; g.font = '500 24px Inter, sans-serif'; g.fillText('Your table is confirmed', 150, ny + 96)
    }
    g.globalAlpha = 1
  }
  phTex.needsUpdate = true
}

// ───────── captions (review version)
const CAPS = [
  { a: 0.02, b: 0.14, k: '00%', h: 'Every product starts<br>as a <em>blank screen.</em>' },
  { a: 0.17, b: 0.32, k: '25%', h: 'We design it first.' },
  { a: 0.36, b: 0.56, k: '50%', h: 'Then we <em>build</em> it.' },
  { a: 0.6, b: 0.78, k: '75%', h: 'Web and mobile,<br>working together.' },
  { a: 0.84, b: 1.01, k: '100%', h: 'Forged by <em>DuoForge.</em>' },
]
const cap = document.getElementById('cap')!
cap.style.color = INK; cap.style.textShadow = '0 2px 30px rgba(255,248,238,0.9)'
function drawCaption(t: number) {
  const c = CAPS.find((c) => t >= c.a && t <= c.b)
  if (!c) { cap.style.opacity = '0'; return }
  const fin = seg(t, c.a, c.a + 0.025), fout = c.b > 1 ? 1 : 1 - seg(t, c.b - 0.025, c.b)
  cap.innerHTML = `<small>${c.k}</small>${c.h}`; cap.style.opacity = String(Math.min(fin, fout)); cap.style.transform = `translateY(${(1 - fin) * 30}px)`
}

// ───────── post-processing: ambient occlusion + gentle depth of field
const rt = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType })
const composer = new EffectComposer(renderer, rt)
composer.addPass(new RenderPass(scene, camera))
const gtao = new GTAOPass(scene, camera, W, H); gtao.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.4, thickness: 1.2, scale: 1.1 }); gtao.blendIntensity = 0.9
composer.addPass(gtao)
const bokeh = new BokehPass(scene, camera, { focus: 3, aperture: 0.0016, maxblur: 0.006 })
composer.addPass(bokeh)
composer.addPass(new OutputPass())

const dummy = new THREE.Object3D()
function renderFrame(t: number) {
  camAt(t)
  drawLaptop(t); drawPhone(t)
  const lift = ease(seg(t, 0.78, 0.92))
  phone.position.lerpVectors(PHONE_REST.p, PHONE_FLY.p, lift)
  phone.position.y += Math.sin(seg(t, 0.92, 1) * Math.PI) * 0.05
  phone.rotation.set(THREE.MathUtils.lerp(PHONE_REST.r.x, PHONE_FLY.r.x, lift), THREE.MathUtils.lerp(PHONE_REST.r.y, PHONE_FLY.r.y, lift), THREE.MathUtils.lerp(PHONE_REST.r.z, PHONE_FLY.r.z, lift))
  // confetti bursts from the phone once it lands in the air
  const ct = (t - 0.88) * 12
  confs.forEach((c, i) => {
    if (ct <= 0) dummy.scale.setScalar(0)
    else {
      dummy.position.copy(CONF_ORIGIN).addScaledVector(c.v, ct * 0.55); dummy.position.y -= 0.5 * ct * ct * 0.35
      dummy.rotation.set(c.spin * ct, c.spin * 0.6 * ct, 0)
      dummy.scale.set(c.s, c.s * 0.25, c.s * 1.6).multiplyScalar(Math.max(0, 1 - ct / 2.4))
    }
    dummy.updateMatrix(); confetti.setMatrixAt(i, dummy.matrix)
  })
  confetti.instanceMatrix.needsUpdate = true
  const lg = seg(t, 0.82, 0.97)
  logoVox.forEach((v, i) => {
    const k = ease(clamp01((lg - v.lag * 0.5) / 0.6))
    dummy.position.lerpVectors(v.from, v.to, k); dummy.position.y += Math.sin(k * Math.PI) * 0.7
    dummy.rotation.set(v.spin * (1 - k), v.spin * 0.7 * (1 - k), 0)
    dummy.scale.setScalar(k <= 0 ? 0 : LU * 0.95 * (0.3 + 0.7 * k))
    dummy.updateMatrix(); logo.setMatrixAt(i, dummy.matrix)
  })
  logo.instanceMatrix.needsUpdate = true
  // focus on what the camera looks at
  ;(bokeh.uniforms as Record<string, { value: number }>).focus.value = camera.position.distanceTo(look)
  drawCaption(t)
  composer.render()
}

declare global { interface Window { renderFrame: (t: number) => void; filmReady: Promise<void> } }
window.renderFrame = renderFrame
window.filmReady = document.fonts.ready.then(() => { renderFrame(0) })
const q = new URLSearchParams(location.search)
if (q.has('clean')) document.body.classList.add('clean')

// ───────── export for Blender: screen frames, static textures and per-frame transforms
function m16(o: THREE.Object3D) { o.updateMatrixWorld(true); return Array.from(o.matrixWorld.elements) }
declare global { interface Window { exportStatic: () => Record<string, string>; frameData: (t: number) => unknown } }
window.exportStatic = () => {
  const out: Record<string, string> = {}
  const grab = (name: string, t: THREE.Texture) => { out[name] = (t.image as HTMLCanvasElement).toDataURL('image/png') }
  grab('oak', oak); grab('plaster', plaster); grab('keys', keys); grab('leaf', leafShape); grab('gobo', leafTex)
  scene.traverse((o) => {
    const m = (o as THREE.Mesh).material as THREE.Material[] | undefined
    if (Array.isArray(m) && m[2] && (m[2] as THREE.MeshStandardMaterial).map) {
      const n = Object.keys(out).filter((k) => k.startsWith('note')).length
      grab('note' + n, (m[2] as THREE.MeshStandardMaterial).map!)
    }
  })
  return out
}
window.frameData = (t: number) => {
  camAt(t); drawLaptop(t); drawPhone(t)
  const lift = ease(seg(t, 0.78, 0.92))
  phone.position.lerpVectors(PHONE_REST.p, PHONE_FLY.p, lift)
  phone.position.y += Math.sin(seg(t, 0.92, 1) * Math.PI) * 0.05
  phone.rotation.set(THREE.MathUtils.lerp(PHONE_REST.r.x, PHONE_FLY.r.x, lift), THREE.MathUtils.lerp(PHONE_REST.r.y, PHONE_FLY.r.y, lift), THREE.MathUtils.lerp(PHONE_REST.r.z, PHONE_FLY.r.z, lift))
  const ct = (t - 0.88) * 12
  const conf = ct <= 0 ? null : confs.map((c) => {
    dummy.position.copy(CONF_ORIGIN).addScaledVector(c.v, ct * 0.55); dummy.position.y -= 0.5 * ct * ct * 0.35
    dummy.rotation.set(c.spin * ct, c.spin * 0.6 * ct, 0)
    dummy.scale.set(c.s, c.s * 0.25, c.s * 1.6).multiplyScalar(Math.max(0, 1 - ct / 2.4))
    return m16(dummy)
  })
  const lg = seg(t, 0.82, 0.97)
  const logoM = lg <= 0 ? null : logoVox.map((v) => {
    const k = ease(clamp01((lg - v.lag * 0.5) / 0.6))
    dummy.position.lerpVectors(v.from, v.to, k); dummy.position.y += Math.sin(k * Math.PI) * 0.7
    dummy.rotation.set(v.spin * (1 - k), v.spin * 0.7 * (1 - k), 0)
    dummy.scale.setScalar(k <= 0 ? 0.0001 : LU * 0.95 * (0.55 + 0.45 * k))
    return m16(dummy)
  })
  return {
    cam: camera.position.toArray(), look: look.toArray(), phone: m16(phone), conf, logo: logoM,
    lap: LAP.c.toDataURL('image/jpeg', 0.95), ph: PH.c.toDataURL('image/jpeg', 0.95),
  }
}
window.exportMeta = () => ({ logoColors: LOGO.flatMap((v) => [v.col, v.col]), confColors: Array.from({ length: CONF }, (_, i) => [EMBER, SPARK, TEAL, BLUE, PINK, LIME][i % 6]) })
declare global { interface Window { exportMeta: () => unknown } }


// ───────── clips for the scroll website: hero loop, push into the screen, pull back out
const HERO_P = new THREE.Vector3(2.05, 1.3, 4.6), HERO_L = new THREE.Vector3(0.1, 0.98, -1.05)
const SC = new THREE.Vector3(0, 1.119, -1.28), SN = new THREE.Vector3(0, 0.2377, 0.9713)
const FILL_P = SC.clone().addScaledVector(SN, 3.106)
const pushP = new THREE.CatmullRomCurve3([HERO_P, new THREE.Vector3(1.45, 1.5, 4.25), new THREE.Vector3(0.6, 1.72, 3.5), FILL_P], false, 'centripetal')
const pushL = new THREE.CatmullRomCurve3([HERO_L, new THREE.Vector3(0.06, 1.04, -1.14), new THREE.Vector3(0.02, 1.09, -1.24), SC.clone()], false, 'centripetal')
const pullP = new THREE.CatmullRomCurve3([FILL_P, new THREE.Vector3(0.3, 2.0, 3.7), new THREE.Vector3(0.7, 2.05, 6.0), new THREE.Vector3(0.1, 2.2, 8.0)], false, 'centripetal')
const pullL = new THREE.CatmullRomCurve3([SC.clone(), new THREE.Vector3(0.2, 1.35, -0.8), new THREE.Vector3(0.4, 1.6, -0.5), new THREE.Vector3(0.15, 1.85, -0.6)], false, 'centripetal')

export const SCREEN_BLUE = '#1E2BFF'
function drawBlueHero(u: number) {
  const g = LAP.g, W2 = 1600, H2 = 1000
  g.fillStyle = SCREEN_BLUE; g.fillRect(0, 0, W2, H2)
  // logo + nav
  const cell = 5; LOGO.forEach((v) => { g.fillStyle = v.col === LOGO_D ? '#FFFFFF' : v.col; g.fillRect(70 + v.c * cell, 52 + v.r * cell, cell - 0.5, cell - 0.5) })
  g.fillStyle = '#FFFFFF'; g.font = '700 34px "Space Grotesk", sans-serif'; g.fillText('DuoForge', 175, 100)
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.roundRect(1300, 60, 230, 56, 28); g.fill()
  g.fillStyle = SCREEN_BLUE; g.font = '600 24px Inter, sans-serif'; g.fillText('Start a project', 1330, 96)
  // headline: big, tight, white
  g.fillStyle = '#FFFFFF'; g.textAlign = 'center'
  g.font = '700 128px "Space Grotesk", sans-serif'
  g.fillText('WE FORGE APPS', 800, 430)
  g.fillText('& WEBSITES', 800 + 70, 560)
  // inline pixel tile before the second line, in brand ember
  const tx = 330, ty = 468
  g.fillStyle = '#FF5A1F'; g.beginPath(); g.roundRect(tx, ty, 150, 100, 18); g.fill()
  g.fillStyle = '#FFB020'; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) g.fillRect(tx + 22 + i * 38, ty + 22 + j * 32, 26, 22)
  g.fillStyle = '#FFFFFF'
  g.fillText('PEOPLE LOVE.', 800, 690)
  g.font = '500 30px Inter, sans-serif'; g.globalAlpha = 0.9
  g.fillText('Two developers. Web and mobile. From idea to launch.', 800, 790)
  g.globalAlpha = 1; g.textAlign = 'left'
  // a soft blinking scroll hint
  if (Math.floor(u * 4) % 2 === 0) { g.fillStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.arc(800, 900, 8, 0, Math.PI * 2); g.fill() }
  lapTex.needsUpdate = true
}

/** the screen the website hands back at the end: DuoForge "Forged" card that the 3D logo then leaves */
function drawForged(u: number) {
  const g = LAP.g
  g.fillStyle = SCREEN_BLUE; g.fillRect(0, 0, 1600, 1000)
  // soft lighter glow so the blue is not flat
  const gl = g.createRadialGradient(800, 430, 40, 800, 430, 900); gl.addColorStop(0, 'rgba(255,255,255,0.16)'); gl.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = gl; g.fillRect(0, 0, 1600, 1000)
  const fade = 1 - seg(u, 0.38, 0.55)
  g.globalAlpha = fade
  const cell = 24, ox = 800 - 9 * cell, oy = 250
  LOGO.forEach((v) => { g.fillStyle = v.col === LOGO_D ? '#FFFFFF' : v.col; g.fillRect(ox + v.c * cell, oy + v.r * cell, cell - 2, cell - 2) })
  g.globalAlpha = 1
  g.fillStyle = '#FFFFFF'; g.font = '700 96px "Space Grotesk", sans-serif'; g.textAlign = 'center'
  g.fillText('100% · FORGED.', 800, 760)
  g.globalAlpha = 0.9; g.font = '500 32px Inter, sans-serif'; g.fillText('Your product, live.', 800, 825)
  g.globalAlpha = 1; g.textAlign = 'left'
  lapTex.needsUpdate = true
}

function setPhone(lift: number) {
  phone.position.lerpVectors(PHONE_REST.p, PHONE_FLY.p, lift)
  phone.rotation.set(THREE.MathUtils.lerp(PHONE_REST.r.x, PHONE_FLY.r.x, lift), THREE.MathUtils.lerp(PHONE_REST.r.y, PHONE_FLY.r.y, lift), THREE.MathUtils.lerp(PHONE_REST.r.z, PHONE_FLY.r.z, lift))
}
function confettiAt(ct: number) {
  return ct <= 0 ? null : confs.map((c) => {
    dummy.position.copy(CONF_ORIGIN).addScaledVector(c.v, ct * 0.55); dummy.position.y -= 0.5 * ct * ct * 0.35
    dummy.rotation.set(c.spin * ct, c.spin * 0.6 * ct, 0)
    dummy.scale.set(c.s, c.s * 0.25, c.s * 1.6).multiplyScalar(Math.max(0, 1 - ct / 2.4))
    return m16(dummy)
  })
}
function logoAt(lg: number) {
  return lg <= 0 ? null : logoVox.map((v) => {
    const k = ease(clamp01((lg - v.lag * 0.5) / 0.6))
    dummy.position.lerpVectors(v.from, v.to, k); dummy.position.y += Math.sin(k * Math.PI) * 0.7
    dummy.rotation.set(v.spin * (1 - k), v.spin * 0.7 * (1 - k), 0)
    dummy.scale.setScalar(k <= 0 ? 0.0001 : LU * 0.95 * (0.55 + 0.45 * k))
    return m16(dummy)
  })
}
declare global { interface Window { clipData: (name: string, u: number) => unknown } }
window.clipData = (name: string, u: number) => {
  let conf = null, logoM = null
  const sway = Math.sin(u * Math.PI * 2) * 0.35
  if (name === 'hero') {
    // 2 s seamless loop: the camera breathes, leaf shadows sway, the cursor blinks
    const a = u * Math.PI * 2
    camera.position.copy(HERO_P).add(new THREE.Vector3(Math.sin(a) * 0.08, Math.sin(a * 2) * 0.025, 0)); look.copy(HERO_L); camera.lookAt(look)
    drawBlueHero(u)
    drawPhone(0); setPhone(0)
  } else if (name === 'push') {
    const k = u * u * (3 - 2 * u)
    camera.position.copy(pushP.getPoint(k)); look.copy(pushL.getPoint(k)); camera.lookAt(look)
    drawBlueHero(0)
    drawPhone(0); setPhone(0)
  } else {
    const k = ease(u)
    camera.position.copy(pullP.getPoint(k)); look.copy(pullL.getPoint(k)); camera.lookAt(look)
    drawForged(u); drawPhone(0.8)
    setPhone(ease(seg(u, 0.3, 0.6)))
    phone.position.y += Math.sin(seg(u, 0.6, 1) * Math.PI) * 0.05
    conf = confettiAt((u - 0.55) * 6)
    logoM = logoAt(seg(u, 0.38, 0.85))
  }
  return { cam: camera.position.toArray(), look: look.toArray(), phone: m16(phone), conf, logo: logoM, sway,
    lap: LAP.c.toDataURL('image/jpeg', 0.95), ph: PH.c.toDataURL('image/jpeg', 0.95) }
}
declare global { interface Window { renderNow: () => void } }
window.renderNow = () => composer.render()
