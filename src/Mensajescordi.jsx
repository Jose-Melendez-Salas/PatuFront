import React, { useEffect, useState } from 'react';
import Navbar from './Navbar.jsx';
import { MailX, CheckCircle } from 'lucide-react';
import { FaTrash } from 'react-icons/fa';

const MensajesCordi = () => {
    const [mensajes, setMensajes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [modal, setModal] = useState({ abierto: false, mensaje: '', tipo: '', onConfirm: null });
    const [filtroCorreo, setFiltroCorreo] = useState('');

    // Simulación de mensajes sin backend
    useEffect(() => {
        const mockMensajes = [
            {
                id: 1,
                nombre: 'Juan Pérez',
                correo: 'juan@mail.com',
                asunto: 'Solicitud de información',
                mensaje: 'Hola coordinador, necesito que me agregue al grupo del tutor Roberto.',
                fecha_envio: '2025-11-04T20:00:00Z',
                recibido: false
            },
            {
                id: 2,
                nombre: 'María López',
                correo: 'maria@mail.com',
                asunto: 'Duda sobre entrega',
                mensaje: 'Está mal escrito mi nombre.',
                fecha_envio: '2025-11-03T18:30:00Z',
                recibido: true
            },
            {
                id: 3,
                nombre: 'Carlos Sánchez',
                correo: 'carlos@mail.com',
                asunto: 'Petición de reunión',
                mensaje: 'Puede modificar mi horario de tutorías?',
                fecha_envio: '2025-11-02T10:15:00Z',
                recibido: false
            }
        ];

        // Simular carga de mensajes
        setTimeout(() => {
            setMensajes(mockMensajes);
            setCargando(false);
        }, 500);
    }, []);

    // Marcar como recibido (simulado)
    const handleMarcarRecibido = (id) => {
        setMensajes(prev => prev.map(m => m.id === id ? { ...m, recibido: true } : m));
        setModal({ abierto: true, tipo: 'success', mensaje: 'Se ha marcado como recibido (simulado).' });
    };

    // Eliminar mensaje (simulado)
    const handleEliminar = (id) => {
        setModal({
            abierto: true,
            tipo: 'confirm',
            mensaje: '¿Estás seguro de que quieres eliminar este mensaje?',
            onConfirm: () => {
                setMensajes(prev => prev.filter(msg => msg.id !== id));
                setModal({ abierto: true, tipo: 'success', mensaje: 'Mensaje eliminado correctamente (simulado).' });
            }
        });
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return "";
        const date = new Date(fecha);
        return date.toLocaleDateString('es-MX', {
            timeZone: 'America/Mexico_City',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 animate-fadeIn relative">
            <Navbar />

            <main className="p-4 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Mensajes</h2>
                    <div className="w-full h-1 bg-yellow-400 mb-4"></div>

                    {/* Input para filtrar por correo */}
                    <input
                        type="text"
                        placeholder="Buscar por correo..."
                        value={filtroCorreo}
                        onChange={(e) => setFiltroCorreo(e.target.value)}
                        className="mb-6 p-3 border border-gray-300 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />

                    {cargando ? (
                        <div className="flex flex-col items-center text-center py-10 text-gray-500">
                            <MailX className="w-20 h-20 mb-4 animate-pulse" style={{ color: '#4F3E9B' }} />
                            <p className="text-lg font-semibold">Cargando mensajes...</p>
                        </div>
                    ) : mensajes.filter(msg => msg.correo.toLowerCase().includes(filtroCorreo.toLowerCase())).length === 0 ? (
                        <div className="flex flex-col items-center text-center py-10 text-gray-500">
                            <MailX className="w-20 h-20 mb-4" style={{ color: '#4F3E9B' }} />
                            <p className="text-lg font-semibold">
                                No hay mensajes que coincidan con el filtro.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 divide-y divide-gray-200">
                            {mensajes
                                .filter(msg => msg.correo.toLowerCase().includes(filtroCorreo.toLowerCase()))
                                .map((msg) => (
                                    <div key={msg.id} className="p-5 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                        <div className="flex-1 w-full">
                                            <p className="text-sm text-gray-400 mb-1">📅 {formatearFecha(msg.fecha_envio)}</p>
                                            <p className="text-sm font-bold" style={{ color: '#4F3E9B' }}>
                                                {msg.nombre} - {msg.correo}
                                            </p>
                                            <p className="text-gray-700 font-semibold mt-2">Asunto: {msg.asunto}</p>
                                            <p className="text-gray-700 bg-gray-100 p-3 rounded-lg border border-gray-200 mt-2">{msg.mensaje}</p>
                                        </div>

                                        <div className="flex gap-3 mt-3 sm:mt-0 sm:ml-4">
                                            {!msg.recibido ? (
                                                <button
                                                    onClick={() => handleMarcarRecibido(msg.id)}
                                                    className="flex items-center px-3 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all"
                                                    title="Marcar como recibido"
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1" /> Recibido
                                                </button>
                                            ) : (
                                                <span className="flex items-center text-green-600 font-semibold">
                                                    <CheckCircle className="w-4 h-4 mr-1" /> Recibido
                                                </span>
                                            )}
                                            <button
                                                onClick={() => handleEliminar(msg.id)}
                                                className="text-gray-400 hover:text-red-600 transition-transform hover:scale-110"
                                                title="Eliminar mensaje"
                                            >
                                                <FaTrash className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Modal */}
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

export default MensajesCordi;
