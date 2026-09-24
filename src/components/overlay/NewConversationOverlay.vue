<script setup>
import { ref } from 'vue'
import { useT, useTopics } from '@/i18n'
import { useUiStore } from '@/stores/ui'
import { useConversationStore } from '@/stores/conversation'
import { useOverlayGeometry } from '@/composables/useOverlayGeometry'
import { useSubmission } from '@/composables/useSubmission'
import CommentEditor from '@/components/comment/CommentEditor.vue'
import OverlayDialog from './OverlayDialog.vue'
import SubmitBar from './SubmitBar.vue'

const t = useT()
const topicOptions = useTopics()
const ui = useUiStore()
const conversation = useConversationStore()
const { editorSlot, editorStyle } = useOverlayGeometry()

const text = ref('')
const topics = ref([])
const consented = ref(false)

const { sending, offline, submit } = useSubmission(() => {
  const body = text.value.trim()
  if (!conversation.submitNewConversation({ text: body, topics: topics.value })) return false
  ui.showThanks('submitted', { text: body })
  return true
})
</script>

<template>
  <OverlayDialog :label="t('a11y.dialog_new')">
    <div class="absolute left-(--gutter) right-(--gutter) flex flex-col" :style="editorStyle">
      <CommentEditor
        v-model="text"
        :slot-name="editorSlot"
        :placeholder="t('new_comment.comment_newconvo')"
        counter
        :error="offline ? t('error.no_connection') : ''"
      />

      <fieldset class="mt-6 min-w-0 grid grid-cols-2 gap-x-4 gap-y-[0.7rem]">
        <legend class="sr-only">{{ t('a11y.topics') }}</legend>
        <label
          v-for="topic in topicOptions"
          :key="topic.id"
          class="flex items-center gap-[0.45rem] text-[0.7rem] cursor-pointer"
        >
          <input
            v-model="topics"
            type="checkbox"
            :value="topic.id"
            class="shrink-0 accent-accent"
          />
          <span>{{ topic.label }}</span>
        </label>
      </fieldset>
    </div>

    <SubmitBar
      v-model:checked="consented"
      class="mt-auto"
      :label="t('new_comment.tickbox')"
      :disabled="!text.trim() || !topics.length || sending"
      @send="submit"
    />
  </OverlayDialog>
</template>
