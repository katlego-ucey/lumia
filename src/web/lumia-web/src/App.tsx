
import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState<{role: string, text: string}[]>([])
  const [input, setInput] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Start onboarding session
    const startOnboarding = async () => {
      try {
        const response = await fetch('http://localhost:3000/onboarding/start', {
          method: 'POST',
        })
        const data = await response.json()
        setUserId(data.userId)
        setMessages([{ role: 'agent', text: data.question }])
      } catch (error) {
        console.error('Failed to start onboarding:', error)
      }
    }
    startOnboarding()
  }, [])

  const handleSend = async () => {
    if (!input.trim() || !userId) return

    const userMessage = input
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMessage }])
    setLoading(true)

    try {
      const response = await fetch('http://localhost:3000/onboarding/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, response: userMessage }),
      })
      const data = await response.json()
      setMessages(prev => [...prev, { role: 'agent', text: data.question }])
    } catch (error) {
      console.error('Failed to send response:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Lumia</h1>
        <p>Your AI Career Agent</p>
      </header>
      <main className="chat-container">
        <div className="messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              {msg.text}
            </div>
          ))}
          {loading && <div className="message agent">...</div>}
        </div>
        <div className="input-area">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your answer..."
          />
          <button onClick={handleSend} disabled={loading}>Send</button>
        </div>
      </main>
    </div>
  )
}

export default App
