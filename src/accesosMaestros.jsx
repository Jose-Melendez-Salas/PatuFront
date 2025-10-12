import React from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import { UserCheck, FileText } from 'lucide-react';
import Navbar from './Navbar'; // Importamos el navbar

const dataProblemas = [
    { name: 'Problemas Económicos', value: 60 },
    { name: 'Problemas familiares', value: 25 },
    { name: 'Problemas de Salud', value: 15 },
    { name: 'Falta de Motivación', value: 10 },
    { name: 'Otros', value: 10 },
];

const COLORS = ['#7C72FF', '#FF8888', '#4DD0E1', '#FFA500', '#666666'];

// Calculamos el total dinámicamente
const totalAlumnos = dataProblemas.reduce((sum, item) => sum + item.value, 0);

const eventos = [
    { hora: 'Hoy, 12:30', titulo: 'Sesión de Tutorías', alumno: 'Perez Ruiz Ignacio José', color: 'blue' },
    { hora: 'Hoy, 14:20', titulo: 'Examen complementario', alumno: 'López Ruiz María Guadalupe', color: 'orange' },
];

const EventoCard = ({ evento }) => {
    const Icono = evento.titulo.includes('Tutoría') ? UserCheck : FileText;

    return (
        <div className={`p-4 rounded-xl border-4 shadow hover:shadow-xl hover:scale-[1.02] transition-all duration-200
            ${evento.color === 'blue' ? 'border-blue-400 bg-blue-50' : 'border-orange-400 bg-orange-50'}`}>
            <div className="flex items-center gap-4">
                <Icono className={`w-20 h-20 flex-shrink-0 ${evento.color === 'blue' ? 'text-blue-500' : 'text-orange-500'}`} />
                <div className="flex flex-col">
                    <p className={`font-bold ${evento.color === 'blue' ? 'text-blue-500' : 'text-orange-500'}`}>
                        {evento.hora}
                    </p>
                    <p className="font-semibold mt-1">{evento.titulo}</p>
                    <p className="text-sm mt-1">Alumno: {evento.alumno}</p>
                    <a href="#" className={`text-sm ${evento.color === 'blue' ? 'text-blue-500' : 'text-orange-500'} underline mt-2 inline-block`}>
                        Ver detalles
                    </a>
                </div>
            </div>
        </div>
    );
};

const AccesosMaestros = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <main className="p-5">
                <div className="flex flex-col lg:flex-row justify-between items-center border-b-6 border-yellow-400 pb-2 mb-5 text-center lg:text-left gap-2">

                    <h2 className="font-bold text-3xl">Problemas Frecuentes de los alumnos</h2>
                    <h2 className="font-bold text-3xl">Próximos eventos</h2>
                </div>

                <div className="flex flex-col lg:flex-row gap-5">
                    {/* Izquierda: gráfico */}
                    <div className="bg-white rounded-xl shadow p-5 flex-[2] min-h-[400px] sm:min-h-[500px]">

                        <ResponsiveContainer width="100%" height={500}>
                            <PieChart>
                                <Pie
                                    data={dataProblemas}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="40%"
                                    outerRadius="70%"
                                    paddingAngle={3}
                                    labelLine={true} // líneas hacia afuera
                                    label={({ value }) => value} // muestra el valor al final de la línea
                                >
                                    {dataProblemas.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>

                                {/* Total en el centro */}
                                <text
                                    x="50%"
                                    y="50%"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    style={{
                                        fontWeight: 'bold',
                                        fontSize: window.innerWidth < 640 ? '12px' : '16px',
                                    }}
                                >
                                    {totalAlumnos} Alumnos
                                </text>

                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Derecha: próximos eventos */}
                    <div className="flex-1 flex flex-col gap-4">
                        {eventos.map((evento, idx) => (
                            <EventoCard key={idx} evento={evento} />
                        ))}
                        <a href="/Calendario" className="text-blue-500 underline mt-2 text-xl text-right">
                            Ver agenda completa
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AccesosMaestros;
