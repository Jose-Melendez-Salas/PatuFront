import React, { useState } from 'react';
import logoImg from './assets/logo.png';
import { useNavigate } from 'react-router-dom';
import ilustracionImg from './assets/ilustracion.png';
import { Eye, EyeOff } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!correo.trim() || !contraseña.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }

    try {
      const res = await fetch('https://apis-patu.onrender.com/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: correo,
          password: contraseña // backend espera "password"
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Error en el inicio de sesión');
        return;
      }

      // Guardar datos por separado en localStorage
      localStorage.setItem(
        "usuario",
        JSON.stringify({
          id: data.data.id,
          nombre: data.data.nombre,
          rol: data.data.rol,
          correo: data.data.correo,
          accessToken: data.data.accessToken
        })
      );

      setError('');
      onLogin?.(data.data.nombre);


      navigate('/accesosMaestros');
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con el servidor');
    }
  };

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
          <div className="flex-1 flex flex-col items-center justify-center p-10 md:-ml-30">
            <div className="bg-white rounded-3xl shadow-3xl p-10 w-full max-w-3xl animate-fadeIn border-7 border-gray-300 flex flex-col items-center">
              <h2 className="text-4xl font-bold mb-8 text-center border-b-4 border-yellow-400 pb-2 w-full">
                Iniciar Sesión
              </h2>

              <form className="flex flex-col items-center gap-6 w-full" onSubmit={handleSubmit}>
                <label className="text-gray-700 font-medium w-4/5 relative group">
                  Correo Electrónico <span className="text-red-500">*</span>
                  <input
                    type="text"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="Correo Electrónico"
                    className="p-4 border border-gray-300 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-purple-400 mt-2"
                  />

                  {/* Tooltip informativo */}
                  <span className="absolute top-full left-0 mt-1 text-sm text-gray-600 bg-yellow-100 border border-yellow-400 px-3 py-1 rounded-xl shadow-sm opacity-0 group-focus-within:opacity-100 transition-opacity duration-300">
                    Debe ser un correo institucional <strong>@itsmante.edu.mx</strong>
                  </span>
                </label>

                <label className="text-gray-700 font-medium w-4/5 flex flex-col">
                  Contraseña:
                  <div className="relative w-full mt-2">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={contraseña}
                      onChange={(e) => setContraseña(e.target.value)}
                      placeholder="Ingresa tu contraseña aquí"
                      className="p-4 pr-12 border border-gray-300 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-purple-400 text-base sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-4 flex items-center"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff size={22} color="#4F3E9B" />
                      ) : (
                        <Eye size={22} color="#4F3E9B" />
                      )}
                    </button>
                  </div>

                </label>

                {error && <p className="text-red-600 text-sm text-center">{error}</p>}

                {/* Olvidaste tu contraseña */}
                <div className="w-4/5 text-center">
                  <a
                    href="/RecuperarContra"
                    className="text-lg text-gray-400 underline font-medium hover:text-gray-600"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                <button
                  type="submit"
                  className="bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white py-3 px-6 rounded-2xl font-bold text-2xl mt-4"
                >
                  Iniciar Sesión
                </button>
              </form>
            </div>

            <p className="mt-6 text-medium text-center w-4/5 font-medium">
              ¿No tienes cuenta?{' '}
              <a href="/Registro" className="text-[#4F3E9B] underline font-medium">
                Regístrate aquí
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Animación */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>
    </div>
  );
};

export default Login;
