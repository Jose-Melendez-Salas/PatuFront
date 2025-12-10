import React, { useState, useEffect } from 'react';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

// --- Constantes de API ---
const API_BASE = 'https://apis-patu.onrender.com/api';

const EventoCalendario = () => {
    const location = useLocation();
    const alumnoData = location.state?.alumno;
    // Obtener datos del usuario logueado
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const esAlumno = usuario && usuario.rol === 'alumno';

    const [busqueda, setBusqueda] = useState('');
    // Almacena la persona seleccionada (alumno si soy tutor, tutor/psicóloga si soy alumno)
    const [personaEncontrada, setPersonaEncontrada] = useState(null);
    const [errorBusqueda, setErrorBusqueda] = useState('');
    const [fecha, setFecha] = useState('');
    const [horaInicio, setHoraInicio] = useState('');
    const [horaError, setHoraError] = useState('');
    const [duracion, setDuracion] = useState('');
    const [tipo, setTipo] = useState('');
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
    const [loading, setLoading] = useState(false);

    const [alumnosAsignados, setAlumnosAsignados] = useState([]); // Lista de alumnos del tutor
    const [cargandoAlumnos, setCargandoAlumnos] = useState(false);
    const esTutor = usuario && usuario.rol === 'tutor'; // Definimos esTutor para simplificar

    // ⚡ NUEVOS ESTADOS PARA ALUMNO ⚡
    const [opcionElegida, setOpcionElegida] = useState('tutor'); // 'tutor' o 'psicologa'
    const [tutorAsignado, setTutorAsignado] = useState(null); // Datos del tutor del alumno
    const [psicologaEncontrada, setPsicologaEncontrada] = useState(null); // Datos de la psicóloga

    // 🕒 Disponibilidad del alumno (solo relevante si soy tutor)
    const [disponibilidades, setDisponibilidades] = useState([]);
    const [cargandoDisponibilidades, setCargandoDisponibilidades] = useState(false);
    // ---------------------------------------------------------

    // ---------------------------------------------------------
    // 🔍 FUNCIONES DE CARGA DE DATOS
    // ---------------------------------------------------------




    const fetchAlumnosAsignados = async (idTutor) => {
        if (!idTutor || !usuario.accessToken) return;

        try {
            setCargandoAlumnos(true);
            const resp = await fetch(
                `${API_BASE}/alumnos/tutor/${idTutor}`,
                { headers: { Authorization: `Bearer ${usuario.accessToken}` } }
            );
            const data = await resp.json();

            if (resp.ok && data.success && Array.isArray(data.data)) {
                setAlumnosAsignados(data.data);
            } else {
                setAlumnosAsignados([]);
                console.warn('Error al cargar alumnos asignados:', data.message);
            }
        } catch (err) {
            console.error('Error de red al cargar alumnos:', err);
            setAlumnosAsignados([]);
        } finally {
            setCargandoAlumnos(false);
        }
    };


    // Función auxiliar para traer disponibilidad (Solo usada por el tutor)
    const fetchDisponibilidad = async (matricula) => {
        try {
            setCargandoDisponibilidades(true);
            const respDisp = await fetch(
                `${API_BASE}/disponibilidades/alumno/${matricula}`,
                { headers: { Authorization: `Bearer ${usuario.accessToken}` } }
            );
            const dataDisp = await respDisp.json();

            if (respDisp.ok && dataDisp.success) {
                const data = dataDisp.data;
                const arrayDisp = Array.isArray(data) ? data : [data];
                setDisponibilidades(arrayDisp);
            } else {
                setDisponibilidades([]);
            }
        } catch (err) {
            console.error('Error cargando disponibilidades:', err);
            setDisponibilidades([]);
        } finally {
            setCargandoDisponibilidades(false);
        }
    };

    // Obtener tutor asignado del alumno
    const fetchTutorAsignado = async (matricula) => {
        try {
            // 1. Obtener datos del alumno (incluye id_tutor)
            const resAlumno = await fetch(`${API_BASE}/alumnos/matricula/${matricula}`, {
                headers: { Authorization: `Bearer ${usuario.accessToken}` },
            });
            const dataAlumno = await resAlumno.json();

            if (!resAlumno.ok || !dataAlumno.success || !dataAlumno.data.id_tutor) {
                setErrorBusqueda('Error al obtener el tutor asignado.');
                return;
            }

            const alumnoInfo = dataAlumno.data;

            // 2. Obtener datos completos del tutor usando el id_tutor
            const resTutor = await fetch(`${API_BASE}/tutores/id/${alumnoInfo.id_tutor}`, {
                headers: { Authorization: `Bearer ${usuario.accessToken}` },
            });
            const dataTutor = await resTutor.json();

            if (!resTutor.ok || !dataTutor.success) {
                setErrorBusqueda('Error al obtener los datos del tutor.');
                return;
            }

            const tutorInfo = dataTutor.data;
            // Adaptar la estructura
            const tutorCompleto = {
                id: tutorInfo.id_usuario,
                nombre: tutorInfo.nombre,
                apellido_paterno: tutorInfo.apellido_paterno,
                apellido_materno: tutorInfo.apellido_materno,
                correo: tutorInfo.correo,
                id_grupo: alumnoInfo.id_grupo, // Usamos el grupo del alumno
                rol: 'tutor'
            };

            setTutorAsignado(tutorCompleto);
            setPersonaEncontrada(tutorCompleto); // Inicialmente seleccionamos al tutor
            console.log("Tutor asignado cargado:", tutorCompleto);
        } catch (err) {
            console.error('Error cargando tutor asignado:', err);
            setErrorBusqueda('Error de conexión al cargar el tutor.');
        }
    };

    // Obtener psicóloga
    const fetchPsicologa = async () => {
        try {
            const resPsicologa = await fetch(`${API_BASE}/usuarios/rol/psicologia`, {
                headers: { Authorization: `Bearer ${usuario.accessToken}` },
            });
            const dataPsicologa = await resPsicologa.json();

            if (resPsicologa.ok && dataPsicologa.success && dataPsicologa.data && Array.isArray(dataPsicologa.data) && dataPsicologa.data.length > 0) {
                const psicologa = dataPsicologa.data[0]; // Tomamos la primera psicóloga
                // Adaptar la estructura
                const psicologaCompleta = {
                    id: 12,
                    nombre: psicologa.nombre,
                    apellido_paterno: psicologa.apellido_paterno,
                    apellido_materno: psicologa.apellido_materno,
                    correo: psicologa.correo,
                    rol: psicologa.rol,
                    id_grupo: usuario.id_grupo, // Usamos el grupo del ALUMNO logueado
                };
                setPsicologaEncontrada(psicologaCompleta);
                console.log("Psicóloga cargada:", psicologaCompleta);
            } else {
                console.warn('No se encontró ninguna psicóloga.');
            }
        } catch (err) {
            console.error('Error cargando psicóloga:', err);
        }
    };


    // ---------------------------------------------------------
    // 🔄 EFECTOS DE MONTAJE Y CAMBIO DE ESTADO
    // ---------------------------------------------------------

    useEffect(() => {
        // 1. Lógica para cuando un tutor llega con un alumno pre-seleccionado
        if (alumnoData && usuario && usuario.rol === 'tutor') {
            const valorBusqueda = alumnoData.matricula || alumnoData.correo;
            setBusqueda(valorBusqueda);
            setPersonaEncontrada(alumnoData);
            fetchDisponibilidad(alumnoData.matricula);
        }

        // 2. Lógica de carga inicial para ALUMNO (Cargar Tutor y Psicóloga)
        if (esAlumno && usuario && usuario.matricula) {
            fetchTutorAsignado(usuario.matricula);
            fetchPsicologa();
        }
        // 3. Lógica de carga inicial para TUTOR (Cargar alumnos asignados)
        if (esTutor && usuario?.id) {
            fetchAlumnosAsignados(usuario.id);
        }
        
    }, [esAlumno, usuario?.matricula, usuario?.rol]);

    // ⚡ Sincronizar personaEncontrada cuando cambia la opción elegida por el alumno ⚡
    useEffect(() => {
        if (esAlumno) {
            // Si el alumno elige Psicóloga
            if (opcionElegida === 'psicologa' && psicologaEncontrada) {
                setPersonaEncontrada(psicologaEncontrada);
                setTipo('psicologia'); // Establecer tipo fijo
            }
            // Si el alumno elige Tutor
            else if (opcionElegida === 'tutor' && tutorAsignado) {
                setPersonaEncontrada(tutorAsignado);
                setTipo(''); // Limpiar tipo para que elija
            } else {
                setPersonaEncontrada(null);
            }
            // Limpiar los campos relacionados con la hora al cambiar de persona
            setFecha('');
            setHoraInicio('');
            setDuracion('');
        }
    }, [opcionElegida, tutorAsignado, psicologaEncontrada, esAlumno]);


    // ---------------------------------------------------------
    // 🔍 FUNCIÓN DE BÚSQUEDA (SÓLO PARA TUTORES)
    // ---------------------------------------------------------
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

            // Esta función SÓLO se usa para que el tutor busque un alumno
            let url = `${API_BASE}/alumnos/matricula/${busqueda}`;

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

            // Cargar disponibilidades
            const alumnoId = persona.id || persona.id_usuario;
            if (alumnoId) {
                fetchDisponibilidad(persona.matricula);
            }
        } catch (err) {
            console.error(err);
            setErrorBusqueda(' Error al conectar con la API.');
        }
    };


    // ---------------------------------------------------------
    // 💾 FUNCIÓN DE GUARDAR
    // ---------------------------------------------------------
    const handleGuardar = async () => {
        try {
            if (!usuario || !usuario.accessToken) {
                setMensaje({ tipo: 'error', texto: ' No hay usuario logueado.' });
                return;
            }

            if (!personaEncontrada) {
                setMensaje({
                    tipo: 'error',
                    texto: esAlumno
                        ? ' No se ha cargado el tutor o psicóloga.'
                        : ' Debes buscar y seleccionar un alumno primero.',
                });
                return;
            }
            const personaId = personaEncontrada.id || personaEncontrada.id_usuario;

            const grupoParaSesion = esAlumno
                ? usuario.id_grupo // ID numérico del grupo/carrera del alumno logueado
                : personaEncontrada.id_grupo; // ID numérico del grupo del alumno buscado



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

            // Determinar id_tutor y id_alumno según el rol
            const id_tutor = esAlumno ? personaId : usuario.id;
            const id_alumno = esAlumno ? usuario.id : personaId;

            const nuevoEvento = {
                id_tutor, // id del tutor o psicóloga
                id_alumno, // id del alumno logueado o buscado
                id_grupo: grupoParaSesion, 
                fecha,
                hora_inicio: horaInicio,
                hora_fin: horaFinCalculada,
                tipo,
            };

            const res = await fetch(`${API_BASE}/sesiones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${usuario.accessToken}`,
                },
                body: JSON.stringify(nuevoEvento),
            });
            console.log("Enviando nuevo evento:", nuevoEvento);
            const data = await res.json();

            if (!res.ok) {
                setMensaje({ tipo: 'error', texto: data.message || ' Error al guardar el evento.' });
                setLoading(false);
                return;
            }

            setMensaje({ tipo: 'success', texto: ' Sesión creada con éxito.' });
            // Limpiar estados relevantes
            setBusqueda('');
            setPersonaEncontrada(null);
            setFecha('');
            setTipo('');
            setHoraInicio('');
            setDuracion('');
            setDisponibilidades([]);
            
            // Recargar datos iniciales si es alumno para restablecer la vista
            if (esAlumno) {
                setTutorAsignado(null);
                setPsicologaEncontrada(null);
                setOpcionElegida('tutor');
                fetchTutorAsignado(usuario.matricula);
                fetchPsicologa();
            }
        } catch (err) {
            console.error(err);
            setMensaje({ tipo: 'error', texto: ' Error de conexión con el servidor.' });
        } finally {
            setLoading(false);
        }
    };


    const botonDeshabilitado = loading 
        || !personaEncontrada 
        || !fecha 
        || !horaInicio 
        || !duracion 
        || !tipo 
        || horaError 
        || (esAlumno && opcionElegida === 'tutor' && !tutorAsignado) 
        || (esAlumno && opcionElegida === 'psicologa' && !psicologaEncontrada);

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

                        {/* ⚡ SELECTOR DE ROL PARA ALUMNO ⚡ */}
                        {esAlumno && (
                            <div className="mb-6">
                                <label className="block text-lg sm:text-xl font-bold mb-2">
                                    Agendar con:
                                </label>
                                <select
                                    value={opcionElegida}
                                    onChange={(e) => setOpcionElegida(e.target.value)}
                                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-2xl shadow-md focus:ring-2 focus:ring-[#3CB9A5]"
                                >
                                    <option value="tutor" disabled={!tutorAsignado}>
                                        {tutorAsignado ? `Mi Tutor: ${tutorAsignado.nombre} ${tutorAsignado.apellido_paterno}` : 'Cargando Tutor Asignado...'}
                                    </option>
                                    <option value="psicologa" disabled={!psicologaEncontrada}>
                                        {psicologaEncontrada ? `Psicóloga: ${psicologaEncontrada.nombre} ${psicologaEncontrada.apellido_paterno}` : 'Cargando Psicóloga...'}
                                    </option>
                                </select>
                            </div>
                        )}


                        {/* BUSCADOR (SÓLO PARA TUTORES) */}
                        {!esAlumno && (
                            <div className="mb-6">
                                <label className="block text-lg sm:text-xl font-bold mb-2">
                                    Alumno:
                                </label>

                                {/* ⚡ NUEVO: DESPLEGABLE DE ALUMNOS ASIGNADOS ⚡ */}
                                      <div className="mb-4">
                                          <select
                                              onChange={(e) => {
                                                  const matriculaSeleccionada = e.target.value;
                                                  if (matriculaSeleccionada) {
                                                      const alumno = alumnosAsignados.find(a => a.matricula === matriculaSeleccionada);
                                                      if (alumno) {
                                                          // 1. Rellenar el campo de búsqueda (opcional, pero útil)
                                                          setBusqueda(matriculaSeleccionada);
                                                          // 2. Establecer directamente a la persona encontrada
                                                          setPersonaEncontrada(alumno);
                                                          // 3. Cargar disponibilidad
                                                          fetchDisponibilidad(alumno.matricula);
                                                          setErrorBusqueda('');
                                                      }
                                                  } else {
                                                      setBusqueda('');
                                                      setPersonaEncontrada(null);
                                                      setDisponibilidades([]);
                                                  }
                                              }}
                                              disabled={cargandoAlumnos}
                                              className="w-full p-3 sm:p-4 border border-gray-300 rounded-2xl shadow-md focus:ring-2 focus:ring-[#3CB9A5] bg-gray-50"
                                          >
                                              <option value="">
                                                  {cargandoAlumnos ? 'Cargando alumnos asignados...' : '--- Selecciona un alumno asignado ---'}
                                              </option>
                                              {alumnosAsignados.map((alumno) => (
                                                  <option key={alumno.matricula} value={alumno.matricula}>
                                                      {alumno.nombre} {alumno.apellido_paterno} ({alumno.matricula})
                                                  </option>
                                              ))}
                                          </select>
                                          {cargandoAlumnos && <FaSpinner className="animate-spin inline-block ml-2 text-gray-500" />}
                                          <p className="text-sm text-gray-500 mt-1">
                                              Opcional: Selecciona de la lista o busca por matrícula abajo.
                                          </p>
                                      </div>
                                      {/* FIN DESPLEGABLE */}
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="text"
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                        placeholder='Buscar alumno por matrícula'
                                        className="flex-1 p-3 sm:p-4 border border-gray-300 rounded-2xl shadow-md w-full"
                                    />
                                    <button onClick={handleBuscar} className="bg-[#E4CD87] hover:bg-[#E9DBCD] text-black px-5 py-3 rounded-2xl font-bold flex justify-center items-center">
                                        <FaSearch />
                                    </button>
                                </div>

                                {errorBusqueda && <p className="text-red-500 mt-2 font-semibold">{errorBusqueda}</p>}

                                {!personaEncontrada && !errorBusqueda && (
                                    <p className="text-yellow-600 mt-2 font-semibold text-sm sm:text-base">
                                        Debes buscar y seleccionar un alumno primero
                                    </p>
                                )}
                            </div>
                        )}


                        {/* Mostrar la persona con la que se agendará (Tutor/Psicóloga o Alumno buscado) */}
                        {personaEncontrada && (
                            <div className="mt-3 mb-6 p-3 bg-green-100 border border-green-400 rounded-xl text-sm sm:text-base">
                                <p><span className="font-bold">Agendando con:</span> {personaEncontrada.nombre} {personaEncontrada.apellido_paterno} {personaEncontrada.apellido_materno}</p>
                                <p><span className="font-bold">{esAlumno ? 'Correo:' : 'Matrícula:'}</span> {esAlumno ? personaEncontrada.correo : personaEncontrada.matricula}</p>
                            </div>
                        )}


                        {/* Resto de inputs (Tipo, Fecha, Hora, Duración)... */}
                        <div className="mb-6">
                            <label className="block text-lg sm:text-xl font-bold mb-2">Tipo</label>
                            <select
                                value={tipo}
                                onChange={(e) => setTipo(e.target.value)}
                                className={`w-full p-3 sm:p-4 border border-gray-300 rounded-2xl shadow-md focus:ring-2 focus:ring-[#3CB9A5] ${opcionElegida === 'psicologa' ? 'bg-gray-100' : ''}`}
                                disabled={opcionElegida === 'psicologa'} // ⚡ Deshabilitar si se eligió Psicóloga
                            >
                                <option value="">Selecciona ...</option>
                                <option value="psicologia" disabled={opcionElegida !== 'psicologa'}>Psicología</option> 
                                <option value="seguimiento">Seguimiento</option>
                                <option value="general">General</option>
                                <option value="problemas academicos">Problemas académicos</option>
                                <option value="problemas personales">Problemas personales</option>
                                <option value="cambio de tutor">Cambio de tutor</option>
                            </select>
                            {opcionElegida === 'psicologa' && <p className="text-sm text-gray-500 mt-1">El tipo de sesión es fijo al agendar con la psicóloga.</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                            <div>
                                <label className="block text-lg sm:text-xl font-bold mb-2">Fecha</label>
                                <input type="date" value={fecha}
                                    onChange={(e) => {
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

                        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                            <button onClick={handleGuardar} disabled={botonDeshabilitado} className={`px-8 py-3 rounded-2xl font-bold text-lg shadow-md flex justify-center items-center gap-2 transition-colors duration-300 ${botonDeshabilitado ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#E4CD87] hover:bg-[#E9DBCD] text-black'}`}>
                                {loading && <FaSpinner className="animate-spin" />} Guardar
                            </button>
                            <button onClick={() => (window.location.href = '/calendario')} disabled={loading} className={`px-8 py-3 rounded-2xl font-bold text-lg shadow-md transition-colors duration-300 ${loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#E4CD87] hover:bg-[#E9DBCD] text-black'}`}>
                                Regresar al calendario
                            </button>
                        </div>
                    </div>

                    {/* Panel derecho: Disponibilidad (Solo si soy tutor) */}
                    {usuario.rol === 'tutor' && (
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
