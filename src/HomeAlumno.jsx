import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from "recharts";
import { FaEye, FaTrash } from 'react-icons/fa';
import Navbar from './Navbar';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { Info, BookX, HeartHandshake, HelpCircle, ClipboardList, UserCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom'; // Agregado useNavigate

const ESTILOS_POR_TIPO = {
    'general': { color: 'green', Icono: Info, hex: '#22c55e' },
    'problemas académicos': { color: 'orange', Icono: BookX, hex: '#f97316' },
    'seguimiento': { color: 'blue', Icono: ClipboardList, hex: '#3b82f6' },
    'problemas personales': { color: 'purple', Icono: HeartHandshake, hex: '#8b5cf6' },
    'cambio de tutor': { color: 'pink', Icono: UserCheck, hex: '#ec4899' },
    'sin tipo': { color: 'gray', Icono: HelpCircle, hex: '#6b7280' },
    'default': { color: 'gray', Icono: HelpCircle, hex: '#6b7280' }
};

const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
};

// --- Componente EventoCard Responsivo ---
const EventoCard = ({ evento, onVerDetalles }) => {
    const tipoEvento = evento.tipo?.toLowerCase() || 'default';
    const { color, Icono } = ESTILOS_POR_TIPO[tipoEvento] || ESTILOS_POR_TIPO.default;
    
    // Mapeo de colores completo para Tailwind
    const classes = {
        blue: 'border-blue-500 bg-blue-50 text-blue-600',
        green: 'border-green-500 bg-green-50 text-green-600',
        orange: 'border-orange-500 bg-orange-50 text-orange-600',
        purple: 'border-purple-500 bg-purple-50 text-purple-600',
        gray: 'border-gray-500 bg-gray-50 text-gray-600',
        pink: 'border-pink-500 bg-pink-50 text-pink-600'
    };
    const colorClasses = classes[color] || classes.gray;

    const formatEventTime = (fecha, hora) => {
        const hoy = new Date();
        const manana = new Date(); manana.setDate(hoy.getDate() + 1);
        const fechaEvento = new Date(`${fecha}T00:00:00`);
        let diaTexto = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric' }).format(fechaEvento);
        
        // Comparación simple de fechas
        const isSameDay = (d1, d2) => d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

        if (isSameDay(hoy, fechaEvento)) diaTexto = 'Hoy';
        else if (isSameDay(manana, fechaEvento)) diaTexto = 'Mañana';
        
        return `${diaTexto}, ${hora ? hora.substring(0, 5) : '--:--'}`;
    };

    return (
        <div className={`p-3 md:p-4 rounded-xl border-l-4 md:border-4 shadow-sm hover:shadow-md transition-all duration-200 ${colorClasses} w-full`}>
            <div className="flex items-start md:items-center gap-3 md:gap-4">
                {/* Icono más pequeño en móvil (w-10) y normal en desktop (w-14) */}
                <div className="p-2 bg-white/50 rounded-full flex-shrink-0">
                    <Icono className="w-8 h-8 md:w-12 md:h-12" />
                </div>
                
                <div className="flex flex-col min-w-0 flex-1">
                    <p className="font-bold text-sm md:text-base truncate">{formatEventTime(evento.fecha, evento.hora_inicio)}</p>
                    <p className="font-semibold text-xs md:text-sm mt-0.5 uppercase tracking-wide opacity-90">{capitalizeFirstLetter(evento.tipo) || "Sesión"}</p>
                    <button 
                        onClick={() => onVerDetalles(evento)} 
                        className="flex items-center gap-1 mt-2 text-sm font-bold hover:underline w-fit"
                    >
                        <FaEye /> <span className="hidden sm:inline">Ver detalles</span><span className="sm:hidden">Ver</span>
                    </button>
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
        semestre: usuario?.semestre || "X"
    });

    const [chartDataVisual, setChartDataVisual] = useState([]);
    const [eventosProximos, setEventosProximos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [detalleEvento, setDetalleEvento] = useState(null);

    const [materias, setMaterias] = useState([]);
    const [cursadas, setCursadas] = useState([]);
    const [calificaciones, setCalificaciones] = useState([]);

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
                            // Intentar obtener datos del alumno si es necesario, aunque en HomeAlumno ya sabemos quién es
                            return { ...evento, alumno: { nombre: usuario.nombre, apellido_paterno: usuario.apellido_paterno } };
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
                        const tipo = capitalizeFirstLetter(evento.tipo) || 'Sin tipo';
                        acc[tipo] = (acc[tipo] || 0) + 1;
                        return acc;
                    }, {});

                    const datosParaGrafica = Object.keys(conteoPorTipo).map(key => ({
                        tipo: key,
                        sesiones: conteoPorTipo[key]
                    }));
                    setChartDataVisual(datosParaGrafica);
                }

                // 2. Datos Académicos
                const [resMat, resCurs, resCalif] = await Promise.all([
                    fetch(`https://apis-patu.onrender.com/api/materias/`, { headers }),
                    fetch(`https://apis-patu.onrender.com/api/cursada/alumno/${usuario.id}`, { headers }),
                    fetch(`https://apis-patu.onrender.com/api/calificacion/alumno/${usuario.id}`, { headers })
                ]);

                if (resMat.ok) { const d = await resMat.json(); setMaterias(d.data || []); }
                if (resCurs.ok) { const d = await resCurs.json(); setCursadas(d.data || []); }
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

    const materiasCursadasConDetalle = (() => {
        const mapaMaterias = {};
        materias.forEach(m => { mapaMaterias[m.id] = m; });
        return cursadas.map(c => {
            const matInfo = mapaMaterias[c.id_materia];
            const califs = calificaciones.filter(cal => Number(cal.id_materia) === Number(c.id_materia));
            const objeto = { nombre: matInfo ? matInfo.nombre : `Materia ${c.id_materia}` };
            califs.forEach(cal => { objeto[`unidad_${cal.unidad}`] = Number(cal.calificacion); });
            return objeto;
        });
    })();

    const handleEliminar = async (id_sesion) => {
        const result = await Swal.fire({
            title: '¿Eliminar sesión?', text: "No se puede deshacer.", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
        });
        if (!result.isConfirmed) return;

        try {
            const res = await fetch(`https://apis-patu.onrender.com/api/sesiones/${id_sesion}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${usuario.accessToken}` }
            });
            if (!res.ok) { const data = await res.json(); await Swal.fire('Error', data.message || 'No se pudo eliminar', 'error'); return; }
            setEventosProximos(prev => prev.filter(e => e.id_sesion !== id_sesion));
            setDetalleEvento(null);
            await Swal.fire({ icon: 'success', title: 'Sesión eliminada', timer: 1500, showConfirmButton: false });
        } catch { await Swal.fire('Error', 'No se pudo conectar', 'error'); }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <Navbar />
            
            <main className="p-4 animate-fadeIn relative z-10">
                <div className="max-w-6xl mx-auto">
                    
                    {/* Encabezado Responsive */}
                    <div className="mb-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                            Bienvenido, <span className="text-[#8C1F2F]">{usuario?.nombre}</span>
                        </h2>
                        <div className="w-full h-1 border-[#C7952C] border-2 mb-6 rounded-full"></div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                        
                        {/* COLUMNA IZQUIERDA */}
                        <div className="lg:w-3/5 flex flex-col gap-6">
                            
                            {/* Tarjeta de Información Alumno */}
                            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-md border border-gray-100">
                                <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-800">{alumnoData.nombre_completo}</h3>
                                <div className="space-y-1 text-sm md:text-lg text-gray-600">
                                    <p><span className="font-semibold text-gray-800">Matrícula:</span> {alumnoData.matricula}</p>
                                    <p><span className="font-semibold text-gray-800">Carrera:</span> {alumnoData.carrera}</p>
                                    <p><span className="font-semibold text-gray-800">Semestre:</span> {alumnoData.semestre}</p>
                                </div>
                            </div>

                            {/* Tarjeta de Próximos Eventos */}
                            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col h-full">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl md:text-2xl font-bold text-gray-800">Próximos eventos</h3>
                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-bold">7 días</span>
                                </div>
                                <div className="w-full h-1 border-[#C7952C] border-2 mb-4 rounded-full"></div>
                                
                                <div className="flex-grow space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {loading ? <p className="text-center text-gray-500 py-8">Cargando datos...</p> : 
                                     error ? <p className="text-center text-red-600 font-semibold py-8">{error}</p> :
                                     eventosProximos.length > 0 ? eventosProximos.map(e => <EventoCard key={e.id_sesion} evento={e} onVerDetalles={setDetalleEvento} />) :
                                     <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                         <p className="text-gray-500 font-medium">No tienes eventos programados.</p>
                                     </div>}
                                </div>
                                <Link to="/Calendario" className="text-blue-600 hover:text-blue-800 text-sm md:text-base font-semibold text-right mt-4 block">
                                    Ver agenda completa →
                                </Link>
                            </div>
                        </div>

                        {/* COLUMNA DERECHA */}
                        <div className="lg:w-2/5 flex flex-col gap-6">
                            
                            {/* Gráfica 1: Tipos de sesión */}
                            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-md border border-gray-100">
                                <h3 className="text-lg md:text-xl font-bold text-gray-800 text-center mb-1">Tipos de sesiones</h3>
                                <p className="text-center text-gray-500 text-xs md:text-sm mb-4">Distribución reciente</p>
                                
                                {chartDataVisual.length === 0 && !loading && <p className="text-gray-400 text-center py-10 text-sm">No hay datos suficientes.</p>}
                                
                                <div className="h-[250px] md:h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartDataVisual}>
                                            <YAxis allowDecimals={false} fontSize={12} width={30} />
                                            <Tooltip cursor={{fill: 'transparent'}} />
                                            <Bar dataKey="sesiones" radius={[4, 4, 0, 0]}>
                                                {chartDataVisual.map((entry, index) => {
                                                    const estilo = ESTILOS_POR_TIPO[entry.tipo?.toLowerCase()] || ESTILOS_POR_TIPO.default;
                                                    return <Cell key={`cell-${index}`} fill={estilo.hex} />;
                                                })}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                
                                <div className="flex flex-wrap justify-center gap-2 mt-4">
                                    {chartDataVisual.map((entry, index) => {
                                        const estilo = ESTILOS_POR_TIPO[entry.tipo?.toLowerCase()] || ESTILOS_POR_TIPO.default;
                                        return (
                                            <div key={index} className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: estilo.hex }}></div>
                                                <span className="text-xs font-medium text-gray-600">{entry.tipo}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Gráfica 2: Rendimiento */}
                            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-md border border-gray-100">
                                <h3 className="text-lg md:text-xl font-bold text-gray-800 text-center mb-4">Rendimiento Académico</h3>
                                <div className="w-16 h-1 border-[#C7952C] border-2 mb-6 mx-auto rounded-full"></div>
                                
                                {materiasCursadasConDetalle.length === 0 ? (
                                    <p className="text-gray-400 text-center py-10 text-sm">No hay materias registradas.</p>
                                ) : (
                                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                                        {materiasCursadasConDetalle.map((mat, idx) => {
                                            const unidadesKeys = Object.keys(mat).filter(k => k.startsWith('unidad_')).sort((a,b) => Number(a.split('_')[1]) - Number(b.split('_')[1]));
                                            const data = [ mat ];
                                            return (
                                                <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                    <h4 className="font-bold mb-2 text-center text-xs text-gray-700 truncate px-2" title={mat.nombre}>{mat.nombre}</h4>
                                                    <div className="h-[150px] w-full">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                                <XAxis dataKey="nombre" hide={true} />
                                                                <YAxis domain={[0, 100]} allowDecimals={false} fontSize={10} width={25} />
                                                                <Tooltip />
                                                                {unidadesKeys.map((uk, i) => (
                                                                    <Bar key={uk} dataKey={uk} name={`U${uk.split('_')[1]}`} fill={["#4F3E9B","#f97316","#3b82f6","#22c55e","#8b5cf6"][i % 5]} radius={[2, 2, 0, 0]} />
                                                                ))}
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
                <style>{`
                    @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } } 
                    .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
                    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
                `}</style>
            </main>

            {/* Modal Detalles Responsive */}
            {detalleEvento && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-md relative shadow-2xl animate-fadeIn">
                        <button
                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 font-bold text-2xl transition-colors"
                            onClick={() => setDetalleEvento(null)}
                        >
                            ×
                        </button>
                        
                        <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 pr-8">
                            Detalles de sesión
                        </h2>
                        <div className="w-full h-1 border-[#C7952C] border-2 mb-6 rounded-full"></div>
                        
                        <div className="space-y-3 text-sm md:text-base text-gray-700">
                            <p><strong className="text-gray-900">Fecha:</strong> {detalleEvento.fecha}</p>
                            <p><strong className="text-gray-900">Hora:</strong> {detalleEvento.hora_inicio?.slice(0,5)} - {detalleEvento.hora_fin?.slice(0,5)}</p>
                            <p><strong className="text-gray-900">Tipo:</strong> {detalleEvento.tipo || "Sin tipo"}</p>
                            <p><strong className="text-gray-900">Alumno:</strong> {`${detalleEvento.alumno?.nombre || ''} ${detalleEvento.alumno?.apellido_paterno || ''}`}</p>
                            
                            <div className="flex items-center gap-2 mt-2">
                                <strong className="text-gray-900">Estado:</strong>
                                <span className={`ml-2 px-3 py-1 rounded-full text-sm font-bold ${detalleEvento.estado === 'completada' ? 'bg-green-100 text-green-700' : 'bg-[#E4CD87] text-black-900'}`}>
                                 { detalleEvento.estado}
                                </span>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col gap-3">
                            <button
                                onClick={() => handleEliminar(detalleEvento.id_sesion)}
                                className="w-full flex items-center justify-center gap-2 bg-[#8C1F2F] border-2 border-[#8C1F2F] text-white font-bold py-2.5 rounded-xl hover:bg-red-50 transition-all"
                            >
                                <FaTrash /> Eliminar sesión
                            </button>

                            {usuario?.rol === 'tutor' && (
                                <button
                                    onClick={() => navigate(`/bitacora/${detalleEvento.id_sesion}`)}
                                    className="w-full flex items-center justify-center gap-2 bg-[#E4CD87] text-black font-bold py-3 rounded-xl hover:bg-[#dcb95b] transition-all shadow-md"
                                >
                                    Registrar Bitácora
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomeAlumno;