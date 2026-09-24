<script setup>
import { useT } from '@/i18n'

const t = useT()
defineEmits(['new'])
</script>

<template>
  <div
    class="shrink-0 h-(--hints-height) mt-(--hints-gap) flex flex-col items-center justify-center gap-[calc(0.72rem*1.6*1.5)] px-(--gutter) text-center overflow-hidden"
  >
    <p
      aria-hidden="true"
      class="text-[0.72rem] text-fg whitespace-pre-line text-balance leading-[1.6]"
    >
      {{ t('main.reply_comment_button') }}
    </p>
    <p class="sr-only">{{ t('a11y.hint_reply') }}</p>
    <button
      type="button"
      :aria-label="t('a11y.new')"
      class="text-[0.72rem] text-fg whitespace-pre-line text-balance leading-[1.6]"
      @click="$emit('new')"
    >
      {{ t('main.new_comment_button') }}
    </button>
  </div>
</template>
