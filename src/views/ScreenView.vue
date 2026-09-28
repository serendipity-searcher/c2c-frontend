<script setup>
import { storeToRefs } from 'pinia'
import { SLOTS, useConversationStore } from '@/stores/conversation'
import { useT } from '@/i18n'

const t = useT()
const { slots, current, display } = storeToRefs(useConversationStore())
</script>

<template>
  <div class="relative h-full cursor-none overflow-hidden">
    <Transition name="stage">
      <div v-if="display === 'comment'" class="absolute inset-0 flex flex-col">
        <div v-for="name in SLOTS" :key="name" class="half" :class="{ 'half-top': name === 'top' }">
          <Transition name="rotate" mode="out-in">
            <p
              v-if="slots[name]"
              :key="slots[name].ID"
              class="wall-text"
              :lang="slots[name].language"
            >
              {{ slots[name].text }}
            </p>
          </Transition>
        </div>
      </div>
    </Transition>

    <Transition name="interrupt" :duration="0">
      <div
        v-if="display !== 'comment'"
        :key="current?.ID"
        class="interrupt-arc absolute inset-0 flex flex-col"
      >
        <template v-if="display === 'starter' && current">
          <div
            v-for="name in SLOTS"
            :key="name"
            class="half"
            :class="{ 'half-top': name === 'top' }"
          >
            <p v-if="current.slots[name]" class="wall-text" :lang="current.slots[name].language">
              {{ current.slots[name].text }}
            </p>
          </div>
        </template>
        <template v-else-if="display === 'live' && current">
          <div class="half half-top">
            <p class="wall-text text-fg-muted">{{ t('main.live_banner') }}</p>
          </div>
          <div class="half">
            <p class="wall-text" :lang="current.language">{{ current.text }}</p>
          </div>
        </template>
      </div>
    </Transition>
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

.stage-enter-active {
  transition: opacity 10s ease;
}

.stage-leave-active {
  transition: opacity calc(var(--interrupt-duration, 20s) / 4) ease;
}

.stage-enter-from,
.stage-leave-to {
  opacity: 0;
}

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
  filter: blur(0.8vh);
}

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
