import React, { useState } from 'react'
import logoImg from './assets/logo.png'
import ilustracionImg from './assets/ilustracion.png'
import ojoImg from './assets/ojo.png'

const Login = ({ onLogin }) => {
  const [correo, setCorreo] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (correo.trim() === '' || contraseña.trim() === '') {
      setError('Por favor completa todos los campos.')
      return
    }

    try {
      const res = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contraseña })
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.message || 'Error en el inicio de sesión')
        return
      }

      const data = await res.json()
      setError('')
      onLogin?.(correo)
      alert(`¡Bienvenido ${correo}!`)
      console.log('Respuesta del backend:', data)
    } catch (err) {
      console.error(err)
      setError('No se pudo conectar con el servidor')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-[#4F3E9B] text-white flex items-center justify-end px-10 h-20">
        <div className="flex items-center gap-4 text-5xl font-bold">
          PATU
          <img src={logoImg} alt="Logo" className="w-12 h-12" />
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 bg-white">
        <div className="flex flex-col md:flex-row h-full">
          {/* Lado izquierdo */}
          <div className="hidden md:flex md:w-1/2 items-center justify-center p-10">
            <img
              src={ilustracionImg}
              alt="Ilustración"
              className="rounded-xl w-full max-h-[80vh] object-contain"
            />
          </div>

          {/* Lado derecho: formulario */}
          <div className="flex-1 flex flex-col items-center justify-center p-10">
            <div className="bg-white rounded-4xl shadow-3xl p-10 w-full max-w-md animate-fadeIn border-7 border-gray-300">
              <h2 className="text-4xl font-bold mb-6 text-center border-b-5 border-yellow-400 pb-1">
                Iniciar Sesión
              </h2>

              <form className="flex flex-col" onSubmit={handleSubmit}>
                <label className="flex flex-col text-lg mb-4 text-gray-700 font-medium">
                  Correo Electrónico:
                  <input
                    type="text"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="Correo Electrónico"
                    className="p-3 mt-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </label>

                <label className="flex flex-col text-lg mb-4 text-gray-700 font-medium">
                  Contraseña:
                  <div className="mt-2 flex items-center border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-purple-400">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={contraseña}
                      onChange={(e) => setContraseña(e.target.value)}
                      placeholder="Ingresa tu contraseña aquí"
                      className="flex-1 p-3 text-base rounded-l-xl outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="flex items-center justify-center px-3"
                      tabIndex={-1}
                    >
                      <img
                        src={ojoImg}
                        alt={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        className={`w-6 h-6 transition-opacity ${showPassword ? 'opacity-50' : 'opacity-100'
                          }`}
                      />
                    </button>
                  </div>
                </label>

                <a href="#" className="text-gray-400 underline text-center mb-2">
                  ¿Olvidaste tu contraseña?
                </a>

                {/* Mensaje de error centrado arriba del botón */}
                {error && (
                  <p className="text-red-600 text-sm text-center mb-4 mt-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white py-2 px-6 rounded-xl font-bold text-2xl transition-colors mt-2 mx-auto"
                >
                  Iniciar Sesión
                </button>
              </form>
            </div>

            <p className="mt-6 text-sm text-center w-full max-w-md font-medium">
              ¿No tienes cuenta?{' '}
              <a href="#" className="text-purple-600 underline font-medium">
                Regístrate aquí
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Animación */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out;
          }
        `}
      </style>
    </div>
  )
}

export default Login
