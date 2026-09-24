// made by claude
import { onScopeDispose } from 'vue'

export const MAX_COMMENT_LENGTH = 240

const SAMPLES = [
  'wij denken dat de stad meer ruimte moet maken voor mensen die hier al jaren wonen want zonder hen verliest de buurt haar stem en wie beslist eigenlijk wat er gebeurt met de plekken waar we elke dag samenkomen om te praten',
  'democratische besluitvorming verdwijnt langzaam uit onze buurten, inspraakavonden worden afgeschaft, bewonersinitiatieven krijgen geen ruimte, en verantwoording achteraf blijft volledig onzichtbaar voor gewone inwoners',
  'burgerparticipatie betekent tegenwoordig vooral informatieavonden, terwijl bewonersinitiatieven nauwelijks doorslaggevend meewegen; besluitvormingsprocessen blijven ondoorzichtig, verantwoording achteraf ontbreekt volledig',
]

function toCap(sample, length) {
  let out = sample
  while (out.length < length) out += ` ${sample}`
  return out.slice(0, length)
}

const DEBUG = location.search.includes('size-debug')

const MIN_SIZE = 11
const MAX_SIZE = 64
const STEPS = 10

export function useCommentSizing() {
  const root = document.documentElement

  const box = document.createElement('div')
  box.setAttribute('aria-hidden', 'true')
  box.style.cssText = `
    position: fixed; top: 0; left: 0; visibility: hidden; pointer-events: none;
    z-index: -1; height: calc(var(--band) * 50); width: var(--comment-width);
  `

  const blocks = SAMPLES.map((sample) => {
    const el = document.createElement('div')
    el.className = 'comment-text'
    el.style.hyphens = 'manual'
    el.style.webkitHyphens = 'manual'
    el.textContent = toCap(sample, MAX_COMMENT_LENGTH)
    box.append(el)
    return el
  })
  document.body.append(box)

  function tallest(size) {
    let height = 0
    for (const el of blocks) {
      el.style.fontSize = `${size}px`
      height = Math.max(height, el.getBoundingClientRect().height)
    }
    return height
  }

  function autosizing() {
    const el = document.createElement('div')
    el.style.cssText = 'position:absolute;top:0;left:0;width:340px;font-size:14px'
    el.textContent = 'x '.repeat(400)
    document.body.append(el)
    const computed = getComputedStyle(el).fontSize
    el.remove()
    return computed !== '14px'
  }

  const readout = DEBUG ? document.createElement('pre') : null
  if (readout) {
    readout.style.cssText = `
      position: fixed; inset: auto 0 0 0; z-index: 99; margin: 0; padding: 6px;
      font: 11px/1.35 monospace; white-space: pre-wrap; color: #000;
      background: #ff0; pointer-events: none;
    `
    document.body.append(readout)
  }

  function report(lines) {
    if (readout) readout.textContent = lines.join('\n')
  }

  let last = ''

  function measure() {
    const { height: pair, width: column } = box.getBoundingClientRect()
    if (!pair || !column) return

    const key = `${Math.round(pair)}x${Math.round(column)}`
    if (key === last) return
    last = key

    const styles = getComputedStyle(root)
    const leading = parseFloat(styles.getPropertyValue('--comment-leading')) || 1.5
    const gapLines = parseFloat(styles.getPropertyValue('--slot-gap-lines')) || 1

    const band = (size) => (pair - size * leading * gapLines) / 2

    let fits = MIN_SIZE
    let over = MAX_SIZE
    for (let i = 0; i < STEPS; i += 1) {
      const mid = (fits + over) / 2
      if (tallest(mid) <= band(mid) + 0.5) fits = mid
      else over = mid
    }
    const size = Math.floor(fits * 10) / 10

    if (over >= MAX_SIZE || tallest(size) > band(size) + 0.5) {
      last = ''
      report([
        `REJECTED size=${size} over=${over}`,
        `viewport ${innerWidth}x${innerHeight} pair=${pair.toFixed(1)} col=${column.toFixed(1)}`,
        `leading=${leading} gap=${gapLines} band(${size})=${band(size).toFixed(1)} tallest=${tallest(size).toFixed(1)}`,
        `autosizing=${autosizing()} font=${getComputedStyle(blocks[0]).fontFamily}`,
      ])
      return
    }

    const lines = Math.max(1, Math.floor((band(size) + 0.5) / (size * leading)))

    root.style.setProperty('--comment-size', `${size}px`)
    root.style.setProperty('--slot-lines', String(lines))

    report([
      `size=${size}px lines=${lines}`,
      `viewport ${innerWidth}x${innerHeight} pair=${pair.toFixed(1)} col=${column.toFixed(1)}`,
      `leading=${leading} gap=${gapLines} band=${band(size).toFixed(1)} tallest=${tallest(size).toFixed(1)}`,
      `autosizing=${autosizing()} font=${getComputedStyle(blocks[0]).fontFamily}`,
    ])
  }

  function remeasure() {
    last = ''
    measure()
  }

  measure()
  requestAnimationFrame(remeasure)
  document.fonts?.ready?.then(remeasure)
  document.fonts?.addEventListener('loadingdone', remeasure)
  window.addEventListener('resize', measure)
  window.addEventListener('orientationchange', remeasure)

  onScopeDispose(() => {
    document.fonts?.removeEventListener('loadingdone', remeasure)
    window.removeEventListener('resize', measure)
    window.removeEventListener('orientationchange', remeasure)
    box.remove()
    readout?.remove()
  })
}
