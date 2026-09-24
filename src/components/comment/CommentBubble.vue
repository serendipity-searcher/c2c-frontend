<script setup>
import { computed } from 'vue'
import { useT } from '@/i18n'

const {
  comment,
  slotName = 'bottom',
  frozen = false,
  flaggable = true,
} = defineProps({
  comment: { type: Object, required: true },
  slotName: { type: String, default: 'bottom' },
  frozen: { type: Boolean, default: false },
  flaggable: { type: Boolean, default: true },
})

defineEmits(['tap', 'flag'])

const t = useT()

const flagged = computed(() => comment?.is_flagged === true)
const interactive = computed(() => !flagged.value && !frozen)
const textClass = computed(() =>
  flagged.value ? 'blur-[5px] select-none' : frozen ? 'blur-[1px]' : '',
)
const textHidden = computed(() => interactive.value || flagged.value)
</script>

<template>
  <div
    class="comment-bubble relative flex-1 flex flex-col"
    :class="[{ 'cursor-pointer': interactive }, { 'slot-top': slotName === 'top' }]"
  >
    <button
      v-if="interactive"
      type="button"
      class="absolute inset-0 z-10"
      :lang="comment.language"
      :aria-label="`${t('a11y.reply')}: ${comment.text}`"
      @click="$emit('tap', comment, $event)"
    ></button>

    <div class="relative pr-(--flag-gutter)">
      <button
        v-if="flaggable && interactive"
        type="button"
        class="absolute top-[-0.9rem] -right-2 z-20 p-[0.85rem] text-fg-muted"
        :aria-label="t('main.flag_button')"
        @click.stop="$emit('flag', comment, $event)"
      >
        <svg
          class="inline align-baseline"
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M5 21V4h12l-2.5 4L17 12H5" />
        </svg>
      </button>
      <p
        class="comment-text comment-clamp"
        :class="textClass"
        :lang="comment.language"
        :aria-hidden="textHidden || undefined"
      >
        {{ comment.text }}
      </p>
      <span v-if="flagged" class="sr-only">{{ t('a11y.flagged') }}</span>
    </div>
  </div>
</template>
