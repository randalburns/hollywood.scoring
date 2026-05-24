import { useState } from 'react'
import Home from './components/Home'
import Setup from './components/Setup'
import GameBoard from './components/GameBoard'
import { loadSessions, upsertSession, removeSession } from './storage'
import './App.css'

const freshGame = () => ({ p1: 0, p2: 0, done: false })

function App() {
  const [screen, setScreen] = useState('home')
  const [sessions, setSessions] = useState(() => loadSessions())

  // Active game state
  const [activeId, setActiveId]       = useState(null)
  const [sessionName, setSessionName] = useState('')
  const [players, setPlayers]         = useState(null)
  const [p1Level, setP1Level]         = useState(0)
  const [p2Level, setP2Level]         = useState(0)
  const [games, setGames]             = useState([freshGame(), freshGame(), freshGame()])
  const [handLog, setHandLog]         = useState([])

  function replayLog(rawLog) {
    const gms = [freshGame(), freshGame(), freshGame()]
    let pl1 = 0, pl2 = 0
    const log = []
    for (const { winner, points } of rawLog) {
      const prevLevel = winner === 0 ? pl1 : pl2
      const newLevel = Math.min(prevLevel + 1, 3)
      const activeSlots = []
      gms.forEach((g, i) => {
        if (i >= newLevel || g.done) return
        activeSlots.push(i)
        if (winner === 0) g.p1 += points
        else g.p2 += points
        if (g.p1 >= 100 || g.p2 >= 100) g.done = true
      })
      if (winner === 0) pl1 = newLevel
      else pl2 = newLevel
      log.push({ handNum: log.length + 1, winner, points, activeSlots })
    }
    return { games: gms, p1Level: pl1, p2Level: pl2, handLog: log }
  }

  function applyReplay(result) {
    setGames(result.games)
    setP1Level(result.p1Level)
    setP2Level(result.p2Level)
    setHandLog(result.handLog)
    persist(activeId, sessionName, players, result.p1Level, result.p2Level, result.games, result.handLog)
  }

  function editHand(idx, winner, points) {
    const raw = handLog.map((h, i) => i === idx ? { winner, points } : { winner: h.winner, points: h.points })
    applyReplay(replayLog(raw))
  }

  function deleteHand(idx) {
    const raw = handLog.filter((_, i) => i !== idx).map(h => ({ winner: h.winner, points: h.points }))
    applyReplay(replayLog(raw))
  }

  function persist(id, name, plrs, pl1, pl2, gms, log) {
    const session = {
      id, name, players: plrs,
      p1Level: pl1, p2Level: pl2,
      games: gms, handLog: log,
      updatedAt: Date.now(),
      completed: gms.every(g => g.done),
    }
    setSessions(upsertSession(session))
  }

  function startNew(name, p1, p2) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const fresh = [freshGame(), freshGame(), freshGame()]
    setActiveId(id); setSessionName(name); setPlayers([p1, p2])
    setP1Level(0); setP2Level(0); setGames(fresh); setHandLog([])
    persist(id, name, [p1, p2], 0, 0, fresh, [])
    setScreen('game')
  }

  function resumeSession(s) {
    setActiveId(s.id); setSessionName(s.name); setPlayers(s.players)
    setP1Level(s.p1Level); setP2Level(s.p2Level)
    setGames(s.games); setHandLog(s.handLog)
    setScreen('game')
  }

  function addHand(winner, points) {
    const prevLevel = winner === 0 ? p1Level : p2Level
    const newLevel  = Math.min(prevLevel + 1, 3)
    const activeSlots = []

    const newGames = games.map((g, i) => {
      if (i >= newLevel || g.done) return g
      activeSlots.push(i)
      const next = { ...g }
      if (winner === 0) next.p1 += points
      else              next.p2 += points
      if (next.p1 >= 100 || next.p2 >= 100) next.done = true
      return next
    })

    const newLog = [...handLog, { handNum: handLog.length + 1, winner, points, activeSlots }]
    const newPl1 = winner === 0 ? newLevel : p1Level
    const newPl2 = winner === 1 ? newLevel : p2Level

    setGames(newGames)
    if (winner === 0) setP1Level(newLevel)
    else              setP2Level(newLevel)
    setHandLog(newLog)
    persist(activeId, sessionName, players, newPl1, newPl2, newGames, newLog)
  }

  function handleDelete(id) {
    setSessions(removeSession(id))
  }

  if (screen === 'home') return (
    <Home
      sessions={sessions}
      onNew={() => setScreen('setup')}
      onResume={resumeSession}
      onDelete={handleDelete}
    />
  )

  if (screen === 'setup') return (
    <Setup onStart={startNew} onBack={() => setScreen('home')} />
  )

  return (
    <GameBoard
      players={players}
      sessionName={sessionName}
      games={games}
      handLog={handLog}
      p1Level={p1Level}
      p2Level={p2Level}
      onAddHand={addHand}
      onEditHand={editHand}
      onDeleteHand={deleteHand}
      onExit={() => setScreen('home')}
    />
  )
}

export default App
