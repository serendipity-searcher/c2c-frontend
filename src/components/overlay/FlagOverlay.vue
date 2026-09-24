<script setup>
import { ref } from 'vue'
import { useT } from '@/i18n'
import { useUiStore } from '@/stores/ui'
import { useConversationStore } from '@/stores/conversation'
import { useOverlayGeometry } from '@/composables/useOverlayGeometry'
import { useSubmission } from '@/composables/useSubmission'
import CommentBubble from '@/components/comment/CommentBubble.vue'
import CommentEditor from '@/components/comment/CommentEditor.vue'
import OverlayDialog from './OverlayDialog.vue'
import SubmitBar from './SubmitBar.vue'

const t = useT()
const ui = useUiStore()
const conversation = useConversationStore()
const { comment, commentSlot, commentStyle, editorSlot, editorStyle } = useOverlayGeometry()

const reason = ref('')
const consented = ref(false)

const { sending, offline, submit } = useSubmission(() => {
  if (!conversation.flagComment(comment.value.ID, reason.value.trim())) return false
  ui.showThanks('flagged', comment.value)
  return true
})
</script>

<template>
  <OverlayDialog :label="t('a11y.dialog_flag')">
    <div :style="commentStyle">
      <CommentBubble :comment="comment" :slot-name="commentSlot" frozen :flaggable="false" />
    </div>

    <CommentEditor
      v-model="reason"
      class="absolute left-(--gutter) right-(--gutter)"
      :style="editorStyle"
      :slot-name="editorSlot"
      :placeholder="t('flag.reason')"
      :error="offline ? t('error.no_connection') : ''"
    />

    <SubmitBar
      v-model:checked="consented"
      class="mt-auto"
      :label="t('flag.donotshow')"
      :disabled="sending"
      @send="submit"
    />
  </OverlayDialog>
</template>
