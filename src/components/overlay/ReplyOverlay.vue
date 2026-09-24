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

const text = ref('')
const consented = ref(false)

const { sending, offline, submit } = useSubmission(() => {
  const body = text.value.trim()
  if (!conversation.submitReply({ text: body, replyTo: comment.value.ID })) return false
  ui.showThanks('submitted', { ID: comment.value.ID, text: body })
  return true
})
</script>

<template>
  <OverlayDialog :label="t('a11y.dialog_reply')">
    <div :style="commentStyle">
      <CommentBubble :comment="comment" :slot-name="commentSlot" frozen :flaggable="false" />
    </div>

    <CommentEditor
      v-model="text"
      class="absolute left-(--gutter) right-(--gutter)"
      :style="editorStyle"
      :slot-name="editorSlot"
      :placeholder="t('new_comment.comment_response')"
      counter
      :error="offline ? t('error.no_connection') : ''"
    />

    <SubmitBar
      v-model:checked="consented"
      class="mt-auto"
      :label="t('new_comment.tickbox')"
      :disabled="!text.trim() || sending"
      @send="submit"
    />
  </OverlayDialog>
</template>
