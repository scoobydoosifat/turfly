import { useState } from 'react'
import { Bot, Send, Sparkles, X } from 'lucide-react'
import { api } from '../api'
import { ButtonSpinner } from './LoadingButton'

export default function AiAssistant() {
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([{ by: 'bot', text: 'Hi! Ask me about booking, hours, prices or our location.' }])
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    if (!question.trim() || busy) return
    const text = question.trim()
    setQuestion('')
    setMessages((items) => [...items, { by: 'you', text }])
    setBusy(true)
    try {
      const result = await api('/api/ai/ask', { method: 'POST', body: JSON.stringify({ question: text }) })
      setMessages((items) => [...items, { by: 'bot', text: result.answer }])
    } catch (error) {
      setMessages((items) => [...items, { by: 'bot', text: error.message }])
    } finally { setBusy(false) }
  }

  return <div className="assistant-wrap">
    {open && <section className="assistant-panel" aria-label="Turfly assistant">
      <header><span><Sparkles size={17} /> Turfly assistant</span><button onClick={() => setOpen(false)}><X size={18} /></button></header>
      <div className="assistant-messages">
        {messages.map((message, index) => <p className={message.by} key={index}>{message.text}</p>)}
        {busy && <p className="bot typing">Thinking…</p>}
      </div>
      <form onSubmit={submit}><input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a question…" maxLength="500" disabled={busy} /><button aria-label="Send" disabled={busy}>{busy ? <ButtonSpinner /> : <Send size={17} />}</button></form>
    </section>}
    <button className="assistant-toggle" onClick={() => setOpen(!open)} aria-label="Open Turfly assistant"><Bot /></button>
  </div>
}
