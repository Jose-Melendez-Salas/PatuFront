import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid, LabelList } from "recharts";
import { FaEye, FaTrash, FaUserGraduate, FaIdCard, FaGraduationCap, FaCalendarAlt, FaChartBar, FaBook, FaRegCalendarCheck } from 'react-icons/fa';
import { 
  Info, BookX, HeartHandshake, HelpCircle, ClipboardList, UserCheck, 
  Calendar, Clock, TrendingUp, ChevronRight, BookOpen, Award, 
  BarChart3, CheckCircle, AlertCircle, ArrowRight
} from 'lucide-react';
import Navbar from './Navbar';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { Link, useNavigate } from 'react-router-dom';

const ESTILOS_POR_TIPO = {
    'general': { color: 'green', Icono: Info, hex: '#22c55e', bg: '#dcfce7' },
    'problemas académicos': { color: 'orange', Icono: BookX, hex: '#f97316', bg: '#ffedd5' },
    'seguimiento': { color: 'blue', Icono: ClipboardList, hex: '#3b82f6', bg: '#dbeafe' },
    'problemas personales': { color: 'purple', Icono: HeartHandshake, hex: '#8b5cf6', bg: '#f3e8ff' },
    'cambio de tutor': { color: 'pink', Icono: UserCheck, hex: '#ec4899', bg: '#fce7f3' },
    'psicologia': { color: 'indigo', Icono: HeartHandshake, hex: '#6366f1', bg: '#e0e7ff' },
    'sin tipo': { color: 'gray', Icono: HelpCircle, hex: '#6b7280', bg: '#f3f4f6' },
    'default': { color: 'gray', Icono: HelpCircle, hex: '#6b7280', bg: '#f3f4f6' }
};

const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
};

