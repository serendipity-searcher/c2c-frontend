import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { LOCALES } from '@/i18n/locales'

const STORAGE_KEY = 'c2c-locale'

export const useLanguageStore = defineStore('language', () => {
  const stored = sessionStorage.getItem(STORAGE_KEY)
  const locale = ref(LOCALES.includes(stored) ? stored : null)

  const hasChosen = computed(() => locale.value !== null)

  function setLocale(value) {
    if (!LOCALES.includes(value)) return
    locale.value = value
    sessionStorage.setItem(STORAGE_KEY, value)
  }

  return { locale, hasChosen, setLocale }
})
