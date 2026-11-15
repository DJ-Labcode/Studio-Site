import { useMemo, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/*
 * One continuous forge, fixed behind the whole page.
 * `stage.current` is a float from 0 to 8 written by useForgeProgress (scroll position).
 * The same voxels morph through every stage and never stop moving:
 *   0 raw pixels  1 two letters  2 the mark  3 the idea (lightbulb)  4 wireframe
 *   5 built product  6 wall of shipped work  7 launch  8 forged (100%)
 */

const U = 0.2
const C = {
  ash: new THREE.Color('#F5F3EE'),
  ember: new THREE.Color('#FF5A1F'),
  spark: new THREE.Color('#FFB020'),
  slate: new THREE.Color('#3B3B4A'),
  wire: new THREE.Color('#77748A'),
  wireDim: new THREE.Color('#2C2C38'),
  blue: new THREE.Color('#3D7BFF'),
  green: new THREE.Color('#2FBF71'),
  pink: new THREE.Color('#FF4D6D'),
  violet: new THREE.Color('#8F7CFF'),
  teal: new THREE.Color('#7FD1C7'),
}
type V = { p: THREE.Vector3; c: THREE.Color }
type Cell = [number, number]

const blk = (c0: number, c1: number, r0: number, r1: number): Cell[] => {
  const o: Cell[] = []
  for (let c = c0; c <= c1; c++) for (let r = r0; r <= r1; r++) o.push([c, r])
  return o
}
const outline = (w: number, h: number): Cell[] =>
  blk(0, w - 1, 0, h - 1).filter(([c, r]) => c === 0 || r === 0 || c === w - 1 || r === h - 1)
const place = (cells: Cell[], w: number, h: number, color: THREE.Color, ox = 0, oy = 0, z = 0): V[] =>
  cells.map(([c, r]) => ({ p: new THREE.Vector3((c - w / 2 + 0.5) * U + ox, (h / 2 - r - 0.5) * U + oy, z), c: color }))
const deep = (vs: V[], layers: number) =>
  vs.flatMap((v) => Array.from({ length: layers }, (_, i) => ({ p: v.p.clone().setZ(v.p.z + (i - (layers - 1) / 2) * U), c: v.c })))

const D_CELLS = [...blk(0, 1, 2, 15), ...blk(2, 5, 2, 3), ...blk(2, 5, 14, 15), ...blk(6, 7, 4, 5), ...blk(6, 7, 12, 13)]
const F_CELLS = [...blk(8, 9, 2, 15), ...blk(10, 15, 2, 3), ...blk(10, 13, 8, 9)]
const S_CELLS: Cell[] = [...blk(16, 17, 0, 1), [15, 5]]

// a seeded random so the layout is the same on every visit
let seed = 7
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)

