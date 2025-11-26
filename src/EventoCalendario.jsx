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

  // 🕒 Disponibilidad del alumno
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [cargandoDisponibilidades, setCargandoDisponibilidades] = useState(false);

  const usuario = JSON.parse(localStorage.getItem('usuario'));

  // 🔍 Buscar alumno o tutor según el rol
  const handleBuscar = async () => {
    try {
      setErrorBusqueda('');
      setPersonaEncontrada(null);
      setDisponibilidades([]);

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
        url = `https://apis-patu.onrender.com/api/alumnos/matricula/${busqueda}`;
      } else {
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

      const persona = data.data || data;
      setPersonaEncontrada(persona);

      // Cargar disponibilidades si es tutor
      if (usuario.rol === 'tutor') {
        const alumnoId = persona.id || persona.id_usuario;
        if (alumnoId) {
          try {
            setCargandoDisponibilidades(true);
            const respDisp = await fetch(
              `https://apis-patu.onrender.com/api/disponibilidades/alumno/${persona.matricula}`,
              { headers: { Authorization: `Bearer ${usuario.accessToken}` } }
            );
              const dataDisp = await respDisp.json();
              console.log(" Respuesta de disponibilidades:", dataDisp);

              if (respDisp.ok && dataDisp.success) {
                const data = dataDisp.data;
                const arrayDisp = Array.isArray(data) ? data : [data];
                setDisponibilidades(arrayDisp);
              } else {
                console.warn(" La API devolvió un formato inesperado para disponibilidades:", dataDisp);
                setDisponibilidades([]);
              }

          } catch (err) {
            console.error('Error cargando disponibilidades:', err);
            setDisponibilidades([]);
          } finally {
            setCargandoDisponibilidades(false);
          }
        }
      }
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

      const horaFinCalculada = (() => {
        const [h, m] = horaInicio.split(':').map(Number);
        const totalMin = h * 60 + m + parseInt(duracion);
        const finH = String(Math.floor(totalMin / 60)).padStart(2, '0');
        const finM = String(totalMin % 60).padStart(2, '0');
        return `${finH}:${finM}`;
      })();

      const nuevoEvento = {
        id_tutor:
          usuario.rol === 'tutor'
            ? usuario.id
            : personaEncontrada.id || personaEncontrada.id_usuario,
        id_alumno:
          usuario.rol === 'tutor'
            ? personaEncontrada.id || personaEncontrada.id_usuario
            : usuario.id,
            
            id_grupo: personaEncontrada.id_grupo || personaEncontrada.grupo_id, 
        fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFinCalculada,
        tipo,
      };

      console.log('Datos enviados al backend:', nuevoEvento);

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

      // Reset campos
      setBusqueda('');
      setPersonaEncontrada(null);
      setFecha('');
      setHoraInicio('');
      setDuracion('');
      setTipo('');
      setDisponibilidades([]);
    } catch (err) {
      console.error(err);
      setMensaje({ tipo: 'error', texto: ' Error de conexión con el servidor.' });
    } finally {
      setLoading(false);
    }
  };

  const botonDeshabilitado =
    loading || !personaEncontrada || !fecha || !horaInicio || !duracion || !tipo || horaError;

  return (
    <>
      <Navbar />

      <main className="p-4 sm:p-6 md:p-8 flex justify-center ">
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl pt-20">
          {/* 🧾 Formulario principal */}
          <div className="flex-1 bg-white rounded-3xl shadow-lg p-6 sm:p-8 border-7 border-[#E9DBCD]">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 border-b-4 border-[#C7952C] pb-3 text-center sm:text-left">
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
              <label className="block text-lg sm:text-xl font-bold mb-2">
                {usuario.rol === 'tutor' ? 'Alumno:' : 'Tutor:'}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder={
                    usuario.rol === 'tutor'
                      ? 'Buscar alumno por matrícula'
                      : 'Buscar tutor por correo'
                  }
                  className="flex-1 p-3 sm:p-4 border border-gray-300 rounded-2xl shadow-md w-full"
                />
                <button
                  onClick={handleBuscar}
                  className="bg-[#E4CD87] hover:bg-[#E9DBCD] text-black px-5 py-3 rounded-2xl font-bold flex justify-center items-center"
                >
                  <FaSearch />
                </button>
              </div>

              {errorBusqueda && <p className="text-red-500 mt-2 font-semibold">{errorBusqueda}</p>}

              {!personaEncontrada && !errorBusqueda && (
                <p className="text-yellow-600 mt-2 font-semibold text-sm sm:text-base">
                  Debes buscar y seleccionar{' '}
                  {usuario.rol === 'tutor' ? 'un alumno' : 'un tutor'} primero
                </p>
              )}

              {personaEncontrada && (
                <div className="mt-3 p-3 bg-green-100 border border-green-400 rounded-xl text-sm sm:text-base">
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
              <label className="block text-lg sm:text-xl font-bold mb-2">Tipo</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full p-3 sm:p-4 border border-gray-300 rounded-2xl shadow-md focus:ring-2 focus:ring-[#3CB9A5]"
              >
                <option value="">Selecciona ...</option>
                <option value="seguimiento">Seguimiento</option>
                <option value="general">General</option>
                <option value="problemas academicos">Problemas académicos</option>
                <option value="problemas personales">Problemas personales</option>
                <option value="cambio de tutor">Cambio de tutor</option>
              </select>
            </div>

            {/* Fecha, hora y duración */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
              <div>
                <label className="block text-lg sm:text-xl font-bold mb-2">Fecha</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => {
                    const fechaUTC = new Date(e.target.value);
                    const seleccionada = new Date(
                      fechaUTC.getTime() + fechaUTC.getTimezoneOffset() * 60000
                    );
                    const dia = seleccionada.getDay();
                    if (dia === 0 || dia === 6) {
                      alert('⚠️ No se pueden seleccionar sábados ni domingos.');
                      setFecha('');
                      return;
                    }
                    setFecha(e.target.value);
                  }}
                  min={(() => {
                    const mañana = new Date();
                    mañana.setDate(mañana.getDate() + 1);
                    return mañana.toISOString().split('T')[0];
                  })()}
                  max={(() => {
                    const limite = new Date();
                    limite.setDate(limite.getDate() + 30);
                    return limite.toISOString().split('T')[0];
                  })()}
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-2xl"
                />
              </div>

              <div>
                <label className="block text-lg sm:text-xl font-bold mb-2">Hora de inicio</label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => {
                    const valor = e.target.value;
                    setHoraInicio(valor);
                    if (valor) {
                      const [hora] = valor.split(':').map(Number);
                      if (hora < 7 || hora >= 18) {
                        setHoraError(' La hora debe estar entre 7:00 AM y 6:00 PM');
                      } else {
                        setHoraError('');
                      }
                    } else {
                      setHoraError('');
                    }
                  }}
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-2xl"
                />
                {horaError && <p className="text-red-500 mt-1 font-semibold">{horaError}</p>}
              </div>

              <div>
                <label className="block text-lg sm:text-xl font-bold mb-2">Duración</label>
                <select
                  value={duracion}
                  onChange={(e) => setDuracion(e.target.value)}
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-2xl shadow-md focus:ring-2 focus:ring-[#3CB9A5]"
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
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <button
                onClick={handleGuardar}
                disabled={botonDeshabilitado}
                className={`px-8 py-3 rounded-2xl font-bold text-lg shadow-md flex justify-center items-center gap-2 transition-colors duration-300 ${
                  botonDeshabilitado
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#E4CD87] hover:bg-[#E9DBCD] text-white'
                }`}
              >
                {loading && <FaSpinner className="animate-spin" />} Guardar
              </button>

              <button
                onClick={() => (window.location.href = '/calendario')}
                disabled={loading}
                className={`px-8 py-3 rounded-2xl font-bold text-lg shadow-md transition-colors duration-300 ${
                  loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#E4CD87] hover:bg-[#E9DBCD] text-black'
                }`}
              >
                Regresar al calendario
              </button>
            </div>
          </div>

          {/* 🕒 Panel derecho: Disponibilidad del alumno */}
          {usuario.rol === 'tutor' && (
            <div className="w-full md:w-1/3 bg-white rounded-3xl shadow-lg p-6 border-7 border-[#E9DBCD]">
              <h3 className="text-xl font-bold mb-4 border-b-2 border-[#C7952C] pb-2">
                Horario disponible del alumno
              </h3>

              {cargandoDisponibilidades ? (
                <p className="text-gray-500 italic">Cargando disponibilidad...</p>
              ) : disponibilidades.length === 0 ? (
                <p className="text-red-500">No hay horarios registrados.</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                    {disponibilidades.map((disp) => (
                      <li key={disp.id} className="py-2">
                        <p className="font-semibold capitalize">
                          {disp.dia_semana || disp.dia || 'Sin día registrado'}
                        </p>
                        <p className="text-sm text-gray-700">
                          {disp.hora_inicio} - {disp.hora_fin}
                        </p>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default EventoCalendario;
