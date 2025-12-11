import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Trash2, ArrowLeft, Calendar, Phone, User, FileText } from 'lucide-react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import Navbar from './Navbar';

const COLORS = {
    acentoPrincipal: '#3A8A4F',
    acentoSecundario: '#E4CD87',
    rojoOscuro: '#8C1F2F',
    textoPrincipal: '#222222',
    crema: '#E9DBCD',
    dorado: '#C7952C'
};

const ListadoNotasPsicologia = () => {
    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const [notasListado, setNotasListado] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUserData = async (id, token) => {
        if (!id) return { nombre_completo: 'ID no proporcionado' };
        try {
            const res = await fetch(
                `https://apis-patu.onrender.com/api/usuarios/id/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            if (res.ok && data.data) {
                const user = data.data;
                const nombreCompleto = `${user.nombre || ''} ${user.apellido_paterno || ''}`.trim();
                return { ...user, nombre_completo: nombreCompleto };
            }
            return { nombre_completo: 'Usuario Desconocido' };
        } catch (e) {
            console.error(`Error fetching user ID ${id}:`, e);
            return { nombre_completo: 'Error de carga' };
        }
    };

    const fetchNotas = async () => {
        if (!usuario || !usuario.accessToken) {
            setError("Faltan datos de autenticación.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const token = usuario.accessToken;
            const url = `https://apis-patu.onrender.com/api/psicologia/`; 
            
            const res = await fetch(url, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const rawData = await res.json();
            
            if (!res.ok || !rawData.success) {
                setError(rawData.message || "Error al cargar las notas.");
                return;
            }

            const notasData = Array.isArray(rawData.data) ? rawData.data : [];

            const notasEnriquecidas = await Promise.all(
                notasData.map(async (nota) => {
                    const [alumno, psicologo] = await Promise.all([
                        fetchUserData(nota.id_alumno, token),
                        fetchUserData(nota.quien_agenda, token) 
                    ]);

                    return {
                        ...nota,
                        alumno_data: alumno,
                        psicologo_data: psicologo,
                        fecha_registro_local: new Date(nota.fecha) 
                    };
                })
            );

            setNotasListado(notasEnriquecidas);

        } catch (err) {
            console.error(err);
            setError("Error de conexión al cargar las notas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotas();
    }, [usuario?.id]);

    const handleEliminarNota = async (id_nota) => {
        const result = await Swal.fire({
            title: '¿Eliminar Nota de Sesión?',
            text: "Esta acción eliminará permanentemente la nota de psicología.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: COLORS.acentoPrincipal,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });

        if (!result.isConfirmed) return;

        try {
            setLoading(true);
            const res = await fetch(`https://apis-patu.onrender.com/api/psicologia/${id_nota}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${usuario.accessToken}` }
            });

            if (!res.ok) {
                const data = await res.json();
                await Swal.fire('Error', data.message || 'No se pudo eliminar la nota.', 'error');
                setLoading(false);
                return;
            }
            
            await Swal.fire('Éxito', 'Nota eliminada correctamente.', 'success');
            fetchNotas(); 

        } catch (err) {
            console.error(err);
            await Swal.fire('Error de Conexión', 'No se pudo conectar con la API para eliminar.', 'error');
            setLoading(false);
        }
    };

    if (!usuario) {
        return <div className="p-8 text-center pt-28">Por favor, inicie sesión.</div>;
    }

    return (
        <>
            <Navbar />
            
            <main className="min-h-screen p-6 flex flex-col items-center pt-28" style={{background: 'linear-gradient(135deg, #f8f4f0 0%, #ffffff 100%)'}}>
                <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-5xl border-4 transition-all duration-300 hover:shadow-3xl" style={{borderColor: COLORS.crema}}>
                    {/* Header con animación */}
                    <div className="flex justify-between items-center mb-8 pb-4 relative overflow-hidden" style={{borderBottom: `4px solid ${COLORS.dorado}`}}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-50 to-transparent opacity-50 animate-pulse"></div>
                        <h2 className="text-3xl font-bold flex items-center gap-3 relative z-10 animate-fade-in" style={{color: COLORS.rojoOscuro}}>
                            <ClipboardList className='w-8 h-8 animate-bounce' /> 
                            <span className="bg-gradient-to-r from-red-900 to-red-700 bg-clip-text text-transparent">
                                Bitácora de Sesiones de Psicología
                            </span>
                        </h2>
                        <button 
                            onClick={() => navigate('/homepsicologa')}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 relative overflow-hidden group"
                            style={{backgroundColor: COLORS.dorado}}
                        >
                            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                            <ArrowLeft className='w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300'/> 
                            <span className="relative z-10">Volver</span>
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-100 text-red-700 p-4 text-center font-bold mb-6 rounded-xl border-l-4 border-red-500 animate-shake">
                            {error}
                        </div>
                    )}

                    {loading && notasListado.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="relative w-16 h-16 mx-auto mb-4">
                                <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                                <div className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin" style={{borderTopColor: COLORS.acentoPrincipal}}></div>
                            </div>
                            <p className="text-lg text-gray-600 animate-pulse">Cargando notas...</p>
                        </div>
                    ) : notasListado.length === 0 ? (
                        <div className="rounded-2xl text-center p-16 transition-all duration-300 hover:shadow-inner" style={{backgroundColor: '#fafaf8'}}>
                            <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-pulse" />
                            <p className='text-xl text-gray-500 font-medium'>No hay notas de sesiones registradas aún.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-3 custom-scrollbar">
                            {notasListado.map((nota, index) => (
                                <div 
                                    key={nota.id}
                                    className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-l-8 group animate-slide-in"
                                    style={{
                                        borderLeftColor: COLORS.acentoPrincipal,
                                        animationDelay: `${index * 0.1}s`
                                    }}
                                >
                                    {/* Header de la nota */}
                                    <div className="flex justify-between items-start mb-4 pb-3 border-b-2 border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md transition-transform duration-300 group-hover:scale-110" style={{backgroundColor: COLORS.rojoOscuro}}>
                                                {nota.alumno_data?.nombre_completo?.[0] || 'A'}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold" style={{color: COLORS.textoPrincipal}}>
                                                    {nota.alumno_data?.nombre_completo || 'Alumno (ID ' + nota.id_alumno + ')'}
                                                </h3>
                                                <p className='text-sm text-gray-500 flex items-center gap-1 mt-1'>
                                                    <User className="w-3 h-3" />
                                                    Nota ID: #{nota.id}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right bg-gradient-to-br from-amber-50 to-yellow-50 px-4 py-2 rounded-xl shadow-sm">
                                            <p className='text-xs font-semibold text-gray-600'>Registrado por:</p>
                                            <p className='text-sm font-bold' style={{color: COLORS.dorado}}>{nota.psicologo_data?.nombre_completo}</p>
                                        </div>
                                    </div>

                                    {/* Grid de información */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                                        <div className="bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Calendar className="w-4 h-4" style={{color: COLORS.dorado}} />
                                                <p className='font-semibold text-gray-700 text-sm'>Fecha de Registro</p>
                                            </div>
                                            <p className="text-sm text-gray-600 pl-6">{nota.fecha_registro_local.toLocaleDateString('es-MX', { 
                                                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                                            })}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Phone className="w-4 h-4" style={{color: COLORS.dorado}} />
                                                <p className='font-semibold text-gray-700 text-sm'>Teléfono</p>
                                            </div>
                                            <p className="text-sm text-gray-600 pl-6">{nota.telefono || 'N/A'}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
                                            <div className="flex items-center gap-2 mb-1">
                                                <User className="w-4 h-4" style={{color: COLORS.dorado}} />
                                                <p className='font-semibold text-gray-700 text-sm'>ID Alumno</p>
                                            </div>
                                            <p className="text-sm text-gray-600 pl-6">{nota.id_alumno}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Situación */}
                                    <div className="mt-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileText className="w-5 h-5" style={{color: COLORS.rojoOscuro}} />
                                            <p className='font-bold text-gray-800'>Situación (Motivo):</p>
                                        </div>
                                        <div className='bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-xl border-l-4 shadow-sm whitespace-pre-wrap text-gray-700 transition-all duration-300 hover:shadow-md' style={{borderLeftColor: COLORS.rojoOscuro}}>
                                            {nota.situacion}
                                        </div>
                                    </div>
                                    
                                    {/* Notas */}
                                    <div className="mt-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ClipboardList className="w-5 h-5" style={{color: COLORS.acentoPrincipal}} />
                                            <p className='font-bold text-gray-800'>Notas de la Sesión:</p>
                                        </div>
                                        <div className='bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border-l-4 shadow-sm whitespace-pre-wrap text-gray-700 transition-all duration-300 hover:shadow-md' style={{borderLeftColor: COLORS.acentoPrincipal}}>
                                            {nota.notas}
                                        </div>
                                    </div>
                                    
                                    {/* Botón eliminar */}
                                    <div className="flex justify-end mt-5 pt-4 border-t border-gray-200">
                                        <button 
                                            onClick={() => handleEliminarNota(nota.id)}
                                            className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 border border-red-200"
                                        >
                                            <Trash2 className='w-4 h-4'/> Eliminar Nota
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes slide-in {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }
                
                .animate-slide-in {
                    animation: slide-in 0.5s ease-out forwards;
                    opacity: 0;
                }
                
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
                
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: ${COLORS.dorado};
                    border-radius: 10px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: ${COLORS.rojoOscuro};
                }
            `}</style>
        </>
    );
};

export default ListadoNotasPsicologia;