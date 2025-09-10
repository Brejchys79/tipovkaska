import React, { useEffect, useMemo, useState } from 'react'
import { db } from '../services/firebase'
import { collection, getDocs } from 'firebase/firestore'

function winnerFromScore(score) {
  if (!score || !score.includes(':')) return null
  const [a, b] = score.split(':').map(n => parseInt(n, 10))
  if (isNaN(a) || isNaN(b)) return null
  if (a === b) return 'draw'
  return a > b ? 'A' : 'B'
}

export default function Leaderboard() {
  const [tips, setTips] = useState([])
  const [matches, setMatches] = useState([])
  const [extraPoints, setExtraPoints] = useState([])

  useEffect(() => {
    (async () => {
      const tipsSnap = await getDocs(collection(db, 'tips'))
      const matchSnap = await getDocs(collection(db, 'matches'))
      const extraSnap = await getDocs(collection(db, 'manualPoints'))

      setTips(tipsSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setMatches(matchSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setExtraPoints(extraSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    })()
  }, [])

  const rows = useMemo(() => {
    const matchById = Object.fromEntries(matches.map(m => [m.id, m]))
    const scoreMap = {}

    for (const t of tips) {
      const m = matchById[t.matchId]
      if (!m || !m.result) continue
      let pts = 0
      if (t.score && m.result && t.score.trim() === m.result.trim()) {
        pts += 5
        if (m.isSpecial) pts += 3
      } else {
        const tw = winnerFromScore(t.score)
        const rw = winnerFromScore(m.result)
        if (tw && rw && tw === rw) {
          pts += 3
        }
      }
      if (t.scorer && m.scorer && t.scorer.trim().toLowerCase() === m.scorer.trim().toLowerCase()) {
        pts += 3
      }
      scoreMap[t.user] = (scoreMap[t.user] || 0) + pts
    }

    // přičteme manuální body
    for (const e of extraPoints) {
      scoreMap[e.user] = (scoreMap[e.user] || 0) + (e.points || 0)
    }

    return Object.entries(scoreMap).sort((a, b) => b[1] - a[1])
  }, [tips, matches, extraPoints])

  return (
    <div className="card">
      <h2>Žebříček</h2>
      <table className="table">
        <thead>
          <tr><th>Pořadí</th><th>Jméno</th><th>Body</th></tr>
        </thead>
        <tbody>
          {rows.map(([name, pts], idx) => (
            <tr key={name}>
              <td>{idx + 1}.</td>
              <td>{name}</td>
              <td>{pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
