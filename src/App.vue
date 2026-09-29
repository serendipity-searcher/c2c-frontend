<script setup>
import { computed, watchEffect } from 'vue'
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

conversation.initialize()

loadMessages()
useCommentSizing()
useKeyboardInset()
</script>

<template>
  <div class="app-root h-full bg-bg text-fg" :class="{ inverted }">
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </div>
</template>
