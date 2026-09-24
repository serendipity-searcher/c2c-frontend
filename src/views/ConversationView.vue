<script setup>
import { computed, nextTick, useTemplateRef, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useLanguageStore } from '@/stores/language'
import { useConversationStore } from '@/stores/conversation'
import { useUiStore } from '@/stores/ui'
import { useT } from '@/i18n'
import ConversationStage from '@/components/conversation/ConversationStage.vue'
import InstructionHints from '@/components/conversation/InstructionHints.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import LanguageGate from '@/components/layout/LanguageGate.vue'
import ReplyOverlay from '@/components/overlay/ReplyOverlay.vue'
import NewConversationOverlay from '@/components/overlay/NewConversationOverlay.vue'
import FlagOverlay from '@/components/overlay/FlagOverlay.vue'
import ThanksScreen from '@/components/overlay/ThanksScreen.vue'

const OVERLAYS = {
  reply: ReplyOverlay,
  new: NewConversationOverlay,
  flag: FlagOverlay,
  thanks: ThanksScreen,
}

const t = useT()
const language = useLanguageStore()
const conversation = useConversationStore()
const ui = useUiStore()
const { overlay } = storeToRefs(ui)
const { status } = storeToRefs(conversation)

const stage = useTemplateRef('stage')
const openNew = () => ui.openNew(stage.value?.slotRect('top') ?? null)

const offline = computed(() => status.value !== 'open' && language.hasChosen)
const blocked = computed(() => !language.hasChosen || ui.isOpen)
const overlayComponent = computed(() => OVERLAYS[overlay.value] ?? null)

let lastFocused = null

watch(
  overlay,
  (now, before) => {
    if (now && !before) {
      lastFocused = document.activeElement
      return
    }
    if (!now && before) nextTick(() => lastFocused?.isConnected && lastFocused.focus())
  },
  { flush: 'pre' },
)
</script>

<template>
  <div class="h-full flex flex-col">
    <main class="flex-1 min-h-0 flex flex-col overflow-hidden" :inert="blocked || undefined">
      <ConversationStage ref="stage" @tap="ui.openReply" @flag="ui.openFlag" />
      <InstructionHints @new="openNew" />
    </main>
    <AppFooter :inert="blocked || undefined" />

    <Transition name="fade">
      <p
        v-if="offline"
        role="status"
        class="fixed top-0 left-0 right-0 py-[0.4rem] px-4 text-center text-[0.62rem] text-fg-muted bg-bg border-b border-line"
      >
        {{ t('error.connection_lost') }}
      </p>
    </Transition>

    <Teleport to="body">
      <Transition name="fade">
        <LanguageGate v-if="!language.hasChosen" />
      </Transition>
    </Teleport>

    <Transition name="fade" mode="out-in">
      <component :is="overlayComponent" v-if="overlayComponent" :key="overlay" />
    </Transition>
  </div>
</template>
