import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

import Login from './Login'
import Registro from './Registro'
import AccesosMaestros from './accesosMaestros'
import RecuperarContra from './RecuperarContra'
import EventoCalendario from './EventoCalendario'
import Calendario from './Calendario'
import Grupos from './Grupos'
import ListaAlumnos from './ListaAlumnos'
import FichaAlumno from './FichaAlumno'
import NuevoGrupo from './NuevoGrupo'
import HomeAlumno from './HomeAlumno'
import Reportes from './Reportes'
import Mensajes from './Mensajes'


function App() {

  return (

    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Registro" element={<Registro />} />
        <Route path="/AccesosMaestros" element={<AccesosMaestros />} />
        <Route path="/RecuperarContra" element={<RecuperarContra />} />
        <Route path="/EventoCalendario" element={<EventoCalendario />} />
        <Route path="/Calendario" element={<Calendario />} />
        <Route path="/Grupos" element={<Grupos />} />
        <Route path="/alumnos/:matricula/ficha" element={<FichaAlumno />} />
        <Route path="/Reportes" element={<Reportes />} />
        <Route path="/Mensajes" element={<Mensajes />} />
        <Route path="/ListaAlumnos" element={<ListaAlumnos />} />
        <Route path="/ListaAlumnos/:idGrupo" element={<ListaAlumnos />} />
        <Route path="/NuevoGrupo" element={<NuevoGrupo />} />
        <Route path="/HomeAlumno/:matricula" element={<HomeAlumno />} />
        <Route path="/bitacora/:idSesion" element={<RegistroBitacora />} />

      </Routes>

    </Router>
  )
}

export default App
