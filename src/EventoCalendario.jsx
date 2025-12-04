import React, { useState, useEffect } from 'react';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const EventoCalendario = () => {
  const location = useLocation();
  const alumnoData = location.state?.alumno;

  const [busqueda, setBusqueda] = useState('');
  const [personaEncontrada, setPersonaEncontrada] = useState(null);
  const [tutorAsignado, setTutorAsignado] = useState(null); // <-- nuevo
  const [errorBusqueda, setErrorBusqueda] = useState('');
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaError, setHoraError] = useState('');
  const [duracion, setDuracion] = useState('');
  const [tipo, setTipo] = useState('');
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [loading, setLoading] = useState(false);

  const [disponibilidades, setDisponibilidades] = useState([]);
  const [cargandoDisponibilidades, setCargandoDisponibilidades] = useState(false);

  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

  // 🔥 NUEVO — Lista de psicólogas
  const [psicologas, setPsicologas] = useState([]);

  // 🔥 NUEVO — Lista de alumnos del tutor
  const [alumnosTutor, setAlumnosTutor] = useState([]);

  // modo sesión para alumno: '' | 'tutor' | 'psicologa'
  const [modoSesion, setModoSesion] = useState('');

  // ======================================================
  // 🚀 CARGA AUTOMÁTICA SEGÚN TIPO DE USUARIO
  // ======================================================
  useEffect(() => {
    if (!usuario) return;

    // Si venimos con alumno seleccionado desde otra pantalla, guardarlo (no sobrescribimos)
    if (alumnoData) {
      setPersonaEncontrada(alumnoData);
      setBusqueda(alumnoData.matricula || '');
      // Si es alumno (el usuario logueado), también intentar cargar tutor y psicólogas
      if (usuario.rol === 'alumno') {
        cargarPsicologas();
        cargarTutorDelAlumno(alumnoData.id_usuario || alumnoData.id);
      }
      if (usuario.rol === 'tutor') {
        fetchDisponibilidad(alumnoData.matricula);
      }
      return;
    }

    if (usuario.rol === 'alumno') {
      // cargar alumno y tutor + psicologas
      cargarPsicologas();
      cargarDatosAlumnoYTutor(usuario.id);
      // no forzamos tipo hasta que el alumno elija modoSesion; si quieres que por defecto sea psicologia,
      // puedes activar setModoSesion('psicologa') aquí (pero lo dejamos para que el usuario elija)
    }

    if (usuario.rol === 'tutor') {
      cargarAlumnosTutor(usuario.id);
    }
  }, [alumnoData, usuario]);

  // ======================================================
  // 🔥 CARGAR PSICÓLOGAS
  // ======================================================
  const cargarPsicologas = async () => {
    try {
      const res = await fetch(
        'https://apis-patu.onrender.com/api/usuarios/rol/psicologia',
        { headers: usuario?.accessToken ? { Authorization: `Bearer ${usuario.accessToken}` } : {} }
      );
      const data = await res.json();
      if (res.ok && data.success) setPsicologas(data.data || []);
      else setPsicologas([]);
    } catch (e) {
      console.error('Error cargando psicólogas:', e);
      setPsicologas([]);
    }
  };

  // ======================================================
  // 🔥 CARGAR ALUMNOS DEL TUTOR
  // ======================================================
  const cargarAlumnosTutor = async (idTutor) => {
    try {
      const res = await fetch(
        `https://apis-patu.onrender.com/api/alumnos/tutor/${idTutor}`,
        { headers: usuario?.accessToken ? { Authorization: `Bearer ${usuario.accessToken}` } : {} }
      );
      const data = await res.json();
      if (res.ok && data.success) setAlumnosTutor(data.data || []);
      else setAlumnosTutor([]);
    } catch (e) {
      console.error('Error cargando alumnos del tutor:', e);
      setAlumnosTutor([]);
    }
  };

  // ======================================================
  // 🔥 CARGAR DATOS DEL ALUMNO LOGUEADO + SU TUTOR
  // ======================================================
  const cargarDatosAlumnoYTutor = async (idAlumno) => {
    try {
      // 1) Obtener alumno
      const resAlumno = await fetch(
        `https://apis-patu.onrender.com/api/alumnos/${idAlumno}`,
        { headers: usuario?.accessToken ? { Authorization: `Bearer ${usuario.accessToken}` } : {} }
      );
      const dataAlumno = await resAlumno.json();
      if (resAlumno.ok && dataAlumno.success) {
        const alumno = dataAlumno.data;
        setPersonaEncontrada(alumno);
        // 2) si viene id_tutor -> obtener tutor completo
        if (alumno.id_tutor) {
          await cargarTutorDelAlumno(alumno.id_tutor);
        } else {
          setTutorAsignado(null);
        }
      }
    } catch (e) {
      console.error('Error cargando alumno y tutor:', e);
    }
  };

  // obtener solo tutor por id (se usa cuando ya tenemos id_tutor)
  const cargarTutorDelAlumno = async (idTutor) => {
    try {
      const resTutor = await fetch(
        `https://apis-patu.onrender.com/api/usuarios/${idTutor}`,
        { headers: usuario?.accessToken ? { Authorization: `Bearer ${usuario.accessToken}` } : {} }
      );
      const dataTutor = await resTutor.json();
      if (resTutor.ok && dataTutor.success) {
        setTutorAsignado(dataTutor.data);
      } else {
        setTutorAsignado(null);
      }
    } catch (e) {
      console.error('Error cargando tutor:', e);
      setTutorAsignado(null);
    }
  };

  // ======================================================
  // 🔍 BUSCAR PERSONA (mantiene comportamiento)
  // ======================================================
  const handleBuscar = async () => {
    try {
      setErrorBusqueda('');
      setPersonaEncontrada(null);
      setDisponibilidades([]);

      if (!busqueda.trim()) {
        setErrorBusqueda('Ingresa un valor de búsqueda.');
        return;
      }

      let url = '';
      if (usuario.rol === 'tutor') {
        url = `https://apis-patu.onrender.com/api/alumnos/matricula/${busqueda}`;
      } else {
        url = `https://apis-patu.onrender.com/api/usuarios/correo/${busqueda}`;
      }

      const res = await fetch(url, {
        headers: usuario?.accessToken ? { Authorization: `Bearer ${usuario.accessToken}` } : {}
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorBusqueda(data?.message || 'No se encontró ningún resultado.');
        return;
      }

      // si buscamos desde tutor (buscador por matrícula) viene un alumno
      setPersonaEncontrada(data.data);

      if (usuario.rol === 'tutor') {
        // cargar disponibilidad del alumno
        fetchDisponibilidad(data.data.matricula);
      }
    } catch (e) {
      console.error(e);
      setErrorBusqueda('Error al conectar con la API.');
    }
  };

  // ======================================================
  // 🕒 CARGAR DISPONIBILIDAD DEL ALUMNO
  // ======================================================
  const fetchDisponibilidad = async (matricula) => {
    try {
      setCargandoDisponibilidades(true);
      const resp = await fetch(
        `https://apis-patu.onrender.com/api/disponibilidades/alumno/${matricula}`,
        { headers: usuario?.accessToken ? { Authorization: `Bearer ${usuario.accessToken}` } : {} }
      );
      const data = await resp.json();
      if (resp.ok && data.success) setDisponibilidades(Array.isArray(data.data) ? data.data : [data.data]);
      else setDisponibilidades([]);
    } catch (err) {
      console.error('Error disponibilidad:', err);
      setDisponibilidades([]);
    } finally {
      setCargandoDisponibilidades(false);
    }
  };

  // ======================================================
  // 💾 GUARDAR EVENTO (usa tutorAsignado cuando corresponde)
  // ======================================================
  const handleGuardar = async () => {
    try {
      if (!personaEncontrada) {
        setMensaje({ tipo: 'error', texto: 'Selecciona una persona.' });
        return;
      }

      // reglas: si usuario es alumno y modoSesion === 'psicologa' -> tipo forzado a 'psicologia'
      if (usuario.rol === 'alumno' && modoSesion === 'psicologa') {
        setTipo('psicologia');
      }

      if (!fecha || !horaInicio || !duracion || !tipo) {
        setMensaje({ tipo: 'error', texto: 'Completa todos los campos.' });
        return;
      }

      setLoading(true);

      const [h, m] = horaInicio.split(':').map(Number);
      const total = h * 60 + m + parseInt(duracion);
      const hFin = String(Math.floor(total / 60)).padStart(2, '0');
      const mFin = String(total % 60).padStart(2, '0');

      // determinar id_tutor correctamente:
      let idTutorParaPayload = null;
      if (usuario.rol === 'tutor') {
        idTutorParaPayload = usuario.id;
      } else {
        // usuario rol alumno
        if (modoSesion === 'tutor') {
          // usar tutorAsignado.id (objeto usuario del tutor)
          idTutorParaPayload = tutorAsignado ? (tutorAsignado.id || tutorAsignado.id_usuario || tutorAsignado.id) : personaEncontrada.id_tutor;
        } else if (modoSesion === 'psicologa') {
          // la "psicóloga" seleccionada en personaEncontrada es un usuario (psicóloga), usar su id
          idTutorParaPayload = personaEncontrada.id || personaEncontrada.id_usuario;
        }
      }

      const nuevoEvento = {
        id_tutor: idTutorParaPayload,
        id_alumno: usuario.rol === 'tutor' ? personaEncontrada.id || personaEncontrada.id_usuario : usuario.id,
        id_grupo: personaEncontrada.id_grupo || personaEncontrada.grupo_id || null,
        fecha,
        hora_inicio: horaInicio,
        hora_fin: `${hFin}:${mFin}`,
        tipo,
      };

      const res = await fetch('https://apis-patu.onrender.com/api/sesiones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: usuario?.accessToken ? `Bearer ${usuario.accessToken}` : '',
        },
        body: JSON.stringify(nuevoEvento),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setMensaje({ tipo: 'error', texto: data?.message || 'Error al guardar.' });
      } else {
        setMensaje({ tipo: 'success', texto: 'Sesión creada con éxito.' });
        // limpiar formulario básico
        setBusqueda('');
        setPersonaEncontrada(null);
        setTutorAsignado(null);
        setModoSesion('');
        setFecha('');
        setHoraInicio('');
        setDuracion('');
        setTipo('');
        setDisponibilidades([]);
      }
    } catch (e) {
      console.error(e);
      setMensaje({ tipo: 'error', texto: 'Error en el servidor.' });
    } finally {
      setLoading(false);
    }
  };

  const tipoDisabled = usuario?.rol === 'alumno' && modoSesion === 'psicologa';
  const botonDeshabilitado = loading || !fecha || !horaInicio || !duracion || !tipo || (usuario.rol !== 'tutor' && !modoSesion);

  // =====================================================================
  //                              RENDER
  // =====================================================================

  return (
    <>
      <Navbar />
      <main className="p-4 sm:p-6 md:p-8 flex justify-center ">
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl pt-20">
          {/* Formulario principal */}
          <div className="flex-1 bg-white rounded-3xl shadow-lg p-6 sm:p-8 border-7 border-[#E9DBCD]">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 border-b-4 border-[#C7952C] pb-3 text-center sm:text-left">
              Nuevo evento
            </h2>

            {mensaje.texto && (
              <div className={`mb-6 p-4 rounded-xl text-center font-semibold transition-all duration-300 ${mensaje.tipo === 'error' ? 'bg-red-100 text-red-700' : mensaje.tipo === 'success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {mensaje.texto}
              </div>
            )}

            {/* BUSCADOR / SELECTS */}
            <div className="mb-6">
              <label className="block text-lg sm:text-xl font-bold mb-2">
                {usuario?.rol === 'tutor' ? 'Alumno:' : 'Psicóloga / Tutor:'}
              </label>

              {/* Si eres TUTOR -> select con tus alumnos */}
              {usuario?.rol === 'tutor' && (
                <>
                  <select
                    onChange={(e) => {
                      const alumno = alumnosTutor.find(a => String(a.id) === String(e.target.value));
                      if (alumno) {
                        setPersonaEncontrada(alumno);
                        setBusqueda(alumno.matricula);
                        fetchDisponibilidad(alumno.matricula);
                      } else {
                        setPersonaEncontrada(null);
                      }
                    }}
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-2xl shadow-md mb-3"
                    defaultValue=""
                  >
                    <option value="">Selecciona un alumno...</option>
                    {alumnosTutor.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.nombre} {a.apellido_paterno} ({a.matricula})
                      </option>
                    ))}
                  </select>

                  {/* Buscador manual */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      placeholder={'Buscar alumno por matrícula'}
                      className="flex-1 p-3 sm:p-4 border border-gray-300 rounded-2xl shadow-md w-full"
                    />
                    <button onClick={handleBuscar} className="bg-[#E4CD87] hover:bg-[#E9DBCD] text-black px-5 py-3 rounded-2xl font-bold flex justify-center items-center">
                      <FaSearch />
                    </button>
                  </div>

                  {errorBusqueda && <p className="text-red-500 mt-2 font-semibold">{errorBusqueda}</p>}
                </>
              )}

              {/* Si eres ALUMNO -> elegir entre tutor o psicóloga */}
              {usuario?.rol === 'alumno' && (
                <>
                  <select
                    value={modoSesion}
                    onChange={async (e) => {
                      const val = e.target.value;
                      setModoSesion(val);
                      setPersonaEncontrada(null);
                      // si el alumno ya fue cargado anteriormente, personaEncontrada contiene sus datos
                      // cargamos tutor si seleccionó tutor
                      if (val === 'tutor') {
                        // asegurarnos de tener tutorAsignado (si no lo tuvimos en useEffect)
                        if (!tutorAsignado && personaEncontrada && personaEncontrada.id_tutor) {
                          await cargarTutorDelAlumno(personaEncontrada.id_tutor);
                        } else if (!tutorAsignado && !personaEncontrada) {
                          // si no tenemos personaEncontrada (raro), cargamos datos del alumno logueado
                          await cargarDatosAlumnoYTutor(usuario.id);
                        }
                        // mostrar tutor asignado en UI (no cambiamos tipo aquí, tipo será elegido como 'tutor' en select tipo)
                        setTipo('tutor');
                      } else if (val === 'psicologa') {
                        // elegir psicóloga: mostramos la lista de psicologas y forzamos tipo
                        setTipo('psicologia');
                        // si aún no tenemos psicologas, cargarlas
                        if (psicologas.length === 0) cargarPsicologas();
                      } else {
                        setTipo('');
                      }
                    }}
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-2xl shadow-md mb-3"
                  >
                    <option value="">Selecciona opción...</option>
                    <option value="tutor">Con mi tutor</option>
                    <option value="psicologa">Con psicóloga</option>
                  </select>

                  {/* mostrar tutor asignado cuando elija tutor */}
                  {modoSesion === 'tutor' && tutorAsignado && (
                    <div className="mt-3 p-3 bg-green-100 border border-green-400 rounded-xl text-sm sm:text-base">
                      <p><span className="font-bold">Tutor asignado:</span> {tutorAsignado.nombre} {tutorAsignado.apellido_paterno} {tutorAsignado.apellido_materno || ''}</p>
                      <p className="text-xs text-gray-600">ID: {tutorAsignado.id || tutorAsignado.id_usuario}</p>
                    </div>
                  )}

                  {/* seleccionar psicóloga */}
                  {modoSesion === 'psicologa' && (
                    <div className="mt-3">
                      <label className="block text-sm font-semibold mb-2">Selecciona psicóloga</label>
                      <select
                        onChange={(e) => {
                          const psi = psicologas.find(p => String(p.id) === String(e.target.value));
                          setPersonaEncontrada(psi || null);
                        }}
                        className="w-full p-3 sm:p-4 border border-gray-300 rounded-2xl shadow-md"
                        defaultValue=""
                      >
                        <option value="">Elige una psicóloga...</option>
                        {psicologas.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.nombre} {p.apellido_paterno}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              {/* info básica de persona encontrada */}
              {personaEncontrada && (
                <div className="mt-3 p-3 bg-green-100 border border-green-400 rounded-xl text-sm sm:text-base">
                  <p><span className="font-bold">Nombre:</span> {personaEncontrada.nombre} {personaEncontrada.apellido_paterno} {personaEncontrada.apellido_materno || ''}</p>
                  <p><span className="font-bold">{usuario?.rol === 'tutor' ? 'Matrícula:' : 'Correo/ID:'}</span> {usuario?.rol === 'tutor' ? personaEncontrada.matricula : (personaEncontrada.correo || personaEncontrada.id)}</p>
                </div>
              )}
            </div>

            {/* TIPO (reglas: si alumno y psicologa -> bloqueado) */}
            <div className="mb-6">
              <label className="block text-lg font-bold mb-2">Tipo</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                disabled={tipoDisabled}
                className={`w-full p-3 border border-gray-300 rounded-2xl shadow-md ${tipoDisabled ? 'bg-gray-100' : ''}`}
              >
                <option value="">{usuario?.rol === 'alumno' ? 'Selecciona...' : 'Selecciona...'}</option>
                {usuario?.rol === 'alumno' ? (
                  <>
                    <option value="psicologia">Psicología</option>
                    <option value="tutor">Tutor</option>
                  </>
                ) : (
                  <>
                    <option value="seguimiento">Seguimiento</option>
                    <option value="psicologia">Psicología</option>
                    <option value="general">General</option>
                    <option value="problemas academicos">Problemas académicos</option>
                    <option value="problemas personales">Problemas personales</option>
                    <option value="cambio de tutor">Cambio de tutor</option>
                  </>
                )}
              </select>

              {tipoDisabled && (
                <p className="mt-2 text-sm text-gray-600">Tipo fijado a "Psicología" porque elegiste sesión con psicóloga.</p>
              )}
            </div>

            {/* Fecha / Hora / Duración */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
              <div>
                <label className="block text-lg sm:text-xl font-bold mb-2">Fecha</label>
                <input type="date" value={fecha}
                  onChange={(e) => {
                    // bloquea selección fin de semana (ejemplo anterior)
                    const fechaUTC = new Date(e.target.value);
                    const seleccionada = new Date(fechaUTC.getTime() + fechaUTC.getTimezoneOffset() * 60000);
                    const dia = seleccionada.getDay();
                    if (dia === 0 || dia === 6) { alert('⚠️ No se pueden seleccionar sábados ni domingos.'); setFecha(''); return; }
                    setFecha(e.target.value);
                  }}
                  min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}
                  max={new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]}
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-2xl" />
              </div>

              <div>
                <label className="block text-lg sm:text-xl font-bold mb-2">Hora de inicio</label>
                <input type="time" value={horaInicio} onChange={(e) => {
                  const valor = e.target.value;
                  setHoraInicio(valor);
                  if (valor) {
                    const [hora] = valor.split(':').map(Number);
                    if (hora < 7 || hora >= 18) setHoraError(' La hora debe estar entre 7:00 AM y 6:00 PM');
                    else setHoraError('');
                  } else setHoraError('');
                }} className="w-full p-3 sm:p-4 border border-gray-300 rounded-2xl" />
                {horaError && <p className="text-red-500 mt-1 font-semibold">{horaError}</p>}
              </div>

              <div>
                <label className="block text-lg sm:text-xl font-bold mb-2">Duración</label>
                <select value={duracion} onChange={(e) => setDuracion(e.target.value)} className="w-full p-3 sm:p-4 border border-gray-300 rounded-2xl shadow-md focus:ring-2 focus:ring-[#3CB9A5]">
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
              <button onClick={handleGuardar} disabled={botonDeshabilitado} className={`px-8 py-3 rounded-2xl font-bold text-lg shadow-md flex justify-center items-center gap-2 transition-colors duration-300 ${botonDeshabilitado ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#E4CD87] hover:bg-[#E9DBCD] text-white'}`}>
                {loading && <FaSpinner className="animate-spin" />} Guardar
              </button>
              <button onClick={() => (window.location.href = '/calendario')} disabled={loading} className={`px-8 py-3 rounded-2xl font-bold text-lg shadow-md transition-colors duration-300 ${loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#E4CD87] hover:bg-[#E9DBCD] text-black'}`}>
                Regresar al calendario
              </button>
            </div>
          </div>

          {/* PANEL DERECHO: Disponibilidad (solo para rol tutor) */}
          {usuario?.rol === 'tutor' && (
            <div className="w-full md:w-1/3 bg-white rounded-3xl shadow-lg p-6 border-7 border-[#E9DBCD]">
              <h3 className="text-xl font-bold mb-4 border-b-2 border-[#C7952C] pb-2">Horario disponible del alumno</h3>
              {cargandoDisponibilidades ? (
                <p className="text-gray-500 italic">Cargando disponibilidad...</p>
              ) : disponibilidades.length === 0 ? (
                <p className="text-red-500">No hay horarios registrados.</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {disponibilidades.map((disp) => (
                    <li key={disp.id} className="py-2">
                      <p className="font-semibold capitalize">{disp.dia_semana || disp.dia || 'Sin día registrado'}</p>
                      <p className="text-sm text-gray-700">{disp.hora_inicio} - {disp.hora_fin}</p>
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
