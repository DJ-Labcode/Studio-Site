// HD walkthrough of the DuoForge site. The page runs K times slower while recording (JS clocks, CSS animations and
// the hero video), and the result is sped back up, so the final video is smooth at ~30 fps.
const { chromium } = require('playwright')
const fs = require('fs')
const OUT = process.argv[2], URL = process.argv[3] || 'http://localhost:4174'
;(async () => {
  const K = 4
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } })
  await p.addInitScript((K) => {
    const rNow = performance.now.bind(performance), t0 = rNow()
    performance.now = () => t0 + (rNow() - t0) / K
    const rDate = Date.now, d0 = rDate(); Date.now = () => d0 + (rDate() - d0) / K
    const rRAF = window.requestAnimationFrame.bind(window)
    window.requestAnimationFrame = (cb) => rRAF(() => cb(performance.now()))
    const rST = window.setTimeout.bind(window), rSI = window.setInterval.bind(window)
    window.setTimeout = (f, ms = 0, ...a) => rST(f, ms * K, ...a)
    window.setInterval = (f, ms = 0, ...a) => rSI(f, ms * K, ...a)
    new MutationObserver(() => document.querySelectorAll('video').forEach((v) => { v.playbackRate = 1 / K })).observe(document, { childList: true, subtree: true })
  }, K)
  const cdp = await p.context().newCDPSession(p)
  await cdp.send('Animation.enable'); await cdp.send('Animation.setPlaybackRate', { playbackRate: 1 / K })
  const frames = []
  cdp.on('Page.screencastFrame', async (f) => { frames.push({ t: f.metadata.timestamp, data: f.data }); try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }) } catch {} })
  await p.goto(URL)
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto' })
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 })
  const wait = (ms) => p.waitForTimeout(ms * K)
  const scrollTo = (y, ms) => p.evaluate(([y, ms]) => new Promise((res) => {
    const s = scrollY, d = y - s, t0 = performance.now()
    const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
    const step = (now) => { const k = Math.min((now - t0) / ms, 1); window.scrollTo(0, s + d * ease(k)); k < 1 ? requestAnimationFrame(step) : res() }
    requestAnimationFrame(step)
  }), [y, ms])
  const yOf = (sel, f) => p.evaluate(([sel, f]) => { const e = document.querySelector(sel); const r = e.getBoundingClientRect(); return scrollY + r.top + (r.height - innerHeight) * f }, [sel, f])
  const park = () => p.mouse.move(960, 80)

  await wait(4200)                                            // splash, then the desk
  await scrollTo(await yOf('#top', 1), 6500); await wait(500) // glide into the laptop
  await scrollTo(await yOf('#inside', 0.95), 4200); await wait(1300) // the split
  await p.click('.split-web .split-go'); await park(); await wait(5200) // web world, belt moving
  await p.mouse.move(700, 760); await wait(700)              // hovering pauses the belt
  await p.click('.wv-item >> nth=1', { force: true }); await wait(2200) // open a website
  await p.evaluate(() => new Promise((res) => { const el = document.querySelector('.case-panel'), t0 = performance.now(); const st = (n) => { const k = Math.min((n - t0) / 900, 1); el.scrollTop = 360 * k; k < 1 ? requestAnimationFrame(st) : res() }; requestAnimationFrame(st) }))
  await wait(700)
  await p.click('.ls-chips button >> text=2 BHK'); await wait(900)
  await p.click('.ls-home >> nth=0'); await wait(1500)
  await p.keyboard.press('Escape'); await wait(900)
  await p.click('.wv-close'); await wait(700)
  await p.click('.split-app .split-go'); await park(); await wait(5200) // app world
  await p.click('.wv-close'); await wait(600)
  await scrollTo(await yOf('#web', 0.55), 2600); await wait(600)
  await p.click('.web-tabs button >> nth=3'); await wait(1800)
  await scrollTo(await yOf('#apps', 0.6), 2600); await wait(500)
  await p.click('.app-dock button >> nth=0'); await wait(900)
  await p.click('.lv-opt >> nth=1'); await wait(1600)
  await scrollTo(await yOf('#team', 0.95), 4200); await wait(1300)     // merge
  await scrollTo(await yOf('#how', 0.97), 4500); await wait(1800)      // how we work
  await scrollTo(await yOf('.builder-grid', 0), 2600); await wait(600)
  for (const name of ['AI assistant', 'Admin dashboard']) { await p.click(`.part >> text=${name}`); await wait(1000) }
  if (!process.env.SKIP_END) {
    await scrollTo(await yOf('#forged', 0), 2600); await wait(600)
    await scrollTo(await yOf('#forged', 1), 7500); await wait(2200)      // pull out to the logo
    await scrollTo(await p.evaluate(() => document.body.scrollHeight), 2200); await wait(1800)
  } else { await p.click('.pick button >> text=Web'); await wait(2200) }

  await cdp.send('Page.stopScreencast'); await b.close()
  let list = ''
  frames.forEach((f, i) => {
    const name = `f${String(i).padStart(5, '0')}.jpg`
    fs.writeFileSync(`${OUT}/frames/${name}`, Buffer.from(f.data, 'base64'))
    list += `file 'frames/${name}'\nduration ${((i < frames.length - 1 ? frames[i + 1].t - f.t : 1) / K).toFixed(4)}\n`
  })
  list += `file 'frames/f${String(frames.length - 1).padStart(5, '0')}.jpg'\n`
  fs.writeFileSync(`${OUT}/list.txt`, list)
  const dur = (frames.at(-1).t - frames[0].t) / K
  console.log('frames', frames.length, 'video seconds', dur.toFixed(1), 'fps', (frames.length / dur).toFixed(1))
})()
