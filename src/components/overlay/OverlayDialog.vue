<script setup>
import { onMounted, useTemplateRef } from 'vue'
import { useT } from '@/i18n'
import { useUiStore } from '@/stores/ui'

const { inverted = false } = defineProps({
  label: { type: String, required: true },
  inverted: { type: Boolean, default: false },
})

const t = useT()
const ui = useUiStore()

const root = useTemplateRef('root')
onMounted(() => {
  if (inverted) root.value?.focus()
})
</script>

<template>
  <div
    ref="root"
    class="fixed inset-x-0 top-0 z-10 flex flex-col overflow-hidden bg-bg"
    :class="inverted ? 'inverted bottom-0 text-fg' : 'bottom-(--kb)'"
    :tabindex="inverted ? -1 : undefined"
    role="dialog"
    aria-modal="true"
    :aria-label="label"
    @keydown.esc="ui.close()"
  >
    <button
      type="button"
      class="relative z-10 self-end py-4 px-5 text-[0.9rem]"
      :aria-label="t('a11y.close')"
      @click="ui.close()"
    >
      <span aria-hidden="true">✕</span>
    </button>
    <slot />
  </div>
</template>
