import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUiStore } from '@/stores/ui'
import { otherSlot } from '@/stores/conversation'

const EDITOR_GAP = 28

export function useOverlayGeometry() {
  const { comment, commentSlot, commentRect, editorRect } = storeToRefs(useUiStore())

  const editorSlot = computed(() => (commentSlot.value ? otherSlot(commentSlot.value) : 'top'))

  const commentStyle = computed(() => {
    const rect = commentRect.value
    if (!rect) return {}
    return {
      position: 'absolute',
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      display: 'flex',
      flexDirection: 'column',
    }
  })

  const editorStyle = computed(() => {
    const rect = editorRect.value
    if (rect) {
      return {
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        right: 'auto',
      }
    }
    const anchor = commentRect.value
    if (!anchor) return { top: 'var(--stage-top)', left: 'var(--gutter)', right: 'var(--gutter)' }
    if (commentSlot.value === 'bottom') {
      return { bottom: `calc(${window.innerHeight - anchor.top + EDITOR_GAP}px - var(--kb))` }
    }
    return { top: `${anchor.bottom + EDITOR_GAP}px` }
  })

  return { comment, commentSlot, commentStyle, editorSlot, editorStyle }
}
