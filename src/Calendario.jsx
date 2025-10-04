import React, { useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css' // Estilos base del calendario
import Navbar from './Navbar'
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

            <Navbar />
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