// --- Componente EventoCard Mejorado ---
const EventoCard = ({ evento, onVerDetalles }) => {
    const tipoEvento = evento.tipo?.toLowerCase() || 'default';
    const { color, Icono, hex, bg } = ESTILOS_POR_TIPO[tipoEvento] || ESTILOS_POR_TIPO.default;
    const [isHovered, setIsHovered] = useState(false);

    const formatEventTime = (fecha, hora) => {
        const hoy = new Date();
        const manana = new Date(); 
        manana.setDate(hoy.getDate() + 1);
        const fechaEvento = new Date(`${fecha}T00:00:00`);
        
        const isSameDay = (d1, d2) => d1.getDate() === d2.getDate() && 
                                     d1.getMonth() === d2.getMonth() && 
                                     d1.getFullYear() === d2.getFullYear();

        if (isSameDay(hoy, fechaEvento)) return 'Hoy';
        if (isSameDay(manana, fechaEvento)) return 'Mañana';
        
        return new Intl.DateTimeFormat('es-ES', { 
            weekday: 'short', 
            day: 'numeric',
            month: 'short'
        }).format(fechaEvento);
    };

    return (
        <div
            className={`p-3 md:p-4 rounded-xl border-l-4 md:border-2 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform ${
                isHovered ? 'scale-[1.02] -translate-y-1' : ''
            }`}
            style={{ 
                borderLeftColor: hex,
                backgroundColor: bg,
                borderColor: `${hex}40`
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onVerDetalles(evento)}
        >
            <div className="flex items-start md:items-center gap-3 md:gap-4">
                <div className="relative">
                    <Icono className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0" style={{ color: hex }} />
                    <div 
                        className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: hex }}
                    >
                        <FaEye className="text-white text-xs" />
                    </div>
                </div>
                
                <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex justify-between items-start">
                        <p className="font-bold text-sm md:text-base text-gray-800">
                            {formatEventTime(evento.fecha, evento.hora_inicio)}, {evento.hora_inicio?.slice(0,5)}
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            evento.estado === 'completada' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-amber-100 text-amber-700'
                        }`}>
                            {evento.estado || 'pendiente'}
                        </span>
                    </div>
                    
                    <p className="font-semibold text-xs md:text-sm mt-0.5" style={{ color: hex }}>
                        {capitalizeFirstLetter(evento.tipo) || "Sesión"}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2 group">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onVerDetalles(evento);
                            }}
                            className="flex items-center gap-1 text-xs md:text-sm font-semibold transition-all duration-300 group-hover:gap-2"
                            style={{ color: hex }}
                        >
                            <FaEye className="transition-transform group-hover:scale-110" />
                            <span className="hidden sm:inline">Ver detalles</span>
                            <span className="sm:hidden">Ver</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HomeAlumno = () => {
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    const [alumnoData] = useState({
        nombre_completo: usuario?.nombre_completo || "Nombre del Alumno",
        matricula: usuario?.matricula || "000000",
        carrera: usuario?.carrera || "Carrera",
        semestre: usuario?.semestre || "X",
        correo: usuario?.correo || "correo@ejemplo.com"
    });

    const [chartDataVisual, setChartDataVisual] = useState([]);
    const [eventosProximos, setEventosProximos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [detalleEvento, setDetalleEvento] = useState(null);
    const [modalAnimation, setModalAnimation] = useState(false);
    const [stats, setStats] = useState({
        totalSesiones: 0,
        proximasSesiones: 0,
        materiasActivas: 0
    });

    const [materias, setMaterias] = useState([]);
    const [cursadas, setCursadas] = useState([]);
    const [calificaciones, setCalificaciones] = useState([]);
    const [activeTab, setActiveTab] = useState('sesiones');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                if (!usuario || !usuario.accessToken || usuario.rol !== 'alumno') {
                    setError("No se puede cargar datos: usuario inválido");
                    return;
                }

                const headers = { "Authorization": `Bearer ${usuario.accessToken}` };

                // 1. Eventos
                const resEventos = await fetch(`https://apis-patu.onrender.com/api/sesiones/alumno/${usuario.id}`, { headers });
                const dataEventos = await resEventos.json();
                
                if (resEventos.ok) {
                    const eventosConNombres = await Promise.all(
                        dataEventos.data.map(async evento => {
                            return { 
                                ...evento, 
                                alumno: { 
                                    nombre: usuario.nombre, 
                                    apellido_paterno: usuario.apellido_paterno 
                                } 
                            };
                        })
                    );

                    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
                    const semana = new Date(); semana.setDate(hoy.getDate() + 7);
                    
                    const eventosFiltrados = eventosConNombres.filter(e => {
                        const fechaEvento = new Date(e.fecha + 'T00:00:00');
                        return fechaEvento >= hoy && fechaEvento <= semana;
                    }).sort((a, b) => new Date(`${a.fecha}T${a.hora_inicio}`) - new Date(`${b.fecha}T${b.hora_inicio}`));

                    setEventosProximos(eventosFiltrados);

                    const conteoPorTipo = eventosConNombres.reduce((acc, evento) => {
                        const tipo = evento.tipo?.toLowerCase() || 'sin tipo';
                        acc[tipo] = (acc[tipo] || 0) + 1;
                        return acc;
                    }, {});

                    const datosParaGrafica = Object.keys(conteoPorTipo).map(key => {
                        const estilo = ESTILOS_POR_TIPO[key] || ESTILOS_POR_TIPO.default;
                        return {
                            tipo: estilo.name || capitalizeFirstLetter(key),
                            sesiones: conteoPorTipo[key],
                            color: estilo.hex
                        };
                    });
                    
                    setChartDataVisual(datosParaGrafica);
                    
                    setStats(prev => ({
                        ...prev,
                        totalSesiones: eventosConNombres.length,
                        proximasSesiones: eventosFiltrados.length
                    }));
                }

                // 2. Datos Académicos
                const [resMat, resCurs, resCalif] = await Promise.all([
                    fetch(`https://apis-patu.onrender.com/api/materias/`, { headers }),
                    fetch(`https://apis-patu.onrender.com/api/cursada/alumno/${usuario.id}`, { headers }),
                    fetch(`https://apis-patu.onrender.com/api/calificacion/alumno/${usuario.id}`, { headers })
                ]);

                if (resMat.ok) { const d = await resMat.json(); setMaterias(d.data || []); }
                if (resCurs.ok) { 
                    const d = await resCurs.json(); 
                    setCursadas(d.data || []); 
                    setStats(prev => ({ ...prev, materiasActivas: d.data?.length || 0 }));
                }
                if (resCalif.ok) { const d = await resCalif.json(); setCalificaciones(d.data || []); }

                setError('');
            } catch (err) {
                console.error(err);
                setError("Error de conexión con la API");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Animación del modal
    useEffect(() => {
        if (detalleEvento) {
            setTimeout(() => setModalAnimation(true), 10);
        }
    }, [detalleEvento]);

    const closeModal = () => {
        setModalAnimation(false);
        setTimeout(() => setDetalleEvento(null), 300);
    };

    const materiasCursadasConDetalle = (() => {
        const mapaMaterias = {};
        materias.forEach(m => { mapaMaterias[m.id] = m; });
        return cursadas.map(c => {
            const matInfo = mapaMaterias[c.id_materia];
            const califs = calificaciones.filter(cal => Number(cal.id_materia) === Number(c.id_materia));
            const objeto = { 
                nombre: matInfo ? matInfo.nombre : `Materia ${c.id_materia}`,
                id: c.id_materia
            };
            
            // Calcular promedio
            let total = 0;
            let count = 0;
            
            califs.forEach(cal => { 
                const calNum = Number(cal.calificacion);
                if (!isNaN(calNum)) {
                    objeto[`unidad_${cal.unidad}`] = calNum;
                    total += calNum;
                    count++;
                }
            });
            
            objeto.promedio = count > 0 ? (total / count).toFixed(1) : null;
            objeto.calificacionesCount = count;
            
            return objeto;
        }).filter(mat => mat.calificacionesCount > 0); // Solo materias con calificaciones
    })();

    const handleEliminar = async (id_sesion) => {
        const result = await Swal.fire({
            title: '¿Eliminar sesión?', 
            text: "Esta acción no se puede deshacer.", 
            icon: 'warning',
            showCancelButton: true, 
            confirmButtonColor: '#8C1F2F', 
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar', 
            cancelButtonText: 'Cancelar',
            showClass: {
                popup: 'animate-fadeIn'
            },
            hideClass: {
                popup: 'animate-fadeOut'
            }
        });
        
        if (!result.isConfirmed) return;

        try {
            const res = await fetch(`https://apis-patu.onrender.com/api/sesiones/${id_sesion}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${usuario.accessToken}` }
            });
            
            if (!res.ok) { 
                const data = await res.json(); 
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message || 'No se pudo eliminar la sesión',
                    showClass: {
                        popup: 'animate-shake'
                    }
                }); 
                return; 
            }
            
            setEventosProximos(prev => prev.filter(e => e.id_sesion !== id_sesion));
            closeModal();
            
            await Swal.fire({ 
                icon: 'success', 
                title: '✓ Sesión eliminada', 
                timer: 1500, 
                showConfirmButton: false,
                showClass: {
                    popup: 'animate-fadeIn'
                }
            });
        } catch { 
            await Swal.fire('Error de conexión', 'No se pudo conectar con el servidor.', 'error'); 
        }
    };

    // Custom Tooltip para gráficas
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-bold text-gray-800">{label}</p>
                    <p className="text-gray-700">
                        Sesiones: <span className="font-bold">{payload[0].value}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-20">
            <Navbar />
            
            <main className="p-4 animate-fadeIn relative z-10">
                <div className="max-w-7xl mx-auto">
                    
                    {/* Encabezado con Bienvenida Animada */}
                    <div className="mb-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                                    ¡Bienvenido, <span className="text-[#8C1F2F]">{usuario?.nombre}</span>!
                                </h2>
                                <p className="text-gray-600">Panel de control del alumno</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1 bg-gradient-to-r from-[#E4CD87] to-[#C7952C] text-white rounded-full text-sm font-bold">
                                    {alumnoData.semestre}° Semestre
                                </div>
                                <div className="text-xs text-gray-500">
                                    {new Date().toLocaleDateString('es-ES', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="h-1 w-24 bg-gradient-to-r from-[#C7952C] to-[#E4CD87] mt-4 rounded-full"></div>
                    </div>

                    {/* Tarjetas de Estadísticas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 transition-all duration-300 hover:scale-[1.02]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-700 font-medium">Total Sesiones</p>
                                    <p className="text-2xl font-bold text-blue-900">{stats.totalSesiones}</p>
                                </div>
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4 transition-all duration-300 hover:scale-[1.02]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-700 font-medium">Próximas Sesiones</p>
                                    <p className="text-2xl font-bold text-green-900">{stats.proximasSesiones}</p>
                                </div>
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <FaRegCalendarCheck className="w-5 h-5 text-green-600" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 transition-all duration-300 hover:scale-[1.02]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-purple-700 font-medium">Materias Activas</p>
                                    <p className="text-2xl font-bold text-purple-900">{stats.materiasActivas}</p>
                                </div>
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <BookOpen className="w-5 h-5 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                        
                        {/* COLUMNA IZQUIERDA */}
                        <div className="lg:w-3/5 flex flex-col gap-6">
                            
                            {/* Tarjeta de Información Alumno Mejorada */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                <div className="p-5 md:p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-gradient-to-r from-[#E4CD87] to-[#C7952C] rounded-full">
                                            <FaUserGraduate className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl md:text-2xl font-bold text-gray-800">{alumnoData.nombre_completo}</h3>
                                            <p className="text-gray-600 text-sm">Perfil académico</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                                            <FaIdCard className="text-blue-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Matrícula</p>
                                                <p className="font-bold text-gray-800">{alumnoData.matricula}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                                            <FaGraduationCap className="text-purple-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Carrera</p>
                                                <p className="font-bold text-gray-800">{alumnoData.carrera}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                                            <BookOpen className="text-green-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Semestre</p>
                                                <p className="font-bold text-gray-800">{alumnoData.semestre}°</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                                            <FaCalendarAlt className="text-amber-500" />
                                            <div>
                                                <p className="text-xs text-gray-500">Correo</p>
                                                <p className="font-bold text-gray-800 text-sm truncate">{alumnoData.correo}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tarjeta de Próximos Eventos Mejorada */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                <div className="p-5 md:p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gradient-to-r from-[#3CB9A5] to-emerald-500 rounded-lg">
                                                <Calendar className="w-5 h-5 text-white" />
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-bold text-gray-800">Próximas Sesiones</h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 px-3 py-1 rounded-full font-bold">
                                                Próximos 7 días
                                            </span>
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        </div>
                                    </div>
                                    
                                    <div className="h-1 w-16 bg-gradient-to-r from-[#3CB9A5] to-emerald-500 mb-6 rounded-full"></div>
                                    
                                    <div className="flex-grow space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                        {loading ? (
                                            <div className="space-y-4 py-4">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="p-4 rounded-xl bg-gray-100 animate-pulse">
                                                        <div className="flex gap-4">
                                                            <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                                                            <div className="flex-grow space-y-2">
                                                                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                                                                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                                                                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : error ? (
                                            <div className="text-center p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl animate-shake">
                                                <div className="text-red-600 font-semibold text-lg">{error}</div>
                                                <p className="text-red-500 mt-2">Por favor, intenta de nuevo más tarde</p>
                                            </div>
                                        ) : eventosProximos.length > 0 ? eventosProximos.map((e, index) => (
                                            <EventoCard 
                                                key={e.id_sesion} 
                                                evento={e} 
                                                onVerDetalles={setDetalleEvento}
                                            />
                                        )) : (
                                            <div className="text-center p-8 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-dashed border-gray-300 rounded-xl">
                                                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                                <p className="text-gray-700 font-medium text-lg">
                                                    No hay eventos programados
                                                </p>
                                                <p className="text-gray-500 mt-2">
                                                    No tienes sesiones para los próximos 7 días
                                                </p>
                                                <a
                                                    href="/calendario/nuevo"
                                                    className="inline-flex items-center gap-2 mt-4 px-6 py-2 bg-gradient-to-r from-[#E4CD87] to-[#C7952C] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 group"
                                                >
                                                    Agendar nueva sesión
                                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <Link 
                                        to="/Calendario" 
                                        className="flex items-center justify-end gap-2 text-[#3CB9A5] hover:text-emerald-600 text-sm md:text-base font-semibold mt-4 pt-4 border-t border-gray-100 group"
                                    >
                                        Ver agenda completa
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* COLUMNA DERECHA */}
                        <div className="lg:w-2/5 flex flex-col gap-6">
                            
                            {/* Gráfica 1: Tipos de sesión Mejorada */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                <div className="p-5 md:p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
                                            <BarChart3 className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg md:text-xl font-bold text-gray-800">Distribución de Sesiones</h3>
                                            <p className="text-gray-500 text-xs md:text-sm">Tipos de sesiones realizadas</p>
                                        </div>
                                    </div>
                                    
                                    <div className="h-1 w-12 bg-gradient-to-r from-purple-500 to-indigo-600 mb-4 rounded-full"></div>
                                    
                                    {chartDataVisual.length === 0 && !loading ? (
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <BarChart3 className="w-16 h-16 text-gray-300 mb-3" />
                                            <p className="text-gray-400 text-center text-sm">No hay datos suficientes.</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="h-[250px] md:h-[280px] w-full">
                                                <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                                                    <BarChart 
                                                        data={chartDataVisual} 
                                                        margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                                        <XAxis 
                                                            dataKey="tipo" 
                                                            fontSize={12} 
                                                            tickLine={false}
                                                            axisLine={{ stroke: '#e5e7eb' }}
                                                        />
                                                        <YAxis 
                                                            allowDecimals={false} 
                                                            fontSize={12} 
                                                            width={30}
                                                            tickLine={false}
                                                            axisLine={{ stroke: '#e5e7eb' }}
                                                        />
                                                        <Tooltip content={<CustomTooltip />} />
                                                        <Bar 
                                                            dataKey="sesiones" 
                                                            radius={[6, 6, 0, 0]}
                                                            animationDuration={1500}
                                                        >
                                                            {chartDataVisual.map((entry, index) => (
                                                                <Cell 
                                                                    key={`cell-${index}`} 
                                                                    fill={entry.color}
                                                                    stroke={entry.color}
                                                                    strokeWidth={1}
                                                                    className="transition-all duration-300 hover:opacity-80"
                                                                />
                                                            ))}
                                                            <LabelList 
                                                                dataKey="sesiones" 
                                                                position="top" 
                                                                fontSize={12}
                                                                fill="#374151"
                                                            />
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                            
                                            <div className="flex flex-wrap justify-center gap-2 mt-4">
                                                {chartDataVisual.map((entry, index) => (
                                                    <div 
                                                        key={index} 
                                                        className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                                                    >
                                                        <div 
                                                            className="w-3 h-3 rounded-full flex-shrink-0" 
                                                            style={{ backgroundColor: entry.color }}
                                                        ></div>
                                                        <span className="text-xs font-medium text-gray-600 truncate max-w-[100px]">
                                                            {entry.tipo}
                                                        </span>
                                                        <span className="text-xs font-bold text-gray-800">
                                                            {entry.sesiones}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Gráfica 2: Rendimiento Académico Mejorado */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                <div className="p-5 md:p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg">
                                            <TrendingUp className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg md:text-xl font-bold text-gray-800">Rendimiento Académico</h3>
                                            <p className="text-gray-500 text-xs md:text-sm">Calificaciones por materia</p>
                                        </div>
                                    </div>
                                    
                                    <div className="h-1 w-12 bg-gradient-to-r from-emerald-500 to-green-600 mb-4 rounded-full"></div>
                                    
                                    {materiasCursadasConDetalle.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <BookOpen className="w-16 h-16 text-gray-300 mb-3" />
                                            <p className="text-gray-400 text-center text-sm">No hay materias con calificaciones.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                                            {materiasCursadasConDetalle.map((mat, idx) => {
                                                const unidadesKeys = Object.keys(mat)
                                                    .filter(k => k.startsWith('unidad_'))
                                                    .sort((a,b) => Number(a.split('_')[1]) - Number(b.split('_')[1]));
                                                
                                                const data = unidadesKeys.map(key => ({
                                                    name: `U${key.split('_')[1]}`,
                                                    calificacion: mat[key],
                                                    fill: ["#4F3E9B", "#f97316", "#3b82f6", "#22c55e", "#8b5cf6"][
                                                        Number(key.split('_')[1]) % 5
                                                    ]
                                                }));

                                                return (
                                                    <div 
                                                        key={idx} 
                                                        className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-md"
                                                    >
                                                        <div className="flex justify-between items-center mb-3">
                                                            <h4 
                                                                className="font-bold text-sm text-gray-800 truncate flex-1 mr-2" 
                                                                title={mat.nombre}
                                                            >
                                                                {mat.nombre}
                                                            </h4>
                                                            {mat.promedio && (
                                                                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-gray-200">
                                                                    <Award className="w-3 h-3 text-amber-500" />
                                                                    <span className="text-xs font-bold text-gray-800">
                                                                        {mat.promedio}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="h-[120px] w-full">
                                                            <ResponsiveContainer width="100%" height="100%" minHeight={100}>
                                                                <BarChart 
                                                                    data={data} 
                                                                    margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                                                                >
                                                                    <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e5e7eb" />
                                                                    <XAxis 
                                                                        dataKey="name" 
                                                                        fontSize={10}
                                                                        tickLine={false}
                                                                        axisLine={{ stroke: '#e5e7eb' }}
                                                                    />
                                                                    <YAxis 
                                                                        domain={[0, 100]} 
                                                                        allowDecimals={false} 
                                                                        fontSize={9} 
                                                                        width={25}
                                                                        tickLine={false}
                                                                        axisLine={{ stroke: '#e5e7eb' }}
                                                                    />
                                                                    <Tooltip 
                                                                        formatter={(value) => [`${value}`, 'Calificación']}
                                                                        labelFormatter={(label) => `${label}`}
                                                                    />
                                                                    <Bar 
                                                                        dataKey="calificacion" 
                                                                        radius={[3, 3, 0, 0]}
                                                                        animationDuration={1500}
                                                                    >
                                                                        {data.map((entry, index) => (
                                                                            <Cell 
                                                                                key={`cell-${index}`} 
                                                                                fill={entry.fill}
                                                                                stroke={entry.fill}
                                                                                strokeWidth={1}
                                                                            />
                                                                        ))}
                                                                        <LabelList 
                                                                            dataKey="calificacion" 
                                                                            position="top" 
                                                                            fontSize={9}
                                                                            fill="#374151"
                                                                        />
                                                                    </Bar>
                                                                </BarChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>

            {/* Modal Detalles Mejorado */}
            {detalleEvento && (
                <div 
                    className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
                        modalAnimation 
                            ? 'bg-black/50 backdrop-blur-sm' 
                            : 'bg-black/0 backdrop-blur-0'
                    }`}
                    onClick={closeModal}
                >
                    <div 
                        className={`bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all duration-300 ${
                            modalAnimation 
                                ? 'scale-100 opacity-100 translate-y-0' 
                                : 'scale-95 opacity-0 translate-y-4'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header del modal */}
                        <div 
                            className="p-6 rounded-t-2xl text-white relative"
                            style={{ 
                                backgroundColor: ESTILOS_POR_TIPO[detalleEvento.tipo?.toLowerCase()]?.hex || ESTILOS_POR_TIPO.default.hex,
                                backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)'
                            }}
                        >
                            <button
                                onClick={closeModal}
                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
                            >
                                <span className="text-white text-xl font-bold">×</span>
                            </button>
                            
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                    {React.createElement(
                                        ESTILOS_POR_TIPO[detalleEvento.tipo?.toLowerCase()]?.Icono || ESTILOS_POR_TIPO.default.Icono, 
                                        { className: "w-8 h-8" }
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">Detalles de la sesión</h2>
                                    <p className="text-white/90 mt-1">
                                        {capitalizeFirstLetter(detalleEvento.tipo) || "Sesión general"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Contenido del modal */}
                        <div className="p-6 space-y-5">
                            {/* Estado */}
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                <span className="font-semibold text-gray-700">Estado:</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 ${
                                    detalleEvento.estado === 'completada'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-amber-100 text-amber-700'
                                }`}>
                                    {detalleEvento.estado === 'completada' && <CheckCircle className="w-4 h-4" />}
                                    {detalleEvento.estado || 'Pendiente'}
                                </span>
                            </div>

                            {/* Información de fecha y hora */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Calendar className="w-4 h-4" />
                                        <span className="font-medium">Fecha</span>
                                    </div>
                                    <p className="font-semibold text-gray-800">{detalleEvento.fecha}</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Clock className="w-4 h-4" />
                                        <span className="font-medium">Horario</span>
                                    </div>
                                    <p className="font-semibold text-gray-800">
                                        {detalleEvento.hora_inicio?.slice(0,5)} - {detalleEvento.hora_fin?.slice(0,5)}
                                    </p>
                                </div>
                            </div>

                            {/* Botones de acción */}
                            <div className="space-y-3 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => handleEliminar(detalleEvento.id_sesion)}
                                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#8C1F2F] to-[#a82a3d] text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
                                >
                                    <FaTrash className="group-hover:animate-bounce" />
                                    Eliminar sesión
                                </button>

                                {usuario?.rol === 'tutor' && (
                                    <button
                                        onClick={() => navigate(`/bitacora/${detalleEvento.id_sesion}`)}
                                        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#E4CD87] to-[#C7952C] text-gray-800 font-bold py-3 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
                                    >
                                        <ClipboardList className="group-hover:rotate-12 transition-transform" />
                                        Registrar Bitácora
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Estilos CSS para animaciones */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { 
                        opacity: 0; 
                        transform: translateY(20px) scale(0.98); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0) scale(1); 
                    }
                }
                
                @keyframes fadeOut {
                    from { opacity: 1; transform: translateY(0); }
                    to { opacity: 0; transform: translateY(20px); }
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
                
                .animate-fadeOut {
                    animation: fadeOut 0.3s ease-out;
                }
                
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
                
                /* Scrollbar personalizado */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(to bottom, #E4CD87, #C7952C);
                    border-radius: 10px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(to bottom, #C7952C, #E4CD87);
                }
            `}</style>
        </div>
    );
};

export default HomeAlumno;