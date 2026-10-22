import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './app/AppShell'
import { HomePage } from './features/home/HomePage'
import { JogadoresPage } from './features/jogadores/JogadoresPage'
import { ClubesPage } from './features/clubes/ClubesPage'
import { ClubPage } from './features/clubes/ClubPage'
import { MatchPage } from './features/liga/MatchPage'
import { MatchDetailsPage } from './features/liga/MatchDetailsPage'
import { StandingPage } from './features/liga/StandingPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="jogadores" element={<JogadoresPage />} />
          <Route path="clubes" element={<ClubesPage />} />
          <Route path="clubes/:clubId" element={<ClubPage />} />
          <Route path="partidas" element={<MatchPage />} />
          <Route path="partidas/:matchId" element={<MatchDetailsPage />} />
          <Route path="classificacao" element={<StandingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
