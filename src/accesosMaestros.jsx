import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import { Info, BookX, HeartHandshake, HelpCircle, ClipboardList, UserCheck } from 'lucide-react';
import { FaEye, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import Navbar from './Navbar';

const ESTILOS_POR_TIPO = {
    'general': { color: 'green', Icono: Info, hex: '#3A8A4F' },
    'problemas académicos': { color: 'orange', Icono: BookX, hex: '#D9792B' },
    'seguimiento': { color: 'blue', Icono: ClipboardList, hex: '#3b82f6' },
    'problemas personales': { color: 'purple', Icono: HeartHandshake, hex: '#D4CCF2' },
    'cambio de tutor': { color: 'pink', Icono: UserCheck, hex: '#ec4899' },
    'sin tipo': { color: 'gray', Icono: HelpCircle, hex: '#6b7280' },
    'default': { color: 'gray', Icono: HelpCircle, hex: '#6b7280' }
};

const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
};


const EventoCard = ({ evento, onVerDetalles }) => {
    const tipoEvento = evento.tipo?.toLowerCase() || 'default';
    const { color, Icono } = ESTILOS_POR_TIPO[tipoEvento] || ESTILOS_POR_TIPO.default;

    const classes = {
        blue: 'border-[#3C7DD9] bg-[#3C7DD9] text-[#3C7DD9]',
        green: 'border-[#3A8A4F] bg-[#FFFFFF] text-[#3A8A4F]',
        orange: 'border-[#D9792B] bg-[#D9792B] text-[#D9792B]',
        purple: 'border-purple-500 bg-purple-50 text-purple-600',
        gray: 'border-gray-500 bg-gray-50 text-gray-600',
        pink: 'border-pink-500 bg-pink-50 text-pink-600'
    };
    const colorClasses = classes[color] || classes.gray;

    const formatEventTime = (fecha, hora) => {
        const hoy = new Date();
        const manana = new Date();
        manana.setDate(hoy.getDate() + 1);
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
                    <p className="font-bold">
                        {formatEventTime(evento.fecha, evento.hora_inicio)}
                    </p>
                    <p className="font-semibold mt-1">{capitalizeFirstLetter(evento.tipo) || "Sesión"}</p>
                    <p className="text-sm mt-1">Alumno: {`${evento.alumno?.nombre} ${evento.alumno?.apellido_paterno || ''}`}</p>
                    <button onClick={() => onVerDetalles(evento)} className="flex items-center gap-1 underline mt-2 font-semibold text-left">
                        <FaEye /> Ver detalles
                    </button>
                </div>
            </div>
        </div>
    );
};


