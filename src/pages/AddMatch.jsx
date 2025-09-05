import React, { useState } from 'react'
import { db } from '../services/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export default function AddMatch() {
  const [teamA, setTeamA] = useState('')
  const [teamB, setTeamB] = useState('')
  const [isSpecial, setIsSpecial] = useState(false)
  const [loading, setLoading] = useState(false)

  const add = async () => {
    if (!teamA.trim() || !teamB.trim()) {
      alert('Vyplň oba týmy.')
      return
    }

    setLoading(true)
    try {
      await addDoc(collection(db, 'matches'), {
        teamA: teamA.trim(),
        teamB: teamB.trim(),
        isSpecial,
        result: null,
        scorer: null,
        createdAt: serverTimestamp()
      })
      // vyčistit inputy
      setTeamA('')
      setTeamB('')
      setIsSpecial(false)
      alert('Zápas přidán! 😊')
    } catch (err) {
      console.error(err)
      alert('Chyba při přidávání zápasu.')
    }
    setLoading(false)
  }

  return (
    <div className="card space-y">
      <h2>Přidání zápasu</h2>

      <input
        className="input"
        placeholder="Tým A"
        value={teamA}
        onChange={e => setTeamA(e.target.value)}
        disabled={loading}
      />
      <input
        className="input"
        placeholder="Tým B"
        value={teamB}
        onChange={e => setTeamB(e.target.value)}
        disabled={loading}
      />
      <label className="row">
        <input
          type="checkbox"
          checked={isSpecial}
          onChange={e => setIsSpecial(e.target.checked)}
          disabled={loading}
        /> Zápas kola
      </label>

      <button className="btn" onClick={add} disabled={loading}>
        {loading ? 'Přidávám...' : 'Přidat zápas'}
      </button>
    </div>
  )
}
