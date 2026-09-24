import { ref } from 'vue'

// Nothing is acknowledged on the wire: `perform` reports only that the frame left.
export function useSubmission(perform) {
  const sending = ref(false)
  const offline = ref(false)

  function submit() {
    if (sending.value) return
    sending.value = true
    if (perform()) return
    offline.value = true
    sending.value = false
  }

  return { sending, offline, submit }
}
