import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

import Login from './Login'
import Registro from './Registro'
import AccesosMaestros from './accesosMaestros'
import Pruebas_temp from './Pruebas_temp'
import RecuperarContra from './RecuperarContra'
import EventoCalendario from './EventoCalendario'
import Calendario from './Calendario'
import Grupos from './Grupos'
import ListaAlumnos from './ListaAlumnos'
import FichaAlumno from './FichaAlumno'
import NuevoGrupo from './NuevoGrupo'
import HomeAlumno from './HomeAlumno'
import Contacto from './Contacto'
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
        <Route path="/Pruebas_temp" element={<Pruebas_temp />} />
        <Route path="/RecuperarContra" element={<RecuperarContra />} />
        <Route path="/EventoCalendario" element={<EventoCalendario />} />
        <Route path="/Calendario" element={<Calendario />} />
        <Route path="/Grupos" element={<Grupos />} />
        <Route path="/FichaAlumno/:matricula" element={<FichaAlumno />} />
        <Route path="/ListaAlumnos" element={<ListaAlumnos />} />
        <Route path="/ListaAlumnos/:codigoGrupo" element={<ListaAlumnos />} />
        <Route path="/NuevoGrupo" element={<NuevoGrupo />} />
        <Route path="/HomeAlumno/:matricula" element={<HomeAlumno />} />
        <Route path="/Contacto" element={<Contacto />} />
        <Route path="/Reportes" element={<Reportes />} />
        <Route path="/Mensajes" element={<Mensajes />} />



      </Routes>

    </Router>
  )
}

export default App
