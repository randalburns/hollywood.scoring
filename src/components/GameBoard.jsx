import { useState } from 'react'
import HandEntry from './HandEntry'
import Settlement from './Settlement'

export default function GameBoard({ players, sessionName, games, handLog, p1Level, p2Level, onAddHand, onExit }) {
  const [showEntry, setShowEntry] = useState(false)
  const [p1, p2] = players

  function confirmHand(winner, points) {
    setShowEntry(false)
    onAddHand(winner, points)
  }

  const allDone = games.every(g => g.done)

  return (
    <div className="board">
      <header className="board-header">
        <button className="btn-ghost btn-exit" onClick={onExit}>← Exit</button>
        <span className="board-title">{sessionName}</span>
        <span className="hand-counter">Hand {handLog.length}</span>
      </header>

      <div className="columns-wrap">
        {games.map((game, i) => (
          <ScoreColumn
            key={i}
            gameIdx={i}
            game={game}
            handLog={handLog}
            players={players}
            p1Active={p1Level > i}
            p2Active={p2Level > i}
          />
        ))}
      </div>


      {allDone && (
        <Settlement games={games} handLog={handLog} players={players} />
      )}

      <div style={{ height: 88 }} />

      <div className="bottom-bar">
        <button
          className="btn-primary btn-add-hand"
          onClick={() => setShowEntry(true)}
          disabled={allDone}
        >
          {allDone ? 'Game Over' : '+ Add Hand'}
        </button>
      </div>

      {showEntry && (
        <HandEntry
          players={players}
          onConfirm={confirmHand}
          onCancel={() => setShowEntry(false)}
        />
      )}
    </div>
  )
}

function ScoreColumn({ gameIdx, game, handLog, players, p1Active, p2Active }) {
  const [p1, p2] = players
  const name1 = p1.length > 6 ? p1.slice(0, 6) : p1
  const name2 = p2.length > 6 ? p2.slice(0, 6) : p2
  const colStatus = game.done ? 'done' : (p1Active || p2Active) ? 'active' : 'pending'
  const streetNames = ['1st Street', '2nd Street', '3rd Street']

  // Each player's column = their own running totals, one entry per box won
  let p1Run = 0, p2Run = 0
  const p1Rows = [], p2Rows = []
  handLog
    .filter(h => h.activeSlots.includes(gameIdx))
    .forEach(hand => {
      if (hand.winner === 0) { p1Run += hand.points; p1Rows.push(p1Run) }
      else                   { p2Run += hand.points; p2Rows.push(p2Run) }
    })

  const numRows = Math.max(p1Rows.length, p2Rows.length)

  return (
    <div className={`score-col ${colStatus}`}>
      <div className="score-col-header">
        <span className="score-col-num">{streetNames[gameIdx]}</span>
        {game.done && <span className="score-col-done-badge">Done</span>}
      </div>

      <div className="score-col-names">
        <span className={`score-col-pname p1-color ${!p1Active ? 'inactive-player' : ''}`}>{name1}</span>
        <span className={`score-col-pname p2-color ${!p2Active ? 'inactive-player' : ''}`}>{name2}</span>
      </div>

      <div className="score-col-body">
        {numRows === 0 && (
          <div className="score-col-pending-msg">Not started</div>
        )}
        {Array.from({ length: numRows }, (_, i) => {
          const p1Val = i < p1Rows.length ? p1Rows[i] : null
          const p2Val = i < p2Rows.length ? p2Rows[i] : null
          const p1Final = i === p1Rows.length - 1
          const p2Final = i === p2Rows.length - 1
          return (
            <div key={i} className="score-run-row">
              <span className={[
                'score-run-val p1-color',
                p1Final && p1Val !== null ? 'score-run-final' : '',
                p1Final && game.p1 > game.p2 ? 'leading' : '',
              ].join(' ')}>
                {p1Val ?? ''}
              </span>
              <span className={[
                'score-run-val p2-color',
                p2Final && p2Val !== null ? 'score-run-final' : '',
                p2Final && game.p2 > game.p1 ? 'leading' : '',
              ].join(' ')}>
                {p2Val ?? ''}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
