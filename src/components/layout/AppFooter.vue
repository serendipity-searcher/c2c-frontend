<script setup>
import { computed, ref, useId } from 'vue'
import { LOCALES, DEFAULT_LOCALE, ENDONYMS, useT } from '@/i18n'
import { useLanguageStore } from '@/stores/language'

const t = useT()
const language = useLanguageStore()
const pickerOpen = ref(false)
const pickerId = useId()

const FOOTER_ITEM = 'text-[0.68rem] tracking-[0.02em] text-fg'

const current = computed(() => language.locale ?? DEFAULT_LOCALE)

function choose(locale) {
  language.setLocale(locale)
  pickerOpen.value = false
}

function onPickerFocusOut(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) pickerOpen.value = false
}
</script>

<template>
  <footer
    class="relative z-1 shrink-0 grid grid-cols-[1fr_auto_1fr] items-center h-[calc(var(--footer-height)+var(--inset-bottom))] px-(--gutter) pb-(--inset-bottom) border-t border-line"
  >
    <RouterLink to="/about" :class="[FOOTER_ITEM, 'justify-self-start']">
      {{ t('main.about') }}
    </RouterLink>
    <RouterLink to="/rules" :class="[FOOTER_ITEM, 'underline underline-offset-[3px]']">
      {{ t('main.rules') }}
    </RouterLink>
    <div
      class="relative justify-self-end"
      @keydown.esc="pickerOpen = false"
      @focusout="onPickerFocusOut"
    >
      <button
        type="button"
        :class="FOOTER_ITEM"
        :aria-expanded="pickerOpen"
        :aria-controls="pickerId"
        :aria-label="`${t('a11y.language')}: ${ENDONYMS[current]}`"
        @click="pickerOpen = !pickerOpen"
      >
        {{ current.toUpperCase() }} <span aria-hidden="true">▴</span>
      </button>
      <div
        v-if="pickerOpen"
        :id="pickerId"
        class="absolute right-0 bottom-[1.8rem] flex flex-col gap-[0.4rem] py-[0.6rem] px-[0.8rem] bg-bg border border-line"
      >
        <button
          v-for="locale in LOCALES"
          :key="locale"
          type="button"
          :lang="locale"
          :aria-label="ENDONYMS[locale]"
          :aria-current="locale === language.locale ? 'true' : undefined"
          :class="[FOOTER_ITEM, { 'font-bold': locale === language.locale }]"
          @click="choose(locale)"
        >
          {{ locale.toUpperCase() }}
        </button>
      </div>
    </div>
  </footer>
</template>
