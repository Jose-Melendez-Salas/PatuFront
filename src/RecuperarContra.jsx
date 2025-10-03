import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logoImg from './assets/logo.png';

const RecuperarContra = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);

    if (!correo.trim() || !password.trim() || !confirmarPassword.trim()) {
      setError('⚠️ Por favor completa todos los campos.');
      return;
    }

    if (password !== confirmarPassword) {
      setError('❌ Las contraseñas no coinciden.');
      return;
    }

        try {
          const response = await fetch(
      `https://apis-patu.onrender.com/api/usuarios/actualizar-password/${correo}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      }
    );


      const data = await response.json();

      if (!response.ok) {
        setError(data.message || '❌ Error al actualizar la contraseña');
        return;
      }

      setMensaje('✅ Contraseña actualizada exitosamente. Ahora puedes iniciar sesión.');
      setCorreo('');
      setPassword('');
      setConfirmarPassword('');
    } catch (err) {
      console.error(err);
      setError('⚠️ Error al conectar con el servidor. Intenta de nuevo.');
    }
  };

  return (
    <>
      {/* Header */}
      <header className="relative bg-[#4F3E9B] text-white flex items-center justify-between px-5 h-20">
        <div className="flex items-center gap-8">
          <div className="text-2xl md:text-4xl font-bold">Recupera tu contraseña rápido y seguro</div>
        </div>
        <div className="flex items-center gap-4 text-3xl md:text-5xl font-bold">
          PATU
          <img src={logoImg} alt="Logo" className="w-12 h-12" />
        </div>
      </header>

      {/* Contenido */}
      <div className="flex-1 flex flex-col items-center justify-center p-10">
        <div className="bg-white rounded-3xl shadow-lg p-10 w-full max-w-3xl border border-gray-300">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center border-b-4 border-yellow-400 pb-2">
            Recuperar Contraseña
          </h2>

          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {/* Correo */}
            <label className="text-gray-700 font-medium flex flex-col">
              Correo electrónico:
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="Correo Electrónico"
                className="p-4 border border-gray-300 rounded-2xl mt-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </label>

            {/* Nueva contraseña */}
            <label className="text-gray-700 font-medium flex flex-col relative">
              Nueva contraseña:
              <input
                type={mostrarPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nueva contraseña"
                className="p-4 border border-gray-300 rounded-2xl mt-2 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-4 top-12 text-gray-500"
              >
                {mostrarPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </label>

            {/* Confirmar nueva contraseña */}
            <label className="text-gray-700 font-medium flex flex-col relative">
              Confirmar nueva contraseña:
              <input
                type={mostrarConfirmar ? "text" : "password"}
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                placeholder="Repite la nueva contraseña"
                className="p-4 border border-gray-300 rounded-2xl mt-2 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                className="absolute right-4 top-12 text-gray-500"
              >
                {mostrarConfirmar ? <FaEyeSlash /> : <FaEye />}
              </button>
            </label>

            {/* Mensajes */}
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}
            {mensaje && <p className="text-green-600 text-sm text-center">{mensaje}</p>}

            {/* Botón */}
            <button
              type="submit"
              className="bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white py-3 px-6 rounded-2xl font-bold text-xl mt-4"
            >
              Actualizar Contraseña
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default RecuperarContra;
