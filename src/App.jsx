import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

import Login from './Login'
import Registro from './Registro'
import AccesosMaestros from './accesosMaestros'
import Pruebas from './Pruebas'

function App() {

  return (
    <Router>

      <Routes> {/* Aqui van a meter las diferentes rutas de sus pantallas*/}

        <Route path="/" element={<Login />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Registro" element={<Registro />} />
        <Route path="/AccesosMaestros" element={<AccesosMaestros />} />
        <Route path="/Pruebas" element={<Pruebas />} />


      </Routes>

    </Router>
  )
}

export default App
