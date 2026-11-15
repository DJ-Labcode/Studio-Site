const { chromium } = require('playwright')
const fs = require('fs')
const OUT = process.argv[2], N = Number(process.argv[3]), CLIP = process.argv[4] || null
const save = (p, d) => fs.writeFileSync(p, Buffer.from(d.split(',')[1], 'base64'))
;(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
  const p = await b.newPage({ viewport: { width: 400, height: 300 } })
  const errs = []; p.on('pageerror', (e) => errs.push(e.message))
  await p.goto('http://localhost:4180/film/day.html')
  await p.waitForFunction(() => window.filmReady); await p.evaluate(() => window.filmReady)
  fs.mkdirSync(`${OUT}/tex`, { recursive: true }); fs.mkdirSync(`${OUT}/screens/lap`, { recursive: true }); fs.mkdirSync(`${OUT}/screens/ph`, { recursive: true })
  const st = await p.evaluate(() => window.exportStatic())
  for (const [k, v] of Object.entries(st)) save(`${OUT}/tex/${k}.png`, v)
  const meta = await p.evaluate(() => window.exportMeta())
  const frames = []
  for (let i = 0; i < N; i++) {
    const u = CLIP === 'hero' ? i / N : i / (N - 1)
    const d = await p.evaluate(([c, u]) => (c ? window.clipData(c, u) : window.frameData(u)), [CLIP, u])
    const n = String(i + 1).padStart(4, '0')
    save(`${OUT}/screens/lap/${n}.jpg`, d.lap); save(`${OUT}/screens/ph/${n}.jpg`, d.ph)
    delete d.lap; delete d.ph; frames.push(d)
  }
  fs.writeFileSync(`${OUT}/anim.json`, JSON.stringify({ N, meta, frames }))
  console.log('ok', Object.keys(st), N, errs)
  await b.close()
})()
