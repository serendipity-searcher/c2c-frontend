<script setup>
import { storeToRefs } from 'pinia'
import { SLOTS, useConversationStore } from '@/stores/conversation'
import { useT } from '@/i18n'

const t = useT()
const { slots, banner, interrupting } = storeToRefs(useConversationStore())
</script>

<template>
  <div class="relative h-full cursor-none overflow-hidden">
    <div class="absolute inset-0 flex flex-col">
      <div v-for="name in SLOTS" :key="name" class="half" :class="{ 'half-top': name === 'top' }">
        <Transition :name="interrupting ? 'swap' : 'rotate'" mode="out-in">
          <p v-if="name === 'top' && banner" key="banner" class="wall-text text-fg-muted">
            {{ t('main.live_banner') }}
          </p>
          <p
            v-else-if="slots[name]"
            :key="slots[name].ID"
            class="wall-text"
            :lang="slots[name].language"
          >
            {{ slots[name].text }}
          </p>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.half {
  height: 50%;
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 4vh 4vw 0;
}

.half-top {
  justify-content: flex-end;
  padding: 0 4vw 4vh;
}

.wall-text {
  font-family: var(--font-comment);
  font-weight: 500;
  font-size: clamp(1.25rem, min(2.2vw, 9vh), 12rem);
  line-height: 1.4;
  max-width: 100%;
  text-align: center;
  overflow-wrap: break-word;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.rotate-enter-active,
.rotate-leave-active {
  transition:
    opacity 10s ease,
    filter 10s ease;
}

.rotate-enter-from,
.rotate-leave-to {
  opacity: 0;
  filter: blur(0.8vh);
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
  filter: blur(0.8vh);
}
</style>
