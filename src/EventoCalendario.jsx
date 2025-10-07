import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import Navbar from './Navbar';

const EventoCalendario = ({ nombreUsuario }) => {
  const [busqueda, setBusqueda] = useState('');
  const [personaEncontrada, setPersonaEncontrada] = useState(null);
  const [errorBusqueda, setErrorBusqueda] = useState('');
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [tipo, setTipo] = useState('');
  //const [comentarios, setComentarios] = useState('');

  const usuario = JSON.parse(localStorage.getItem('usuario'));


  const handleBuscar = async () => {
    try {
      setErrorBusqueda('');
      setPersonaEncontrada(null);

      if (!busqueda.trim()) {
        setErrorBusqueda(
          usuario.rol === 'tutor'
            ? '⚠️ Ingresa una matrícula por favor'
            : '⚠️ Ingresa el correo de tu tutor por favor'
        );
        return;
      }

      if (!usuario || !usuario.accessToken) {
        setErrorBusqueda('⚠️ Debes iniciar sesión primero');
        return;
      }

      let url = '';

      if (usuario.rol === 'tutor') {
        // 🧑‍🏫 Tutor busca alumno por matrícula
        url = `https://apis-patu.onrender.com/api/alumnos/matricula/${busqueda}`;
      } else {
        // 🎓 Alumno busca tutor por correo
        url = `https://apis-patu.onrender.com/api/usuarios/correo/${busqueda}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${usuario.accessToken}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorBusqueda(data.message || '❌ No se encontró ningún resultado');
        return;
      }

      // Normalizar la respuesta
      const persona = data.data || data;
      setPersonaEncontrada(persona);
    } catch (err) {
      console.error(err);
      setErrorBusqueda('⚠️ Error al conectar con la API');
    }
  };

  // 💾 Guardar evento
  const handleGuardar = async () => {
    try {
      if (!usuario || !usuario.accessToken) {
        alert('⚠️ No hay usuario logueado');
        return;
      }

      if (!personaEncontrada) {
        alert(
          usuario.rol === 'tutor'
            ? '⚠️ Debes buscar y seleccionar un alumno primero'
            : '⚠️ Debes buscar y seleccionar a tu tutor primero'
        );
        return;
      }

      const nuevoEvento = {
        id_alumno: usuario.rol === 'tutor' ? personaEncontrada.id : usuario.id,
        id_tutor: usuario.rol === 'tutor' ? usuario.id : personaEncontrada.id,
        fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        tipo,
        //comentarios,
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
        alert(data.message || '❌ Error al guardar el evento');
        return;
      }

      alert('✅ Evento guardado con éxito');
      console.log('Evento creado:', data);
    } catch (err) {
      console.error(err);
      alert('⚠️ Error de conexión con el servidor');
    }
  };

  return (
    <>
      <Navbar />

      <main className="p-8 flex flex-col items-center">
        <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-4xl border border-gray-200">
          <h2 className="text-3xl font-bold mb-6 border-b-4 border-yellow-400 pb-3">
            Nuevo evento
          </h2>

          {/* 🔍 Buscar alumno o tutor */}
          <div className="mb-6">
            <label className="block text-xl font-bold mb-2">
              {usuario.rol === 'tutor' ? 'Alumno:' : 'Tutor:'}
            </label>
            <div className="relative flex gap-2">
              <input
                type={usuario.rol === 'tutor' ? 'text' : 'email'}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder={
                  usuario.rol === 'tutor'
                    ? 'Buscar alumno por matrícula'
                    : 'Buscar tutor por correo electrónico'
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

            {errorBusqueda && (
              <p className="text-red-500 mt-2">{errorBusqueda}</p>
            )}
            {personaEncontrada && (
              <div className="mt-3 p-3 bg-green-100 border border-green-400 rounded-xl">
                <p>
                  <span className="font-bold">Nombre:</span>{' '}
                  {personaEncontrada.nombre}{' '}
                  {personaEncontrada.apellido_paterno}{' '}
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
              className="w-full p-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-md text-gray-500"
            >
              <option value="">Selecciona ...</option>
              <option value="seguimiento">Seguimiento</option>
              <option value="general">General</option>
              <option value="problemas academicos">Problemas académicos</option>
              <option value="problemas personales">Problemas personales</option>
            </select>
          </div>

          {/* Comentarios 
          <div className="mb-6">
            <label className="block text-xl font-bold mb-2">Comentarios</label>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              placeholder="Agrega notas del evento..."
              className="w-full p-4 border border-gray-300 rounded-2xl"
            />
          </div>
            */}
          {/* Fecha y hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xl font-bold mb-2">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-2xl"
              />
            </div>
            <div>
              <label className="block text-xl font-bold mb-2">Hora inicio</label>
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-2xl"
              />
            </div>
            <div>
              <label className="block text-xl font-bold mb-2">Hora fin</label>
              <input
                type="time"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-2xl"
              />
            </div>
          </div>

          {/* Botón Guardar */}
          <div className="flex justify-center">
            <button
              onClick={handleGuardar}
              className="bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white px-10 py-3 rounded-2xl font-bold text-lg shadow-md"
            >
              Guardar
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default EventoCalendario;
