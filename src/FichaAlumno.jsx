import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    Tooltip, 
    Legend, 
    ResponsiveContainer 
} from "recharts";
import { FaPlus } from 'react-icons/fa'; // Usaremos FaPlus y lo estilizaremos
import AccesosMaestros from './accesosMaestros'; // Tu layout con header y barra lateral

// --- Componente para una Ficha de Bitácora (¡Ajustado al Prototipo!) ---
const BitacoraFicha = ({ tipo, observaciones, fecha, color }) => (
    // Estilos ahora usan el color como borde completo y redondeado.
    <div 
        className={`p-4 mb-4 rounded-xl shadow-md transition-shadow hover:shadow-lg`}
        style={{ border: `2px solid ${color}` }} // Borde sólido de color
    >
        <div className="flex justify-between items-start mb-1">
            {/* Título en negrita */}
            <h4 className="font-bold text-base text-gray-800">{tipo}</h4>
            {/* Fecha alineada a la derecha */}
            <span className="text-xs text-gray-500 whitespace-nowrap" style={{ color: color }}>{fecha}</span>
        </div>
        <p className="text-sm mt-1">
            <span className="font-semibold">Observaciones:</span> {observaciones}
        </p>
    </div>
);

// --- Componente principal FichaAlumno ---
const FichaAlumno = () => {
    // NOTA: Se usa useParams() para simular la obtención de la matrícula de la URL.
    const { matricula } = useParams();
    const nombreUsuario = "Juan";

    // 1. Datos del Alumno (Estáticos)
    const alumnoData = {
        nombre: "Su Jefa Ortíz de Dominguez",
        matricula: matricula || "2201F0654",
        carrera: "Ingeniería en sistemas computacionales",
        semestre: "7°"
    };

    // 2. Datos de Bitácora (Estáticos)
    const bitacoraData = [
        { 
            tipo: "Sesión de Tutorías", 
            observaciones: "Problemas económicos", 
            fecha: "12 de Febrero 2025", 
            color: '#3CB9A5' // Verde Agua (Color del primer prototipo)
        },
        { 
            tipo: "Examen Complementario", 
            observaciones: "Calificación pendiente", 
            fecha: "15 de Febrero, 2025", 
            color: '#00A99D' // Turquesa/Teal (Color del segundo prototipo)
        },
    ];

    // 3. Datos del Gráfico (Estáticos, ajustados para el prototipo)
    const chartDataVisual = [
        { subject: 'Inglés', Promedios: 86, Inasistencias: 5 },
        { subject: 'POO', Promedios: 89, Inasistencias: 2 },
        { subject: 'GPS', Promedios: 85, Inasistencias: 3 },
        { subject: 'Taller investigación', Promedios: 94, Inasistencias: 2 },
        { subject: 'Taller Bases de datos', Promedios: 72, Inasistencias: 4 },
        { subject: 'Física', Promedios: 76, Inasistencias: 2 },
        { subject: 'Cálculo Integral', Promedios: 79, Inasistencias: 3 },
        { subject: 'Simulación', Promedios: 100, Inasistencias: 3 },
    ];
    
    // Custom Label para mostrar el valor sobre la barra (como en el prototipo)
    const CustomBarLabel = ({ x, y, width, value }) => (
        <text x={x + width / 2} y={y} dy={-8} fill="#4F3E9B" fontSize={12} textAnchor="middle">
            {value}
        </text>
    );

    return (
        <>
            {/* Header y barra lateral (Para demostración) */}
            <AccesosMaestros nombreUsuario={nombreUsuario} />
            <style jsx>{`main { display: none; }`}</style>

            {/* Contenido principal: Ficha del Alumno */}
            <div className="min-h-full bg-gray-50 p-4 md:p-8 animate-fadeIn pt-4 md:pt-4">
                
                {/* Título y Separador */}
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Ficha del alumno</h2>
                <div className="w-100% max-w-4xl h-1 bg-yellow-400 mb-8"></div>

                {/* Contenedor Principal: 2 Columnas (Info/Bitácora y Gráfico) */}
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* COLUMNA IZQUIERDA: Info del Alumno y Bitácora (60% de ancho en desktop) */}
                    <div className="lg:w-3/5 flex flex-col gap-8">
                        
                        {/* 2. Información General del Alumno */}
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                            <h3 className="text-2xl font-bold mb-3">{alumnoData.nombre}</h3>
                            <p className="text-lg"><span className="font-semibold">Matrícula:</span> {alumnoData.matricula}</p>
                            <p className="text-lg"><span className="font-semibold">Carrera:</span> {alumnoData.carrera}</p>
                            <p className="text-lg"><span className="font-semibold">Semestre:</span> {alumnoData.semestre}°</p>
                        </div>
                        
                        {/* 3. Sección Bitácora */}
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col">
                            <h3 className="text-2xl font-bold mb-4">Bitácora</h3>
                            <div className="w-full max-w-xs h-1 bg-yellow-400 mb-4"></div>
                            
                            {/* Fichas de Eventos de Bitácora */}
                            {bitacoraData.map((item, index) => (
                                <BitacoraFicha 
                                    key={index} 
                                    tipo={item.tipo} 
                                    observaciones={item.observaciones} 
                                    fecha={item.fecha}
                                    color={item.color}
                                />
                            ))}
                            
                            {/* CTA de Registro con icono circular amarillo */}
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

                    {/* COLUMNA DERECHA: Gráfico de Rendimiento (40% de ancho en desktop) */}
                    <div className="lg:w-2/5 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <h3 className="text-xl font-bold text-gray-800 text-center mb-4">
                            Semestre Feb – Ago 2025
                        </h3>
                        <p className="text-center text-gray-600 mb-6">Primer periodo</p>

                        {/* 4. Contenedor del Gráfico de Barras */}
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

                                    {/* Barras: Promedios (Rosado) y Inasistencias (Naranja) */}
                                    <Bar 
                                        dataKey="Promedios" 
                                        fill="#FF8BCF" // Rosado
                                        label={<CustomBarLabel />}
                                        barSize={10} 
                                        isAnimationActive={false} 
                                    />
                                    <Bar 
                                        dataKey="Inasistencias" 
                                        fill="#FF8A00" // Naranja
                                        barSize={10} 
                                        isAnimationActive={false} 
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Estilos de animación heredados */}
                <style jsx>{`
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                    .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
                `}</style>
            </div>
        </>
    );
};

export default FichaAlumno;

