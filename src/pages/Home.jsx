import React, { useEffect, useState } from 'react'
import { db } from '../services/firebase'
import { collection, setDoc, doc, serverTimestamp, onSnapshot } from 'firebase/firestore'

const PLAYERS = ['Kuba', 'Dominik', 'Michal', 'Ondra',, 'Adéla',]

export default function Home() {
  const [user, setUser] = useState(PLAYERS[0])
  const [matches, setMatches] = useState([])
  const [tips, setTips] = useState({})

  // Realtime listener pro zápasy
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'matches'), snapshot => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      setMatches(list)
    })
    return () => unsub()
  }, [])

  const handleChange = (matchId, field, value) => {
    setTips(prev => ({ ...prev, [matchId]: { ...(prev[matchId]||{}), [field]: value }}))
  }

  const saveAll = async () => {
    const ops = Object.entries(tips).map(([matchId, t]) => {
      const tipId = `${user}_${matchId}` // upsert per user+match
      return setDoc(doc(db, 'tips', tipId), {
        user,
        matchId,
        score: (t.score || '').trim(),
        scorer: (t.scorer || '').trim(),
        createdAt: serverTimestamp()
      }, { merge: true })
    })
    await Promise.all(ops)
    alert('Tipy uloženy!')
    setTips({})
  }

  if (!matches.length) return <p>Načítám zápasy...</p>

  return (
    <div className="space-y">
      <div className="card">
        <div className="row">
          <label>Vyber jméno:</label>
          <select value={user} onChange={e => setUser(e.target.value)}>
            {PLAYERS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <p className="muted">Zadej přesný výsledek (např. 2:1) a střelce.</p>
      </div>

      <div className="grid">
        {matches.map(m => (
          <div key={m.id} className="card">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <strong>
                {m.teamA} vs {m.teamB} {m.isSpecial ? '⭐' : ''}
              </strong>
            </div>
            <div className="row">
              <input
                className="input"
                placeholder="Výsledek např. 2:1"
                onChange={e => handleChange(m.id, 'score', e.target.value)}
              />
              <input
                className="input"
                placeholder="Střelec"
                onChange={e => handleChange(m.id, 'scorer', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <button className="btn" onClick={saveAll}>Uložit tipy</button>
    </div>
  )
}
