<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { SLOTS, otherSlot, useConversationStore } from '@/stores/conversation'
import { useUiStore } from '@/stores/ui'
import { useT } from '@/i18n'
import CommentBubble from '@/components/comment/CommentBubble.vue'

const t = useT()

const conversation = useConversationStore()
const ui = useUiStore()
const { slots, banner, interrupting } = storeToRefs(conversation)
const emit = defineEmits(['tap', 'flag'])

const slotEls = {}
let keyboardHeld = false

const announcement = computed(() => {
  if (!interrupting.value) return []
  const spoken = banner.value ? [{ text: `${t('main.live_banner')}:` }] : []
  for (const name of SLOTS) {
    const statement = slots.value[name]
    if (statement) spoken.push({ text: statement.text, lang: statement.language })
  }
  return spoken
})

function onFocusIn(event) {
  if (keyboardHeld || !event.target?.matches?.(':focus-visible')) return
  keyboardHeld = true
  conversation.freeze()
}

function onFocusOut(event) {
  if (!keyboardHeld || event.currentTarget.contains(event.relatedTarget)) return
  keyboardHeld = false
  if (!ui.isOpen) conversation.unfreeze()
}

function retire(el) {
  el.setAttribute('aria-hidden', 'true')
  for (const button of el.querySelectorAll('button')) button.setAttribute('tabindex', '-1')
}

function revive(el) {
  el.removeAttribute('aria-hidden')
  for (const button of el.querySelectorAll('button')) button.removeAttribute('tabindex')
}

function toRect(el) {
  if (!el) return null
  const { top, left, bottom, width, height } = el.getBoundingClientRect()
  return { top, left, bottom, width, height }
}

function slotRect(name) {
  const el = slotEls[name]
  return toRect(el?.querySelector('.comment-bubble') ?? el)
}

const rectOf = (event) => toRect(event?.target?.closest('.comment-bubble'))

function relay(type, comment, event, name) {
  emit(type, comment, name, rectOf(event), slotRect(otherSlot(name)))
}

defineExpose({ slotRect })
</script>

<template>
  <section
    class="relative isolate shrink-0 h-(--stage-height) flex flex-col pt-(--stage-top) px-(--gutter) overflow-hidden"
    :aria-label="t('a11y.stage')"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <p class="sr-only" role="status">
      <template v-for="(segment, index) in announcement" :key="index">
        <span :lang="segment.lang">{{ segment.text }}</span
        >{{ ' ' }}
      </template>
    </p>

    <div
      v-for="name in SLOTS"
      :key="name"
      :ref="(el) => (slotEls[name] = el)"
      class="slot"
      :class="{ 'slot-top': name === 'top' }"
    >
      <Transition
        :name="interrupting ? 'swap' : 'rotate'"
        mode="out-in"
        @enter="revive"
        @leave="retire"
      >
        <p
          v-if="name === 'top' && banner"
          key="banner"
          class="comment-text comment-clamp text-fg-muted"
        >
          {{ t('main.live_banner') }}
        </p>
        <CommentBubble
          v-else-if="slots[name]"
          :key="slots[name].ID"
          :comment="slots[name]"
          :slot-name="name"
          :tappable="!interrupting"
          :flaggable="!interrupting"
          @tap="(comment, event) => relay('tap', comment, event, name)"
          @flag="(comment, event) => relay('flag', comment, event, name)"
        />
      </Transition>
    </div>
  </section>
</template>

<style scoped>
.rotate-enter-active,
.rotate-leave-active {
  transition:
    opacity 10s ease,
    filter 10s ease;
}

.rotate-enter-from,
.rotate-leave-to {
  opacity: 0;
  filter: blur(8px);
}

.swap-enter-active,
.swap-leave-active {
  transition:
    opacity var(--interrupt-fade) ease,
    filter var(--interrupt-fade) ease;
}

.swap-enter-from,
.swap-leave-to {
  opacity: 0;
  filter: blur(8px);
}
</style>
