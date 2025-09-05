import React, { useEffect, useState } from 'react'
import { db } from '../services/firebase'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'

export default function Admin() {
  const [matches, setMatches] = useState([])

  const load = async () => {
    const snap = await getDocs(collection(db, 'matches'))
    setMatches(snap.docs.map(d=>({ id:d.id, ...d.data() })))
  }
  useEffect(()=>{ load() }, [])

  const save = async (m, result, scorer) => {
    await updateDoc(doc(db, 'matches', m.id), { result: result || null, scorer: scorer || null })
    await load()
    alert('Uloženo')
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
            <input className="input" placeholder="Výsledek např. 2:1" defaultValue={m.result||''}
                   onBlur={e=>save(m, e.target.value, m.scorer)} />
            <input className="input" placeholder="Střelec" defaultValue={m.scorer||''}
                   onBlur={e=>save(m, m.result, e.target.value)} />
          </div>
          <p className="muted">Uloží se při opuštění pole (onBlur).</p>
        </div>
      ))}
    </div>
  )
}