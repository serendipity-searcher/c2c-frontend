import { createSocket } from './socket'

// C2C_backend/docs/asyncapi.yaml.
const socket = createSocket(import.meta.env.VITE_WS_URL ?? 'ws://127.0.0.1:8000/ws')

const STATEMENT_TYPES = new Set(['comment', 'new_comment', 'conversation_starter'])

export const api = {
  connect: () => socket.connect(),
  onStatus: (handler) => socket.onStatus(handler),

  onStatement(handler) {
    socket.onMessage((frame) => {
      if (STATEMENT_TYPES.has(frame?.type) && frame.payload) handler(frame)
    })
  },

  postComment({ text, replyTo = null, topics = [], language }) {
    return socket.send('comment', {
      text,
      reply_to: replyTo,
      topics: replyTo === null ? [...topics] : null,
      language,
    })
  },

  postFlag({ commentID, reason = '', donotshow = true }) {
    return socket.send('flag', { reason, donotshow, comment_ID: commentID })
  },
}
