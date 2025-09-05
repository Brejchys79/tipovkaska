import React, { useEffect, useState } from 'react'
import { db } from '../services/firebase'
import { collection, onSnapshot, doc, updateDoc, getDocs, serverTimestamp } from 'firebase/firestore'

export default function Administration() {
  const [matches, setMatches] = useState([])
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'matches'), snapshot => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      setMatches(list)
    })
    return () => unsub()
  }, [])

  const handleChange = (matchId, field, value) => {
    setResults(prev => ({ ...prev, [matchId]: { ...(prev[matchId] || {}), [field]: value } }))
  }

  const evaluateMatch = async (match) => {
    const res = results[match.id]
    if (!res || !res.score) { alert('Zadej výsledek!'); return }
    setLoading(true)
    try {
      await updateDoc(doc(db, 'matches', match.id), {
        result: res.score.trim(),
        scorer: res.scorer ? res.scorer.trim() : null,
        evaluatedAt: serverTimestamp()
      })

      const tipsSnap = await getDocs(collection(db, 'tips'))
      const matchTips = tipsSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(t => t.matchId === match.id)

      const ops = matchTips.map(async tip => {
        let points = 0
        const [realA, realB] = res.score.trim().split(':').map(Number)
        const [tipA, tipB] = tip.score ? tip.score.split(':').map(Number) : [null, null]

        if (tipA !== null && tipB !== null) {
          if (tipA === realA && tipB === realB) points += 5
          else if ((tipA > tipB && realA > realB) || (tipA < tipB && realA < realB) || (tipA === tipB && realA === realB)) points += 3
        }

        if (res.scorer && tip.scorer && res.scorer.toLowerCase() === tip.scorer.toLowerCase()) points += 3
        if (match.isSpecial) points += 3

        await updateDoc(doc(db, 'tips', tip.id), { points })
      })

      await Promise.all(ops)
      alert(`Zápas "${match.teamA} vs ${match.teamB}" vyhodnocen!`)
    } catch (err) {
      console.error(err)
      alert('Chyba při vyhodnocení zápasu: ' + err.message)
    }
    setLoading(false)
  }

  return (
    <div className="space-y">
      <h2>Administrace zápasů</h2>
      {matches.map(m => (
        <div key={m.id} className="card">
          <strong>{m.teamA} vs {m.teamB} {m.isSpecial ? '⭐' : ''}</strong>
          <div className="row space-x">
            <input className="input" placeholder="Skutečný výsledek" value={results[m.id]?.score || ''} 
                   onChange={e => handleChange(m.id, 'score', e.target.value)} disabled={loading} />
            <input className="input" placeholder="Střelec" value={results[m.id]?.scorer || ''} 
                   onChange={e => handleChange(m.id, 'scorer', e.target.value)} disabled={loading} />
            <button className="btn" onClick={() => evaluateMatch(m)} disabled={loading}>
              {loading ? 'Vyhodnocuji…' : 'Vyhodnotit zápas'}
            </button>
          </div>
        </div>
      ))}
    </
