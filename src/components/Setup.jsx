import { useState } from 'react'

export default function Setup({ onStart, onBack }) {
  const [name, setName] = useState('')
  const [p1, setP1]     = useState('')
  const [p2, setP2]     = useState('')

  function handleStart(e) {
    e.preventDefault()
    const gameName = name.trim() || `Game ${new Date().toLocaleDateString()}`
    onStart(gameName, p1.trim() || 'Player 1', p2.trim() || 'Player 2')
  }

  return (
    <div className="setup-screen">
      <div className="setup-card">
        <button className="btn-ghost setup-back" onClick={onBack}>← Back</button>
        <div className="setup-icon">♠</div>
        <h1 className="setup-title">New Game</h1>
        <form onSubmit={handleStart} className="setup-form">
          <div className="field-group">
            <label className="field-label">Game Name</label>
            <input
              className="field-input"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Saturday Night"
              autoCapitalize="words"
              autoComplete="off"
            />
          </div>
          <div className="field-group">
            <label className="field-label">Player 1</label>
            <input
              className="field-input"
              type="text"
              value={p1}
              onChange={e => setP1(e.target.value)}
              placeholder="Enter name"
              autoCapitalize="words"
              autoComplete="off"
            />
          </div>
          <div className="field-group">
            <label className="field-label">Player 2</label>
            <input
              className="field-input"
              type="text"
              value={p2}
              onChange={e => setP2(e.target.value)}
              placeholder="Enter name"
              autoCapitalize="words"
              autoComplete="off"
            />
          </div>
          <button type="submit" className="btn-primary btn-lg">Start Game</button>
        </form>
      </div>
    </div>
  )
}
