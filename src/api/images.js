import { ref } from 'vue'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

const svgs = ref({})
let request = null

export { svgs as images }

export function loadImages() {
  request ??= fetch(`${API_URL}/images?inline=true`, { headers: { Accept: 'application/json' } })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return response.json()
    })
    .then((list) => {
      svgs.value = Object.fromEntries(list.map(({ name, svg }) => [name, svg]))
      return true
    })
    .catch((error) => {
      console.warn('[c2c] no images from the backend:', error)
      request = null
      return false
    })
  return request
}
