import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

import Login from './Login'
import Registro from './Registro'
import AccesosMaestros from './AccesosMaestros'
import Pruebas_temp from './Pruebas_temp'
import RecuperarContra from './RecuperarContra'
import EventoCalendario from './EventoCalendario'
import Calendario from './Calendario'
import Grupos from './Grupos'
import ListaAlumnos from './ListaAlumnos'
import FichaAlumno from './FichaAlumno'
import NuevoGrupo from './NuevoGrupo'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar-contra" element={<RecuperarContra />} />
        <Route path="/accesos-maestros" element={<AccesosMaestros />} />
        <Route path="/pruebas-temp" element={<Pruebas_temp />} />
        <Route path="/evento-calendario" element={<EventoCalendario />} />
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/grupos" element={<Grupos />} />
        <Route path="/lista-alumnos/:codigoGrupo" element={<ListaAlumnos />} />
        <Route path="/nuevo-grupo" element={<NuevoGrupo />} />
        <Route path="/alumnos/:matricula/ficha" element={<FichaAlumno />} />
      </Routes>
    </Router>
  )
}

export default App


