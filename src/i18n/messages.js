import { ref } from 'vue'

import { LOCALES } from './locales'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

const BACKEND_DEFAULT = 'en'
const RETRY_MS = [500, 2000, 8000]
const TOPIC_PREFIX = 'new_comment.topics.'

const tables = ref({})

const isLeaf = (node) => {
  const keys = Object.keys(node)
  return keys.length > 0 && keys.every((key) => LOCALES.includes(key))
}

function flatten(node, path, out) {
  for (const [key, value] of Object.entries(node)) {
    if (value === null || typeof value !== 'object') continue
    const next = path ? `${path}.${key}` : key
    if (!isLeaf(value)) {
      flatten(value, next, out)
      continue
    }
    for (const locale of LOCALES) {
      const text = value[locale] ?? value[BACKEND_DEFAULT]
      if (typeof text === 'string') (out[locale] ??= {})[next] = text.trim()
    }
  }
}

const warned = new Set()

export function resolve(locale, key) {
  const table = tables.value[locale]
  const text = table?.[key]
  if (import.meta.env.DEV && table && text === undefined && !warned.has(`${locale}:${key}`)) {
    warned.add(`${locale}:${key}`)
    console.warn(`[c2c] messages.yaml has no '${key}' (${locale})`)
  }
  return text
}

export function topics(locale) {
  const table = tables.value[locale] ?? {}
  return Object.keys(table)
    .filter((path) => path.startsWith(TOPIC_PREFIX))
    .map((path) => ({ id: path.slice(TOPIC_PREFIX.length), label: table[path] }))
}

export async function loadMessages() {
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await fetch(`${API_URL}/messages`, {
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const flat = {}
      flatten(await response.json(), '', flat)
      tables.value = flat
      return true
    } catch (error) {
      if (attempt >= RETRY_MS.length) {
        console.warn('[c2c] no strings from the backend; the interface will show its keys:', error)
        return false
      }
      await new Promise((done) => setTimeout(done, RETRY_MS[attempt]))
    }
  }
}
