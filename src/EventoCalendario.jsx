import React, { useState } from 'react'
import Navbar from './Navbar'; // Importamos el navbar
import { FaSearch } from 'react-icons/fa';

const EventoCalendario = ({ nombreUsuario }) => {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [busqueda, setBusqueda] = useState('');

    const toggleMenu = () => setMenuAbierto(!menuAbierto);

    return (
        <>
            <Navbar />

            {/* Contenido principal */}
            <main className="p-8 flex flex-col items-center">
                <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-4xl border border-gray-200">
                    {/* Título */}
                    <h2 className="text-3xl font-bold mb-6 border-b-4 border-yellow-400 pb-3">
                        Nuevo evento
                    </h2>

                    {/* Campo Alumno */}
                    <div className="mb-6">
                        <label className="block text-xl font-bold mb-2">Alumno:</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                placeholder="Buscar alumno"
                                className="w-full p-4 pr-10 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-md"
                            />
                            <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    {/* Campo Tipo */}
                    <div className="mb-6">
                        <label className="block text-xl font-bold mb-2">Tipo</label>
                        <select className="w-full p-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-md text-gray-500">
                            <option value="">Selecciona ...</option>
                            <option value="tutoria">Tutoría</option>
                            <option value="examen">Examen</option>
                            <option value="trabajo">Trabajo</option>
                        </select>
                    </div>

                    {/* Fecha y Hora */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-xl font-bold mb-2">Fecha</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    className="w-full p-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-md"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xl font-bold mb-2">Hora</label>
                            <div className="relative">
                                <input
                                    type="time"
                                    className="w-full p-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-md"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Botón Guardar */}
                    <div className="flex justify-center">
                        <button className="bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white px-10 py-3 rounded-2xl font-bold text-lg shadow-md">
                            Guardar
                        </button>
                    </div>
                </div>
            </main>

        </>
    )
}

export default EventoCalendario
