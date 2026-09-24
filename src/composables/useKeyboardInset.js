// made by claude
import { onScopeDispose } from 'vue'

const TOOLBAR_HEIGHT = 120

const DEBUG = location.search.includes('kb-debug')

export function useKeyboardInset() {
  const probe = document.createElement('div')
  probe.style.cssText =
    'position:fixed;top:0;bottom:0;left:0;width:0;visibility:hidden;pointer-events:none'
  document.body.append(probe)

  const ruler = DEBUG ? document.createElement('div') : null
  const readout = DEBUG ? document.createElement('pre') : null
  if (DEBUG) {
    ruler.style.cssText =
      'position:fixed;top:0;left:0;width:0;visibility:hidden;pointer-events:none'
    readout.style.cssText = `
      position: fixed; inset: 0 0 auto 0; z-index: 99; margin: 0; padding: 6px;
      font: 11px/1.35 monospace; white-space: pre-wrap; color: #000;
      background: #ff0; pointer-events: none;
    `
    document.body.append(ruler, readout)
  }

  function rule(length) {
    ruler.style.height = length
    return Math.round(ruler.getBoundingClientRect().height * 10) / 10
  }

  let widest = 0
  let tallest = 0

  function sync() {
    const view = window.visualViewport
    const layout = probe.getBoundingClientRect().height || window.innerHeight

    if (window.innerWidth !== widest) {
      widest = window.innerWidth
      tallest = 0
    }
    tallest = Math.max(tallest, layout)

    const covered = view ? Math.max(0, layout - view.height - view.offsetTop) : 0
    const shrink = tallest - layout > TOOLBAR_HEIGHT ? tallest - layout : 0

    const root = document.documentElement.style
    root.setProperty('--kb-reported', `${Math.round(covered)}px`)
    root.setProperty('--kb-shrink', `${Math.round(shrink)}px`)

    if (!DEBUG) return
    readout.textContent = [
      `layout ${Math.round(layout)}  tallest ${Math.round(tallest)}  vv ${
        view ? `${Math.round(view.height)} @${Math.round(view.offsetTop)}` : 'none'
      }`,
      `reported ${Math.round(covered)}  shrink ${Math.round(shrink)}`,
      `safe-area ${rule('env(safe-area-inset-bottom, 0px)')}  --kb ${rule(
        'var(--kb)',
      )}  --inset-bottom ${rule('var(--inset-bottom)')}`,
      `dpr ${window.devicePixelRatio}  ${window.innerWidth}x${window.innerHeight}`,
    ].join('\n')
  }

  sync()
  window.visualViewport?.addEventListener('resize', sync)
  window.visualViewport?.addEventListener('scroll', sync)
  window.addEventListener('resize', sync)

  onScopeDispose(() => {
    window.visualViewport?.removeEventListener('resize', sync)
    window.visualViewport?.removeEventListener('scroll', sync)
    window.removeEventListener('resize', sync)
    probe.remove()
    ruler?.remove()
    readout?.remove()
  })
}
