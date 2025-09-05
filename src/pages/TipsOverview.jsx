import React, { useEffect, useState } from 'react'
import { db } from '../services/firebase'
import { collection, onSnapshot } from 'firebase/firestore'

export default function TipsOverview() {
  const [tips, setTips] = useState([])

  useEffect(() => {
    // realtime listener pro tipy
    const unsub = onSnapshot(collection(db, 'tips'), snapshot => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      setTips(list)
    })

    return () => unsub() // cleanup listener při odchodu ze stránky
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
          {tips.map(t => (
            <tr key={t.id}>
              <td>{t.user}</td>
              <td>{t.matchId}</td>
              <td>{t.score || '-'}</td>
              <td>{t.scorer || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted">
        Pozn.: Název zápasu můžeš dohledat v administraci. (Pro zobrazení názvu by se musel dělat join víc dotazů.)
      </p>
    </div>
  )
}
