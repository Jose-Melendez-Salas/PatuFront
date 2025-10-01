import React, { useState, useEffect } from 'react';
import logoImg from './assets/logo.png';
import iconCasita from './assets/casita.png';
import iconAlumnos from './assets/alumnos.png';
import iconAgenda from './assets/agenda.png';
import iconConfig from './assets/config.png';
import iconCerrarsesion from './assets/cerrarsesion.png';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

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
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        // Leer usuario de localStorage al cargar la página
        const user = localStorage.getItem('usuario');
        if (user) setUsuario(JSON.parse(user));
    }, []);

    const toggleMenu = () => setMenuAbierto(!menuAbierto);

    const cerrarSesion = () => {
        localStorage.removeItem('usuario'); // limpiar sesión
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navbar */}
            <header className="relative bg-[#4F3E9B] text-white flex items-center justify-between px-5 h-20">
                <div className="flex items-center gap-8">
                    {/* Hamburguesa */}
                    <div
                        className="flex flex-col justify-between w-8 h-6 cursor-pointer"
                        onClick={toggleMenu}
                    >
                        <span className={`block h-1 w-full bg-white rounded transition-transform duration-300 ${menuAbierto ? 'translate-y-2 rotate-45' : ''}`} />
                        <span className={`block h-1 w-full bg-white rounded transition-opacity duration-300 ${menuAbierto ? 'opacity-0' : 'opacity-100'}`} />
                        <span className={`block h-1 w-full bg-white rounded transition-transform duration-300 ${menuAbierto ? '-translate-y-2 -rotate-45' : ''}`} />
                    </div>
                    {/* Saludo */}
                    <div className="text-3xl font-bold">
                        ¡Hola, {usuario ? usuario.nombre : 'Invitado'}!

                    </div>
                </div>

                {/* Logo */}
                <div className="flex items-center gap-4 text-4xl font-bold">
                    PATU
                    <img src={logoImg} alt="Logo" className="w-12 h-12" />
                </div>

                {/* Menú desplegable */}
                <nav className={`absolute top-20 left-0 w-72 h-[calc(100vh-80px)] bg-[#F7F4FF] p-5 flex-col gap-3 overflow-y-auto shadow-lg z-50 ${menuAbierto ? 'flex' : 'hidden'}`}>
                    <a href="/AccesosMaestros" className="flex items-center gap-2 text-black text-xl font-bold p-3 hover:bg-purple-100">
                        <img src={iconCasita} alt="Casita" className="w-9 h-9" />
                        Inicio
                    </a>
                    <a href="/ListaAlumnos" className="flex items-center gap-2 text-black text-xl font-bold p-3 hover:bg-purple-100">
                        <img src={iconAlumnos} alt="Alumnos" className="w-9 h-9" />
                        Alumnos
                    </a>
                    <a href="/Calendario" className="flex items-center gap-2 text-black text-xl font-bold p-3 hover:bg-purple-100">
                        <img src={iconAgenda} alt="Agenda" className="w-9 h-9" />
                        Agenda
                    </a>
                    <a href="/configuracion" className="flex items-center gap-2 text-black text-xl font-bold p-3 hover:bg-purple-100">
                        <img src={iconConfig} alt="Configuración" className="w-9 h-9" />
                        Configuración
                    </a>
                    <button onClick={cerrarSesion} className="flex items-center gap-2 mt-auto text-black text-xl font-bold p-3 hover:bg-purple-100 w-full text-left">
                        <img src={iconCerrarsesion} alt="Cerrar sesión" className="w-9 h-9 rotate-180" />
                        Cerrar sesión
                    </button>
                </nav>
            </header>

            {/* Contenido principal */}
            <main className="p-5 flex flex-col lg:flex-row gap-5">
                {/* Izquierda: gráfico */}
                <div className="bg-white rounded-xl shadow p-5 flex-1">
                    <h2 className="font-bold text-xl mb-3 border-b-4 border-yellow-400 pb-2">
                        Problemas Frecuentes en alumnos
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={dataProblemas}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
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
            </main>
        </div>
    );
};

export default AccesosMaestros;
