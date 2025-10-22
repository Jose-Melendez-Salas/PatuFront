import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import Navbar from './Navbar.jsx';
import NoEncontrado from './assets/NoEncontrado.jpg';

const Mensajes = () => {
    const [mensajes, setMensajes] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMensajes = async () => {
            try {
                setLoading(true);
                setError(null);

                const usuarioGuardado = localStorage.getItem('usuario');
                if (!usuarioGuardado) {
                    setError('⚠️ No hay sesión activa. Inicia sesión de nuevo.');
                    setLoading(false);
                    return;
                }

                const usuario = JSON.parse(usuarioGuardado);
                const token = usuario.accessToken;

                // 🔹 Traemos los mensajes del alumno autenticado
                const res = await fetch(`https://apis-patu.onrender.com/api/reportes/alumno/${usuario.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!res.ok) throw new Error('Error al traer los mensajes.');

                const data = await res.json();
                console.log('📩 Mensajes recibidos:', data);

                setMensajes(data.data || []);
            } catch (err) {
                console.error('Error al traer los mensajes:', err);
                setError('❌ Error al cargar los mensajes.');
            } finally {
                setLoading(false);
            }
        };

        fetchMensajes();
    }, []);

    // 🔍 Filtrar mensajes por correo del maestro
    const mensajesFiltrados = mensajes.filter((msg) =>
        msg.correo_tutor?.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 animate-fadeIn">
            <Navbar />

            <main className="p-4 relative z-10">
                <div className="max-w-6xl mx-auto">
                    {/* 🟣 Título fijo */}
                    <div className="flex justify-between items-end mb-1">
                        <h2 className="text-3xl font-bold text-gray-800">Mensajes</h2>
                    </div>
                    <div className="w-full h-1 bg-yellow-400 mb-8"></div>

                    {/* 🔍 Buscador por correo */}
                    <div className="relative mb-6">
                        <input
                            type="text"
                            placeholder="Buscar por correo del tutor..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full p-4 pl-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm"
                        />
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* 📩 Estados */}
                    {loading && <p className="text-gray-600">Cargando mensajes...</p>}
                    {error && <p className="text-red-600">{error}</p>}

                    {/* 🚫 Sin mensajes */}
                    {!loading && !error && mensajesFiltrados.length === 0 && (
                        <div className="flex flex-col items-center text-center py-10">
                            <img
                                src={NoEncontrado}
                                alt="Sin mensajes"
                                className="w-64 mb-6 opacity-80"
                            />
                            <p className="text-lg font-semibold text-gray-700 mb-6">
                                No tienes mensajes de tus tutores aún.
                            </p>
                        </div>
                    )}

                    {/* ✅ Lista de mensajes */}
                    {!loading && mensajesFiltrados.length > 0 && (
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 divide-y divide-gray-200">
                            {mensajesFiltrados.map((msg, index) => (
                                <div
                                    key={index}
                                    className="p-5 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center"
                                >
                                    <div className="flex-1">
                                        <h4 className="text-xl font-semibold text-gray-800 mb-1">
                                            Tutor: {msg.nombre_tutor}
                                        </h4>
                                        <p className="text-sm text-gray-500 mb-2">
                                            Correo: {msg.correo_tutor}
                                        </p>
                                        <p className="text-gray-700 bg-gray-100 p-3 rounded-lg border border-gray-200">
                                            {msg.mensaje}
                                        </p>
                                    </div>
                                    <div className="text-sm text-gray-400 mt-2 sm:mt-0 sm:ml-4">
                                        📅 {new Date(msg.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <style>{`
                @keyframes fadeIn { 
                    from { opacity: 0; transform: translateY(10px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
                .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
            `}</style>
        </div>
    );
};

export default Mensajes;
