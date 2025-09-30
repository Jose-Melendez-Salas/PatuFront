import React, { useState } from 'react'
import logoImg from './assets/logo.png'
import patoImg from './assets/pato.png'
import ojoImg from './assets/ojo.png'
import { Link } from 'react-router-dom'

const Registro = () => {
  const [nombre, setNombre] = useState('')
  const [apellidoP, setApellidoP] = useState('')
  const [apellidoM, setApellidoM] = useState('')
  const [correo, setCorreo] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!nombre.trim() || !apellidoP.trim() || !correo.trim() || !contraseña.trim() || !confirmar.trim()) {
      setError('Por favor completa todos los campos obligatorios.')
      return
    }

    if (!correo.endsWith('@itsmante.edu.mx')) {
      setError('Por favor, ingresa un correo institucional válido (@itsmante.edu.mx).')
      return
    }

    if (contraseña !== confirmar) {
      setError('Las contraseñas no coinciden.')
      return
    }

    const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/
    if (!regex.test(contraseña)) {
      setError('La contraseña debe contener al menos 8 caracteres, incluyendo una letra mayúscula y un carácter especial.')
      return
    }

    try {
      const res = await fetch('http://localhost:3001/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          apellido_paterno: apellidoP,
          apellido_materno: apellidoM,
          correo,
          contraseña
        })
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.message || 'Error en el registro')
        return
      }
      const data = await res.json()
      setError('')
      alert(`¡Bienvenido ${nombre}!`)
      window.location.href = "/Login"
    } catch (err) {
      console.error(err)
      setError('No se pudo conectar con el servidor')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-[#4F3E9B] text-white flex items-center justify-end px-10 h-20">
        <div className="flex items-center gap-4 text-5xl font-bold">
          PATU
          <img src={logoImg} alt="Logo" className="w-12 h-12" />
        </div>
      </header>

      <main className="flex-1 bg-white">
        <div className="flex flex-col md:flex-row h-full">
          <div className="hidden md:flex md:w-[55%] items-center justify-center">
            <img src={patoImg} alt="pato" className="rounded-xl w-[90%] max-h-[90vh] object-contain" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-7 md:-ml-65">
            <div className="bg-white rounded-3xl shadow-3xl p-10 w-full max-w-3xl animate-fadeIn border-7 border-gray-300">
              <h2 className="text-4xl font-bold mb-8 text-center border-b-4 border-yellow-400 pb-2">Registro</h2>

              <form className="flex flex-col gap-6 items-center" onSubmit={handleSubmit}>
                <label className="text-gray-700 font-medium w-4/5">Nombre (s): <span className="text-red-500">*</span>
                  <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ingresa tu nombre aquí" className="p-4 border border-gray-300 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-purple-400" />
                </label>

                <label className="text-gray-700 font-medium w-4/5">Apellido paterno: <span className="text-red-500">*</span>
                  <input type="text" value={apellidoP} onChange={e => setApellidoP(e.target.value)} placeholder="Ingresa tu apellido paterno aquí" className="p-4 border border-gray-300 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-purple-400" />
                </label>

                <label className="text-gray-700 font-medium w-4/5">Apellido materno:
                  <input type="text" value={apellidoM} onChange={e => setApellidoM(e.target.value)} placeholder="Ingresa tu apellido materno aquí (opcional)" className="p-4 border border-gray-300 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-purple-400" />
                </label>

                <label className="text-gray-700 font-medium w-4/5">Correo Electrónico: <span className="text-red-500">*</span>
                  <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} placeholder="Correo Electrónico" className="p-4 border border-gray-300 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-purple-400" />
                </label>

                <label className="text-gray-700 font-medium w-4/5">Contraseña: <span className="text-red-500">*</span>
                  <div className="flex items-center border border-gray-300 rounded-2xl mt-2 w-full">
                    <input type={showPassword ? 'text' : 'password'} value={contraseña} onChange={e => setContraseña(e.target.value)} placeholder="Ingresa tu contraseña aquí" className="flex-1 p-4 rounded-l-2xl outline-none" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="px-4">
                      <img src={ojoImg} alt={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} className="w-6 h-6" />
                    </button>
                  </div>
                </label>

                <label className="text-gray-700 font-medium w-4/5">Confirma tu contraseña: <span className="text-red-500">*</span>
                  <div className="flex items-center border border-gray-300 rounded-2xl mt-2 w-full">
                    <input type={showConfirmPassword ? 'text' : 'password'} value={confirmar} onChange={e => setConfirmar(e.target.value)} placeholder="Confirma tu contraseña" className="flex-1 p-4 rounded-l-2xl outline-none" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="px-4">
                      <img src={ojoImg} alt={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} className="w-6 h-6" />
                    </button>
                  </div>
                </label>

                {error && <p className="text-red-600 text-sm text-center">{error}</p>}

                <button type="submit" className="bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white py-3 px-6 rounded-2xl font-bold text-2xl mt-4 mx-auto w-1/2">Comenzar</button>
              </form>

              <p className="mt-6 text-medium text-center font-medium">
                ¿Ya tienes cuenta?{' '}
                <Link to="/Login" className="text-[#4F3E9B] underline font-medium">
                  Inicia sesión
                </Link>
              </p>
            </div>

          </div>
        </div>
      </main>

      <style>{`
        @keyframes fadeIn { from {opacity:0; transform: translateY(10px);} to {opacity:1; transform: translateY(0);} }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>
    </div>
  )
}

export default Registro
