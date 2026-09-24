<script setup>
import { useT } from '@/i18n'

defineProps({
  label: { type: String, required: true },
  disabled: { type: Boolean, default: false },
})

const checked = defineModel('checked', { type: Boolean, default: false })
defineEmits(['send'])

const t = useT()
</script>

<template>
  <div
    class="relative z-10 flex items-center gap-3 min-h-[calc(var(--bar-height)+var(--inset-bottom))] px-4 pb-(--inset-bottom) bg-bg border-t border-line"
  >
    <label class="flex-1 flex items-start gap-2 text-[0.68rem] cursor-pointer">
      <input v-model="checked" type="checkbox" class="shrink-0 mt-[0.2em] accent-accent" />
      <span>{{ label }}</span>
    </label>
    <button
      type="button"
      class="py-[0.35rem] px-[1.1rem] text-[0.72rem] bg-accent text-[#f2f2ee] rounded-[2px] disabled:opacity-40 disabled:cursor-default"
      :disabled="disabled || !checked"
      @click="$emit('send')"
    >
      {{ t('new_comment.button') }}
    </button>
  </div>
</template>
