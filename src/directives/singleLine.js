const onKeydown = (event) => {
  if (event.key === 'Enter') event.preventDefault()
}

const onBeforeInput = (event) => {
  if (event.inputType === 'insertLineBreak' || event.inputType === 'insertParagraph') {
    event.preventDefault()
  }
}

const onInput = (event) => {
  const el = event.target
  if (!/[\r\n]/.test(el.value)) return
  const collapsed = el.value.replace(/[ \t]*[\r\n]+[ \t]*/g, ' ')
  const caret = Math.max(0, el.selectionStart - (el.value.length - collapsed.length))
  el.value = collapsed
  el.setSelectionRange(caret, caret)
  el.dispatchEvent(new Event('input', { bubbles: true }))
}

export const vSingleLine = {
  mounted(el) {
    el.addEventListener('keydown', onKeydown)
    el.addEventListener('beforeinput', onBeforeInput)
    el.addEventListener('input', onInput)
  },
  unmounted(el) {
    el.removeEventListener('keydown', onKeydown)
    el.removeEventListener('beforeinput', onBeforeInput)
    el.removeEventListener('input', onInput)
  },
}
