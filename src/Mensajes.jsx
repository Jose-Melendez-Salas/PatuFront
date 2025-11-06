import React, { useEffect, useState } from 'react';
import Navbar from './Navbar.jsx';
import { MailX } from 'lucide-react';
import { FaTrash } from 'react-icons/fa';

const Mensajes = () => {
    const [mensajes, setMensajes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [modal, setModal] = useState({ abierto: false, mensaje: '', tipo: '', onConfirm: null });

    const usuario = JSON.parse(localStorage.getItem('usuario'));

    useEffect(() => {
        const fetchMensajes = async () => {
            if (!usuario || !usuario.accessToken) {
                setError("Debes iniciar sesión primero.");
                setCargando(false);
                return;
            }

            try {
                const res = await fetch(
                    `https://apis-patu.onrender.com/api/reportes/alumno/${usuario.id}`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${usuario.accessToken}`
                        }
                    }
                );

                const data = await res.json();

                if (res.ok && data.success) {
                    setMensajes(data.data || []);
                } else {
                    setError(data.message || "No se pudieron obtener los mensajes.");
                    setMensajes([]);
                }
            } catch (err) {
                console.error(err);
                setError("Hubo un problema al cargar los mensajes.");
            } finally {
                setCargando(false);
            }
        };

        fetchMensajes();
    }, [usuario?.id, usuario?.accessToken]);

    const handleEliminar = (id) => {
        setModal({
            abierto: true,
            tipo: 'confirm',
            mensaje: '¿Estás seguro de que quieres eliminar este reporte?',
            onConfirm: async () => {
                if (!usuario || !usuario.accessToken) {
                    setModal({ abierto: true, tipo: 'error', mensaje: 'Debes iniciar sesión primero.' });
                    return;
                }

                try {
                    const res = await fetch(`https://apis-patu.onrender.com/api/reportes/eliminar/${id}`, {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${usuario.accessToken}` },
                    });

                    const data = await res.json();

                    if (res.ok && data.success) {
                        setMensajes(prev => prev.filter(msg => msg.id !== id));
                        setModal({ abierto: true, tipo: 'success', mensaje: 'Reporte eliminado correctamente.' });
                    } else {
                        setModal({ abierto: true, tipo: 'error', mensaje: `No se pudo eliminar: ${data.message || "Error desconocido"}` });
                    }
                } catch (err) {
                    console.error(err);
                    setModal({ abierto: true, tipo: 'error', mensaje: 'Error al conectar con el servidor.' });
                }
            }
        });
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return "";
        if (fecha.includes('T') && fecha.includes('Z')) {
            const date = new Date(fecha);
            return date.toLocaleDateString('es-MX', {
                timeZone: 'America/Mexico_City',
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
        }
        return fecha;
    };

    return (
        <div className="min-h-screen bg-gray-50 animate-fadeIn relative">
            <Navbar />

            <main className="p-4 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Mensajes</h2>
                    <div className="w-full h-1 bg-yellow-400 mb-8"></div>

                    {cargando ? (
                        <div className="flex flex-col items-center text-center py-10 text-gray-500">
                            <MailX className="w-20 h-20 mb-4 animate-pulse" style={{ color: '#4F3E9B' }} />
                            <p className="text-lg font-semibold">Cargando mensajes...</p>
                        </div>
                    ) : error ? (
                        <p className="text-center text-red-500 py-10">{error}</p>
                    ) : mensajes.length === 0 ? (
                        <div className="flex flex-col items-center text-center py-10 text-gray-500">
                            <MailX className="w-20 h-20 mb-4" style={{ color: '#4F3E9B' }} />
                            <p className="text-lg font-semibold">
                                No tienes reportes de tu tutor aún.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 divide-y divide-gray-200">
                            {mensajes.map((msg) => (
                                <div key={msg.id} className="p-5 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                    <div className="flex-1 w-full">
                                        <p className="text-sm text-gray-400 mb-1">📅 {formatearFecha(msg.fecha_generacion)}</p>
                                        <p className="text-sm font-bold mb-2" style={{ color: '#4F3E9B' }}>{msg.correo_tutor}</p>
                                        <p className="text-gray-700 bg-gray-100 p-3 rounded-lg border border-gray-200">{msg.contenido}</p>
                                    </div>
                                    <button
                                        onClick={() => handleEliminar(msg.id)}
                                        className="text-gray-400 hover:text-red-600 mt-3 sm:mt-0 sm:ml-4 transition-transform hover:scale-110"
                                        title="Eliminar mensaje"
                                    >
                                        <FaTrash className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Modal sin fondo negro */}
            {modal.abierto && (
                <div className="absolute inset-0 flex items-center justify-center z-50">
                    <div className="bg-white border border-gray-300 rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
                        <p
                            className={`mb-6 text-lg font-semibold ${modal.tipo === 'error'
                                ? 'text-red-600'
                                : modal.tipo === 'success'
                                    ? 'text-green-600'
                                    : 'text-gray-800'
                                }`}
                        >
                            {modal.mensaje}
                        </p>

                        {modal.tipo === 'confirm' ? (
                            <div className="flex justify-center gap-4">
                                <button
                                    className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
                                    onClick={() => { modal.onConfirm(); setModal({ abierto: false }); }}
                                >
                                    Sí
                                </button>
                                <button
                                    className="px-4 py-2 bg-gray-300 rounded-xl hover:bg-gray-400"
                                    onClick={() => setModal({ abierto: false })}
                                >
                                    No
                                </button>
                            </div>
                        ) : (
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                                onClick={() => setModal({ abierto: false })}
                            >
                                Cerrar
                            </button>
                        )}
                    </div>
                </div>
            )}

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
