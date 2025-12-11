import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { FaPhone, FaStickyNote, FaCommentMedical, FaUserMd, FaSave, FaArrowLeft, FaSpinner, FaCalendarAlt, FaUser } from 'react-icons/fa';
import Navbar from './Navbar';

const RegistroNotasPsicologia = () => {
    const navigate = useNavigate();
    // Parsear el usuario UNA sola vez para mantener la misma referencia y evitar re-ejecución del useEffect
    const [usuario] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('usuario'));
        } catch (e) {
            return null;
        }
    });
    const { idSesion } = useParams(); // ID de la sesión desde la URL

    // --- ESTADOS PARA LOS NUEVOS CAMPOS ---
    const [situacion, setSituacion] = useState('');
    const [telefono, setTelefono] = useState('');
    const [notas, setNotas] = useState('');
    // Campos requeridos pero que se obtendrán de la sesión
    const [idAlumno, setIdAlumno] = useState(null); 
    const [detalleSesion, setDetalleSesion] = useState(null);
    const [alumnoInfo, setAlumnoInfo] = useState(null);

    const [loading, setLoading] = useState(false);
    const [errorCarga, setErrorCarga] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldFocus, setFieldFocus] = useState('');

    // --- Colores de la UI ---
    const COLORS = {
        acentoPrincipal: '#3A8A4F',
        acentoSecundario: '#E4CD87',
        bordeClaro: '#E9DBCD',
        textoPrincipal: '#222222',
        rojoOscuro: '#8C1F2F',
        verdeSuave: '#D1FAE5',
        fondoSuave: '#FEF7E5'
    };

    // 1. OBTENER DETALLES DE LA SESIÓN
    useEffect(() => {
        const fetchSessionDetails = async () => {
            if (!usuario || !idSesion) {
                setErrorCarga("Faltan datos de sesión o autenticación.");
                return;
            }
            
            setLoading(true);
            try {
                // Obtener detalles de la sesión
                const res = await fetch(`https://apis-patu.onrender.com/api/sesiones/${idSesion}`, {
                    headers: { "Authorization": `Bearer ${usuario.accessToken}` }
                });
                const data = await res.json();

                if (!res.ok || !data.data) {
                    setErrorCarga(`No se pudo cargar el detalle de la sesión ${idSesion}.`);
                    await Swal.fire({
                        icon: 'error',
                        title: 'Error de Carga',
                        text: 'No se encontraron detalles para esta sesión.',
                        showClass: { popup: 'animate__animated animate__shakeX' }
                    });
                    setLoading(false);
                    return;
                }
                
                const sessionData = data.data;
                const id_alumno = sessionData.id_alumno;
                setIdAlumno(id_alumno);
                setDetalleSesion(sessionData);

                // Obtener datos del alumno
                const alumnoRes = await fetch(`https://apis-patu.onrender.com/api/usuarios/id/${id_alumno}`, {
                    headers: { "Authorization": `Bearer ${usuario.accessToken}` }
                });
                const alumnoData = await alumnoRes.json();
                if (alumnoRes.ok && alumnoData.data) {
                    setAlumnoInfo(alumnoData.data);
                    if (alumnoData.data.telefono) {
                        setTelefono(alumnoData.data.telefono);
                    }
                }

            } catch (err) {
                console.error(err);
                setErrorCarga("Error de conexión al cargar datos de la sesión.");
            } finally {
                setLoading(false);
            }
        };

        fetchSessionDetails();
    }, [idSesion, usuario?.accessToken]);

    // 2. LÓGICA DE REGISTRO
    const handleGuardar = async () => {
        // Validación
        if (!idAlumno || !situacion || !notas) {
            // Animación de shake para los campos faltantes
            const missingFields = [];
            if (!situacion) missingFields.push('Situación');
            if (!notas) missingFields.push('Notas');
            
            // Animación de los campos vacíos
            if (!situacion) {
                const situacionField = document.querySelector('textarea[name="situacion"]');
                if (situacionField) {
                    situacionField.classList.add('animate-shake');
                    setTimeout(() => situacionField.classList.remove('animate-shake'), 600);
                }
            }
            if (!notas) {
                const notasField = document.querySelector('textarea[name="notas"]');
                if (notasField) {
                    notasField.classList.add('animate-shake');
                    setTimeout(() => notasField.classList.remove('animate-shake'), 600);
                }
            }

            await Swal.fire({
                icon: 'warning',
                title: 'Campos obligatorios',
                html: `Los siguientes campos son obligatorios:<br><strong>${missingFields.join(', ')}</strong>`,
                showClass: { popup: 'animate__animated animate__headShake' },
                background: '#FEF3F2',
                confirmButtonColor: COLORS.acentoSecundario
            });
            return;
        }

        const notaPsicologia = {
            id_alumno: idAlumno,
            situacion,
            telefono: telefono || null,
            notas,
            quien_agenda: usuario.id,
            id_sesion: parseInt(idSesion),
        };

        try {
            setIsSubmitting(true);
            
            // Mostrar confirmación con animación
            const confirmResult = await Swal.fire({
                title: '¿Guardar notas?',
                text: '¿Estás seguro de que deseas guardar estas notas de psicología?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: COLORS.acentoSecundario,
                cancelButtonColor: COLORS.rojoOscuro,
                confirmButtonText: 'Sí, guardar',
                cancelButtonText: 'Cancelar',
                background: '#FFF',
                showClass: { popup: 'animate__animated animate__fadeIn' },
                customClass: {
                    confirmButton: 'px-6 py-2 rounded-full transition-transform hover:scale-105',
                    cancelButton: 'px-6 py-2 rounded-full transition-transform hover:scale-105'
                }
            });

            if (!confirmResult.isConfirmed) {
                setIsSubmitting(false);
                return;
            }

            const res = await fetch('https://apis-patu.onrender.com/api/psicologia/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${usuario.accessToken}`,
                },
                body: JSON.stringify(notaPsicologia),
            });

            const data = await res.json();

            if (!res.ok) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message || 'Error al guardar las notas de psicología.',
                    showClass: { popup: 'animate__animated animate__shakeX' }
                });
                return;
            }

            // Éxito con animación
            await Swal.fire({
                icon: 'success',
                title: '¡Guardado!',
                text: 'Notas de psicología registradas con éxito.',
                showConfirmButton: false,
                timer: 1500,
                showClass: { popup: 'animate__animated animate__bounceIn' }
            });

            // Animación de desvanecimiento antes de redirigir
            const form = document.querySelector('form, main');
            if (form) {
                form.style.transition = 'opacity 0.5s ease';
                form.style.opacity = '0.7';
            }

            setTimeout(() => {
                // Limpiar estados
                setSituacion('');
                setTelefono('');
                setNotas('');
                // Redirigir
                navigate('/homepsicologa');
            }, 600);

        } catch (error) {
            console.error(error);
            await Swal.fire({
                icon: 'error',
                title: 'Error de Conexión',
                text: 'No se pudo conectar con el servidor API.',
                showClass: { popup: 'animate__animated animate__shakeX' }
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Efecto para scroll suave al enfocar campos
    useEffect(() => {
        if (fieldFocus) {
            const element = document.getElementById(fieldFocus);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.focus({ preventScroll: true });
            }
        }
    }, [fieldFocus]);

    if (!usuario) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
                <div className="text-center p-8 animate__animated animate__fadeIn">
                    <div className="text-5xl mb-4">🔒</div>
                    <p className="text-xl text-gray-600 mb-4">Por favor, inicie sesión</p>
                    <button 
                        onClick={() => navigate('/login')}
                        className="bg-gradient-to-r from-[#E4CD87] to-[#F5E6C8] text-black font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                        Ir a inicio de sesión
                    </button>
                </div>
            </div>
        );
    }

    if (loading && !detalleSesion) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-28 flex items-center justify-center">
                    <div className="text-center animate__animated animate__fadeIn">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E4CD87] mx-auto"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <FaUserMd className="text-[#8C1F2F] text-xl animate-pulse" />
                            </div>
                        </div>
                        <p className='text-xl text-gray-600 mt-6 font-medium'>Cargando detalles de la sesión...</p>
                        <p className="text-gray-400 mt-2">Por favor espera un momento</p>
                    </div>
                </div>
            </>
        );
    }

    if (errorCarga) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-28 flex items-center justify-center px-4">
                    <div className={`bg-gradient-to-r from-red-50 to-red-100 text-red-700 p-8 rounded-3xl text-center max-w-lg w-full shadow-xl animate__animated animate__fadeIn`}>
                        <div className="text-5xl mb-4">⚠️</div>
                        <p className="text-xl font-bold mb-2">Error al cargar</p>
                        <p className="mb-6">{errorCarga}</p>
                        <button 
                            onClick={() => navigate('/homepsicologa')} 
                            className="bg-gradient-to-r from-[#E4CD87] to-[#F5E6C8] text-black font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 mx-auto"
                        >
                            <FaArrowLeft /> Volver al inicio
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
                .focus-glow:focus {
                    box-shadow: 0 0 0 3px rgba(232, 205, 205, 0.4);
                }
                .float-animation {
                    animation: float 6s ease-in-out infinite;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
            
            <main className="min-h-screen bg-gradient-to-b from-[#ffffff] to-white p-6 flex flex-col items-center pt-28 animate__animated animate__fadeIn">
                {/* Tarjeta de información de la sesión */}
                {detalleSesion && alumnoInfo && (
                    <div className="w-full max-w-3xl mb-6 animate__animated animate__fadeInDown">
                        <div className="bg-gradient-to-r from-white to-[#FEF7E5] rounded-3xl shadow-lg p-6 border-4 border-[#E9DBCD] transform transition-all duration-300 hover:shadow-xl">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-gradient-to-r from-[#E4CD87] to-[#F5E6C8]">
                                        <FaCalendarAlt className="text-xl text-[#8C1F2F]" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">Sesión #{idSesion}</h3>
                                        <p className="text-gray-600 flex items-center gap-2">
                                            <FaUser className="text-sm" />
                                            {alumnoInfo.nombre} {alumnoInfo.apellido_paterno}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Fecha de sesión</p>
                                    <p className="font-bold text-gray-700">{detalleSesion.fecha}</p>
                                    <p className="text-sm text-gray-500">{detalleSesion.hora_inicio} - {detalleSesion.hora_fin}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-3xl border-4 border-[#E9DBCD] transform transition-all duration-300 hover:shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#8C1F2F] to-[#C7952C] bg-clip-text text-transparent">
                                Registro de Notas de Psicología
                            </h2>
                            <p className="text-gray-500 mt-1">Completa los campos para registrar las notas de la sesión</p>
                        </div>
                        <div className="p-3 rounded-full bg-gradient-to-r from-[#E4CD87]/20 to-[#F5E6C8]/20">
                            <FaUserMd className="text-2xl text-[#8C1F2F]" />
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Campo Situación */}
                        <div className="transform transition-all duration-300 hover:scale-[1.01]">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`p-2 rounded-lg ${fieldFocus === 'situacion' ? 'bg-[#E4CD87]' : 'bg-gray-100'} transition-colors`}>
                                    <FaCommentMedical className={`${fieldFocus === 'situacion' ? 'text-[#8C1F2F]' : 'text-gray-600'}`} />
                                </div>
                                <label className="font-bold text-gray-700 text-lg">Motivo de consulta *</label>
                            </div>
                            <textarea
                                id="situacion"
                                name="situacion"
                                value={situacion}
                                onChange={(e) => setSituacion(e.target.value)}
                                onFocus={() => setFieldFocus('situacion')}
                                onBlur={() => setFieldFocus('')}
                                className="w-full p-4 border-2 rounded-2xl border-gray-200 focus:border-[#E4CD87] focus:outline-none focus:ring-2 focus:ring-[#E4CD87]/30 focus-glow transition-all duration-300 resize-none"
                                rows="4"
                                placeholder="Describe brevemente la situación principal o motivo de la sesión..."
                                required
                            ></textarea>
                            {!situacion && (
                                <p className="text-sm text-red-500 mt-2 animate-pulse">Este campo es obligatorio</p>
                            )}
                        </div>
                        
                        {/* Campo Notas */}
                        <div className="transform transition-all duration-300 hover:scale-[1.01]">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`p-2 rounded-lg ${fieldFocus === 'notas' ? 'bg-[#E4CD87]' : 'bg-gray-100'} transition-colors`}>
                                    <FaStickyNote className={`${fieldFocus === 'notas' ? 'text-[#8C1F2F]' : 'text-gray-600'}`} />
                                </div>
                                <label className="font-bold text-gray-700 text-lg">Notas de la Sesión *</label>
                            </div>
                            <textarea
                                id="notas"
                                name="notas"
                                value={notas}
                                onChange={(e) => setNotas(e.target.value)}
                                onFocus={() => setFieldFocus('notas')}
                                onBlur={() => setFieldFocus('')}
                                className="w-full p-4 border-2 rounded-2xl border-gray-200 focus:border-[#E4CD87] focus:outline-none focus:ring-2 focus:ring-[#E4CD87]/30 focus-glow transition-all duration-300 resize-none"
                                rows="6"
                                placeholder="Registro de la conversación, observaciones y resultados de la sesión..."
                                required
                            ></textarea>
                            {!notas && (
                                <p className="text-sm text-red-500 mt-2 animate-pulse">Este campo es obligatorio</p>
                            )}
                        </div>

                        {/* Campo Teléfono */}
                        <div className="transform transition-all duration-300 hover:scale-[1.01]">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`p-2 rounded-lg ${fieldFocus === 'telefono' ? 'bg-[#E4CD87]' : 'bg-gray-100'} transition-colors`}>
                                    <FaPhone className={`${fieldFocus === 'telefono' ? 'text-[#8C1F2F]' : 'text-gray-600'}`} />
                                </div>
                                <label className="font-bold text-gray-700 text-lg">Teléfono de Contacto</label>
                            </div>
                            <input
                                id="telefono"
                                name="telefono"
                                type="number"
                                value={telefono || ''}
                                onChange={(e) => setTelefono(e.target.value)}
                                onFocus={() => setFieldFocus('telefono')}
                                onBlur={() => setFieldFocus('')}
                                className="w-full p-4 border-2 rounded-2xl border-gray-200 focus:border-[#E4CD87] focus:outline-none focus:ring-2 focus:ring-[#E4CD87]/30 focus-glow transition-all duration-300"
                                placeholder="Teléfono del alumno"
                            />
                            {!notas && (
                                <p className="text-sm text-red-500 mt-2 animate-pulse">Este campo es obligatorio</p>
                            )}
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="mt-12 space-y-4">
                        <button
                            onClick={handleGuardar}
                            disabled={isSubmitting || loading}
                            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                                isSubmitting || loading
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : `bg-gradient-to-r from-[#E4CD87] to-[#F5E6C8] hover:from-[#F5E6C8] hover:to-[#E4CD87] text-black shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95`
                            }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>                                
                                    Guardar Notas de Psicología
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => {
                                const button = document.activeElement;
                                button.classList.add('animate-pulse');
                                setTimeout(() => {
                                    button.classList.remove('animate-pulse');
                                    navigate('/homepsicologa');
                                }, 300);
                            }}
                            className="w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 text-gray-700 shadow hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                        >
                            <FaArrowLeft />
                            Volver al Inicio
                        </button>
                    </div>

                    {/* Indicador de campos obligatorios */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500 text-center">
                            <span className="text-red-500">*</span> Campos obligatorios
                        </p>
                    </div>
                </div>

                {/* Nota de ayuda */}
                <div className="mt-6 max-w-3xl w-full animate__animated animate__fadeInUp">
                    <div className="bg-gradient-to-r from-[#D1FAE5] to-[#ECFDF5] rounded-2xl p-4 text-center">
                        <p className="text-sm text-gray-600">
                            <strong> Nota:</strong> Una vez guardadas, las notas quedarán registradas en el sistema y podrán ser consultadas posteriormente.
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
};

export default RegistroNotasPsicologia;