function buildFormations(): V[][] {
  const markD = deep(place(D_CELLS, 18, 16, C.ash), 2)
  const markF = deep(place(F_CELLS, 18, 16, C.ember), 2)
  const markS = deep(place(S_CELLS, 18, 16, C.spark), 2)

  // 0 raw pixels: loose ore floating in a slab
  const raw: V[] = Array.from({ length: 320 }, (_, i) => ({
    p: new THREE.Vector3((rnd() - 0.5) * 6.4, (rnd() - 0.5) * 4.6, (rnd() - 0.5) * 2.4),
    c: i % 9 === 0 ? C.ember : i % 13 === 0 ? C.spark : i % 3 === 0 ? C.ash : C.slate,
  }))

  const two = [
    ...markD.map((v) => ({ p: v.p.clone().add(new THREE.Vector3(-1.05, 0.15, -0.4)), c: v.c })),
    ...markF.map((v) => ({ p: v.p.clone().add(new THREE.Vector3(1.25, -0.15, 0.3)), c: v.c })),
  ]
  const forge = [...markD, ...markF, ...markS]

  // 3 the idea: a pixel lightbulb with a glowing filament and rays
  const BULB = [
    '....###....',
    '..##...##..',
    '.#.......#.',
    '#.........#',
    '#....f....#',
    '#...f.f...#',
    '#...f.f...#',
    '.#..f.f..#.',
    '..#.f.f.#..',
    '...#...#...',
    '...bbbbb...',
    '...sssss...',
    '...bbbbb...',
    '....sss....',
  ]
  const glass: Cell[] = [], fil: Cell[] = [], base: Cell[] = [], dark: Cell[] = [], fill: Cell[] = []
  BULB.forEach((row, r) => [...row].forEach((ch, c) => {
    if (ch === '#') glass.push([c, r])
    else if (ch === 'f') fil.push([c, r])
    else if (ch === 'b') base.push([c, r])
    else if (ch === 's') dark.push([c, r])
  }))
  // soft inner glow: fill the glass interior one layer back
  BULB.slice(1, 9).forEach((row, i) => {
    const first = row.indexOf('#'), last = row.lastIndexOf('#')
    for (let c = first + 1; c < last; c++) if (row[c] === '.') fill.push([c, i + 1])
  })
  const by0 = 0.25
  const rays: V[] = []
  const rayAngles = [-150, -120, -90, -60, -30, 0, 180]
  rayAngles.forEach((deg) => {
    const a = (deg * Math.PI) / 180
    for (let k = 0; k < 3; k++) {
      const r = 1.55 + k * U
      rays.push({ p: new THREE.Vector3(Math.cos(a) * r, by0 + 0.75 - Math.sin(a) * r * 0.95, 0), c: C.spark })
    }
  })
  const idea = [
    ...deep(place(glass, 11, 14, C.spark, 0, by0), 2),
    ...deep(place(fil, 11, 14, C.ember, 0, by0), 2),
    ...place(fill, 11, 14, new THREE.Color('#5A3A12'), 0, by0, -U),
    ...deep(place(base, 11, 14, C.ash, 0, by0), 2),
    ...deep(place(dark, 11, 14, C.slate, 0, by0), 2),
    ...rays,
  ]

  // 5 built product: phone + laptop
  const phoneW = 9, phoneH = 17, px = -1.6, py = 0.05
  const phone = [
    ...place(outline(phoneW, phoneH), phoneW, phoneH, C.ash, px, py),
    ...place(blk(2, 6, 2, 4), phoneW, phoneH, C.ember, px, py, 0.02),
    ...place(blk(2, 6, 6, 6), phoneW, phoneH, C.slate, px, py),
    ...place(blk(2, 5, 8, 8), phoneW, phoneH, C.slate, px, py),
    ...place(blk(2, 6, 10, 10), phoneW, phoneH, C.slate, px, py),
    ...place(blk(2, 4, 13, 14), phoneW, phoneH, C.spark, px, py, 0.02),
    ...place(blk(6, 6, 13, 14), phoneW, phoneH, C.slate, px, py),
  ]
  const lapW = 19, lapH = 12, lx = 1.05, ly = 0.35
  const bars = [3, 5, 4, 7, 6, 8, 5]
  const laptop = [
    ...place(outline(lapW, lapH), lapW, lapH, C.ash, lx, ly),
    ...place(blk(2, 7, 2, 2), lapW, lapH, C.spark, lx, ly),
    ...place(blk(13, 16, 2, 2), lapW, lapH, C.slate, lx, ly),
    ...bars.flatMap((h, i) => place(blk(3 + i * 2, 3 + i * 2, 10 - h + 1, 9), lapW, lapH, C.ember, lx, ly)),
    ...blk(0, 21, 0, 2).map(([c, r]) => ({
      p: new THREE.Vector3((c - 10.5) * U + lx, ly - (lapH / 2) * U - 0.12 - r * 0.04, 0.12 + r * U),
      c: r === 0 ? C.ash : C.slate,
    })),
  ]
  const build = [...phone, ...laptop]
  // 4 wireframe: the same product, before colour (outline light, fills dark)
  const wire = build.map((v) => ({ p: v.p.clone(), c: v.c === C.ash ? C.wire : C.wireDim }))

  // 6 wall of shipped work: six screens on a gentle arc
  const hues = [C.blue, C.green, C.pink, C.spark, C.violet, C.teal]
  const wall: V[] = []
  for (let i = 0; i < 6; i++) {
    const col = i % 3, row = Math.floor(i / 3)
    const ox = (col - 1) * 2.05, oy = (0.5 - row) * 1.6, oz = -Math.abs(col - 1) * 0.7
    wall.push(
      ...place(outline(9, 6), 9, 6, C.ash, ox, oy, oz),
      ...place(blk(1, 7, 1, 1), 9, 6, hues[i], ox, oy, oz),
      ...place(blk(1, 3, 2, 4), 9, 6, hues[i], ox, oy, oz),
      ...place(blk(5, 7, 3, 3), 9, 6, C.slate, ox, oy, oz),
    )
  }

  // 7 launch: the phone lifts off on sparks
  const bW = 11, bH = 19, by = 0.55
  const iconColors = [C.ember, C.spark, C.blue, C.green, C.ash, C.ember, C.green, C.spark, C.blue]
  const icons: V[] = []
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 3; col++)
      icons.push(...place(blk(2 + col * 3, 3 + col * 3, 3 + row * 3, 4 + row * 3), bW, bH, iconColors[row * 3 + col], 0, by, 0.03))
  const trail: V[] = Array.from({ length: 90 }, (_, i) => {
    const t = i / 90, spread = 0.15 + t * 0.9, a = i * 2.399963
    return {
      p: new THREE.Vector3(Math.cos(a) * spread * ((i % 5) / 5), by - (bH / 2) * U - 0.3 - t * 3.2, Math.sin(a) * spread * 0.5),
      c: t < 0.35 ? C.spark : t < 0.75 ? C.ember : C.slate,
    }
  })
  const launch = [
    ...deep(place(outline(bW, bH), bW, bH, C.ash, 0, by), 2),
    ...icons,
    ...place(blk(3, 7, 13, 13), bW, bH, C.slate, 0, by),
    ...place(blk(2, 8, 16, 17), bW, bH, C.ember, 0, by, 0.03),
    ...trail,
  ]

  // 8 forged: the finished mark, three layers deep
  const forged = [...deep(place(D_CELLS, 18, 16, C.ash), 3), ...deep(place(F_CELLS, 18, 16, C.ember), 3), ...deep(place(S_CELLS, 18, 16, C.spark), 2)]

  return [raw, two, forge, idea, wire, build, wall, launch, forged]
}

