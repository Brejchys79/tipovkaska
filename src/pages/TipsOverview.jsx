import React, { useEffect, useState } from 'react'
import { db } from '../services/firebase'
import { collection, onSnapshot } from 'firebase/firestore'

export default function TipsOverview() {
  const [tips, setTips] = useState([])
  const [matches, setMatches] = useState({})
  const [filters, setFilters] = useState({
    user: '',
    match: '',
    score: '',
    scorer: '',
    date: '', // yyyy-mm-dd z input[type=date]
  })

  useEffect(() => {
    const unsubTips = onSnapshot(collection(db, 'tips'), snapshot => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      setTips(list)
    })

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

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const filteredTips = tips.filter(t => {
    const match = matches[t.matchId]
    const matchName = match ? `${match.teamA} vs ${match.teamB}` : t.matchId
    const dateObj = t.createdAt?.toDate ? t.createdAt.toDate() : null
    const formattedDate = dateObj ? dateObj.toLocaleString('cs-CZ') : '-'

    // Porovnání datumu
    let dateMatch = true
    if (filters.date && dateObj) {
      const dateOnly = dateObj.toISOString().split('T')[0] // yyyy-mm-dd
      dateMatch = dateOnly === filters.date
    } else if (filters.date && !dateObj) {
      dateMatch = false
    }

    return (
      t.user?.toLowerCase().includes(filters.user.toLowerCase()) &&
      matchName.toLowerCase().includes(filters.match.toLowerCase()) &&
      (t.score || '-').toString().toLowerCase().includes(filters.score.toLowerCase()) &&
      (t.scorer || '-').toLowerCase().includes(filters.scorer.toLowerCase()) &&
      dateMatch
    )
  })

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
            <th>Datum a čas</th>
          </tr>
          <tr>
            <th>
              <input
                type="text"
                placeholder="Filtr..."
                value={filters.user}
                onChange={e => handleFilterChange('user', e.target.value)}
              />
            </th>
            <th>
              <input
                type="text"
                placeholder="Filtr..."
                value={filters.match}
                onChange={e => handleFilterChange('match', e.target.value)}
              />
            </th>
            <th>
              <input
                type="text"
                placeholder="Filtr..."
                value={filters.score}
                onChange={e => handleFilterChange('score', e.target.value)}
              />
            </th>
            <th>
              <input
                type="text"
                placeholder="Filtr..."
                value={filters.scorer}
                onChange={e => handleFilterChange('scorer', e.target.value)}
              />
            </th>
            <th>
              <input
                type="date"
                value={filters.date}
                onChange={e => handleFilterChange('date', e.target.value)}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredTips.map(t => {
            const match = matches[t.matchId]
            const matchName = match ? `${match.teamA} vs ${match.teamB}` : t.matchId
            const date = t.createdAt?.toDate ? t.createdAt.toDate() : null
            const formattedDate = date ? date.toLocaleString('cs-CZ') : '-'

            return (
              <tr key={t.id}>
                <td>{t.user}</td>
                <td>{matchName}</td>
                <td>{t.score || '-'}</td>
                <td>{t.scorer || '-'}</td>
                <td>{formattedDate}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="muted">
        Pozn.: Pokud zápas neexistuje, zobrazí se ID. Pokud tip nemá datum, zobrazí se „-”.
      </p>
    </div>
  )
}
