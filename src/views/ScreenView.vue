<script setup>
import { storeToRefs } from 'pinia'
import { useConversationStore } from '@/stores/conversation'

const { slots } = storeToRefs(useConversationStore())
</script>

<template>
  <div class="flex h-full cursor-none flex-col overflow-hidden">
    <div class="flex h-1/2 flex-none flex-col items-center justify-end px-[4vw] pb-[4vh]">
      <Transition name="rotate" mode="out-in">
        <p
          v-if="slots.top"
          :key="slots.top.ID"
          class="comment-text max-w-full text-center text-[clamp(1.25rem,min(2.2vw,9vh),12rem)] leading-[1.4] line-clamp-2"
          :lang="slots.top.language"
        >
          {{ slots.top.text }}
        </p>
      </Transition>
    </div>
    <div class="flex h-1/2 flex-none flex-col items-center justify-start px-[4vw] pt-[4vh]">
      <Transition name="rotate" mode="out-in">
        <p
          v-if="slots.bottom"
          :key="slots.bottom.ID"
          class="comment-text max-w-full text-center text-[clamp(1.25rem,min(2.2vw,9vh),12rem)] leading-[1.4] line-clamp-2"
          :lang="slots.bottom.language"
        >
          {{ slots.bottom.text }}
        </p>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.rotate-enter-active {
  transition:
    opacity 5s ease,
    filter 5s ease;
}

.rotate-leave-active {
  transition:
    opacity 5s ease,
    filter 5s ease;
}

.rotate-enter-from,
.rotate-leave-to {
  opacity: 0;
  filter: blur(0.8vh);
}
</style>
