<script setup>
import { computed, onMounted, useTemplateRef } from 'vue'
import { useLanguageStore } from '@/stores/language'
import { ENDONYMS, LOCALES, tOrNull } from '@/i18n'

const language = useLanguageStore()

const card = useTemplateRef('card')
onMounted(() => card.value?.focus())

const options = computed(() =>
  LOCALES.map((locale) => ({
    locale,
    heading: tOrNull(locale, 'welcome.no_cookies') ?? 'welcome.no_cookies',
    text: tOrNull(locale, 'welcome.description') ?? 'welcome.description',
    button: tOrNull(locale, 'welcome.agree') ?? 'welcome.agree',
  })),
)
</script>

<template>
  <div
    class="fixed inset-0 z-20 will-change-[opacity] flex items-center justify-center p-6 text-fg bg-white/55 backdrop-blur-[7px]"
    role="dialog"
    aria-modal="true"
    aria-labelledby="landing-nl landing-fr landing-en"
  >
    <div
      ref="card"
      tabindex="-1"
      class="w-full max-w-84 max-h-full overflow-auto bg-white/65 border border-line rounded-[0.85rem] pt-8 px-[1.35rem] pb-6 flex flex-col gap-7 max-[600px]:gap-5 max-[600px]:pt-7 max-[600px]:px-5 max-[600px]:pb-[1.35rem]"
    >
      <section
        v-for="option in options"
        :key="option.locale"
        :lang="option.locale"
        class="flex flex-col gap-[0.6rem] text-center"
      >
        <h2
          :id="`landing-${option.locale}`"
          class="text-[1.05rem] font-bold leading-[1.3] max-[600px]:text-[0.9rem]"
        >
          {{ option.heading }}
        </h2>
        <p class="text-left font-normal text-[0.85rem] leading-normal max-[600px]:text-[0.7rem]">
          {{ option.text }}
        </p>
      </section>

      <div class="flex flex-col gap-2 mt-2">
        <button
          v-for="option in options"
          :key="option.locale"
          type="button"
          :lang="option.locale"
          :aria-label="`${option.button} — ${ENDONYMS[option.locale]}`"
          class="w-full py-[0.7rem] px-4 border border-line rounded-full text-[0.9rem] font-semibold text-center max-[600px]:py-[0.6rem] max-[600px]:text-[0.75rem]"
          @click="language.setLocale(option.locale)"
        >
          {{ option.button }}
        </button>
      </div>
    </div>
  </div>
</template>
