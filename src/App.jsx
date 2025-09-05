import React from 'react'
import { NavLink, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Leaderboard from './pages/Leaderboard.jsx'
import AddMatch from './pages/AddMatch.jsx'
import Admin from './pages/Admin.jsx'
import TipsOverview from './pages/TipsOverview.jsx'

export default function App() {
  return (
    <div>
      <nav className="nav">
        <NavLink to="/">Domů</NavLink>
        <NavLink to="/leaderboard">Žebříček</NavLink>
        <NavLink to="/add">Přidání zápasů</NavLink>
        <NavLink to="/admin">Administrace</NavLink>
        <NavLink to="/overview">Přehled tipů</NavLink>
      </nav>
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/add" element={<AddMatch />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/overview" element={<TipsOverview />} />
        </Routes>
      </div>
    </div>
  )
}