// where the scene sits per stage on wide screens: 1 = right of the copy, 0 = centred behind content
const SIDE = [1, 1, 1, 1, 1, 1, 0, 1, 1]

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1)

function Voxels({ stage, reduced }: { stage: MutableRefObject<number>; reduced: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const group = useRef<THREE.Group>(null)
  const { size, viewport } = useThree()
  const formations = useMemo(buildFormations, [])
  const count = Math.max(...formations.map((f) => f.length))
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const col = useMemo(() => new THREE.Color(), [])
  const per = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        lag: rnd() * 0.3,
        swirl: new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(2.2),
        spin: new THREE.Euler(rnd() * 5, rnd() * 5, 0),
        phase: rnd() * Math.PI * 2,
        hide: new THREE.Vector3((rnd() - 0.5) * 0.6, (rnd() - 0.5) * 0.6, -1.5 - (i % 7) * 0.1),
      })),
    [count],
  )
  const s0 = useRef(0)
  const intro = useRef(0)
  const a = useMemo(() => new THREE.Vector3(), [])
  const b = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ clock, pointer }, dt) => {
    const m = mesh.current
    const g = group.current
    if (!m || !g) return
    const step = Math.min(dt, 0.05)
    s0.current += (stage.current - s0.current) * (reduced ? 1 : 1 - Math.pow(0.004, step))
    intro.current = reduced ? 1 : Math.min(intro.current + step / 1.8, 1)
    const s = Math.min(Math.max(s0.current, 0), formations.length - 1)
    const k = Math.min(Math.floor(s), formations.length - 2)
    const f = s - k // no hold zone: the forge is always mid-motion while you scroll
    const A = formations[k], B = formations[k + 1]
    const t = clock.elapsedTime
    const rawness = clamp01(1 - s) // how loose the ore still is
    const live = reduced ? 0 : 1

    for (let i = 0; i < count; i++) {
      const it = per[i]
      const local = easeInOut(clamp01((f - it.lag) / 0.7))
      const va = A[i], vb = B[i]
      a.copy(va ? va.p : it.hide)
      b.copy(vb ? vb.p : it.hide)
      dummy.position.lerpVectors(a, b, local)
      const arc = Math.sin(Math.PI * local)
      dummy.position.addScaledVector(it.swirl, arc * 0.45)
      // always-on motion: a slow wave through the solid shapes, a drift in the raw ore
      const wave = Math.sin(t * 1.4 + dummy.position.x * 1.6 + dummy.position.y * 0.8) * 0.035
      dummy.position.z += wave * live
      if (rawness > 0) {
        dummy.position.x += Math.sin(t * 0.4 + it.phase) * 0.25 * rawness * live
        dummy.position.y += Math.cos(t * 0.35 + it.phase * 1.3) * 0.25 * rawness * live
      }
      const ip = easeInOut(clamp01(intro.current * 1.3 - it.lag))
      dummy.position.addScaledVector(it.swirl, (1 - ip) * 2)
      const tumble = arc + (1 - ip) + rawness * 0.6
      dummy.rotation.set(it.spin.x * tumble + t * 0.3 * rawness * live, it.spin.y * tumble, 0)
      const sa = va ? 1 : 0, sb = vb ? 1 : 0
      const rawScale = 1 - rawness * 0.35
      dummy.scale.setScalar((sa + (sb - sa) * local) * ip * U * 0.92 * rawScale)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
      col.copy(va ? va.c : C.slate).lerp(vb ? vb.c : C.slate, local)
      m.setColorAt(i, col)
    }
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true

    // place and move the whole forge
    const vw = viewport.width, vh = viewport.height
    const wide = size.width >= 900
    const side = SIDE[k] + (SIDE[k + 1] - SIDE[k]) * easeInOut(f)
    const regionW = wide ? vw * (0.56 + (1 - side) * 0.3) : vw
    const regionH = wide ? vh * 0.8 : vh * 0.5
    const scale = Math.min(regionW / 6.6, regionH / 5)
    const targetX = wide ? (vw / 2 - regionW / 2 - vw * 0.02) * side : 0
    const targetY = wide ? -vh * 0.02 : vh / 2 - regionH / 2 - vh * 0.07
    const launch = 1 - Math.min(Math.abs(s - 7), 1)
    g.position.x += (targetX - g.position.x) * 0.08
    g.position.y += (targetY + Math.sin(t * 1.1) * 0.06 * live + launch * 0.3 * scale - g.position.y) * 0.1
    g.scale.setScalar(scale)
    const baseY = -0.3 + Math.sin(t * 0.35) * 0.22 * live + s * 0.05
    g.rotation.y += (baseY + pointer.x * 0.3 * live - g.rotation.y) * 0.05
    g.rotation.x += (0.08 - pointer.y * 0.18 * live + Math.sin(t * 0.5) * 0.04 * live - g.rotation.x) * 0.05
    m.rotation.y = rawness * t * 0.08 * live
  })

  return (
    <group ref={group}>
      <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.42} metalness={0.08} />
      </instancedMesh>
      <Sparks stage={stage} reduced={reduced} />
    </group>
  )
}

