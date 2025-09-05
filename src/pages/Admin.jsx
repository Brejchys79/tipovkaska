import React, { useState } from 'react'
import { db } from '../services/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export default function AddMatch() {
  const [teamA, setTeamA] = useState('')
  const [teamB, setTeamB] = useState('')
  const [matchDateTime, setMatchDateTime] = useState('') // nový state
  const [isSpecial, setIsSpecial] = useState(false)
  const [loading, setLoading] = useState(false)

  const add = async () => {
    if (!teamA.trim() || !teamB.trim() || !matchDateTime) {
      alert('Vyplň oba týmy a datum zápasu.')
      return
    }

    setLoading(true)
    try {
      const docRef = await addDoc(collection(db, 'matches'), {
        teamA: teamA.trim(),
        teamB: teamB.trim(),
        matchDateTime, // uložení do DB
        isSpecial,
        result: null,
        scorer: null,
        createdAt: serverTimestamp(),
        evaluated: false
      })

      alert(`Zápas přidán! ID: ${docRef.id}`)

      // reset formuláře
      setTeamA('')
      setTeamB('')
      setMatchDateTime('')
      setIsSpecial(false)
    } catch (err) {
      console.error('Chyba při přidávání zápasu:', err)
      alert('Chyba při přidávání zápasu: ' + err.message)
    } finally {
      setLoading(false)
    }
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

      <label>
        Datum a čas zápasu:
        <input
          type="datetime-local"
          className="input"
          value={matchDateTime}
          onChange={e => setMatchDateTime(e.target.value)}
          disabled={loading}
        />
      </label>

      <label className="row">
        <input
          type="checkbox"
          checked={isSpecial}
          onChange={e => setIsSpecial(e.target.checked)}
          disabled={loading}
        /> Zápas kola
      </label>

      <button className="btn" onClick={add} disabled={loading}>
        {loading ? 'Přidávám…' : 'Přidat zápas'}
      </button>
    </div>
  )
}
