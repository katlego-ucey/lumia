
import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState<{role: string, text: string}[]>([])
  const [input, setInput] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [cvUrl, setCvUrl] = useState<string | null>(null)
  const [mode, setMode] = useState<'onboarding' | 'interview'>('onboarding')

  useEffect(() => {
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
      const endpoint = mode === 'onboarding' ? 'onboarding/respond' : 'interview/respond'
      const response = await fetch(`http://localhost:3000/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, response: userMessage }),
      })
      const data = await response.json()
      
      if (mode === 'onboarding') {
        setMessages(prev => [...prev, { role: 'agent', text: data.question }])
        if (data.profile.currentStep === 'complete') {
          setIsComplete(true)
        }
      } else {
        let feedbackText = `Score: ${data.score}%. ${data.feedback}`
        if (data.hint) feedbackText += `\n\nHint: ${data.hint}`
        
        setMessages(prev => [...prev, { role: 'agent', text: feedbackText }])
        
        if (data.nextQuestion) {
            setMessages(prev => [...prev, { role: 'agent', text: `Next Question: ${data.nextQuestion}` }])
        } else if (data.masteryAchieved) {
            setMessages(prev => [...prev, { role: 'agent', text: "Mastery achieved for this question! Well done." }])
        }
      }
    } catch (error) {
      console.error('Failed to send response:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateCV = async () => {
    if (!userId) return
    setLoading(true)
    try {
      const response = await fetch('http://localhost:3000/cv/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await response.json()
      if (data.success) {
        setCvUrl(data.downloadUrl)
        setMessages(prev => [...prev, { role: 'agent', text: "Your ATS-safe CV has been generated!" }])
      }
    } catch (error) {
      console.error('Failed to generate CV:', error)
    } finally {
      setLoading(false)
    }
  }

  const startInterview = async () => {
    if (!userId) return
    setLoading(true)
    try {
      const response = await fetch('http://localhost:3000/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await response.json()
      setMode('interview')
      setMessages([{ role: 'agent', text: "Welcome to Interview Mastery. Let's practice. " + data.question }])
    } catch (error) {
      console.error('Failed to start interview:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Lumia</h1>
        <p>{mode === 'onboarding' ? 'Your AI Career Agent' : 'Interview Mastery Mode'}</p>
      </header>
      <main className="chat-container">
        <div className="messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`} style={{ whiteSpace: 'pre-wrap' }}>
              {msg.text}
            </div>
          ))}
          {loading && <div className="message agent">...</div>}
        </div>
        
        {isComplete && mode === 'onboarding' && (
          <div className="actions">
            <button onClick={generateCV} disabled={loading} style={{ marginRight: '10px' }}>Generate My CV</button>
            <button onClick={startInterview} disabled={loading} className="secondary">Start Interview Mastery</button>
          </div>
        )}
        
        {cvUrl && mode === 'onboarding' && (
          <div className="actions">
            <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="download-link">
              Download CV (PDF)
            </a>
          </div>
        )}

        {(!isComplete || mode === 'interview') && (
          <div className="input-area">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={mode === 'onboarding' ? "Type your answer..." : "Answer the interview question..."}
            />
            <button onClick={handleSend} disabled={loading}>Send</button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
