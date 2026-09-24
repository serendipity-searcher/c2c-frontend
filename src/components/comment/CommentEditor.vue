<script setup>
import { onMounted, useId, useTemplateRef } from 'vue'
import { vSingleLine } from '@/directives/singleLine'
import { MAX_COMMENT_LENGTH } from '@/composables/useCommentSizing'

defineProps({
  placeholder: { type: String, default: '' },
  slotName: { type: String, default: 'bottom' },
  counter: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

const text = defineModel({ type: String, default: '' })

const textarea = useTemplateRef('textarea')
const counterId = useId()

function resize() {
  const el = textarea.value
  if (!el) return
  el.style.height = '0px'
  el.style.height = `${el.scrollHeight}px`
}

function onInput(event) {
  resize()
  text.value = event.target.value
}

onMounted(() => {
  resize()
  textarea.value?.focus()
})
</script>

<template>
  <div class="flex flex-col">
    <div
      class="comment-editor-box"
      :class="{ 'slot-top': slotName === 'top' }"
      @click="textarea?.focus()"
    >
      <textarea
        ref="textarea"
        v-single-line
        class="comment-text comment-editor w-full"
        :value="text"
        :maxlength="MAX_COMMENT_LENGTH"
        :placeholder="placeholder"
        :aria-label="placeholder || undefined"
        :aria-describedby="counter ? counterId : undefined"
        rows="1"
        enterkeyhint="done"
        @input="onInput"
      ></textarea>
    </div>
    <span v-if="counter" :id="counterId" class="self-end text-[0.6rem] text-fg-muted">
      {{ text.length }}/{{ MAX_COMMENT_LENGTH }}
    </span>
    <span v-if="error" class="mt-2 text-[0.68rem] text-accent">{{ error }}</span>
  </div>
</template>
