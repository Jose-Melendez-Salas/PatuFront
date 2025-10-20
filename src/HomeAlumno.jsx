import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell } from "recharts";
import { FaEye, FaTrash } from 'react-icons/fa';
import Navbar from './Navbar';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { Info, BookX, ClipboardList, HeartHandshake, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ESTILOS_POR_TIPO = {
    'general': { color: 'green', Icono: Info, hex: '#22c55e' },
    'problemas académicos': { color: 'orange', Icono: BookX, hex: '#f97316' },
    'seguimiento': { color: 'blue', Icono: ClipboardList, hex: '#3b82f6' },
    'problemas personales': { color: 'purple', Icono: HeartHandshake, hex: '#8b5cf6' },
    'sin tipo': { color: 'gray', Icono: HelpCircle, hex: '#6b7280' },
    'default': { color: 'gray', Icono: HelpCircle, hex: '#6b7280' }
};

const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
};

// Componente para cada evento
const EventoCard = ({ evento, onVerDetalles }) => {
    const tipoEvento = evento.tipo?.toLowerCase() || 'default';
    const { color, Icono } = ESTILOS_POR_TIPO[tipoEvento] || ESTILOS_POR_TIPO.default;
    const classes = {
        blue: 'border-blue-500 bg-blue-50 text-blue-600',
        green: 'border-green-500 bg-green-50 text-green-600',
        orange: 'border-orange-500 bg-orange-50 text-orange-600',
        purple: 'border-purple-500 bg-purple-50 text-purple-600',
        gray: 'border-gray-500 bg-gray-50 text-gray-600'
    };
    const colorClasses = classes[color] || classes.gray;

    const formatEventTime = (fecha, hora) => {
        const hoy = new Date();
        const manana = new Date(); manana.setDate(hoy.getDate() + 1);
        const fechaEvento = new Date(`${fecha}T00:00:00`);
        let diaTexto = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric' }).format(fechaEvento);
        if (hoy.toDateString() === fechaEvento.toDateString()) diaTexto = 'Hoy';
        else if (manana.toDateString() === fechaEvento.toDateString()) diaTexto = 'Mañana';
        return `${diaTexto}, ${hora.substring(0, 5)}`;
    };

    return (
        <div className={`p-4 rounded-xl border-4 shadow hover:shadow-xl hover:scale-[1.02] transition-all duration-200 ${colorClasses}`}>
            <div className="flex items-center gap-4">
                <Icono className="w-16 h-16 flex-shrink-0" />
                <div className="flex flex-col">
                    <p className="font-bold">{formatEventTime(evento.fecha, evento.hora_inicio)}</p>
                    <p className="font-semibold mt-1">{capitalizeFirstLetter(evento.tipo) || "Sesión"}</p>
                    <p className="text-sm mt-1">Alumno: {`${evento.alumno?.nombre || ''} ${evento.alumno?.apellido_paterno || ''}`}</p>
                    <button onClick={() => onVerDetalles(evento)} className="flex items-center gap-1 underline mt-2 font-semibold text-left">
                        <FaEye /> Ver detalles
                    </button>
                </div>
            </div>
        </div>
    );
};

