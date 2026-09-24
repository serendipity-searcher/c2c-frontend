import { computed } from 'vue'

import { useLanguageStore } from '@/stores/language'
import { DEFAULT_LOCALE } from './locales'
import { resolve, topics } from './messages'

export { LOCALES, DEFAULT_LOCALE, ENDONYMS } from './locales'
export { loadMessages } from './messages'

function useLocale() {
  const language = useLanguageStore()
  return computed(() => language.locale ?? DEFAULT_LOCALE)
}

export function useT() {
  const locale = useLocale()
  return (key) => resolve(locale.value, key) ?? key
}

// explicit locale, no key fallback
export function tOrNull(locale, key) {
  return resolve(locale, key) ?? null
}

export function useTOrNull() {
  const locale = useLocale()
  return (key) => tOrNull(locale.value, key)
}

export function useTopics() {
  const locale = useLocale()
  return computed(() => topics(locale.value))
}
