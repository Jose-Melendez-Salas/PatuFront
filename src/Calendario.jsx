import React, { useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css' 
import logoImg from './assets/logo.png'
import iconCasita from './assets/casita.png'
import iconAlumnos from './assets/alumnos.png'
import iconAgenda from './assets/agenda.png'
import iconConfig from './assets/config.png'
import iconCerrarsesion from './assets/cerrarsesion.png'
import { FaPlus } from 'react-icons/fa'
import { useNavigate } from "react-router-dom";

const Calendario = ({ nombreUsuario }) => {
    const navigate = useNavigate();
    const [menuAbierto, setMenuAbierto] = useState(false)
    const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date())

    const toggleMenu = () => setMenuAbierto(!menuAbierto)

    const eventos = [
        {
            fecha: "2025-07-12",
            titulo: "Sesión de Tutorías",
            alumno: "Perez Ruiz Ignacio José",
            color: "border-blue-400 text-blue-500"
        },
        {
            fecha: "2025-07-15",
            titulo: "Examen complementario",
            alumno: "López Ruiz María Guadalupe",
            color: "border-orange-400 text-orange-500"
        }
    ]

    // Función para resaltar fechas con eventos
    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const isoDate = date.toISOString().split('T')[0]
            if (eventos.find(e => e.fecha === isoDate)) {
                return 'bg-yellow-200 rounded-full'
            }
            if (date.toDateString() === new Date().toDateString()) {
                return 'bg-blue-200 rounded-full'
            }
        }
        return null
    }

    return (
        <>
            {/* Navbar */}
            <header className="relative bg-[#4F3E9B] text-white flex items-center justify-between px-5 h-20">
                {/* Izquierda: hamburguesa + mensaje */}
                <div className="flex items-center gap-8">
                    {/* Hamburguesa */}
                    <div
                        className="flex flex-col justify-between w-8 h-6 cursor-pointer"
                        onClick={toggleMenu}
                    >
                        <span
                            className={`block h-1 w-full bg-white rounded transition-transform duration-300 ${menuAbierto ? 'translate-y-2 rotate-45' : ''}`}
                        />
                        <span
                            className={`block h-1 w-full bg-white rounded transition-opacity duration-300 ${menuAbierto ? 'opacity-0' : 'opacity-100'}`}
                        />
                        <span
                            className={`block h-1 w-full bg-white rounded transition-transform duration-300 ${menuAbierto ? '-translate-y-2 -rotate-45' : ''}`}
                        />
                    </div>
                    {/* Mensaje usuario */}
                    <div className="text-4xl font-bold">Agenda de {nombreUsuario}</div>
                </div>
                {/* Logo */}
                <div className="flex items-center gap-4 text-5xl font-bold">
                    PATU
                    <img src={logoImg} alt="Logo" className="w-12 h-12" />
                </div>
                {/* Menú desplegable */}
                <nav
                    className={`absolute top-20 left-0 w-72 h-[calc(100vh-80px)] bg-[#F7F4FF] p-5 flex-col gap-3 overflow-y-auto shadow-lg z-50 ${menuAbierto ? 'flex' : 'hidden'}`}
                >
                    <a
                        href="/AccesosMaestros"
                        className="flex items-center gap-2 text-black text-xl font-bold p-3 hover:bg-purple-100"
                    >
                        <img src={iconCasita} alt="Casita" className="w-9 h-9" />
                        Inicio
                    </a>
                    <a
                        href="/ListaAlumnos"
                        className="flex items-center gap-2 text-black text-xl font-bold p-3 hover:bg-purple-100"
                    >
                        <img src={iconAlumnos} alt="Alumnos" className="w-9 h-9" />
                        Alumnos
                    </a>
                    <a
                        href="/Calendario"
                        className="flex items-center gap-2 text-black text-xl font-bold p-3 hover:bg-purple-100"
                    >
                        <img src={iconAgenda} alt="Agenda" className="w-9 h-9" />
                        Agenda
                    </a>
                    <a
                        href="/configuracion"
                        className="flex items-center gap-2 text-black text-xl font-bold p-3 hover:bg-purple-100"
                    >
                        <img src={iconConfig} alt="Configuración" className="w-9 h-9" />
                        Configuración
                    </a>
                    <a
                        href="/login"
                        className="flex items-center gap-2 mt-auto text-black text-xl font-bold p-3 hover:bg-purple-100"
                    >
                        <img src={iconCerrarsesion} alt="Cerrar sesión" className="w-9 h-9 rotate-180" />
                        Cerrar sesión
                    </a>
                </nav>
            </header>

            {/* Contenido */}
            <main className="p-8 flex gap-6">
                {/* Calendario */}
                <div className="bg-white rounded-3xl shadow-lg p-6 flex-1">
                    <Calendar
                        onChange={setFechaSeleccionada}
                        value={fechaSeleccionada}
                        locale="es-ES"
                        tileClassName={tileClassName}
                    />
                </div>

                {/* Eventos */}
                <div className="bg-white rounded-3xl shadow-lg p-6 w-80 flex flex-col">
                    <h3 className="text-xl font-bold mb-4 border-b-4 border-yellow-400 pb-2">Eventos del mes:</h3>
                    {eventos.map((evento, idx) => (
                        <div key={idx} className={`border-2 rounded-xl p-4 mb-4 ${evento.color}`}>
                            <p className="text-sm font-bold">{evento.fecha}</p>
                            <h4 className="font-bold">{evento.titulo}</h4>
                            <p className="text-sm">Alumno: {evento.alumno}</p>
                            <a href="#" className="text-xs underline">Ver detalles</a>
                        </div>
                    ))}
                    <button
                        onClick={() => navigate("/EventoCalendario")}
                        className="mt-auto flex items-center justify-center gap-2 bg-yellow-400 text-black font-bold py-3 rounded-full shadow-md hover:bg-yellow-300"
                    >
                        <FaPlus /> Registrar evento
                    </button>
                </div>
            </main>

        </>
    )
}

export default Calendario
