import React, { useState } from 'react';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import Navbar from './Navbar';

const EventoCalendario = () => {
  const [busqueda, setBusqueda] = useState('');
  const [personaEncontrada, setPersonaEncontrada] = useState(null);
  const [errorBusqueda, setErrorBusqueda] = useState('');
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaError, setHoraError] = useState('');
  const [duracion, setDuracion] = useState('');
  const [tipo, setTipo] = useState('');
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [loading, setLoading] = useState(false);

  const usuario = JSON.parse(localStorage.getItem('usuario'));

  // 🔍 Buscar alumno o tutor según el rol
  const handleBuscar = async () => {
    try {
      setErrorBusqueda('');
      setPersonaEncontrada(null);

      if (!busqueda.trim()) {
        setErrorBusqueda(' Ingresa un valor de búsqueda.');
        return;
      }

      if (!usuario || !usuario.accessToken) {
        setErrorBusqueda(' Debes iniciar sesión primero.');
        return;
      }

      let url = '';
      if (usuario.rol === 'tutor') {
        // tutor busca alumno por matrícula
        url = `https://apis-patu.onrender.com/api/alumnos/matricula/${busqueda}`;
      } else {
        // alumno busca tutor por correo (ruta antigua que funciona)
        url = `https://apis-patu.onrender.com/api/usuarios/correo/${busqueda}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${usuario.accessToken}` },
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorBusqueda(data.message || ' No se encontró ningún resultado.');
        return;
      }

      setPersonaEncontrada(data.data || data);
    } catch (err) {
      console.error(err);
      setErrorBusqueda(' Error al conectar con la API.');
    }
  };

  // 💾 Guardar evento
  const handleGuardar = async () => {
    try {
      if (!usuario || !usuario.accessToken) {
        setMensaje({ tipo: 'error', texto: ' No hay usuario logueado.' });
        return;
      }

      if (!personaEncontrada) {
        setMensaje({
          tipo: 'error',
          texto:
            usuario.rol === 'tutor'
              ? ' Debes buscar y seleccionar un alumno primero.'
              : ' Debes buscar y seleccionar un tutor primero.',
        });
        return;
      }

      if (!fecha || !horaInicio || !duracion || !tipo) {
        setMensaje({ tipo: 'error', texto: ' Completa todos los campos antes de guardar.' });
        return;
      }

      setLoading(true);
      setMensaje({ tipo: 'info', texto: ' Asignando sesión...' });

      // Calcular hora fin
      const horaFinCalculada = (() => {
        const [h, m] = horaInicio.split(':').map(Number);
        const totalMin = h * 60 + m + parseInt(duracion);
        const finH = String(Math.floor(totalMin / 60)).padStart(2, '0');
        const finM = String(totalMin % 60).padStart(2, '0');
        return `${finH}:${finM}`;
      })();

      const nuevoEvento = {
        id_alumno: usuario.rol === 'tutor' ? personaEncontrada.id : usuario.id,
        id_tutor: usuario.rol === 'tutor' ? usuario.id : personaEncontrada.id,
        fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFinCalculada,
        tipo,
      };

      const res = await fetch('https://apis-patu.onrender.com/api/sesiones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${usuario.accessToken}`,
        },
        body: JSON.stringify(nuevoEvento),
      });

      const data = await res.json();

      if (!res.ok) {
        setMensaje({ tipo: 'error', texto: data.message || ' Error al guardar el evento.' });
        setLoading(false);
        return;
      }

      setMensaje({ tipo: 'success', texto: ' Sesión creada con éxito.' });

      // Limpiar formulario
      setBusqueda('');
      setPersonaEncontrada(null);
      setFecha('');
      setHoraInicio('');
      setDuracion('');
      setTipo('');
    } catch (err) {
      console.error(err);
      setMensaje({ tipo: 'error', texto: ' Error de conexión con el servidor.' });
    } finally {
      setLoading(false);
    }
  };

  // Deshabilitar botón si faltan datos
  const botonDeshabilitado =
    loading || !personaEncontrada || !fecha || !horaInicio || !duracion || !tipo || horaError;

  return (
    <>
      <Navbar />

      <main className="p-8 flex flex-col items-center">
        <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-4xl border border-gray-200">
          <h2 className="text-3xl font-bold mb-6 border-b-4 border-yellow-400 pb-3">
            Nuevo evento
          </h2>

          {/* 🟡 Mensaje global */}
          {mensaje.texto && (
            <div
              className={`mb-6 p-4 rounded-xl text-center font-semibold transition-all duration-300 ${
                mensaje.tipo === 'error'
                  ? 'bg-red-100 text-red-700'
                  : mensaje.tipo === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {mensaje.texto}
            </div>
          )}

          {/* 🔍 Buscar alumno o tutor */}
          <div className="mb-6">
            <label className="block text-xl font-bold mb-2">
              {usuario.rol === 'tutor' ? 'Alumno:' : 'Tutor:'}
            </label>
            <div className="relative flex gap-2">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder={
                  usuario.rol === 'tutor'
                    ? 'Buscar alumno por matrícula'
                    : 'Buscar tutor por correo'
                }
                className="flex-1 p-4 border border-gray-300 rounded-2xl shadow-md"
              />
              <button
                onClick={handleBuscar}
                className="bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white px-5 rounded-2xl font-bold"
              >
                <FaSearch />
              </button>
            </div>

            {errorBusqueda && <p className="text-red-500 mt-2 font-semibold">{errorBusqueda}</p>}

            {!personaEncontrada && !errorBusqueda && (
              <p className="text-yellow-600 mt-2 font-semibold">
                 Debes buscar y seleccionar {usuario.rol === 'tutor' ? 'un alumno' : 'un tutor'} primero
              </p>
            )}

            {personaEncontrada && (
              <div className="mt-3 p-3 bg-green-100 border border-green-400 rounded-xl">
                <p>
                  <span className="font-bold">Nombre:</span>{' '}
                  {personaEncontrada.nombre} {personaEncontrada.apellido_paterno}{' '}
                  {personaEncontrada.apellido_materno}
                </p>
                <p>
                  <span className="font-bold">
                    {usuario.rol === 'tutor' ? 'Matrícula:' : 'Correo:'}
                  </span>{' '}
                  {usuario.rol === 'tutor'
                    ? personaEncontrada.matricula
                    : personaEncontrada.correo}
                </p>
              </div>
            )}
          </div>

          {/* Tipo */}
          <div className="mb-6">
            <label className="block text-xl font-bold mb-2">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-2xl shadow-md focus:ring-2 focus:ring-[#3CB9A5]"
            >
              <option value="">Selecciona ...</option>
              <option value="seguimiento">Seguimiento</option>
              <option value="general">General</option>
              <option value="problemas academicos">Problemas académicos</option>
              <option value="problemas personales">Problemas personales</option>
            </select>
          </div>

          {/* Fecha, hora y duración */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xl font-bold mb-2">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split('T')[0]}
                className="w-full p-4 border border-gray-300 rounded-2xl"
              />
            </div>

            <div>
              <label className="block text-xl font-bold mb-2">Hora de inicio</label>
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => {
                  const valor = e.target.value;
                  setHoraInicio(valor);
                  
                  // Validar rango de 7:00 AM a 7:00 PM
                  if (valor) {
                    const [hora] = valor.split(':').map(Number);
                    if (hora < 7 || hora >= 19) {
                      setHoraError(' La hora debe estar entre 7:00 AM y 7:00 PM');
                    } else {
                      setHoraError('');
                    }
                  } else {
                    setHoraError('');
                  }
                }}
                className="w-full p-4 border border-gray-300 rounded-2xl"
              />
              {horaError && <p className="text-red-500 mt-1 font-semibold">{horaError}</p>}
            </div>

            <div>
              <label className="block text-xl font-bold mb-2">Duración</label>
              <select
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-2xl shadow-md focus:ring-2 focus:ring-[#3CB9A5]"
              >
                <option value="">Selecciona duración...</option>
                <option value="15">15 minutos</option>
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">1 hora</option>
              </select>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handleGuardar}
              disabled={botonDeshabilitado}
              className={`px-10 py-3 rounded-2xl font-bold text-lg shadow-md flex items-center gap-2 ${
                botonDeshabilitado
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white'
              }`}
            >
              {loading && <FaSpinner className="animate-spin" />} Guardar
            </button>

            <button
              onClick={() => window.location.href = '/calendario'}
              disabled={loading}
              className={`px-10 py-3 rounded-2xl font-bold text-lg shadow-md ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white'
              }`}
            >
              Regresar al calendario
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default EventoCalendario;