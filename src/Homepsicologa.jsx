import React, { useState, useEffect } from 'react';
import { Home, Search, Calendar, ClipboardList, ArrowRight, Trash2, Clock, User } from "lucide-react";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { useNavigate } from "react-router-dom";
import Navbar from './Navbar'; 

const COLORS = {
    header: 'bg-[#8C1F2F]',
    acentoPrincipal: 'bg-[#3A8A4F]',
    acentoSecundario: 'bg-[#D9792B]',
    bordeClaro: 'border-[#E9DBCD]',
    textoPrincipal: 'text-[#222222]',
    crema: '#E9DBCD',
    rojo: '#8C1F2F',
    dorado: '#C7952C',
    verde: '#3A8A4F'
};

const SessionCard = ({ evento, onActionClick, onRegisterNotes, onEliminarClick }) => {
    const isPending = evento.tipo !== 'psicologia' && evento.estado === 'pendiente';
    const isPsychology = evento.tipo === 'psicologia';
    const accentColor = isPending ? COLORS.acentoSecundario : COLORS.acentoPrincipal;
    const buttonText = isPsychology && evento.estado === 'pendiente' ? 'Programar Cita' : 'Registrar Notas';
    const nombreAlumno = evento.alumno?.nombre_completo || evento.alumno?.nombre || 'Alumno Desconocido'; 

    return (
        <div className={`bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-5 shadow-lg border-l-8 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] group animate-slide-in ${isPending ? 'border-[#D9792B]' : 'border-[#3A8A4F]'}`}>
            <div className='flex flex-col sm:flex-row justify-between items-start gap-4'>
                <div className='flex-1 w-full'>
                    {/* Header con avatar */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-md transition-transform duration-300 group-hover:scale-110 flex-shrink-0`}
                            style={{backgroundColor: isPending ? '#D9792B' : COLORS.verde}}>
                            {nombreAlumno[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className={`text-lg sm:text-xl font-bold ${COLORS.textoPrincipal} truncate`}>{nombreAlumno}</h3>
                            <p className='text-xs sm:text-sm text-gray-600 font-semibold flex items-center gap-1 mt-1'>
                                <ClipboardList className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="truncate">
                                    {isPsychology ? 
                                        `${evento.motivo || 'Sesión de Psicología'}` :
                                        `${evento.tipo || 'Sesión General'}`
                                    }
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Info de fecha y hora */}
                    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 mt-3">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                            <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <span className="font-semibold">{evento.fecha}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 mt-2">
                            <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <span className="font-semibold">{evento.hora_inicio} - {evento.hora_fin}</span>
                        </div>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex sm:flex-col flex-row flex-wrap sm:space-y-2 gap-2 sm:gap-0 w-full sm:w-auto sm:min-w-[150px]">
                    <button
                        onClick={() => onActionClick(evento)}
                        className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm sm:text-base text-white font-semibold transition-all duration-300 hover:opacity-90 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg ${accentColor}`}>
                        {buttonText}
                    </button>
                    
                    {evento.estado === 'completada' && (
                        <button
                            onClick={() => onRegisterNotes(evento.id_sesion)}
                            className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 flex items-center justify-center gap-1 sm:gap-2`}>
                            <ClipboardList className='w-3 h-3 sm:w-4 sm:h-4' /> 
                            <span className="hidden sm:inline">{evento.notas ? 'Ver Notas' : 'Registrar Notas'}</span>
                            <span className="sm:hidden">Notas</span>
                        </button>
                    )}
                    
                    <button
                        onClick={() => onEliminarClick(evento.id_sesion)} 
                        className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-all duration-300 shadow-sm hover:shadow-md border border-red-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-1 sm:gap-2`}>
                        <Trash2 className='w-3 h-3 sm:w-4 sm:h-4' /> Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};

export function Homepsicologa() {
    const navigate = useNavigate();
    const [sesiones, setSesiones] = useState([]);
    const [solicitudesAlumno, setSolicitudesAlumno] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [busqueda, setBusqueda] = useState(''); 
    const [sesionesFiltradas, setSesionesFiltradas] = useState(null); 
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const psicologoId = usuario?.id;

    const fetchUserData = async (id, token) => {
        try {
            const res = await fetch(
                `https://apis-patu.onrender.com/api/usuarios/id/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            return data.data; 
        } catch (e) {
            console.error(`Error fetching user ID ${id}:`, e);
            return { id_usuario: id, nombre: 'Error al cargar', apellido_paterno: '' };
        }
    };

    const fetchSesionesEnriquecidas = async (psicologoId, token) => {
        if (!psicologoId || !token) {
            setError("Faltan datos de autenticación.");
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const urlSesiones = `https://apis-patu.onrender.com/api/sesiones/tutor/${psicologoId}`;
            const res = await fetch(urlSesiones, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (!res.ok) {
                setError(data.message || "Error al cargar sesiones.");
                return;
            }

            const allData = Array.isArray(data.data) ? data.data : [];

            const eventosConNombres = await Promise.all(
                allData.map(async (evento) => {
                    const alumnoData = await fetchUserData(evento.id_alumno, token);
                    const nombreCompleto = `${alumnoData.nombre || ''} ${alumnoData.apellido_paterno || ''}`.trim();

                    return {
                        ...evento,
                        alumno: { ...alumnoData, nombre_completo: nombreCompleto },
                    };
                })
            );

            const sesionesProgramadas = eventosConNombres.filter(s => s.tipo === 'psicologia' && s.estado !== 'pendiente');
            const solicitudes = eventosConNombres.filter(s => s.tipo === 'psicologia' && s.estado === 'pendiente');

            setSesiones(sesionesProgramadas);
            setSolicitudesAlumno(solicitudes);
            setError(null);

        } catch (err) {
            console.error(err);
            setError("Error de conexión al cargar datos.");
        } finally {
            setLoading(false);
        }
    };
    
    const recargarSesiones = () => {
        fetchSesionesEnriquecidas(psicologoId, usuario.accessToken);
    };

    useEffect(() => {
        recargarSesiones();
    }, [psicologoId]);

    const handleEliminarSesion = async (id_sesion) => {
        const result = await Swal.fire({
            title: '¿Eliminar sesión?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });

        if (!result.isConfirmed) return;

        try {
            const res = await fetch(`https://apis-patu.onrender.com/api/sesiones/${id_sesion}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${usuario.accessToken}` }
            });

            const data = await res.json();
            if (!res.ok) {
                await Swal.fire('Error', data.message || 'No se pudo eliminar la sesión', 'error');
                return;
            }
            recargarSesiones(); 
            
            await Swal.fire({
                icon: 'success',
                title: 'Sesión eliminada',
                text: 'La sesión se eliminó correctamente.',
                timer: 1800,
                showConfirmButton: false
            });

        } catch (err) {
            console.error(err);
            await Swal.fire('Error de conexión', 'No se pudo conectar con la API.', 'error');
        }
    };

    const handleAction = (evento) => {
        if (evento.estado === 'pendiente') {
            Swal.fire('Programar Cita', 'Se abrirá el formulario para asignar fecha y hora a esta solicitud.', 'info');
        } else {
            navigate(`/RegistroNotasPsicologia/${evento.id_sesion}`);
        }
    };

    const handleRegisterNotes = (id_sesion) => {
        navigate(`/RegistroNotasPsicologia/${id_sesion}`);
    };

    if (!usuario) {
        return <div className="p-8 text-center pt-28">Por favor, inicie sesión.</div>;
    }

    const listaSesionesActual = sesionesFiltradas === null ? sesiones : sesionesFiltradas;
    const esBusquedaActiva = sesionesFiltradas !== null;
    const esBusquedaVacia = esBusquedaActiva && sesionesFiltradas.length === 0;

    return (
        <>
            <Navbar />
            
            {error && (
                <div className="bg-red-100 text-red-700 p-4 text-center font-bold pt-20 border-l-4 border-red-500 animate-shake text-sm sm:text-base">
                    {error}
                </div>
            )}

            <main className="p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-4 sm:gap-6 pt-24 min-h-screen" style={{background: 'linear-gradient(135deg, #f8f4f0 0%, #ffffff 100% pt-20)'}}>
                
                {/* Sección principal de sesiones */}
                <div className="flex-1 w-full lg:w-3/4 pt-24">
                    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border-2 sm:border-4 border-[#E9DBCD]">
                        <h2 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 pb-3 sm:pb-4 ${COLORS.textoPrincipal} flex items-center gap-2 sm:gap-3 border-b-2 sm:border-b-4 border-[#C7952C]`}>
                            <Calendar className="w-6 h-6 sm:w-7 sm:h-7 animate-pulse flex-shrink-0" style={{color: COLORS.rojo}} />
                            <span className="bg-gradient-to-r from-red-900 to-red-700 bg-clip-text text-transparent leading-tight">
                                Sesiones Programadas
                            </span>
                        </h2>

                        {loading ? (
                            <div className="text-center py-12 sm:py-16">
                                <div className="relative w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4">
                                    <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                                    <div className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin" style={{borderTopColor: COLORS.verde}}></div>
                                </div>
                                <p className="text-base sm:text-lg text-gray-600 animate-pulse">Cargando sesiones...</p>
                            </div>
                        ) : esBusquedaVacia ? (
                            <div className="bg-yellow-50 p-8 sm:p-12 rounded-2xl text-center text-yellow-700 border-2 border-yellow-200">
                                <Search className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 animate-pulse" />
                                <p className="text-base sm:text-lg font-semibold">No se encontraron sesiones para: <strong>{busqueda}</strong></p>
                            </div>
                        ) : listaSesionesActual.length === 0 && !esBusquedaActiva ? (
                            <div className="bg-gray-50 p-8 sm:p-12 rounded-2xl text-center text-gray-600 border-2 border-gray-200">
                                <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-gray-400 animate-pulse" />
                                <p className="text-base sm:text-lg font-semibold">No hay sesiones de psicología programadas.</p>
                            </div>
                        ) : (
                            <div className="overflow-y-auto max-h-[65vh] sm:max-h-[70vh] pr-1 sm:pr-2 custom-scrollbar">
                                {listaSesionesActual.map((evento, index) => (
                                    <SessionCard 
                                        key={evento.id_sesion} 
                                        evento={evento} 
                                        onActionClick={handleAction}
                                        onRegisterNotes={handleRegisterNotes}
                                        onEliminarClick={handleEliminarSesion}
                                        style={{animationDelay: `${index * 0.1}s`}}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className={`w-full lg:w-1/4 space-y-4 sm:space-y-6 lg:h-fit lg:sticky lg:top-28`}>
                    
                    {/* Solicitudes Pendientes */}
                    <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl p-4 sm:p-6 shadow-xl border-2 sm:border-4 border-[#E9DBCD] transition-all duration-300 hover:shadow-2xl animate-fade-in">
                        <h3 className={`text-base sm:text-lg font-bold mb-4 sm:mb-5 pb-3 flex items-center gap-2 border-b-2`} style={{color: COLORS.rojo, borderColor: COLORS.dorado}}>
                            <ClipboardList className='w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0' /> 
                            <span className="flex-1 truncate">Solicitudes Pendientes</span>
                            <span className="ml-auto bg-red-100 text-red-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold animate-pulse flex-shrink-0">
                                {solicitudesAlumno.length}
                            </span>
                        </h3>
                        
                        {solicitudesAlumno.length === 0 ? (
                            <p className="text-xs sm:text-sm text-gray-500 text-center py-4">No hay nuevas solicitudes.</p>
                        ) : (
                            <div className='space-y-3 max-h-[250px] sm:max-h-[300px] overflow-y-auto custom-scrollbar pr-1 sm:pr-2'>
                                {solicitudesAlumno.map((solicitud, index) => (
                                    <div 
                                        key={solicitud.id_sesion} 
                                        className='flex justify-between items-center text-xs sm:text-sm p-2 sm:p-3 border-l-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] animate-slide-in border-yellow-400 gap-2'
                                        style={{animationDelay: `${index * 0.1}s`}}
                                    >
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <User className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 flex-shrink-0" />
                                            <p className='font-semibold text-gray-800 truncate'>{solicitud.alumno?.nombre_completo || 'Alumno'}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleAction(solicitud)}
                                            className='text-xs font-bold px-2 sm:px-3 py-1 rounded-full hover:scale-105 transition-transform duration-300 flex items-center gap-1 flex-shrink-0'
                                            style={{backgroundColor: COLORS.rojo, color: 'white'}}
                                        >
                                            <span className="hidden sm:inline">Programar</span>
                                            <ArrowRight className='w-3 h-3'/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button
                            onClick={() => navigate("/Eventopsicologia")} 
                            className="mt-4 sm:mt-5 w-full flex items-center justify-center gap-2 font-bold py-2.5 sm:py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 text-sm sm:text-base"
                            style={{backgroundColor: COLORS.dorado, color: 'white'}}
                        >
                            <Calendar className='w-4 h-4 sm:w-5 sm:h-5'/> 
                            <span className="hidden sm:inline">Agendar Sesión Manual</span>
                            <span className="sm:hidden">Agendar Sesión</span>
                        </button>
                    </div>

                    {/* Notas */}
                    <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl p-4 sm:p-6 shadow-xl border-2 sm:border-4 border-[#E9DBCD] transition-all duration-300 hover:shadow-2xl animate-fade-in" style={{animationDelay: '0.2s'}}>
                        <h3 className={`text-base sm:text-lg font-bold mb-4 sm:mb-5 pb-3 flex items-center gap-2 border-b-2`} style={{color: COLORS.rojo, borderColor: COLORS.dorado}}>
                            <ClipboardList className='w-5 h-5 sm:w-6 sm:h-6' /> Bitácora de Notas
                        </h3>
                        <button
                            onClick={() => navigate("/bitacora/recientes")} 
                            className={`w-full flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:opacity-90 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 text-sm sm:text-base ${COLORS.acentoPrincipal}`}
                        >
                            <ClipboardList className='w-4 h-4 sm:w-5 sm:h-5' />
                            <span className="hidden sm:inline">Ver Todas las Notas</span>
                            <span className="sm:hidden">Ver Notas</span>
                        </button>
                    </div>
                </div>
            </main>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes slide-in {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }
                
                .animate-slide-in {
                    animation: slide-in 0.5s ease-out forwards;
                    opacity: 0;
                }
                
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
                
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                
                @media (min-width: 640px) {
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 8px;
                    }
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: ${COLORS.dorado};
                    border-radius: 10px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: ${COLORS.rojo};
                }
            `}</style>
        </>
    );
}