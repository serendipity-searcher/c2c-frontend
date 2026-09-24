const RECONNECT_MIN_MS = 500
const RECONNECT_MAX_MS = 8000

export function createSocket(url) {
  let socket = null
  let reconnectTimer = null
  let backoff = RECONNECT_MIN_MS
  let status = 'closed' // 'connecting' | 'open' | 'closed'

  let onFrame = () => {}
  let onStatusChange = () => {}

  function setStatus(next) {
    if (status === next) return
    status = next
    onStatusChange(status)
  }

  function handleMessage(event) {
    let frame
    try {
      frame = JSON.parse(event.data)
    } catch {
      console.warn('[c2c] unparseable frame from backend:', event.data)
      return
    }

    if (frame?.error) {
      console.warn('[c2c] backend rejected a message:', frame.error)
      return
    }
    onFrame(frame)
  }

  function connect() {
    if (socket && socket.readyState <= WebSocket.OPEN) return
    clearTimeout(reconnectTimer)
    setStatus('connecting')

    socket = new WebSocket(url)
    socket.onopen = () => {
      backoff = RECONNECT_MIN_MS
      setStatus('open')
    }
    socket.onmessage = handleMessage
    socket.onerror = () => socket?.close()
    socket.onclose = () => {
      setStatus('closed')
      reconnectTimer = setTimeout(connect, backoff)
      backoff = Math.min(backoff * 2, RECONNECT_MAX_MS)
    }
  }

  return {
    connect,

    send(type, payload) {
      if (socket?.readyState !== WebSocket.OPEN) return false
      socket.send(JSON.stringify({ type, payload }))
      return true
    },

    onMessage(handler) {
      onFrame = handler
    },

    onStatus(handler) {
      onStatusChange = handler
      handler(status)
    },
  }
}
