import * as T from 'three'
import { palette } from '@/shared/brand/palette'

/** One train on the loop: its colour, the shape of its panels and the name shown on each. */
export type ForgeTrain = { color: string; wide: boolean; names: readonly string[] }

type Unit = {
  obj: T.Object3D
  /** distance behind the nose, in world units along the track */
  behind: number
  panel?: { finished: T.Mesh; sketch: T.Group; done: boolean | null; poppedAt: number }
}

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1)
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3)

/** Paints a small canvas and returns it as a texture. */
function paint(
  w: number,
  h: number,
  draw: (g: CanvasRenderingContext2D, w: number, h: number) => void,
) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const g = canvas.getContext('2d')
  if (g) draw(g, w, h)
  const texture = new T.CanvasTexture(canvas)
  texture.colorSpace = T.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

/** A stand-in project screen: a header, a coloured block with the project's name, a few lines and a button. */
function screenTexture(name: string, wide: boolean, accent: string) {
  return paint(wide ? 640 : 320, wide ? 420 : 540, (g, w, h) => {
    const bar = wide ? 44 : 34
    const block = wide ? 200 : 230
    g.fillStyle = '#ffffff'
    g.fillRect(0, 0, w, h)
    g.fillStyle = '#f1ece4'
    g.fillRect(0, 0, w, bar)
    if (wide)
      for (let i = 0; i < 3; i++) {
        g.fillStyle = '#e3dccf'
        g.beginPath()
        g.arc(24 + i * 22, bar / 2, 6, 0, Math.PI * 2)
        g.fill()
      }
    g.fillStyle = accent
    g.fillRect(0, bar, w, block)
    g.fillStyle = '#ffffff'
    g.font = `700 ${wide ? 50 : 40}px "Space Grotesk", sans-serif`
    g.textBaseline = 'top'
    let line = ''
    let y = bar + (wide ? 48 : 40)
    for (const word of name.split(' ')) {
      if (line && g.measureText(line + word).width > w - 56) {
        g.fillText(line.trim(), 28, y)
        y += wide ? 56 : 46
        line = ''
      }
      line += `${word} `
    }
    g.fillText(line.trim(), 28, y)
    g.fillStyle = '#e9e3d9'
    for (let i = 0; i < (wide ? 3 : 5); i++)
      g.fillRect(28, bar + block + 30 + i * 30, (w - 56) * (i % 2 ? 0.6 : 0.9), 12)
    g.fillStyle = accent
    g.fillRect(28, h - 62, wide ? 150 : w - 56, 34)
  })
}

/** Outline of an arch with the given inner half-width, straight wall height and wall thickness. */
function archShape(half: number, wall: number, thick: number) {
  const s = new T.Shape()
  s.moveTo(-half - thick, 0)
  s.lineTo(-half - thick, wall)
  s.absarc(0, wall, half + thick, Math.PI, 0, true)
  s.lineTo(half + thick, 0)
  s.lineTo(half, 0)
  s.lineTo(half, wall)
  s.absarc(0, wall, half, 0, Math.PI, false)
  s.lineTo(-half, 0)
  s.lineTo(-half - thick, 0)
  return s
}

/**
 * The forge: a loop of track through an arched tunnel. Two trains carry panels around it; a panel
 * goes in as an outline sketch and comes out as a finished screen, with a burst of sparks.
 * Returns a function that stops the scene and frees its resources.
 */