const AccesosMaestros = () => {
    const [eventosProximos, setEventosProximos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [detalleEvento, setDetalleEvento] = useState(null);
    const [problemasData, setProblemasData] = useState([]);
    const [totalSesiones, setTotalSesiones] = useState(0);

    useEffect(() => {
        const fetchEventos = async () => {
            try {
                setLoading(true);
                const usuario = JSON.parse(localStorage.getItem('usuario'));
                if (!usuario || !usuario.accessToken) { setError("⚠️ Debes iniciar sesión primero"); return; }

                let url = '';
                if (usuario.rol === 'tutor') url = `https://apis-patu.onrender.com/api/sesiones/tutor/${usuario.id}`;
                else if (usuario.rol === 'alumno') url = `https://apis-patu.onrender.com/api/sesiones/alumno/${usuario.id}`;
                if (!url) { setError("Rol de usuario no válido."); return; }

                const res = await fetch(url, { headers: { "Authorization": `Bearer ${usuario.accessToken}` } });
                const data = await res.json();
                if (!res.ok) { setError(data.message || "❌ No se pudieron cargar los eventos"); return; }

                const eventosConNombres = await Promise.all(
                    data.data.map(async (evento) => {
                        const [alumnoRes, tutorRes] = await Promise.all([
                            fetch(`https://apis-patu.onrender.com/api/usuarios/id/${evento.id_alumno}`, { headers: { "Authorization": `Bearer ${usuario.accessToken}` } }),
                            fetch(`https://apis-patu.onrender.com/api/usuarios/id/${evento.id_tutor}`, { headers: { "Authorization": `Bearer ${usuario.accessToken}` } })
                        ]);
                        const alumnoData = await alumnoRes.json();
                        const tutorData = await tutorRes.json();
                        return { ...evento, alumno: alumnoData.data, tutor: tutorData.data };
                    })
                );

                const conteoPorTipo = eventosConNombres.reduce((acc, evento) => {
                    const tipo = capitalizeFirstLetter(evento.tipo) || 'Sin Tipo';
                    acc[tipo] = (acc[tipo] || 0) + 1;
                    return acc;
                }, {});

                const datosParaGrafica = Object.keys(conteoPorTipo).map(key => ({
                    name: key,
                    value: conteoPorTipo[key]
                }));

                setProblemasData(datosParaGrafica);
                setTotalSesiones(eventosConNombres.length);

                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);
                const unaSemanaDespues = new Date();
                unaSemanaDespues.setDate(hoy.getDate() + 7);
                const eventosFiltrados = eventosConNombres.filter(evento => new Date(evento.fecha + 'T00:00:00') >= hoy && new Date(evento.fecha + 'T00:00:00') <= unaSemanaDespues);
                eventosFiltrados.sort((a, b) => new Date(`${a.fecha}T${a.hora_inicio}`) - new Date(`${b.fecha}T${b.hora_inicio}`));
                setEventosProximos(eventosFiltrados);
                setError('');
            } catch (err) {
                console.error(err);
                setError("⚠️ Error de conexión con la API");
            } finally {
                setLoading(false);
            }
        };
        fetchEventos();
    }, []);

    const handleEliminar = async (id_sesion) => {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        const result = await Swal.fire({
            title: '¿Eliminar sesión?', text: "Esta acción no se puede deshacer.", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        try {
            const res = await fetch(`https://apis-patu.onrender.com/api/sesiones/${id_sesion}`, {
                method: "DELETE", headers: { "Authorization": `Bearer ${usuario.accessToken}` }
            });

            if (!res.ok) {
                const data = await res.json();
                await Swal.fire('Error', data.message || 'No se pudo eliminar la sesión', 'error');
                return;
            }

            setEventosProximos(prevEventos => prevEventos.filter(e => e.id_sesion !== id_sesion));
            setDetalleEvento(null);

            await Swal.fire({ icon: 'success', title: 'Sesión eliminada', timer: 1800, showConfirmButton: false });
        } catch (err) {
            await Swal.fire('Error de conexión', 'No se pudo conectar con la API.', 'error');
        }
    };


    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <main className="p-5">
                <div className="flex flex-col lg:flex-row justify-between items-center border-b-4 border-[#C7952C] pb-2 mb-5 text-center lg:text-left gap-2">
                    <h2 className="font-bold text-3xl">Tipos de Sesiones</h2>
                    <h2 className="font-bold text-3xl">Próximos eventos</h2>
                </div>
                <div className="flex flex-col lg:flex-row gap-5">
                    <div className="bg-white rounded-xl shadow p-5 flex-1 lg:flex-[2] min-h-[400px] sm:min-h-[500px]">
                        {loading ? (
                            <div className="flex items-center justify-center h-full"><p>Cargando gráfica...</p></div>
                        ) : problemasData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={500}>
                                <PieChart>
                                    <Pie data={problemasData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="40%" outerRadius="70%" paddingAngle={3} labelLine={true} label={({ name, value }) => `${name}: ${value}`} >
                                        {problemasData.map((entry, index) => {
                                            const tipo = entry.name.toLowerCase();
                                            const estilo = ESTILOS_POR_TIPO[tipo] || ESTILOS_POR_TIPO.default;
                                            return <Cell key={`cell-${index}`} fill={estilo.hex} />
                                        })}
                                    </Pie>
                                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="font-bold" style={{ fontSize: window.innerWidth < 640 ? '16px' : '20px' }}>
                                        {totalSesiones} Sesiones
                                    </text>
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-500">No hay datos para mostrar en la gráfica.</p>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex flex-col">
                        <div className="flex-grow space-y-4 max-h-[500px] overflow-y-auto pr-2">
                            {loading ? (
                                <div className="text-center text-gray-500 p-4">Cargando eventos...</div>
                            ) : error ? (
                                <div className="text-center text-red-600 font-semibold p-4 bg-red-50 rounded-lg">{error}</div>
                            ) : eventosProximos.length > 0 ? (
                                eventosProximos.map((evento) => (
                                    <EventoCard key={evento.id_sesion} evento={evento} onVerDetalles={setDetalleEvento} />
                                ))
                            ) : (
                                <div className="text-center text-gray-600 p-4 bg-gray-50 rounded-lg shadow">
                                    No tienes eventos programados para los próximos 7 días.
                                </div>
                            )}
                        </div>
                        <a href="/Calendario" className="text-blue-500 hover:text-blue-700 underline mt-4 text-lg text-right font-semibold">
                            Ver agenda completa
                        </a>
                    </div>
                </div>
            </main>

            {detalleEvento && (
                <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-2xl w-96 relative shadow-xl max-w-full mx-4">
                        <button className="absolute top-4 right-4 text-red-500 font-bold text-2xl hover:text-red-700" onClick={() => setDetalleEvento(null)}> × </button>
                        <h2 className="text-2xl font-bold mb-6 text-purple-600 border-b-4 border-purple-400 pb-2"> Detalles de la sesión </h2>
                        {/* --- 🌟 CONTENIDO RESTAURADO --- */}
                        <div className="space-y-3">
                            <p><strong>Fecha:</strong> {detalleEvento.fecha}</p>
                            <p><strong>Hora:</strong> {detalleEvento.hora_inicio?.substring(0, 5)} - {detalleEvento.hora_fin?.substring(0, 5)}</p>
                            <p><strong>Tipo:</strong> {capitalizeFirstLetter(detalleEvento.tipo) || "Sin tipo"}</p>
                            <p><strong>Alumno:</strong> {`${detalleEvento.alumno?.nombre} ${detalleEvento.alumno?.apellido_paterno}`}</p>
                            <p><strong>Tutor:</strong> {`${detalleEvento.tutor?.nombre} ${detalleEvento.tutor?.apellido_paterno}`}</p>
                            <p>
                                <strong>Estado:</strong>
                                <span className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${detalleEvento.estado === 'completada' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                                    {detalleEvento.estado}
                                </span>
                            </p>
                        </div>
                        <button onClick={() => handleEliminar(detalleEvento.id_sesion)} className="mt-6 w-full flex items-center justify-center gap-2 bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition-all">
                            <FaTrash /> Eliminar sesión
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccesosMaestros;