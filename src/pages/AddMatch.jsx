import React, { useState } from 'react'
import { db } from '../services/firebase'
import { collection, addDoc } from 'firebase/firestore'

export default function AddMatch() {
  const [teamA, setTeamA] = useState('')
  const [teamB, setTeamB] = useState('')
  const [isSpecial, setIsSpecial] = useState(false)

  const add = async () => {
    if (!teamA || !teamB) return alert('Vyplň oba týmy.')
    await addDoc(collection(db, 'matches'), {
      teamA, teamB, isSpecial, result: null, scorer: null, createdAt: Date.now()
    })
    setTeamA(''); setTeamB(''); setIsSpecial(false)
    alert('Zápas přidán!')
  }

  return (
    <div className="card space-y">
      <h2>Přidání zápasu</h2>
      <input className="input" placeholder="Tým A" value={teamA} onChange={e=>setTeamA(e.target.value)} />
      <input className="input" placeholder="Tým B" value={teamB} onChange={e=>setTeamB(e.target.value)} />
      <label className="row"><input type="checkbox" checked={isSpecial} onChange={e=>setIsSpecial(e.target.checked)} /> Zápas kola</label>
      <button className="btn" onClick={add}>Přidat zápas</button>
    </div>
  )
}