const HomeAlumno = () => {
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

    // Fetch de eventos
    useEffect(() => {
        const fetchEventos = async () => {
            try {
                setLoading(true);
                if (!usuario || !usuario.accessToken || usuario.rol !== 'alumno') {
                    setError("No se puede cargar eventos: usuario inválido");
                    return;
                }

                const res = await fetch(`https://apis-patu.onrender.com/api/sesiones/alumno/${usuario.id}`, {
                    headers: { "Authorization": `Bearer ${usuario.accessToken}` }
                });
                const data = await res.json();
                if (!res.ok) { setError(data.message || "No se pudieron cargar eventos"); return; }

                const eventosConNombres = await Promise.all(
                    data.data.map(async evento => {
                        const alumnoRes = await fetch(`https://apis-patu.onrender.com/api/usuarios/id/${evento.id_alumno}`, { headers: { "Authorization": `Bearer ${usuario.accessToken}` } });
                        const alumnoData = await alumnoRes.json();
                        return { ...evento, alumno: alumnoData.data };
                    })
                );

                const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
                const semana = new Date(); semana.setDate(hoy.getDate() + 7);
                const eventosFiltrados = eventosConNombres.filter(e => {
                    const fechaEvento = new Date(e.fecha + 'T00:00:00');
                    return fechaEvento >= hoy && fechaEvento <= semana;
                }).sort((a, b) => new Date(`${a.fecha}T${a.hora_inicio}`) - new Date(`${b.fecha}T${b.hora_inicio}`));

                setEventosProximos(eventosFiltrados);
                // 🔹 Calcular cantidad de sesiones por tipo
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

                setError('');
            } catch (err) {
                console.error(err); setError("Error de conexión con la API");
            } finally { setLoading(false); }
        };

        fetchEventos();
    }, []);

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

    const CustomBarLabel = ({ x, y, width, value }) => (
        <text x={x + width / 2} y={y} dy={-8} fill="#4F3E9B" fontSize={12} textAnchor="middle">{value}</text>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="p-4 animate-fadeIn relative z-10">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Tu ficha:</h2>
                    <div className="w-full h-1 bg-yellow-400 mb-8"></div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Información del alumno */}
                        <div className="lg:w-3/5 flex flex-col gap-8">
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                                <h3 className="text-2xl font-bold mb-3">{alumnoData.nombre_completo}</h3>
                                <p className="text-lg"><span className="font-semibold">Matrícula:</span> {alumnoData.matricula}</p>
                                <p className="text-lg"><span className="font-semibold">Carrera:</span> {alumnoData.carrera}</p>
                                <p className="text-lg"><span className="font-semibold">Semestre:</span> {alumnoData.semestre}</p>
                            </div>

                            {/* Próximos eventos */}
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col">
                                <h3 className="text-2xl font-bold mb-4">Próximos eventos</h3>
                                {/* Aquí agregamos la línea amarilla */}
                                <div className="w-full h-1 bg-yellow-400 mb-4"></div>

                                <div className="flex-grow space-y-4 max-h-[500px] overflow-y-auto pr-2">
                                    {loading ? (
                                        <p className="text-center text-gray-500 p-4">Cargando eventos...</p>
                                    ) : error ? (
                                        <p className="text-center text-red-600 font-semibold p-4 bg-red-50 rounded-lg">{error}</p>
                                    ) : eventosProximos.length > 0 ? (
                                        eventosProximos.map(e => <EventoCard key={e.id_sesion} evento={e} onVerDetalles={setDetalleEvento} />)
                                    ) : (
                                        <p className="text-center text-gray-600 p-4 bg-gray-50 rounded-lg shadow">
                                            No tienes eventos programados para los próximos 7 días.
                                        </p>
                                    )}
                                </div>
                                <Link to="/Calendario" className="text-blue-500 hover:text-blue-700 underline mt-4 text-lg text-right font-semibold">
                                    Ver agenda completa
                                </Link>
                            </div>

                        </div>

                        {/* Gráfico de calificaciones */}
                        <div className="lg:w-2/5 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800 text-center mb-4">Tipos de sesiones</h3>
                            <p className="text-center text-gray-600 mb-6">Distribución de tus sesiones recientes</p>
                            {chartDataVisual.length === 0 && <p className="text-gray-500 text-center mb-4">No hay calificaciones registradas.</p>}
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="80%">
                                    <BarChart data={chartDataVisual}>
                                        <YAxis
                                            domain={[0, 20]}          // límite de 0 a 50
                                            tickCount={11}            // número aproximado de divisiones
                                            allowDecimals={false}     // 🔹 evita decimales
                                            tickFormatter={(value) => Math.floor(value)} // seguridad extra
                                        />

                                        <Tooltip />
                                        <Bar dataKey="sesiones" barSize={50} isAnimationActive={false}>
                                            {chartDataVisual.map((entry, index) => {
                                                const estilo = ESTILOS_POR_TIPO[entry.tipo?.toLowerCase()] || ESTILOS_POR_TIPO.default;
                                                return <Cell key={`cell-${index}`} fill={estilo.hex} />;
                                            })}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>

                                {/* 🔹 Leyenda personalizada debajo de la gráfica */}
                                <div className="flex flex-wrap justify-center gap-3 mt-4">
                                    {chartDataVisual.map((entry, index) => {
                                        const estilo = ESTILOS_POR_TIPO[entry.tipo?.toLowerCase()] || ESTILOS_POR_TIPO.default;
                                        return (
                                            <div key={index} className="flex items-center gap-2">
                                                <div
                                                    className="w-4 h-4 rounded"
                                                    style={{ backgroundColor: estilo.hex }}
                                                ></div>
                                                <span className="text-sm font-medium text-gray-700">{entry.tipo}</span>
                                            </div>
                                        );
                                    })}
                                </div>



                            </div>
                        </div>
                    </div>
                </div>

                <style>{`
                    @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
                    .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
                `}</style>
            </main>

            {/* Modal de detalles */}
            {detalleEvento && (
                <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-2xl w-96 relative shadow-xl max-w-full mx-4">
                        <button className="absolute top-4 right-4 text-red-500 font-bold text-2xl hover:text-red-700"
                            onClick={() => setDetalleEvento(null)}>×</button>
                        <h2 className="text-2xl font-bold mb-6 text-purple-600 border-b-4 border-purple-400 pb-2">Detalles de la sesión</h2>
                        <div className="space-y-3">
                            <p><strong>Fecha:</strong> {detalleEvento.fecha}</p>
                            <p><strong>Hora:</strong> {detalleEvento.hora_inicio?.substring(0, 5)} - {detalleEvento.hora_fin?.substring(0, 5)}</p>
                            <p><strong>Tipo:</strong> {capitalizeFirstLetter(detalleEvento.tipo) || "Sin tipo"}</p>
                            <p><strong>Alumno:</strong> {`${detalleEvento.alumno?.nombre} ${detalleEvento.alumno?.apellido_paterno}`}</p>
                            <p>
                                <strong>Estado:</strong>
                                <span className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${detalleEvento.estado === 'completada' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                                    {detalleEvento.estado}
                                </span>
                            </p>
                        </div>
                        <button onClick={() => handleEliminar(detalleEvento.id_sesion)}
                            className="mt-6 w-full flex items-center justify-center gap-2 bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition-all">
                            <FaTrash /> Eliminar sesión
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomeAlumno;
