import React, { useEffect, useState } from 'react'
import { db } from '../services/firebase'
import {
  collection, getDocs, updateDoc, doc, addDoc, deleteDoc
} from 'firebase/firestore'

export default function AdminProtected() {
  const [authorized, setAuthorized] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')

  const [matches, setMatches] = useState([])
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(false)

  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState('')
  const [manualPointsList, setManualPointsList] = useState([])

  const [extraPoints, setExtraPoints] = useState('')
  const [extraReason, setExtraReason] = useState('')

  const ADMIN_PASSWORD = 'Dynamo79' // tvé heslo

  const checkPassword = () => {
    if (passwordInput === ADMIN_PASSWORD) setAuthorized(true)
    else alert('Špatné heslo!')
  }

  const loadMatches = async () => {
    const snap = await getDocs(collection(db, 'matches'))
    setMatches(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }

  const loadUsers = async () => {
    const snap = await getDocs(collection(db, 'users'))
    setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }

  const loadManualPoints = async () => {
    const snap = await getDocs(collection(db, 'manualPoints'))
    setManualPointsList(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }

  useEffect(() => {
    if (authorized) {
      loadMatches()
      loadUsers()
      loadManualPoints()
    }
  }, [authorized])

  // Výpočet zápasů – beze změny …
  const handleChange = (matchId, field, value) => {
    setResults(prev => ({
      ...prev,
      [matchId]: { ...(prev[matchId] || {}), [field]: value }
    }))
  }

  const evaluateMatch = async (m) => {
    /* ... stejný kód jako předtím ... */
  }

  const addManualPoints = async () => {
    if (!selectedUser || !extraPoints) {
      alert('Vyber uživatele a počet bodů'); return
    }
    try {
      await addDoc(collection(db, 'manualPoints'), {
        user: selectedUser,
        points: parseInt(extraPoints, 10),
        reason: extraReason.trim(),
        createdAt: new Date()
      })
      alert(`Přidáno ${extraPoints} bodů uživateli ${selectedUser}`)
      setSelectedUser('')
      setExtraPoints('')
      setExtraReason('')
      loadManualPoints()
    } catch (err) {
      console.error(err)
      alert('Chyba při ukládání: ' + err.message)
    }
  }

  const deleteManualEntry = async (id) => {
    if (window.confirm('Opravdu smazat toto zadání?')) {
      await deleteDoc(doc(db, 'manualPoints', id))
      loadManualPoints()
    }
  }

  if (!authorized) {
    return (
      <div className="card">
        <h2>Admin přihlášení</h2>
        <input
          type="password"
          className="input"
          placeholder="Heslo"
          value={passwordInput}
          onChange={e => setPasswordInput(e.target.value)}
        />
        <button className="btn" onClick={checkPassword}>Přihlásit</button>
      </div>
    )
  }

  return (
    <div className="grid">
      {/* Sekce zápasů */}
      {matches.map(m => (
        // ... původní vyhodnocovací UI komponenta ...
        <div key={m.id} className="card space-y">
          {/* ... */}
        </div>
      ))}

      {/* Sekce přidání manuálních bodů */}
      <div className="card space-y">
        <h3>Přidat body ručně</h3>
        <select
          className="input"
          value={selectedUser}
          onChange={e => setSelectedUser(e.target.value)}
        >
          <option value="">-- vyber uživatele --</option>
          {users.map(u => (
            <option key={u.id} value={u.displayName || u.id}>
              {u.displayName || u.id}
            </option>
          ))}
        </select>
        <input
          className="input"
          type="number"
          placeholder="Počet bodů"
          value={extraPoints}
          onChange={e => setExtraPoints(e.target.value)}
        />
        <input
          className="input"
          placeholder="Důvod (volitelné)"
          value={extraReason}
          onChange={e => setExtraReason(e.target.value)}
        />
        <button className="btn" onClick={addManualPoints}>Přidat body</button>
      </div>

      {/* Tabulka manuálních bodů */}
      <div className="card">
        <h3>Manual Points History</h3>
        <table className="table">
          <thead>
            <tr><th>Uživatel</th><th>Body</th><th>Důvod</th><th>Akce</th></tr>
          </thead>
          <tbody>
            {manualPointsList.map(entry => (
              <tr key={entry.id}>
                <td>{entry.user}</td>
                <td>{entry.points}</td>
                <td>{entry.reason || '-'}</td>
                <td>
                  <button
                    className="btn btn-red"
                    onClick={() => deleteManualEntry(entry.id)}
                  >Smazat</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
