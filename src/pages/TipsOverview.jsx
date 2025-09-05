import React, { useEffect, useState } from 'react'
import { db } from '../services/firebase'
import { collection, onSnapshot } from 'firebase/firestore'

export default function TipsOverview() {
  const [tips, setTips] = useState([])
  const [matches, setMatches] = useState({}) // objekt {matchId: zápas}

  useEffect(() => {
    // realtime listener pro tipy
    const unsubTips = onSnapshot(collection(db, 'tips'), snapshot => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      setTips(list)
    })

    // realtime listener pro zápasy
    const unsubMatches = onSnapshot(collection(db, 'matches'), snapshot => {
      const obj = {}
      snapshot.docs.forEach(d => {
        obj[d.id] = d.data()
      })
      setMatches(obj)
    })

    return () => {
      unsubTips()
      unsubMatches()
    }
  }, [])

  return (
    <div className="card">
      <h2>Přehled tipů</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Uživatel</th>
            <th>Zápas</th>
            <th>Tip</th>
            <th>Střelec</th>
          </tr>
        </thead>
        <tbody>
          {tips.map(t => {
            const match = matches[t.matchId]
            const matchName = match ? `${match.teamA} vs ${match.teamB}` : t.matchId
            return (
              <tr key={t.id}>
                <td>{t.user}</td>
                <td>{matchName}</td>
                <td>{t.score || '-'}</td>
                <td>{t.scorer || '-'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="muted">
        Pozn.: Pokud zápas neexistuje, zobrazí se ID.
      </p>
    </div>
  )
}
