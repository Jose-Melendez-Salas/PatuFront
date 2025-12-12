import React, { useEffect, useState } from 'react';
import Navbar from './Navbar.jsx';
import { 
  MailX, 
  CheckCircle, 
  Trash2, 
  AlertCircle, 
  Filter, 
  Search, 
  User, 
  Mail, 
  Calendar, 
  Clock,
  Eye,
  EyeOff,
  Download,
  RefreshCw
} from 'lucide-react';
import { FaTrash, FaPaperclip, FaRegCheckCircle, FaRegCircle } from 'react-icons/fa';

const MensajesCordi = () => {
    const [mensajes, setMensajes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [modal, setModal] = useState({ abierto: false, mensaje: '', tipo: '', onConfirm: null });
    const [filtroCorreo, setFiltroCorreo] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({ total: 0, unread: 0, today: 0 });

    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const token = usuario?.accessToken;

    // 📨 Cargar mensajes reales desde el backend
    useEffect(() => {
        obtenerMensajes();
    }, [token]);

    const obtenerMensajes = async () => {
        try {
            setRefreshing(true);
            if (!token) {
                setModal({
                    abierto: true,
                    tipo: 'error',
                    mensaje: ' No se encontró el token. Inicia sesión nuevamente.'
                });
                setCargando(false);
                setRefreshing(false);
                return;
            }

            const respuesta = await fetch('https://apis-patu.onrender.com/api/mensajes', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            if (!respuesta.ok) throw new Error('Error al obtener los mensajes.');

            const data = await respuesta.json();
            const mensajesData = data.data || data;
            setMensajes(mensajesData);
            
            // Calcular estadísticas
            const unreadCount = mensajesData.filter(msg => !msg.recibido).length;
            const today = new Date().toISOString().split('T')[0];
            const todayCount = mensajesData.filter(msg => 
                msg.fecha_envio && msg.fecha_envio.split('T')[0] === today
            ).length;
            
            setStats({
                total: mensajesData.length,
                unread: unreadCount,
                today: todayCount
            });
            
        } catch (error) {
            setModal({ 
                abierto: true, 
                tipo: 'error', 
                mensaje: `❌ ${error.message}` 
            });
        } finally {
            setCargando(false);
            setRefreshing(false);
        }
    };

    // ✅ Marcar mensaje como recibido
    const handleMarcarRecibido = async (id) => {
        try {
            const respuesta = await fetch(`https://apis-patu.onrender.com/api/mensajes/actualizar/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ recibido: true })
            });

            if (!respuesta.ok) throw new Error('No se pudo marcar como recibido.');

            setMensajes(prev =>
                prev.map(m => (m.id === id ? { ...m, recibido: true } : m))
            );

            setStats(prev => ({ ...prev, unread: prev.unread - 1 }));

            setModal({ 
                abierto: true, 
                tipo: 'success', 
                mensaje: '✓ Mensaje marcado como recibido.' 
            });
            
            setTimeout(() => {
                setModal({ abierto: false });
            }, 1500);
        } catch (error) {
            setModal({ 
                abierto: true, 
                tipo: 'error', 
                mensaje: `❌ ${error.message}` 
            });
        }
    };

    // 🗑️ Eliminar mensaje
    const handleEliminar = (id) => {
        const messageToDelete = mensajes.find(msg => msg.id === id);
        setSelectedMessage(messageToDelete);
        
        setModal({
            abierto: true,
            tipo: 'confirm',
            mensaje: '¿Estás seguro de que quieres eliminar este mensaje?',
            onConfirm: async () => {
                try {
                    const respuesta = await fetch(`https://apis-patu.onrender.com/api/mensajes/eliminar/${id}`, {
                        method: 'DELETE',
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });

                    if (!respuesta.ok) throw new Error('No se pudo eliminar el mensaje.');

                    setMensajes(prev => prev.filter(msg => msg.id !== id));
                    setStats(prev => ({ 
                        ...prev, 
                        total: prev.total - 1,
                        unread: messageToDelete?.recibido ? prev.unread : prev.unread - 1
                    }));
                    
                    setModal({ 
                        abierto: true, 
                        tipo: 'success', 
                        mensaje: '🗑️ Mensaje eliminado correctamente.' 
                    });
                    
                    setTimeout(() => {
                        setModal({ abierto: false });
                    }, 1500);
                    
                } catch (error) {
                    setModal({ 
                        abierto: true, 
                        tipo: 'error', 
                        mensaje: `❌ ${error.message}` 
                    });
                }
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
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeAgo = (fecha) => {
        if (!fecha) return '';
        const now = new Date();
        const messageDate = new Date(fecha);
        const diffMs = now - messageDate;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHours < 24) return `Hace ${diffHours} h`;
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `Hace ${diffDays} días`;
        return `Hace ${Math.floor(diffDays / 7)} sem`;
    };

    const filteredMessages = mensajes.filter(msg => 
        msg.correo?.toLowerCase().includes(filtroCorreo.toLowerCase()) ||
        msg.nombre?.toLowerCase().includes(filtroCorreo.toLowerCase()) ||
        msg.asunto?.toLowerCase().includes(filtroCorreo.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 animate-fadeIn">
            <Navbar />
            
            <main className="pt-24 px-4 sm:px-6 md:px-8 lg:px-20 pb-8">
                {/* Header con estadísticas */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-[#C7952C] to-[#E4CD87] rounded-lg">
                                    <Mail className="w-6 h-6 text-white" />
                                </div>
                                Mensajes Recibidos
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Gestión de mensajes del sistema
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button
                                onClick={obtenerMensajes}
                                className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                                title="Actualizar mensajes"
                            >
                                <RefreshCw className={`w-5 h-5 text-[#C7952C] ${refreshing ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                    
                    {/* Tarjetas de estadísticas */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-700 font-medium">Total</p>
                                    <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                                </div>
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Mail className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-amber-700 font-medium">No leídos</p>
                                    <p className="text-2xl font-bold text-amber-900">{stats.unread}</p>
                                </div>
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <EyeOff className="w-5 h-5 text-amber-600" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-700 font-medium">Hoy</p>
                                    <p className="text-2xl font-bold text-green-900">{stats.today}</p>
                                </div>
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Calendar className="w-5 h-5 text-green-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="h-1 w-24 bg-gradient-to-r from-[#C7952C] to-[#E4CD87] rounded-full"></div>
                </div>

                {/* Barra de búsqueda y filtros */}
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar por correo, nombre o asunto..."
                                value={filtroCorreo}
                                onChange={(e) => setFiltroCorreo(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C7952C] focus:border-transparent shadow-sm"
                            />
                            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        </div>
                        

                    </div>
                </div>

                {/* Contenido principal */}
                {cargando ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="relative mb-6">
                            <div className="w-24 h-24 border-4 border-[#E4CD87] border-t-[#C7952C] rounded-full animate-spin"></div>
                            <Mail className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#C7952C] animate-pulse" />
                        </div>
                        <p className="text-lg font-semibold text-gray-700 mb-2">Cargando mensajes...</p>
                        <p className="text-gray-500">Obteniendo los últimos mensajes recibidos</p>
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="flex flex-col items-center text-center py-16 animate-fadeIn">
                        <div className="relative mb-6">
                            <div className="w-32 h-32 bg-gradient-to-br from-amber-50 to-yellow-100 rounded-full flex items-center justify-center">
                                <MailX className="w-20 h-20 text-amber-400" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-r from-[#C7952C] to-[#E4CD87] rounded-full flex items-center justify-center animate-bounce">
                                <span className="text-white font-bold">!</span>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-700 mb-2">
                            {filtroCorreo ? 'No hay resultados' : 'No hay mensajes aún'}
                        </h3>
                        <p className="text-gray-500 max-w-md">
                            {filtroCorreo 
                                ? 'No encontramos mensajes que coincidan con tu búsqueda.'
                                : 'No se han recibido mensajes en el sistema.'
                            }
                        </p>
                        {filtroCorreo && (
                            <button 
                                onClick={() => setFiltroCorreo('')}
                                className="mt-4 px-6 py-2 bg-amber-100 text-amber-700 rounded-lg font-semibold hover:bg-amber-200 transition-colors"
                            >
                                Limpiar filtro
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredMessages.map((msg, index) => (
                            <div 
                                key={msg.id} 
                                className={`bg-white rounded-2xl shadow-lg border ${!msg.recibido ? 'border-l-4 border-l-[#C7952C]' : 'border-gray-200'} overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.005] animate-slideDown`}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Header del mensaje */}
                                <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${!msg.recibido ? 'bg-gradient-to-r from-[#C7952C] to-[#E4CD87]' : 'bg-gray-100'}`}>
                                                {!msg.recibido ? (
                                                    <User className="w-5 h-5 text-white" />
                                                ) : (
                                                    <User className="w-5 h-5 text-gray-600" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 flex items-center gap-2">
                                                    {msg.nombre || 'Sin nombre'}
                                                    {!msg.recibido && (
                                                        <span className="px-2 py-1 bg-gradient-to-r from-[#E4CD87] to-[#C7952C] text-white text-xs rounded-full animate-pulse">
                                                            Nuevo
                                                        </span>
                                                    )}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {msg.correo || 'Sin correo'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {getTimeAgo(msg.fecha_envio)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            {!msg.recibido ? (
                                                <button
                                                    onClick={() => handleMarcarRecibido(msg.id)}
                                                    className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 group"
                                                    title="Marcar como recibido"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Marcar</span>
                                                </button>
                                            ) : (
                                                <span className="px-3 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                    <span className="hidden sm:inline">Recibido</span>
                                                </span>
                                            )}
                                            <button
                                                onClick={() => handleEliminar(msg.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 transition-all duration-300 hover:scale-110 hover:bg-red-50 rounded-lg group relative"
                                                title="Eliminar mensaje"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                    Eliminar
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Contenido del mensaje */}
                                <div className="p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 bg-gradient-to-r from-[#C7952C] to-[#E4CD87] rounded-full animate-pulse"></div>
                                        <span className="text-sm font-semibold text-gray-600">ASUNTO:</span>
                                        <span className="font-bold text-gray-800">{msg.asunto || 'Sin asunto'}</span>
                                    </div>
                                    <p className="text-gray-700 bg-gradient-to-br from-gray-50 to-amber-50 p-4 rounded-xl border border-gray-100 leading-relaxed whitespace-pre-line">
                                        {msg.mensaje}
                                    </p>
                                    
                                    {/* Metadata */}
                                    <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-500">
                                                {formatearFecha(msg.fecha_envio)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Eye className={`w-4 h-4 ${msg.recibido ? 'text-green-500' : 'text-amber-500'}`} />
                                            <span className={`text-sm ${msg.recibido ? 'text-green-600' : 'text-amber-600'}`}>
                                                {msg.recibido ? 'Leído' : 'No leído'}
                                            </span>
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
                        Mostrando {filteredMessages.length} de {mensajes.length} mensajes
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
                                    {modal.tipo === 'error' && <AlertCircle className="w-6 h-6 text-red-600" />}
                                    {modal.tipo === 'success' && <CheckCircle className="w-6 h-6 text-green-600" />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">
                                        {modal.tipo === 'confirm' ? 'Confirmar eliminación' :
                                         modal.tipo === 'error' ? 'Error' : 'Éxito'}
                                    </h3>
                                    {selectedMessage && modal.tipo === 'confirm' && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            De: {selectedMessage.nombre} ({selectedMessage.correo})
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
                
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
                
                .animate-slideDown {
                    animation: slideDown 0.3s ease-out;
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
                    background: linear-gradient(to bottom, #E4CD87, #C7952C);
                    border-radius: 10px;
                }
                
                ::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(to bottom, #C7952C, #E4CD87);
                }
            `}</style>
        </div>
    );
};

export default MensajesCordi;