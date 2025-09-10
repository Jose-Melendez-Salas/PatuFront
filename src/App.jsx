import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

import Login from './Login'
import Registro from './Registro'

function App() {

  return (
    <Router>

      <Routes> {/* Aqui van a meter las diferentes rutas de sus pantallas*/}

        <Route path="/" element={ <Login/> } />
        <Route path="/Registro" element={ <Registro/> } />

      </Routes>

    </Router>
  )
}

export default App
