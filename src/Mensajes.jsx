import React, { useEffect, useState } from 'react';
import Navbar from './Navbar.jsx';
import { 
  MailX, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  CalendarDays, 
  User, 
  Mail,
  Clock,
  ChevronRight,
  Filter,
  Search
} from 'lucide-react';
import { FaTrash, FaExclamationTriangle, FaRegEnvelope, FaRegCalendarAlt } from 'react-icons/fa';

const Mensajes = () => {
    const [mensajes, setMensajes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [modal, setModal] = useState({ abierto: false, mensaje: '', tipo: '', onConfirm: null });
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredMessages, setFilteredMessages] = useState([]);
    const [animationClass, setAnimationClass] = useState('');
    
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    useEffect(() => {
        const fetchMensajes = async () => {
            if (!usuario || !usuario.accessToken) {
                setError("Debes iniciar sesión primero.");
                setCargando(false);
                return;
            }

            try {
                setAnimationClass('animate-pulse');
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
                    setFilteredMessages(data.data || []);
                    setError(null);
                } else {
                    if (data.message?.includes("no") || data.data?.length === 0) {
                        setMensajes([]);
                        setFilteredMessages([]);
                        setError(null);
                    } else {
                        setError(data.message || "No se pudieron obtener los mensajes.");
                        setMensajes([]);
                        setFilteredMessages([]);
                    }
                }

            } catch (err) {
                console.error(err);
                setError("Hubo un problema al cargar los mensajes.");
            } finally {
                setCargando(false);
                setTimeout(() => setAnimationClass(''), 500);
            }
        };

        fetchMensajes();
    }, [usuario?.id, usuario?.accessToken]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredMessages(mensajes);
        } else {
            const filtered = mensajes.filter(msg =>
                msg.contenido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                msg.correo_tutor?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredMessages(filtered);
        }
    }, [searchTerm, mensajes]);

    const handleEliminar = (id) => {
        const messageToDelete = mensajes.find(msg => msg.id === id);
        setSelectedMessage(messageToDelete);
        
        setModal({
            abierto: true,
            tipo: 'confirm',
            mensaje: '¿Estás seguro de que quieres eliminar este reporte?',
            onConfirm: async () => {
                if (!usuario || !usuario.accessToken) {
                    setModal({ 
                        abierto: true, 
                        tipo: 'error', 
                        mensaje: 'Debes iniciar sesión primero.' 
                    });
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
                        setFilteredMessages(prev => prev.filter(msg => msg.id !== id));
                        setModal({ 
                            abierto: true, 
                            tipo: 'success', 
                            mensaje: '✓ Reporte eliminado correctamente.' 
                        });
                        setTimeout(() => {
                            setModal({ abierto: false });
                        }, 1500);
                    } else {
                        setModal({ 
                            abierto: true, 
                            tipo: 'error', 
                            mensaje: `❌ No se pudo eliminar: ${data.message || "Error desconocido"}` 
                        });
                    }
                } catch (err) {
                    console.error(err);
                    setModal({ 
                        abierto: true, 
                        tipo: 'error', 
                        mensaje: '❌ Error al conectar con el servidor.' 
                    });
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
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        return fecha;
    };

    const getTimeAgo = (fecha) => {
        if (!fecha) return '';
        const now = new Date();
        const messageDate = new Date(fecha);
        const diffMs = now - messageDate;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `Hace ${diffDays} días`;
        if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
        return `Hace ${Math.floor(diffDays / 30)} meses`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 animate-fadeIn relative">
            <Navbar />
            
            <main className="pt-24 px-4 sm:px-6 md:px-8 lg:px-20 pb-8">
                {/* Header con título y estadísticas */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg">
                                    <Mail className="w-6 h-6 text-white" />
                                </div>
                                Mis Reportes
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Reportes enviados por tu tutor/profesor
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">{mensajes.length}</div>
                                <div className="text-xs text-gray-500">Total</div>
                            </div>
                        </div>
                    </div>

                    <div className="h-1 w-24 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full"></div>
                </div>



                {/* Contenido principal */}
                {cargando ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="relative mb-6">
                            <div className="w-24 h-24 border-4 border-[#E9DBCD] border-t-[#E4CD87] rounded-full animate-spin"></div>
                            <Mail className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-black-600 animate-pulse" />
                        </div>
                        <p className="text-lg font-semibold text-gray-700 mb-2">Cargando reportes...</p>
                        <p className="text-gray-500">Estamos obteniendo tus mensajes</p>
                    </div>
                ) : error ? (
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-8 text-center animate-shake">
                        <div className="flex flex-col items-center">
                            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                            <p className="text-red-600 text-lg font-semibold mb-2">¡Ups! Algo salió mal</p>
                            <p className="text-red-500">{error}</p>
                            <button 
                                onClick={() => window.location.reload()}
                                className="mt-4 px-6 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors"
                            >
                                Reintentar
                            </button>
                        </div>
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="flex flex-col items-center text-center py-16 animate-fadeIn">
                        <div className="relative mb-6">
                            <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
                                <MailX className="w-20 h-20 text-purple-400" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center animate-bounce">
                                <span className="text-white font-bold">!</span>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-700 mb-2">
                            {searchTerm ? 'No hay resultados' : 'No tienes reportes aún'}
                        </h3>
                        <p className="text-gray-500 max-w-md">
                            {searchTerm 
                                ? 'No encontramos reportes que coincidan con tu búsqueda.'
                                : 'Tu tutor aún no ha enviado ningún reporte. Los reportes aparecerán aquí cuando sean generados.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredMessages.map((msg, index) => (
                            <div 
                                key={msg.id} 
                                className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.005] animate-slideDown`}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Header del mensaje */}
                                <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
                                                <User className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 flex items-center gap-2">
                                                    {msg.correo_tutor}
                                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                                        Tutor
                                                    </span>
                                                </p>
                                                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <FaRegCalendarAlt className="w-3 h-3" />
                                                        {formatearFecha(msg.fecha_generacion)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {getTimeAgo(msg.fecha_generacion)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <button
                                            onClick={() => handleEliminar(msg.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 transition-all duration-300 hover:scale-110 hover:bg-red-50 rounded-full group relative"
                                            title="Eliminar reporte"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                Eliminar
                                            </div>
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Contenido del mensaje */}
                                <div className="p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full animate-pulse"></div>
                                        <span className="text-sm font-semibold text-gray-600">CONTENIDO DEL REPORTE:</span>
                                    </div>
                                    <p className="text-gray-700 bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-100 leading-relaxed">
                                        {msg.contenido}
                                    </p>
                                    
                                    {/* Metadata */}
                                    <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-500">ID: {msg.id}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span className="text-sm text-gray-500">Recibido</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Indicador de resultados */}
                {filteredMessages.length > 0 && (
                    <div className="mt-6 text-center text-gray-500 text-sm">
                        Mostrando {filteredMessages.length} de {mensajes.length} reportes
                    </div>
                )}
            </main>

            {/* Modal mejorado */}
            {modal.abierto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
                    <div 
                        className={`bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 ${modal.tipo === 'confirm' ? 'scale-100' : 'scale-95'}`}
                    >
                        {/* Header del modal */}
                        <div className={`p-6 rounded-t-2xl ${
                            modal.tipo === 'confirm' ? 'bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100' :
                            modal.tipo === 'error' ? 'bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-100' :
                            'bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-full ${
                                    modal.tipo === 'confirm' ? 'bg-red-100' :
                                    modal.tipo === 'error' ? 'bg-red-100' :
                                    'bg-green-100'
                                }`}>
                                    {modal.tipo === 'confirm' && <AlertCircle className="w-6 h-6 text-red-600" />}
                                    {modal.tipo === 'error' && <FaExclamationTriangle className="w-6 h-6 text-red-600" />}
                                    {modal.tipo === 'success' && <CheckCircle className="w-6 h-6 text-green-600" />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">
                                        {modal.tipo === 'confirm' ? 'Confirmar eliminación' :
                                         modal.tipo === 'error' ? 'Error' : 'Éxito'}
                                    </h3>
                                    {selectedMessage && modal.tipo === 'confirm' && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            De: {selectedMessage.correo_tutor}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Contenido del modal */}
                        <div className="p-6">
                            <p className={`text-lg mb-6 text-center ${
                                modal.tipo === 'confirm' ? 'text-gray-700' :
                                modal.tipo === 'error' ? 'text-red-600' :
                                'text-green-600'
                            }`}>
                                {modal.mensaje}
                            </p>

                            {modal.tipo === 'confirm' ? (
                                <div className="flex gap-3">
                                    <button
                                        className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                                        onClick={() => { 
                                            modal.onConfirm(); 
                                            setModal({ abierto: false });
                                        }}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                        Sí, eliminar
                                    </button>
                                    <button
                                        className="flex-1 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-bold hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                        onClick={() => setModal({ abierto: false })}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                    onClick={() => setModal({ abierto: false })}
                                >
                                    {modal.tipo === 'success' ? '✓ Entendido' : 'Cerrar'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Estilos CSS para animaciones */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { 
                        opacity: 0; 
                        transform: translateY(20px) scale(0.98); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0) scale(1); 
                    }
                }
                
                @keyframes slideDown {
                    from { 
                        opacity: 0; 
                        transform: translateY(-10px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0); 
                    }
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
                
                .animate-slideDown {
                    animation: slideDown 0.3s ease-out;
                }
                
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
                
                /* Personalización del scrollbar */
                ::-webkit-scrollbar {
                    width: 8px;
                }
                
                ::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                
                ::-webkit-scrollbar-thumb {
                    background: linear-gradient(to bottom, #8B5CF6, #6366F1);
                    border-radius: 10px;
                }
                
                ::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(to bottom, #7C3AED, #4F46E5);
                }
            `}</style>
        </div>
    );
};

export default Mensajes;