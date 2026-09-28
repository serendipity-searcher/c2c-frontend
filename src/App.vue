<script setup>
import { computed, useTemplateRef, watch, watchEffect } from 'vue'
import { useConversationStore } from '@/stores/conversation'
import { useLanguageStore } from '@/stores/language'
import { DEFAULT_LOCALE, loadMessages } from '@/i18n'
import { useCommentSizing } from '@/composables/useCommentSizing'
import { useKeyboardInset } from '@/composables/useKeyboardInset'

const conversation = useConversationStore()
const language = useLanguageStore()

watchEffect(() => {
  document.documentElement.lang = language.locale ?? DEFAULT_LOCALE
})

const inverted = computed(() => conversation.inverted)

const arc = computed(() => ({ '--interrupt-duration': `${conversation.interruptSeconds}s` }))

const root = useTemplateRef('root')

watch(
  () => conversation.current?.ID,
  () => {
    const el = root.value
    if (!el || !inverted.value) return
    el.style.animation = 'none'
    void el.offsetWidth
    el.style.animation = ''
  },
  { flush: 'post' },
)

conversation.initialize()

loadMessages()
useCommentSizing()
useKeyboardInset()
</script>

<template>
  <div ref="root" class="app-root h-full bg-bg text-fg" :class="{ inverted }" :style="arc">
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </div>
</template>
