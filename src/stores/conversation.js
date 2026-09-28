import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/api'
import { DEFAULT_LOCALE } from '@/i18n/locales'
import { useLanguageStore } from './language'

export const SLOTS = ['top', 'bottom']

export const otherSlot = (slot) => (slot === 'top' ? 'bottom' : 'top')

const INTERRUPT_TYPES = new Set(['new_comment', 'conversation_starter'])

// Used only if a frame arrives without one; the backend's own value is 20.
const DEFAULT_INTERRUPT_SECONDS = 20

export const useConversationStore = defineStore('conversation', () => {
  const slots = ref({ top: null, bottom: null })
  const current = ref(null)
  const display = ref('comment') // 'comment' | 'starter' | 'live'
  const status = ref('closed') // 'connecting' | 'open' | 'closed'
  // How long the interrupt on screen has before the next frame replaces it, which
  // is the whole length of its four-phase arc (base.css). The backend sends it as
  // `display_seconds` on every frame; only an interrupt's is read.
  const interruptSeconds = ref(DEFAULT_INTERRUPT_SECONDS)

  const inverted = computed(() => display.value !== 'comment')

  const frozen = ref(false)
  let pending = null
  let started = false

  function initialize() {
    if (started) return
    started = true
    api.onStatement(receive)
    api.onStatus(handleStatus)
    api.connect()
  }

  function handleStatus(next) {
    if (next === 'open' && status.value !== 'open') reset()
    status.value = next
  }

  function reset() {
    slots.value = { top: null, bottom: null }
    current.value = null
    display.value = 'comment'
    interruptSeconds.value = DEFAULT_INTERRUPT_SECONDS
    pending = null
  }

  function receive(frame) {
    if (!frozen.value) {
      apply(frame)
      return
    }
    if (pending && INTERRUPT_TYPES.has(pending.type)) return
    pending = frame
  }

  function apply({ type, payload, display_seconds: seconds }) {
    if (INTERRUPT_TYPES.has(type) && seconds > 0) interruptSeconds.value = seconds
    switch (type) {
      case 'comment':
        slots.value = { ...slots.value, [payload.slot]: payload }
        display.value = 'comment'
        break
      case 'new_comment':
        current.value = payload
        display.value = 'live'
        break
      case 'conversation_starter': {
        const { starter, translation } = payload
        const pair = { [starter.slot]: starter }
        if (translation.language !== starter.language) pair[translation.slot] = translation
        current.value = { ID: starter.ID, slots: pair }
        display.value = 'starter'
        break
      }
    }
  }

  function freeze() {
    frozen.value = true
  }

  function unfreeze() {
    frozen.value = false
    if (!pending) return
    apply(pending)
    pending = null
  }

  // the backend keeps a flagged comment in rotation
  function flagComment(commentID, reason) {
    if (!api.postFlag({ commentID, reason, donotshow: true })) return false

    for (const name of SLOTS) {
      const entry = slots.value[name]
      if (entry?.ID === commentID) {
        slots.value = { ...slots.value, [name]: { ...entry, is_flagged: true } }
      }
    }
    if (current.value?.ID === commentID) {
      current.value = { ...current.value, is_flagged: true }
    }
    return true
  }

  const language = useLanguageStore()
  const submissionLanguage = () => language.locale ?? DEFAULT_LOCALE

  const submitReply = ({ text, replyTo }) =>
    api.postComment({ text, replyTo, language: submissionLanguage() })

  const submitNewConversation = ({ text, topics }) =>
    api.postComment({ text, replyTo: null, topics, language: submissionLanguage() })

  return {
    slots,
    current,
    display,
    status,
    inverted,
    interruptSeconds,
    frozen,
    initialize,
    freeze,
    unfreeze,
    flagComment,
    submitReply,
    submitNewConversation,
  }
})
