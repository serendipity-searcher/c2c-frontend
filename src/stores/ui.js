import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useConversationStore } from './conversation'

const OVERLAY_SWAP_MS = 900
const THANKS_HOLD_MS = 7500

export const useUiStore = defineStore('ui', () => {
  const conversation = useConversationStore()

  const overlay = ref(null) // null | 'reply' | 'new' | 'flag' | 'thanks'
  const thanksKind = ref(null) // 'submitted' | 'flagged'
  const comment = ref(null) // the tapped comment, frozen by the overlay
  const commentSlot = ref(null) // 'top' | 'bottom'; null when nothing was tapped
  const commentRect = ref(null)
  const editorRect = ref(null)
  const submittedComment = ref(null) // shown on the thanks screen

  const isOpen = computed(() => overlay.value !== null)

  let thanksTimer = null
  let unfreezeTimer = null

  function open(kind, { comment: tapped = null, slot = null, rect = null, editor = null } = {}) {
    if (overlay.value) return
    overlay.value = kind
    comment.value = tapped
    commentSlot.value = slot
    commentRect.value = rect
    editorRect.value = editor
    conversation.freeze()
  }

  const openReply = (tapped, slot, rect, editor) =>
    open('reply', { comment: tapped, slot, rect, editor })

  const openFlag = (tapped, slot, rect, editor) =>
    open('flag', { comment: tapped, slot, rect, editor })

  const openNew = (rect) => open('new', { editor: rect })

  function showThanks(kind, submitted = null) {
    clearTimeout(thanksTimer)
    clearTimeout(unfreezeTimer)
    overlay.value = 'thanks'
    thanksKind.value = kind
    submittedComment.value = submitted
    unfreezeTimer = setTimeout(conversation.unfreeze, OVERLAY_SWAP_MS)
    thanksTimer = setTimeout(close, THANKS_HOLD_MS)
  }

  function close() {
    clearTimeout(thanksTimer)
    clearTimeout(unfreezeTimer)
    thanksTimer = null
    unfreezeTimer = null
    overlay.value = null
    thanksKind.value = null
    comment.value = null
    commentSlot.value = null
    commentRect.value = null
    editorRect.value = null
    submittedComment.value = null
    conversation.unfreeze()
  }

  return {
    overlay,
    thanksKind,
    comment,
    commentSlot,
    commentRect,
    editorRect,
    submittedComment,
    isOpen,
    openReply,
    openFlag,
    openNew,
    showThanks,
    close,
  }
})