const SPARKS = 80
function Sparks({ stage, reduced }: { stage: MutableRefObject<number>; reduced: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const parts = useMemo(() => Array.from({ length: SPARKS }, () => ({ age: 99, life: 1, pos: new THREE.Vector3(), vel: new THREE.Vector3() })), [])
  useFrame((_, dt) => {
    const m = mesh.current
    if (!m) return
    const step = reduced ? 0 : Math.min(dt, 0.05)
    const ch = Math.round(stage.current)
    const mode = ch === 2 || ch === 8 ? 'mark' : ch === 3 ? 'orb' : ch === 7 ? 'exhaust' : 'drift'
    parts.forEach((p, i) => {
      p.age += step
      if (p.age > p.life && Math.random() < (mode === 'drift' ? 0.04 : 0.25)) {
        p.age = 0
        p.life = 0.8 + Math.random() * 1.4
        if (mode === 'mark') {
          p.pos.set(1.6, 1.4, 0)
          p.vel.set(0.2 + Math.random() * 0.7, 0.6 + Math.random() * 0.9, (Math.random() - 0.5) * 0.6)
        } else if (mode === 'orb') {
          const a = Math.random() * Math.PI * 2
          p.pos.set(Math.cos(a) * 1.2, 0.9 + Math.sin(a) * 1.2, 0)
          p.vel.set(Math.cos(a) * 0.5, Math.sin(a) * 0.5 + 0.2, (Math.random() - 0.5) * 0.3)
        } else if (mode === 'exhaust') {
          p.pos.set((Math.random() - 0.5) * 0.6, -1.5, 0)
          p.vel.set((Math.random() - 0.5) * 0.8, -1.5 - Math.random() * 1.5, (Math.random() - 0.5) * 0.5)
        } else {
          // embers drifting up through the whole page
          p.pos.set((Math.random() - 0.5) * 6, -2.6, (Math.random() - 0.5) * 2)
          p.vel.set((Math.random() - 0.5) * 0.2, 0.5 + Math.random() * 0.5, 0)
          p.life = 4 + Math.random() * 3
        }
      }
      p.vel.y -= (mode === 'mark' ? 0.5 : 0) * step
      p.pos.addScaledVector(p.vel, step)
      const k = Math.max(1 - p.age / p.life, 0)
      dummy.position.copy(p.pos)
      dummy.scale.setScalar(reduced ? 0 : k * U * 0.4)
      dummy.rotation.set(p.age * 3, p.age * 2, 0)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    })
    m.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, SPARKS]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#FFB020" toneMapped={false} />
    </instancedMesh>
  )
}

function ForgeLight({ stage }: { stage: MutableRefObject<number> }) {
  const light = useRef<THREE.PointLight>(null)
  useFrame(({ clock }) => {
    if (!light.current) return
    const s = stage.current
    const melt = 1 - Math.min(Math.abs(s - 3), 1)
    const done = 1 - Math.min(Math.abs(s - 8), 1)
    light.current.intensity = 4 + melt * 14 + done * 8 + Math.sin(clock.elapsedTime * 2.5) * melt * 4
  })
  return <pointLight ref={light} position={[1.8, 1.2, 2]} distance={9} color="#FF5A1F" />
}

export default function ForgeScene({ stage, reduced }: { stage: MutableRefObject<number>; reduced: boolean }) {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 38 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 5]} intensity={1.5} />
      <directionalLight position={[-4, -2, 2]} intensity={0.35} color="#8FA2FF" />
      <ForgeLight stage={stage} />
      <Voxels stage={stage} reduced={reduced} />
    </Canvas>
  )
}
