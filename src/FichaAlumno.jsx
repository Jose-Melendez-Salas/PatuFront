import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FaPlus } from 'react-icons/fa';
import Navbar from './Navbar.jsx';

// Componente para cada entrada de la bitácora
const BitacoraFicha = ({ tipo, observaciones, fecha, color }) => (
    <div className={`p-4 mb-4 rounded-xl shadow-md transition-shadow hover:shadow-lg`} style={{ border: `2px solid ${color}` }}>
        <div className="flex justify-between items-start mb-1">
            <h4 className="font-bold text-base text-gray-800">{tipo}</h4>
            <span className="text-xs text-gray-500 whitespace-nowrap" style={{ color }}>{fecha}</span>
        </div>
        <p className="text-sm mt-1"><span className="font-semibold">Observaciones:</span> {observaciones}</p>
    </div>
);

const FichaAlumno = () => {
    const { matricula } = useParams();

    const [alumnoData, setAlumnoData] = useState(null);
    const [bitacoraData, setBitacoraData] = useState([]);
    const [chartDataVisual, setChartDataVisual] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAlumno = async () => {
            const usuario = JSON.parse(localStorage.getItem('usuario'));
            const token = usuario?.accessToken;

            if (!token) {
                setError("⚠️ No hay sesión activa. Por favor inicia sesión.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // 1️⃣ Información del alumno
                const resAlumno = await fetch(`https://apis-patu.onrender.com/usuarios/${matricula}`, {
                    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
                });
                const alumnoJson = await resAlumno.json();
                if (!resAlumno.ok) throw new Error(alumnoJson.message || "Error al cargar información del alumno");
                setAlumnoData(alumnoJson.data);

                // 2️⃣ Bitácora del alumno
                const resBitacora = await fetch(`https://apis-patu.onrender.com/bitacora/alumno/${matricula}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const bitacoraJson = await resBitacora.json();
                if (!resBitacora.ok) throw new Error(bitacoraJson.message || "Error al cargar bitácora");
                setBitacoraData(bitacoraJson.data || []);

                // 3️⃣ Calificaciones / Inasistencias
                const resCalificaciones = await fetch(`https://apis-patu.onrender.com/calificaciones/alumno/${matricula}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const calificacionesJson = await resCalificaciones.json();
                if (!resCalificaciones.ok) throw new Error(calificacionesJson.message || "Error al cargar calificaciones");
                setChartDataVisual(calificacionesJson.data || []);

                setLoading(false);
            } catch (err) {
                console.error(err);
                setError(err.message || "❌ No se pudo cargar la información del alumno");
                setLoading(false);
            }
        };

        if (matricula) fetchAlumno();
    }, [matricula]);

    // Etiquetas personalizadas para el gráfico
    const CustomBarLabel = ({ x, y, width, value }) => (
        <text x={x + width / 2} y={y} dy={-8} fill="#4F3E9B" fontSize={12} textAnchor="middle">{value}</text>
    );

    // Estado de carga o error
    if (loading) return <p className="text-gray-600 p-4">Cargando información del alumno...</p>;
    if (error) return <p className="text-red-600 p-4">{error}</p>;
    if (!alumnoData) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="p-4 animate-fadeIn relative z-10">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Ficha del alumno</h2>
                    <div className="w-full h-1 bg-yellow-400 mb-8"></div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Información del alumno y bitácora */}
                        <div className="lg:w-3/5 flex flex-col gap-8">
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                                <h3 className="text-2xl font-bold mb-3">{alumnoData.nombre}</h3>
                                <p className="text-lg"><span className="font-semibold">Matrícula:</span> {alumnoData.matricula}</p>
                                <p className="text-lg"><span className="font-semibold">Carrera:</span> {alumnoData.carrera}</p>
                                <p className="text-lg"><span className="font-semibold">Semestre:</span> {alumnoData.semestre}</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col">
                                <h3 className="text-2xl font-bold mb-4">Bitácora</h3>
                                <div className="w-full max-w-xs h-1 bg-yellow-400 mb-4"></div>

                                {bitacoraData.length === 0 
                                    ? <p className="text-gray-500 text-center">No hay registros en la bitácora.</p>
                                    : bitacoraData.map((item, index) => (
                                        <BitacoraFicha 
                                            key={index} 
                                            tipo={item.tipo} 
                                            observaciones={item.observaciones} 
                                            fecha={item.fecha}
                                            color={item.color || '#3CB9A5'}
                                        />
                                    ))
                                }

                                <Link 
                                    to={`/EventoCalendario/${alumnoData.matricula}`}
                                    className="flex items-center justify-center gap-2 mt-4 text-gray-800 font-bold hover:text-gray-900 transition-colors"
                                >
                                    <div className="p-1 rounded-full bg-yellow-400 shadow-md">
                                        <FaPlus className="w-5 h-5 text-white" /> 
                                    </div>
                                    <span className="text-lg">Registrar evento</span>
                                </Link>
                            </div>
                        </div>

                        {/* Gráfico de calificaciones e inasistencias */}
                        <div className="lg:w-2/5 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-800 text-center mb-4">
                                Semestre Feb – Ago 2025
                            </h3>
                            <p className="text-center text-gray-600 mb-6">Primer periodo</p>
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartDataVisual} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                                        <XAxis dataKey="subject" interval={0} angle={-30} textAnchor="end" height={50} style={{ fontSize: '10px' }} />
                                        <YAxis type="number" domain={[0, 100]} ticks={[0, 40, 80, 120, 160, 200]} />
                                        <Tooltip wrapperStyle={{ fontSize: '12px' }}/>
                                        <Legend payload={[
                                            { value: 'Promedios', type: 'square', color: '#FF8BCF' },
                                            { value: 'Inasistencias', type: 'square', color: '#FF8A00' }
                                        ]} wrapperStyle={{ marginTop: '15px' }} />
                                        <Bar dataKey="Promedios" fill="#FF8BCF" label={<CustomBarLabel />} barSize={10} isAnimationActive={false} />
                                        <Bar dataKey="Inasistencias" fill="#FF8A00" barSize={10} isAnimationActive={false} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                <style jsx>{`
                    @keyframes fadeIn { 
                        from { opacity: 0; transform: translateY(10px); } 
                        to { opacity: 1; transform: translateY(0); } 
                    }
                    .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
                `}</style>
            </main>
        </div>
    );
};

export default FichaAlumno;