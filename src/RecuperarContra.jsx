import React, { useState } from 'react';
import logoImg from './assets/logo.png';

const RecuperarContra = () => {
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);

    if (correo === '') {
      setError('Por favor, ingresa tu correo.');
      return;
    }

    try {
      // POST a tu API
      const response = await fetch('https://tu-api.com/recuperar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo }),
      });

      if (!response.ok) {
        throw new Error('Error en la petición');
      }

      // Si la API responde bien:
      setMensaje('Enviamos una nueva contraseña al correo que nos proporcionaste');
      setCorreo('');
    } catch (err) {
      setError('Error al enviar el correo. Inténtalo de nuevo.');
    }
  };

  return (
    <>
      {/* Layout */}
      <header className="relative bg-[#4F3E9B] text-white flex items-center justify-between px-5 h-20">
        <div className="flex items-center gap-8">
          <div className="text-4xl font-bold">Recupera tu contraseña rápido y seguro!</div>
        </div>
        <div className="flex items-center gap-4 text-5xl font-bold">
          PATU
          <img src={logoImg} alt="Logo" className="w-12 h-12" />
        </div>
      </header>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col items-center justify-center p-10 md:-ml-30">
        <div className="bg-white rounded-3xl shadow-3xl p-10 w-full max-w-3xl animate-fadeIn border-7 border-gray-300 flex flex-col items-center">
          <h2 className="text-4xl font-bold mb-8 text-center border-b-4 border-yellow-400 pb-2 w-full">
            Recuperar Contraseña
          </h2>

          <form className="flex flex-col items-center gap-6 w-full" onSubmit={handleSubmit}>
            <label className="text-gray-700 font-medium w-4/5 flex flex-col">
              Ingresa tu correo electrónico:
              <input
                type="text"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="Correo Electrónico"
                className="p-4 border border-gray-300 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-purple-400 mt-2"
              />
            </label>

            {error && <p className="text-red-600 text-sm text-center">{error}</p>}
            {mensaje && <p className="text-green-600 text-sm text-center">{mensaje}</p>}

            <button
              type="submit"
              className="bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white py-3 px-6 rounded-2xl font-bold text-2xl mt-4"
            >
              Recuperar
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default RecuperarContra;
