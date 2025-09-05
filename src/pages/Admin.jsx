import React, { useEffect, useState } from 'react'
import { db } from '../services/firebase'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'

export default function Admin() {
  const [matches, setMatches] = useState([])
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const snap = await getDocs(collection(db, 'matches'))
    setMatches(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }

  useEffect(() => { load() }, [])

  const handleChange = (matchId, field, value) => {
    setResults(prev => ({ ...prev, [matchId]: { ...(prev[matchId] || {}), [field]: value } }))
  }

  const evaluateMatch = async (m) => {
    const res = results[m.id]
    if (!res || !res.score) { alert('Zadej výsledek!'); return }
    setLoading(true)
    try {
      // uložíme výsledek do zápasu
      await updateDoc(doc(db, 'matches', m.id), { 
        result: res.score.trim(), 
        scorer: res.scorer ? res.scorer.trim() : null 
      })

      // načteme tipy na tento zápas
      const tipsSnap = await getDocs(collection(db, 'tips'))
      const matchTips = tipsSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(t => t.matchId === m.id)

      const ops = matchTips.map(async tip => {
        let points = 0
        const [realA, realB] = res.score.trim().split(':').map(Number)
        const [tipA, tipB] = tip.score ? tip.score.split(':').map(Number) : [null, null]

        if (tipA !== null && tipB !== null) {
          if (tipA === realA && tipB === realB) points += 5
          else if ((tipA > tipB && realA > realB) || (tipA < tipB && realA < realB) || (tipA === tipB && realA === realB)) points += 3
        }

        if (res.scorer && tip.scorer && res.scorer.toLowerCase() === tip.scorer.toLowerCase()) points += 3
        if (m.isSpecial) points += 3

        await updateDoc(doc(db, 'tips', tip.id), { points })
      })

      await Promise.all(ops)
      alert(`Zápas "${m.teamA} vs ${m.teamB}" vyhodnocen!`)
      await load()
    } catch (err) {
      console.error(err)
      alert('Chyba při vyhodnocení: ' + err.message)
    }
    setLoading(false)
  }

  return (
    <div className="grid">
      {matches.map(m => (
        <div key={m.id} className="card space-y">
          <div className="row" style={{justifyContent:'space-between'}}>
            <strong>{m.teamA} vs {m.teamB}</strong>
            {m.isSpecial ? <span className="tag">Zápas kola</span> : null}
          </div>
          <div className="row">
            <input className="input" placeholder="Výsledek např. 2:1"
                   value={results[m.id]?.score || m.result || ''}
                   onChange={e=>handleChange(m.id, 'score', e.target.value)}
                   disabled={loading}/>
            <input className="input" placeholder="Střelec"
                   value={results[m.id]?.scorer || m.scorer || ''}
                   onChange={e=>handleChange(m.id, 'scorer', e.target.value)}
                   disabled={loading}/>
            <button className="btn" onClick={()=>evaluateMatch(m)} disabled={loading}>
              {loading ? 'Vyhodnocuji…' : 'Vyhodnotit zápas'}
            </button>
          </div>
          <p className="muted">Vyhodnocení provede výpočet bodů pro všechny tipy.</p>
        </div>
      ))}
    </div>
  )
}
