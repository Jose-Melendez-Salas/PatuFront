import React, { useState, useEffect } from 'react';
import { FaSpinner, FaPaperPlane, FaUserGraduate, FaIdCard, FaGraduationCap, FaCalendarAlt } from 'react-icons/fa';
import { ArrowLeft, FileText, Send, AlertCircle, CheckCircle, User, Mail, BookOpen } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const Reportes = () => {
    const [mensaje, setMensaje] = useState('');
    const [loadingEnviar, setLoadingEnviar] = useState(false);
    const [alerta, setAlerta] = useState('');
    const [textareaFocus, setTextareaFocus] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    const alumnoData = location.state?.alumno; 

    const usuario = JSON.parse(localStorage.getItem('usuario'));

    useEffect(() => {
        if (!usuario) {
            navigate('/login'); 
        }
    }, [usuario, navigate]);

    useEffect(() => {
        setCharCount(mensaje.length);
    }, [mensaje]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlerta('');
        setSubmitSuccess(false);

        if (!mensaje.trim()) {
            setAlerta(' Por favor escribe un mensaje antes de enviar.');
            return;
        }

        if (!alumnoData) {
            setAlerta(' No se recibió información del alumno.');
            return;
        }

        setLoadingEnviar(true);

        try {
            const res = await fetch('https://apis-patu.onrender.com/api/reportes/crear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${usuario?.accessToken || ''}`,
                },
                body: JSON.stringify({
                    matricula: alumnoData.matricula,
                    contenido: mensaje,
                    correo_tutor: usuario.correo,
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setSubmitSuccess(true);
                setAlerta(' Reporte enviado exitosamente.');
                setMensaje('');
                
                // Animación de éxito
                setTimeout(() => {
                    setSubmitSuccess(false);
                }, 2000);
            } else {
                setAlerta(` Error: ${data.message || 'No se pudo enviar el reporte.'}`);
            }
        } catch (err) {
            console.error(err);
            setAlerta(' Error al conectar con el servidor.');
        } finally {
            setLoadingEnviar(false);
        }
    };

    const handleBackClick = () => {
        if (alumnoData && alumnoData.matricula) {
            navigate(`/alumnos/${alumnoData.matricula}/ficha`);
        } else {
            navigate(-1);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-20">

            {/* Navbar */}
            <Navbar />

            <main className="flex flex-col items-center p-4 animate-fadeIn relative z-10 w-full">
                
                {/* Botón flotante de regreso */}
                <button 
                    onClick={handleBackClick}
                    className="fixed left-4 top-24 z-20 p-3 bg-white shadow-lg rounded-full text-[#8C1F2F] hover:bg-red-50 hover:scale-110 transition-all duration-300 hover:shadow-xl border border-gray-200 group"
                    aria-label="Volver"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>

                {/* Contenedor principal */}
                <div className={`bg-white rounded-3xl shadow-2xl p-6 md:p-10 w-full max-w-2xl border-4 border-[#E9DBCD] transition-all duration-500 ${submitSuccess ? 'ring-4 ring-green-200 ring-opacity-50' : ''}`}>
                    
                    {/* Header con icono y título */}
                    <div className="relative mb-8">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="p-3 bg-gradient-to-r from-[#C7952C] to-[#E4CD87] rounded-full shadow-lg">
                                <FileText className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                                Nuevo Reporte
                            </h2>
                        </div>
                        <div className="h-1 w-24 bg-gradient-to-r from-[#C7952C] to-[#E4CD87] rounded-full mx-auto"></div>
                    </div>

                    {/* Tarjeta del alumno */}
                    <div className="mb-8 transition-all duration-300 hover:scale-[1.01]">
                        <label className="font-bold text-lg mb-3 text-gray-700 flex items-center gap-2">
                            <FaUserGraduate className="text-[#3CB9A5]" />
                            Alumno Seleccionado:
                        </label>
                        
                        {alumnoData ? (
                            <div className="mt-2 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-md animate-slideDown">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                                        <User className="w-8 h-8 text-green-600" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-bold text-xl text-gray-800 mb-2">
                                            {alumnoData.nombre_completo || `${alumnoData.nombre || ''} ${alumnoData.apellido_paterno || ''} ${alumnoData.apellido_materno || ''}`}
                                        </p>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                            <div className="flex items-center gap-2 bg-white p-2 rounded-lg">
                                                <FaIdCard className="text-blue-500" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Matrícula</p>
                                                    <p className="font-semibold text-gray-800">{alumnoData.matricula}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 bg-white p-2 rounded-lg">
                                                <Mail className="text-red-500 w-4 h-4" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Correo</p>
                                                    <p className="font-semibold text-gray-800 text-sm truncate">{alumnoData.correo || 'N/A'}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 bg-white p-2 rounded-lg">
                                                <FaGraduationCap className="text-purple-500" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Carrera</p>
                                                    <p className="font-semibold text-gray-800">{alumnoData.carrera || 'N/A'}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 bg-white p-2 rounded-lg">
                                                <FaCalendarAlt className="text-amber-500" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Semestre</p>
                                                    <p className="font-semibold text-gray-800">{alumnoData.semestre || '—'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-2 p-5 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl text-center animate-shake">
                                <div className="flex items-center justify-center gap-3 mb-3">
                                    <AlertCircle className="w-8 h-8 text-red-500" />
                                    <p className="text-red-600 font-bold text-lg">No se recibió información del alumno.</p>
                                </div>
                                <button 
                                    onClick={handleBackClick} 
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Volver atrás
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Formulario de reporte */}
                    <form className="w-full flex flex-col gap-6" onSubmit={handleSubmit}>
                        <div className="transition-all duration-300">
                            <div className="flex justify-between items-center mb-3">
                                <label className="font-bold text-lg text-gray-700 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-[#C7952C]" />
                                    Comentarios del reporte:
                                </label>
                                <span className={`text-sm font-medium ${charCount > 0 ? 'text-gray-600' : 'text-gray-400'}`}>
                                    {charCount}/2000
                                </span>
                            </div>
                            
                            <div className={`relative transition-all duration-300 ${textareaFocus ? 'ring-2 ring-[#3CB9A5] ring-opacity-30' : ''}`}>
                                <textarea
                                    value={mensaje}
                                    onChange={(e) => setMensaje(e.target.value)}
                                    onFocus={() => setTextareaFocus(true)}
                                    onBlur={() => setTextareaFocus(false)}
                                    placeholder="Describe la situación, incidencia o motivo del reporte aquí..."
                                    maxLength={2000}
                                    className="p-4 border-2 border-gray-300 rounded-2xl w-full focus:outline-none focus:border-[#3CB9A5] mt-2 h-48 resize-none text-base shadow-inner transition-all duration-300 focus:shadow-lg bg-gray-50"
                                />
                                <div className="absolute bottom-2 right-2">
                                    <div className="w-8 h-8 bg-gradient-to-r from-[#E4CD87] to-[#C7952C] rounded-full flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-end mt-2">
                                <div className={`h-1 w-full rounded-full transition-all duration-500 ${charCount === 0 ? 'bg-gray-200' : charCount < 500 ? 'bg-green-500' : charCount < 1000 ? 'bg-yellow-500' : charCount < 1500 ? 'bg-orange-500' : 'bg-red-500'}`}></div>
                            </div>
                        </div>

                        {/* Área de alertas */}
                        {alerta && (
                            <div className={`p-4 rounded-xl text-center font-bold text-base transition-all duration-500 transform ${alerta.includes('✅') ? 'bg-green-50 text-green-700 border-2 border-green-200 animate-pulse-subtle' : alerta.includes('❌') ? 'bg-red-50 text-red-700 border-2 border-red-200 animate-shake' : 'bg-yellow-50 text-yellow-800 border-2 border-yellow-300'}`}>
                                <div className="flex items-center justify-center gap-3">
                                    {alerta.includes('✅') && <CheckCircle className="w-6 h-6" />}
                                    {alerta.includes('❌') && <AlertCircle className="w-6 h-6" />}
                                    {!alerta.includes('✅') && !alerta.includes('❌') && <AlertCircle className="w-6 h-6" />}
                                    <span>{alerta}</span>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loadingEnviar || !alumnoData || !mensaje.trim()}
                            onMouseEnter={() => !loadingEnviar && alumnoData && mensaje.trim() && setSubmitSuccess(false)}
                            className={`
                                relative bg-gradient-to-r from-[#E4CD87] via-[#D4B866] to-[#C7952C] 
                                text-white py-4 px-8 rounded-2xl font-bold text-xl 
                                mt-2 flex justify-center items-center gap-3 shadow-lg 
                                transition-all duration-300 w-full overflow-hidden group
                                ${loadingEnviar || !alumnoData || !mensaje.trim() 
                                    ? 'opacity-60 cursor-not-allowed grayscale' 
                                    : 'hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]'
                                }
                                ${submitSuccess ? 'animate-pulse-subtle' : ''}
                            `}
                        >
                            {/* Efecto de brillo en hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            
                            {loadingEnviar ? (
                                <>
                                    <FaSpinner className="animate-spin w-6 h-6" />
                                    <span>Enviando Reporte...</span>
                                </>
                            ) : (
                                <>
                                    <Send className={`w-6 h-6 transition-transform duration-300 ${submitSuccess ? 'animate-bounce' : 'group-hover:translate-x-1'}`} />
                                    <span>Enviar Reporte</span>
                                </>
                            )}
                            
                            {submitSuccess && (
                                <div className="absolute -right-2 -top-2">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                                        <CheckCircle className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            )}
                        </button>
                    </form>

                    {/* Información adicional */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="flex items-center gap-3 text-gray-600">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            <p className="text-sm">
                                <span className="font-semibold">Nota:</span> Este reporte será registrado en el sistema y podrá ser consultado por el personal autorizado.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

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
                        transform: translateY(-20px); 
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
                
                @keyframes pulseSubtle {
                    0%, 100% { 
                        opacity: 1; 
                        box-shadow: 0 10px 25px rgba(199, 149, 44, 0.2); 
                    }
                    50% { 
                        opacity: 0.95; 
                        box-shadow: 0 10px 30px rgba(199, 149, 44, 0.4); 
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.6s ease-out;
                }
                
                .animate-slideDown {
                    animation: slideDown 0.4s ease-out;
                }
                
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
                
                .animate-pulse-subtle {
                    animation: pulseSubtle 1.5s ease-in-out infinite;
                }
                
                /* Efecto de brillo en el botón */
                .shine-effect {
                    position: relative;
                    overflow: hidden;
                }
                
                .shine-effect::after {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: linear-gradient(
                        to right,
                        transparent 0%,
                        rgba(255, 255, 255, 0.3) 50%,
                        transparent 100%
                    );
                    transform: translateX(-100%);
                    transition: transform 0.6s;
                }
                
                .shine-effect:hover::after {
                    transform: translateX(100%);
                }
            `}</style>
        </div>
    );
};

export default Reportes;