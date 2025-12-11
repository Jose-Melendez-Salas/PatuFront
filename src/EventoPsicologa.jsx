import React, { useState, useEffect } from 'react';
import { FaSearch, FaSpinner, FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaClock, FaUser, FaInfoCircle } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const EventoPsicologia = () => {
    const location = useLocation();
    const alumnoData = location.state?.alumno;

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
    const [disponibilidades, setDisponibilidades] = useState([]);
    const [cargandoDisponibilidades, setCargandoDisponibilidades] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const usuario = JSON.parse(localStorage.getItem('usuario'));

    useEffect(() => {
        if (alumnoData) {
            console.log("Datos recibidos:", alumnoData);
            const valorBusqueda = alumnoData.matricula;
            setBusqueda(valorBusqueda);
            setPersonaEncontrada(alumnoData);

            if (usuario && (usuario.rol === 'tutor' || usuario.rol === 'psicologia')) {
                fetchDisponibilidad(alumnoData.matricula);
            }
        }
    }, []);

    const fetchDisponibilidad = async (matricula) => {
        try {
            setCargandoDisponibilidades(true);
            const respDisp = await fetch(
                `https://apis-patu.onrender.com/api/disponibilidades/alumno/${matricula}`,
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

    const handleBuscar = async () => {
        try {
            setIsSearching(true);
            setErrorBusqueda('');
            setPersonaEncontrada(null);
            setDisponibilidades([]);

            if (!busqueda.trim()) {
                setErrorBusqueda('Ingresa la matrícula del alumno.');
                setIsSearching(false);
                return;
            }

            if (!usuario || !usuario.accessToken) {
                setErrorBusqueda('Debes iniciar sesión primero.');
                setIsSearching(false);
                return;
            }

            const url = `https://apis-patu.onrender.com/api/alumnos/matricula/${busqueda}`;
            
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${usuario.accessToken}` },
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                setErrorBusqueda(data.message || 'No se encontró ningún alumno con esa matrícula.');
                setIsSearching(false);
                return;
            }

            const persona = data.data || data;
            setPersonaEncontrada(persona);
            fetchDisponibilidad(persona.matricula);

        } catch (err) {
            console.error(err);
            setErrorBusqueda('Error al conectar con la API.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleGuardar = async () => {
        try {
            if (!usuario || !usuario.accessToken) {
                setMensaje({ tipo: 'error', texto: 'No hay usuario logueado.' });
                return;
            }

            if (!personaEncontrada) {
                setMensaje({
                    tipo: 'error',
                    texto: 'Debes buscar y seleccionar un alumno primero.',
                });
                return;
            }

            if (!fecha || !horaInicio || !duracion || !tipo) {
                setMensaje({ tipo: 'error', texto: 'Completa todos los campos antes de guardar.' });
                return;
            }

            setLoading(true);
            setMensaje({ tipo: 'info', texto: 'Asignando sesión...' });

            const horaFinCalculada = (() => {
                const [h, m] = horaInicio.split(':').map(Number);
                const totalMin = h * 60 + m + parseInt(duracion);
                const finH = String(Math.floor(totalMin / 60)).padStart(2, '0');
                const finM = String(totalMin % 60).padStart(2, '0');
                return `${finH}:${finM}`;
            })();

            const nuevoEvento = {
                id_tutor: usuario.id,
                id_alumno: personaEncontrada.id || personaEncontrada.id_usuario,
                id_grupo: personaEncontrada.id_grupo || personaEncontrada.grupo_id,
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
                setMensaje({ tipo: 'error', texto: data.message || 'Error al guardar el evento.' });
                setLoading(false);
                return;
            }

            setMensaje({ tipo: 'success', texto: 'Sesión creada con éxito.' });
            setBusqueda('');
            setPersonaEncontrada(null);
            setFecha('');
            setHoraInicio('');
            setHoraError('');
            setDuracion('');
            setTipo('');
            setDisponibilidades([]);
        } catch (err) {
            console.error(err);
            setMensaje({ tipo: 'error', texto: 'Error de conexión con el servidor.' });
        } finally {
            setLoading(false);
        }
    };

    const botonDeshabilitado = loading || !personaEncontrada || !fecha || !horaInicio || !duracion || !tipo || horaError;

    return (
        <>
            <Navbar />
            <main className="p-4 sm:p-6 md:p-8 flex justify-center min-h-screen bg-gradient-to-br from-[#ffffff] via-[#ffffff] to-[#ffffff]">
                <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl pt-24 items-start">
                    {/* Formulario principal */}
                    <div className="flex-1 bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border-4 border-[#E9DBCD] transform transition-all duration-300 hover:shadow-3xl">
                        <div className="relative mb-6">
                            <h2 className="text-2xl sm:text-3xl font-bold border-b-4 border-[#C7952C] pb-3 text-center sm:text-left bg-gradient-to-r from-[#C7952C] to-[#E4CD87] bg-clip-text text-transparent">
                                Nuevo Evento
                            </h2>
                            <div className="absolute bottom-0 left-0 w-20 h-1 bg-gradient-to-r from-[#C7952C] to-transparent rounded-full animate-pulse"></div>
                        </div>

                        {mensaje.texto && (
                            <div className={`mb-6 p-4 rounded-xl text-center font-semibold transition-all duration-500 transform ${
                                mensaje.tipo === 'error' 
                                    ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-2 border-red-300 animate-shake' 
                                    : mensaje.tipo === 'success' 
                                    ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-2 border-green-300 animate-bounce-in' 
                                    : 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border-2 border-yellow-300 animate-pulse'
                            } flex items-center justify-center gap-2 shadow-lg`}>
                                {mensaje.tipo === 'error' && <FaTimesCircle className="text-xl animate-spin-slow" />}
                                {mensaje.tipo === 'success' && <FaCheckCircle className="text-xl animate-bounce" />}
                                {mensaje.tipo === 'info' && <FaSpinner className="text-xl animate-spin" />}
                                {mensaje.texto}
                            </div>
                        )}

                        {/* BUSCADOR */}
                        <div className="mb-6 transform transition-all duration-300 hover:scale-[1.01]">
                            <label className="text-lg sm:text-xl font-bold mb-3 flex items-center gap-2 text-gray-700">
                                <FaUser className="text-[#C7952C]" />
                                Alumno:
                            </label>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    placeholder="Buscar alumno por matrícula"
                                    className="flex-1 p-3 sm:p-4 border-2 border-gray-300 rounded-2xl shadow-md w-full focus:border-[#C7952C] focus:ring-4 focus:ring-[#C7952C]/20 transition-all duration-300 hover:shadow-lg"
                                    onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
                                />
                                <button 
                                    onClick={handleBuscar} 
                                    disabled={isSearching}
                                    className="bg-gradient-to-r from-[#E4CD87] to-[#C7952C] hover:from-[#C7952C] hover:to-[#E4CD87] text-white px-6 py-3 rounded-2xl font-bold flex justify-center items-center gap-2 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSearching ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                                    {isSearching ? 'Buscando...' : 'Buscar'}
                                </button>
                            </div>

                            {errorBusqueda && (
                                <p className="text-red-500 mt-2 font-semibold flex items-center gap-2 animate-shake">
                                    <FaTimesCircle /> {errorBusqueda}
                                </p>
                            )}

                            {!personaEncontrada && !errorBusqueda && (
                                <p className="text-yellow-600 mt-2 font-semibold text-sm sm:text-base flex items-center gap-2 animate-pulse">
                                    <FaInfoCircle /> Debes buscar y seleccionar un alumno primero
                                </p>
                            )}

                            {personaEncontrada && (
                                <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-2xl text-sm sm:text-base shadow-lg transform transition-all duration-500 animate-slide-in">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaCheckCircle className="text-green-600 text-xl animate-bounce" />
                                        <p className="font-bold text-green-700">Alumno encontrado</p>
                                    </div>
                                    <p className="mb-1"><span className="font-bold text-gray-700">Nombre:</span> {personaEncontrada.nombre} {personaEncontrada.apellido_paterno} {personaEncontrada.apellido_materno}</p>
                                    <p><span className="font-bold text-gray-700">Matrícula:</span> {personaEncontrada.matricula}</p>
                                </div>
                            )}
                        </div>

                        {/* Tipo */}
                        <div className="mb-6 transform transition-all duration-300 hover:scale-[1.01]">
                            <label className="block text-lg sm:text-xl font-bold mb-3 text-gray-700">Tipo</label>
                            <select 
                                value={tipo} 
                                onChange={(e) => setTipo(e.target.value)} 
                                className="w-full p-3 sm:p-4 border-2 border-gray-300 rounded-2xl shadow-md focus:ring-4 focus:ring-[#3CB9A5]/30 focus:border-[#3CB9A5] transition-all duration-300 hover:shadow-lg bg-white cursor-pointer"
                            >
                                <option value="">Selecciona ...</option>
                                <option value="psicologia">Psicología</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                            <div className="transform transition-all duration-300 hover:scale-[1.02]">
                                <label className="text-lg sm:text-xl font-bold mb-3 flex items-center gap-2 text-gray-700">
                                    <FaCalendarAlt className="text-[#C7952C]" />
                                    Fecha
                                </label>
                                <input 
                                    type="date" 
                                    value={fecha}
                                    onChange={(e) => {
                                        const fechaUTC = new Date(e.target.value);
                                        const seleccionada = new Date(fechaUTC.getTime() + fechaUTC.getTimezoneOffset() * 60000);
                                        const dia = seleccionada.getDay();
                                        if (dia === 0 || dia === 6) { 
                                            alert('⚠️ No se pueden seleccionar sábados ni domingos.'); 
                                            setFecha(''); 
                                            return; 
                                        }
                                        setFecha(e.target.value);
                                    }}
                                    min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}
                                    max={new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]}
                                    className="w-full p-3 sm:p-4 border-2 border-gray-300 rounded-2xl shadow-md focus:ring-4 focus:ring-[#C7952C]/20 focus:border-[#C7952C] transition-all duration-300 hover:shadow-lg cursor-pointer" 
                                />
                            </div>

                            <div className="transform transition-all duration-300 hover:scale-[1.02]">
                                <label className="text-lg sm:text-xl font-bold mb-3 flex items-center gap-2 text-gray-700">
                                    <FaClock className="text-[#C7952C]" />
                                    Hora de inicio
                                </label>
                                <input 
                                    type="time" 
                                    value={horaInicio} 
                                    onChange={(e) => {
                                        const valor = e.target.value;
                                        setHoraInicio(valor);
                                        if (valor) {
                                            const [hora] = valor.split(':').map(Number);
                                            if (hora < 7 || hora >= 18) setHoraError('La hora debe estar entre 7:00 AM y 6:00 PM');
                                            else setHoraError('');
                                        } else setHoraError('');
                                    }} 
                                    className="w-full p-3 sm:p-4 border-2 border-gray-300 rounded-2xl shadow-md focus:ring-4 focus:ring-[#C7952C]/20 focus:border-[#C7952C] transition-all duration-300 hover:shadow-lg cursor-pointer" 
                                />
                                {horaError && (
                                    <p className="text-red-500 mt-1 font-semibold flex items-center gap-2 animate-shake">
                                        <FaTimesCircle /> {horaError}
                                    </p>
                                )}
                            </div>

                            <div className="transform transition-all duration-300 hover:scale-[1.02]">
                                <label className="block text-lg sm:text-xl font-bold mb-3 text-gray-700">Duración</label>
                                <select 
                                    value={duracion} 
                                    onChange={(e) => setDuracion(e.target.value)} 
                                    className="w-full p-3 sm:p-4 border-2 border-gray-300 rounded-2xl shadow-md focus:ring-4 focus:ring-[#3CB9A5]/30 focus:border-[#3CB9A5] transition-all duration-300 hover:shadow-lg bg-white cursor-pointer"
                                >
                                    <option value="">Selecciona duración...</option>
                                    <option value="15">15 minutos</option>
                                    <option value="30">30 minutos</option>
                                    <option value="45">45 minutos</option>
                                    <option value="60">1 hora</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-8">
                            <button 
                                onClick={handleGuardar} 
                                disabled={botonDeshabilitado} 
                                className={`px-8 py-4 rounded-2xl font-bold text-lg shadow-xl flex justify-center items-center gap-3 transition-all duration-300 transform ${
                                    botonDeshabilitado 
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-[#E4CD87] to-[#C7952C] hover:from-[#C7952C] hover:to-[#E4CD87] text-white hover:scale-105 hover:shadow-2xl'
                                }`}
                            >
                                {loading && <FaSpinner className="animate-spin" />} 
                                {loading ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button 
                                onClick={() => (window.location.href = '/calendario')} 
                                disabled={loading} 
                                className={`px-8 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 transform ${
                                    loading 
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-[#E4CD87] to-[#C7952C] hover:from-[#C7952C] hover:to-[#E4CD87] text-white hover:scale-105 hover:shadow-2xl'
                                }`}
                            >
                                Regresar al calendario
                            </button>
                        </div>
                    </div>

                    {/* Panel derecho: Disponibilidad */}
                    <div className="w-full md:w-1/3 bg-white rounded-3xl shadow-2xl p-6 border-4 border-[#E9DBCD] transform transition-all duration-300 hover:shadow-3xl">
                        <h3 className="text-xl font-bold mb-4 border-b-2 border-[#C7952C] pb-3 bg-gradient-to-r from-[#C7952C] to-[#E4CD87] bg-clip-text text-transparent">
                            Horario disponible del alumno
                        </h3>
                        {cargandoDisponibilidades ? (
                            <div className="flex flex-col items-center justify-center py-8 animate-pulse">
                                <FaSpinner className="text-4xl text-[#C7952C] animate-spin mb-3" />
                                <p className="text-gray-500 italic">Cargando disponibilidad...</p>
                            </div>
                        ) : disponibilidades.length === 0 ? (
                            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-shake">
                                <p className="text-red-500 flex items-center gap-2">
                                    <FaTimesCircle /> No hay horarios registrados.
                                </p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {disponibilidades.map((disp, index) => (
                                    <li 
                                        key={disp.id || index} 
                                        className="py-3 px-2 hover:bg-gradient-to-r hover:from-[#FFF8F0] hover:to-[#FFE4C4] rounded-lg transition-all duration-300 transform hover:scale-105 animate-slide-in"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <p className="font-semibold capitalize text-gray-800 flex items-center gap-2">
                                            <FaCalendarAlt className="text-[#C7952C]" />
                                            {disp.dia_semana || disp.dia || 'Sin día registrado'}
                                        </p>
                                        <p className="text-sm text-gray-700 ml-6 flex items-center gap-2">
                                            <FaClock className="text-[#3CB9A5]" />
                                            {disp.hora_inicio} - {disp.hora_fin}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </main>

            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                @keyframes bounce-in {
                    0% { transform: scale(0.8); opacity: 0; }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes slide-in {
                    from { transform: translateY(-10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
                .animate-bounce-in {
                    animation: bounce-in 0.6s ease-out;
                }
                .animate-slide-in {
                    animation: slide-in 0.5s ease-out;
                }
                .animate-spin-slow {
                    animation: spin-slow 2s linear infinite;
                }
            `}</style>
        </>
    );
};

export default EventoPsicologia;