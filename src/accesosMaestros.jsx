import React from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import Navbar from './Navbar'; // Importamos el navbar


const dataProblemas = [
    { name: 'Problemas Económicos', value: 60 },
    { name: 'Problemas familiares', value: 25 },
    { name: 'Problemas de Salud', value: 15 },
    { name: 'Falta de Motivación', value: 10 },
    { name: 'Otros', value: 10 },
];

const COLORS = ['#7C72FF', '#FF8888', '#4DD0E1', '#FFA500', '#666666'];

const eventos = [
    { hora: 'Hoy, 12:30', titulo: 'Sesión de Tutorías', alumno: 'Perez Ruiz Ignacio José', color: 'blue' },
    { hora: 'Hoy, 14:20', titulo: 'Examen complementario', alumno: 'López Ruiz María Guadalupe', color: 'orange' },
];

const EventoCard = ({ evento }) => (
    <div className={`p-4 rounded-xl border-4 shadow hover:shadow-xl hover:scale-[1.02] transition-all duration-200
        ${evento.color === 'blue' ? 'border-blue-400 bg-blue-50' : 'border-orange-400 bg-orange-50'}`}>
        <p className={`font-bold ${evento.color === 'blue' ? 'text-blue-500' : 'text-orange-500'}`}>
            {evento.hora}
        </p>
        <p className="font-semibold mt-1">{evento.titulo}</p>
        <p className="text-sm mt-1">Alumno: {evento.alumno}</p>
        <a href="#" className={`text-sm ${evento.color === 'blue' ? 'text-blue-500' : 'text-orange-500'} underline mt-2 inline-block`}>
            Ver detalles
        </a>
    </div>
);

const AccesosMaestros = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar /> {/* Usamos el navbar importado */}

            {/* Contenido principal */}
            <main className="p-5">
                {/* Encabezado compartido */}
                <div className="flex justify-between items-center border-b-6 border-yellow-400 pb-2 mb-5">
                    <h2 className="font-bold text-3xl">
                        Problemas Frecuentes de los alumnos
                    </h2>
                    <h2 className="font-bold text-3xl">
                        Próximos eventos
                    </h2>
                </div>

                {/* Contenedores debajo */}
                <div className="flex flex-col lg:flex-row gap-5">
                    {/* Izquierda: gráfico */}
                    <div className="bg-white rounded-xl shadow p-5 flex-[2]">
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={dataProblemas}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={90}
                                    outerRadius={160}
                                    paddingAngle={3}
                                    label
                                >
                                    {dataProblemas.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Derecha: próximos eventos */}
                    <div className="flex-1 flex flex-col gap-4">
                        {eventos.map((evento, idx) => (
                            <EventoCard key={idx} evento={evento} />
                        ))}
                        <a href="#" className="text-blue-500 underline mt-2">
                            Ver agenda completa
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AccesosMaestros;
