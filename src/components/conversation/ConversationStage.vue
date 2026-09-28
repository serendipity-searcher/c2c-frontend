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
const { slots, current, display } = storeToRefs(conversation)
const emit = defineEmits(['tap', 'flag'])

const slotEls = {}
let keyboardHeld = false

const announcement = computed(() => {
  const statement = current.value
  if (!statement) return []
  if (display.value === 'starter') {
    return SLOTS.map((name) => statement.slots[name])
      .filter(Boolean)
      .map(({ text, language }) => ({ text, lang: language }))
  }
  if (display.value === 'live') {
    return [
      { text: `${t('main.live_banner')}:` },
      { text: statement.text, lang: statement.language },
    ]
  }
  return []
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

    <template v-if="display === 'comment'">
      <div
        v-for="name in SLOTS"
        :key="name"
        :ref="(el) => (slotEls[name] = el)"
        class="slot"
        :class="{ 'slot-top': name === 'top' }"
      >
        <Transition name="rotate" mode="out-in" @enter="revive" @leave="retire">
          <CommentBubble
            v-if="slots[name]"
            :key="slots[name].ID"
            :comment="slots[name]"
            :slot-name="name"
            @tap="(comment, event) => relay('tap', comment, event, name)"
            @flag="(comment, event) => relay('flag', comment, event, name)"
          />
        </Transition>
      </div>
    </template>

    <Transition v-else name="interrupt" :duration="0" @enter="revive" @leave="retire">
      <div
        :key="current?.ID"
        class="interrupt-arc absolute inset-0 flex flex-col pt-(--stage-top) px-(--gutter)"
      >
        <template v-if="display === 'starter' && current">
          <div
            v-for="name in SLOTS"
            :key="name"
            class="slot"
            :class="{ 'slot-top': name === 'top' }"
          >
            <p
              v-if="current.slots[name]"
              class="comment-text comment-clamp"
              :lang="current.slots[name].language"
            >
              {{ current.slots[name].text }}
            </p>
          </div>
        </template>
        <template v-else-if="display === 'live' && current">
          <div class="slot slot-top">
            <p class="comment-text comment-clamp text-fg-muted">
              {{ t('main.live_banner') }}
            </p>
          </div>
          <div class="slot">
            <CommentBubble
              :comment="current"
              slot-name="bottom"
              @flag="(comment, event) => emit('flag', comment, 'bottom', rectOf(event))"
            />
          </div>
        </template>
      </div>
    </Transition>
  </section>
</template>

<style scoped>
.rotate-enter-active {
  transition:
    opacity 10s ease,
    filter 10s ease;
}

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

/* The second and third phases of the interrupt arc (see `invert-arc` in
   base.css, which runs the first and fourth on the root over the same clock):
   the text waits out the inversion, fades in, and fades out again before the
   frame ends. At the backend's 20 s frame each quarter is 5 s.

   It peaks at the halfway mark and starts leaving immediately — there is no
   plateau, because the four phases were specified as filling the frame exactly.

   `:duration="0"` on the Transition is what keeps this the only clock: Vue
   would otherwise read the 20 s animation off the element as the leave
   duration and hold the outgoing interrupt on screen for a second frame. By the
   time it unmounts the arc has already taken it to zero, so there is nothing
   left to fade. */
@keyframes interrupt-arc {
  0%,
  25% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  75%,
  100% {
    opacity: 0;
  }
}

.interrupt-arc {
  animation: interrupt-arc var(--interrupt-duration, 20s) ease both;
}
</style>