export function createForge(
  canvas: HTMLCanvasElement,
  { trains, still }: { trains: readonly ForgeTrain[]; still: boolean },
): () => void {
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  const scene = new T.Scene()
  const camera = new T.PerspectiveCamera(30, 1.6, 0.1, 100)
  camera.position.set(0, 6.3, 9.3)
  camera.lookAt(0, 0.3, 0.15)
  scene.add(new T.HemisphereLight(0xffffff, 0xe6dccb, 3))
  const sun = new T.DirectionalLight(0xffffff, 2.2)
  sun.position.set(4, 9, 7)
  scene.add(sun)
  const world = new T.Group()
  scene.add(world)

  const material = (color: T.ColorRepresentation, extra: T.MeshStandardMaterialParameters = {}) =>
    new T.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.05, ...extra })

  // the loop is stadium-shaped; its front straight runs left to right through the forge
  const L = 1.75
  const R = 1.55
  const points: T.Vector3[] = []
  for (let i = 0; i < 8; i++) points.push(new T.Vector3(-L + (2 * L * i) / 8, 0, R))
  for (let i = 0; i < 12; i++) {
    const a = (Math.PI * i) / 12
    points.push(new T.Vector3(L + R * Math.sin(a), 0, R * Math.cos(a)))
  }
  for (let i = 0; i < 8; i++) points.push(new T.Vector3(L - (2 * L * i) / 8, 0, -R))
  for (let i = 0; i < 12; i++) {
    const a = (Math.PI * i) / 12
    points.push(new T.Vector3(-L - R * Math.sin(a), 0, -R * Math.cos(a)))
  }
  const loop = new T.CatmullRomCurve3(points, true, 'catmullrom', 0.5)
  const LENGTH = loop.getLength()

  // platform, sleepers and rails
  const edge = R + 0.7
  const platform = new T.Shape()
  platform.moveTo(-L, -edge)
  platform.lineTo(L, -edge)
  platform.absarc(L, 0, edge, -Math.PI / 2, Math.PI / 2, false)
  platform.lineTo(-L, edge)
  platform.absarc(-L, 0, edge, Math.PI / 2, (Math.PI * 3) / 2, false)
  const floor = new T.Mesh(
    new T.ShapeGeometry(platform, 48),
    new T.MeshBasicMaterial({ color: 0xfbf3ea }),
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -0.02
  world.add(floor)

  const SLEEPERS = 96
  const sleepers = new T.InstancedMesh(
    new T.BoxGeometry(0.07, 0.03, 0.56),
    material(0xd8cfc1),
    SLEEPERS,
  )
  const placer = new T.Object3D()
  for (let i = 0; i < SLEEPERS; i++) {
    const at = i / SLEEPERS
    const p = loop.getPointAt(at)
    const t = loop.getTangentAt(at)
    placer.position.set(p.x, 0.015, p.z)
    placer.rotation.set(0, Math.atan2(-t.z, t.x), 0)
    placer.updateMatrix()
    sleepers.setMatrixAt(i, placer.matrix)
  }
  world.add(sleepers)
  for (const side of [0.19, -0.19]) {
    const line: T.Vector3[] = []
    for (let i = 0; i < 160; i++) {
      const p = loop.getPointAt(i / 160)
      const t = loop.getTangentAt(i / 160)
      line.push(new T.Vector3(p.x - t.z * side, 0.05, p.z + t.x * side))
    }
    world.add(
      new T.Mesh(
        new T.TubeGeometry(new T.CatmullRomCurve3(line, true), 240, 0.028, 6, true),
        material(0xb3aa9b, { metalness: 0.4 }),
      ),
    )
  }

  // the forge itself: a dark tunnel over the front straight with glowing mouths and the DF plate
  const DEPTH = 1.7
  const shellShape = new T.ExtrudeGeometry(archShape(0.56, 1.05, 0.16), {
    depth: DEPTH,
    bevelEnabled: false,
    curveSegments: 24,
  })
  shellShape.translate(0, 0, -DEPTH / 2)
  const shell = new T.Mesh(shellShape, material(palette.ink, { roughness: 0.6 }))
  shell.rotation.y = Math.PI / 2
  shell.position.set(0, 0, R)
  world.add(shell)
  const glow = new T.MeshBasicMaterial({ color: palette.ember })
  const lamps = [-1, 1].map((side) => {
    const mouth = new T.Mesh(
      new T.ExtrudeGeometry(archShape(0.56, 1.05, 0.2), {
        depth: 0.07,
        bevelEnabled: false,
        curveSegments: 24,
      }),
      glow,
    )
    mouth.rotation.y = Math.PI / 2
    mouth.position.set(side * (DEPTH / 2) - (side < 0 ? 0.07 : 0), 0, R)
    world.add(mouth)
    const lamp = new T.PointLight(palette.ember, 4, 3.2, 1.5)
    lamp.position.set(side * (DEPTH / 2 + 0.3), 0.8, R)
    world.add(lamp)
    return lamp
  })
  const band = new T.Mesh(new T.BoxGeometry(DEPTH + 0.02, 0.09, 1.46), glow)
  band.position.set(0, 0.045, R)
  world.add(band)
  const plate = new T.Mesh(
    new T.PlaneGeometry(1.15, 0.45),
    new T.MeshBasicMaterial({
      transparent: true,
      map: paint(512, 200, (g, w, h) => {
        g.fillStyle = palette.paper
        g.beginPath()
        g.roundRect(0, 0, w, h, 36)
        g.fill()
        g.font = '700 128px "Space Grotesk", sans-serif'
        g.textBaseline = 'middle'
        const d = g.measureText('D').width
        const f = g.measureText('F').width
        const x = w / 2 - (d + f) / 2
        g.fillStyle = palette.ink
        g.fillText('D', x, h / 2 + 8)
        g.fillStyle = palette.ember
        g.fillText('F', x + d - 4, h / 2 + 8)
      }),
    }),
  )
  plate.position.set(0, 0.78, R + 0.73)
  world.add(plate)

  // the trains
  const blank = new T.MeshBasicMaterial({ color: 0xffffff })
  const fleet = trains.map((train, n) => {
    const units: Unit[] = []
    const nose = new T.Group()
    const body = new T.Mesh(
      new T.SphereGeometry(0.5, 28, 18),
      material(train.color, { roughness: 0.3 }),
    )
    body.scale.set(1.35, 0.52, 0.46)
    body.position.y = 0.36
    const glass = new T.Mesh(
      new T.SphereGeometry(0.5, 20, 14),
      material(0xcfe3ee, { roughness: 0.15 }),
    )
    glass.scale.set(0.5, 0.3, 0.36)
    glass.position.set(0.28, 0.5, 0)
    nose.add(body, glass)
    world.add(nose)
    units.push({ obj: nose, behind: 0 })

    const w = train.wide ? 1.28 : 0.62
    const h = train.wide ? 0.84 : 1.05
    train.names.forEach((name, i) => {
      const coach = new T.Group()
      const bed = new T.Mesh(new T.BoxGeometry(w + 0.12, 0.14, 0.44), material(train.color))
      bed.position.y = 0.17
      const slab = new T.BoxGeometry(w, h, 0.05)
      const face = new T.MeshBasicMaterial({ map: screenTexture(name, train.wide, train.color) })
      const finished = new T.Mesh(slab, [blank, blank, blank, blank, face, blank])
      finished.position.y = 0.26 + h / 2
      // the same panel as an idea: its outline and a few guide lines
      const ink = new T.LineBasicMaterial({ color: train.color })
      const guides: number[] = []
      const guide = (x1: number, y1: number, x2: number, y2: number) =>
        guides.push(x1 * w, y1 * h, 0.03, x2 * w, y2 * h, 0.03)
      guide(-0.5, 0.32, 0.5, 0.32)
      guide(-0.38, 0.1, 0.2, 0.1)
      guide(-0.38, -0.06, 0.34, -0.06)
      guide(-0.38, -0.3, -0.05, -0.3)
      const lines = new T.BufferGeometry()
      lines.setAttribute('position', new T.Float32BufferAttribute(guides, 3))
      const sketch = new T.Group()
      sketch.position.y = 0.26 + h / 2
      sketch.add(new T.LineSegments(new T.EdgesGeometry(slab), ink), new T.LineSegments(lines, ink))
      coach.add(bed, finished, sketch)
      world.add(coach)
      units.push({
        obj: coach,
        behind: 1.25 + (train.wide ? 0.25 : -0.1) + i * (w + 0.24),
        panel: { finished, sketch, done: null, poppedAt: 0 },
      })
    })
    return { units, phase: n / trains.length }
  })
  const forgeAt = L / LENGTH // the middle of the front straight

  // sparks fly from the exit each time a finished screen comes out
  const SPARKS = 60
  const sparkAt = new Float32Array(SPARKS * 3).fill(-20)
  const sparkGo = Array.from({ length: SPARKS }, () => new T.Vector3())
  const sparkLife = new Float32Array(SPARKS)
  const sparks = new T.BufferGeometry()
  sparks.setAttribute('position', new T.BufferAttribute(sparkAt, 3))
  world.add(
    new T.Points(
      sparks,
      new T.PointsMaterial({ color: 0xff7a3d, size: 0.1, transparent: true, opacity: 0.95 }),
    ),
  )
  let nextSpark = 0
  const timers = new Set<number>()
  const burst = () => {
    for (let n = 0; n < 14; n++) {
      const i = nextSpark++ % SPARKS
      sparkAt[i * 3] = DEPTH / 2 + 0.1
      sparkAt[i * 3 + 1] = 0.5 + Math.random() * 0.9
      sparkAt[i * 3 + 2] = R + (Math.random() - 0.5) * 0.5
      sparkGo[i]!.set(
        0.02 + Math.random() * 0.05,
        (Math.random() - 0.25) * 0.05,
        (Math.random() - 0.5) * 0.06,
      )
      sparkLife[i] = 1
    }
  }

  const resize = () => {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.fov = w / h < 1.1 ? 38 : 31
    camera.updateProjectionMatrix()
  }
  const sizes = new ResizeObserver(resize)
  sizes.observe(canvas)
  resize()

  let pointerX = 0
  let pointerY = 0
  let visible = true
  const onPointer = (e: PointerEvent) => {
    pointerX = (e.clientX / window.innerWidth) * 2 - 1
    pointerY = (e.clientY / window.innerHeight) * 2 - 1
  }
  window.addEventListener('pointermove', onPointer)
  const seen = new IntersectionObserver(([entry]) => (visible = entry?.isIntersecting ?? true))
  seen.observe(canvas)

  let raf = 0
  const tick = (now: number) => {
    raf = requestAnimationFrame(tick)
    if (!visible) return
    const lap = still ? 0.16 : (now / 15000) % 1
    let inForge = false
    for (const train of fleet)
      for (const unit of train.units) {
        const at = (((lap + train.phase - unit.behind / LENGTH) % 1) + 1) % 1
        const p = loop.getPointAt(at)
        const t = loop.getTangentAt(at)
        unit.obj.position.set(p.x, 0, p.z)
        unit.obj.rotation.y = Math.atan2(-t.z, t.x)
        const panel = unit.panel
        if (!panel) continue
        // how far round the loop this panel is since the middle of the forge
        const since = (((at - forgeAt) % 1) + 1) % 1
        const done = since < 0.56
        if (panel.done === false && done) {
          panel.poppedAt = now
          const id = window.setTimeout(() => {
            timers.delete(id)
            burst()
          }, 260)
          timers.add(id)
        }
        panel.done = done
        panel.finished.visible = done
        panel.sketch.visible = !done
        const pop = panel.poppedAt ? clamp01((now - panel.poppedAt - 250) / 550) : 1
        panel.finished.scale.setScalar(1 + (1 - easeOut(pop)) * 0.16)
        if (since < 0.05 || since > 0.97) inForge = true
      }

    for (let i = 0; i < SPARKS; i++) {
      if (sparkLife[i]! <= 0) continue
      const v = sparkGo[i]!
      sparkAt[i * 3] = sparkAt[i * 3]! + v.x
      sparkAt[i * 3 + 1] = sparkAt[i * 3 + 1]! + v.y
      sparkAt[i * 3 + 2] = sparkAt[i * 3 + 2]! + v.z
      v.y -= 0.0022
      sparkLife[i] = sparkLife[i]! - 0.028
      if (sparkLife[i]! <= 0) sparkAt[i * 3 + 1] = -20
    }
    sparks.attributes.position!.needsUpdate = true

    // the mouths burn brighter while a panel is inside
    const beat = (Math.sin(now / 300) + 1) / 2
    const heat = inForge ? 10 : 3.5 + beat * 1.2
    for (const lamp of lamps) lamp.intensity += (heat - lamp.intensity) * 0.1
    const k = clamp01(lamps[0]!.intensity / 10)
    glow.color.setRGB(1, 0.1 + k * 0.22, 0.02 + k * 0.08)

    world.rotation.y += ((still ? 0 : pointerX * 0.2) - world.rotation.y) * 0.05
    world.rotation.x += ((still ? 0 : pointerY * 0.05) - world.rotation.x) * 0.05
    renderer.render(scene, camera)
  }
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    timers.forEach((id) => window.clearTimeout(id))
    window.removeEventListener('pointermove', onPointer)
    sizes.disconnect()
    seen.disconnect()
    scene.traverse((node) => {
      const mesh = node as T.Mesh
      mesh.geometry?.dispose()
      const mats = Array.isArray(mesh.material)
        ? mesh.material
        : mesh.material
          ? [mesh.material]
          : []
      for (const m of mats) {
        ;(m as T.MeshBasicMaterial).map?.dispose()
        m.dispose()
      }
    })
    renderer.dispose()
  }
}
