import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api'
import { DEFAULT_LOCALE } from '@/i18n/locales'
import { useLanguageStore } from './language'

export const SLOTS = ['top', 'bottom']

export const otherSlot = (slot) => (slot === 'top' ? 'bottom' : 'top')

const INTERRUPT_TYPES = new Set(['new_comment', 'conversation_starter'])

const SWAP_MS = 5000

export const useConversationStore = defineStore('conversation', () => {
  const slots = ref({ top: null, bottom: null })
  const banner = ref(false)
  const status = ref('closed') // 'connecting' | 'open' | 'closed'
  const inverted = ref(false)
  const interrupting = ref(false)

  const frozen = ref(false)
  let pending = null
  let started = false
  let interruptID = null
  let settleTimer = null

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
    clearTimeout(settleTimer)
    settleTimer = null
    interruptID = null
    slots.value = { top: null, bottom: null }
    banner.value = false
    inverted.value = false
    interrupting.value = false
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

  function stopInterrupt() {
    interruptID = null
    banner.value = false
    inverted.value = false
    if (!interrupting.value) return
    clearTimeout(settleTimer)
    settleTimer = setTimeout(() => {
      interrupting.value = false
      settleTimer = null
    }, SWAP_MS)
  }

  function showInterrupt(ID, pair, withBanner) {
    clearTimeout(settleTimer)
    settleTimer = null
    interruptID = ID
    interrupting.value = true
    banner.value = withBanner
    slots.value = pair
    inverted.value = true
  }

  function apply({ type, payload }) {
    switch (type) {
      case 'comment': {
        const repeat = interruptID !== null && payload.ID === interruptID
        const showing = interrupting.value
        stopInterrupt()
        const next = { ...slots.value, [payload.slot]: payload }
        if (repeat && showing) next[otherSlot(payload.slot)] = null
        slots.value = next
        break
      }
      case 'new_comment':
        showInterrupt(payload.ID, { top: null, bottom: payload }, true)
        break
      case 'conversation_starter': {
        const { starter, translation } = payload
        const pair = { top: null, bottom: null }
        pair[starter.slot] = starter
        if (translation.language !== starter.language) pair[translation.slot] = translation
        showInterrupt(starter.ID, pair, false)
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
    banner,
    status,
    inverted,
    interrupting,
    frozen,
    initialize,
    freeze,
    unfreeze,
    flagComment,
    submitReply,
    submitNewConversation,
  }
})
