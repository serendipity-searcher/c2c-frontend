<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useT } from '@/i18n'
import { useUiStore } from '@/stores/ui'
import OverlayDialog from './OverlayDialog.vue'

const t = useT()
const { thanksKind, submittedComment } = storeToRefs(useUiStore())

const rows = computed(() => {
  const { text, language } = submittedComment.value ?? {}
  const written = { text, lang: language, comment: true }
  const flagged = thanksKind.value === 'flagged'
  const note = { text: t(flagged ? 'flag.result' : 'new_comment_result.note') }
  return flagged ? [written, note] : [note, written]
})
</script>

<template>
  <OverlayDialog :label="t('a11y.dialog_thanks')" inverted>
    <div class="absolute inset-0 pointer-events-none flex flex-col pt-(--stage-top) px-(--gutter)">
      <div
        v-for="(row, index) in rows"
        :key="index"
        class="slot"
        :class="{ 'slot-top': index === 0 }"
      >
        <p
          v-if="row.text"
          :lang="row.lang"
          :class="row.comment ? 'comment-text' : 'text-[0.85rem] whitespace-pre-line'"
        >
          {{ row.text }}
        </p>
      </div>
    </div>
  </OverlayDialog>
</template>
