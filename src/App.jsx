import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

import Login from './Login'
import Registro from './Registro'
import AccesosMaestros from './accesosMaestros'
import Pruebas from './Pruebas'
import RecuperarContra from './RecuperarContra'
import EventoCalendario from './EventoCalendario'
import Calendario from './Calendario'
import Grupos from './Grupos'
import ListaAlumnos from './ListaAlumnos' // Importar ListaAlumnos
import FichaAlumno from './FichaAlumno'

function App() {
  return (
    <Router>
      <Routes> 
        <Route path="/" element={<Login />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Registro" element={<Registro />} />
        <Route path="/AccesosMaestros" element={<AccesosMaestros />} />
        <Route path="/Pruebas" element={<Pruebas />} />
        <Route path="/RecuperarContra" element={<RecuperarContra />} />
        <Route path="/EventoCalendario" element={<EventoCalendario />} />
        <Route path="/Calendario" element={<Calendario />} />
        <Route path="/Grupos" element={<Grupos />} />
        <Route path="/alumnos/:matricula/ficha" element={<FichaAlumno />} />
        <Route path="/ListaAlumnos/:codigoGrupo" element={<ListaAlumnos />} />
        
      </Routes>
    </Router>
  )
}

export default App

