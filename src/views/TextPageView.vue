<script setup>
import { computed } from 'vue'
import { useT, useTOrNull } from '@/i18n'

const props = defineProps({
  section: { type: String, required: true },
})

const t = useT()
const tOrNull = useTOrNull()

const OUTLINES = {
  about: {
    title: 'aboutpage.header',
    blocks: [
      { as: 'body', key: 'aboutpage.about' },
      { as: 'h2', key: 'aboutpage.how_it_works' },
      { as: 'h3', key: 'aboutpage.comment_to_connections' },
      { as: 'body', key: 'aboutpage.connections' },
      { as: 'h3', key: 'aboutpage.connections_to_conversations' },
      { as: 'body', key: 'aboutpage.conversations' },
      { as: 'body', key: 'aboutpage.bubbles' },
      { as: 'credits', key: 'aboutpage.credits' },
    ],
  },
  rules: {
    title: 'terms.terms_title',
    blocks: Array.from({ length: 11 }, (_, i) => `terms.term_${i + 1}`).flatMap((key) => [
      { as: 'h2', key: `${key}_title` },
      { as: 'body', key },
    ]),
  },
}

const lines = (text) =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

const oneParagraph = (text) => lines(text).join(' ')

const title = computed(() => tOrNull(OUTLINES[props.section]?.title))

const blocks = computed(() =>
  (OUTLINES[props.section]?.blocks ?? [])
    .map((block) => ({ ...block, text: tOrNull(block.key) }))
    .filter((block) => block.text),
)
</script>

<template>
  <main class="h-full overflow-y-auto flex flex-col gap-6 pt-18 pb-12 px-(--page-gutter)">
    <div class="fixed inset-x-0 top-0 z-20 flex justify-end bg-bg">
      <RouterLink to="/" class="py-4 px-5 text-[0.9rem]" :aria-label="t('a11y.close')">
        <span aria-hidden="true">✕</span>
      </RouterLink>
    </div>

    <h1 v-if="title" class="text-[1.1rem] font-semibold">{{ title }}</h1>

    <template v-for="block in blocks" :key="block.key">
      <h2 v-if="block.as === 'h2'" class="text-[0.95rem] font-semibold pt-2">
        {{ block.text }}
      </h2>
      <h3 v-else-if="block.as === 'h3'" class="text-[0.85rem] font-semibold">
        {{ block.text }}
      </h3>
      <div
        v-else-if="block.as === 'credits'"
        class="flex flex-col gap-3 pt-4 border-t border-line text-[0.72rem] text-fg-muted leading-[1.6]"
      >
        <p v-for="(line, i) in lines(block.text)" :key="i">{{ line }}</p>
      </div>
      <p v-else class="text-[0.85rem] text-fg-muted leading-[1.6]">
        {{ oneParagraph(block.text) }}
      </p>
    </template>

    <RouterLink to="/" class="text-[0.75rem] underline underline-offset-[3px] pt-2">
      ← {{ t('main.back') }}
    </RouterLink>
  </main>
</template>
