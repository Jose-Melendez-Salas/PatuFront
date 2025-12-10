import React, { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const Reportes = () => {
    const [mensaje, setMensaje] = useState('');
    const [loadingEnviar, setLoadingEnviar] = useState(false);
    const [alerta, setAlerta] = useState('');
    // const [mensajes, setMensajes] = useState([]); // No se usa actualmente
    const navigate = useNavigate();
    const location = useLocation();
    const alumnoData = location.state?.alumno; 

    const usuario = JSON.parse(localStorage.getItem('usuario'));

    useEffect(() => {
        if (!usuario) {
            navigate('/login'); 
        }
    }, [usuario, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlerta('');

        if (!mensaje.trim()) {
            setAlerta('⚠️ Por favor escribe un mensaje antes de enviar.');
            return;
        }

        if (!alumnoData) {
            setAlerta('⚠️ No se recibió información del alumno.');
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
                setAlerta(' Reporte enviado exitosamente.');
                setMensaje('');
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
        <div className="min-h-screen bg-gray-50 pt-20">

            {/* Navbar */}
            <Navbar />

            <main className="flex flex-col items-center p-4 animate-fadeIn relative z-10 w-full">
                
                {/* --- CONTENEDOR PRINCIPAL RESPONSIVE --- */}
                {/* max-w-2xl para que no sea excesivamente ancho en escritorio, w-full para móvil */}
                <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 w-full max-w-2xl border-4 border-[#E9DBCD]">
                    
                    <div className="relative mb-6">
                        {/* Botón regresar alineado y con tamaño táctil adecuado */}
                        <button 
                            onClick={handleBackClick}
                            className="absolute -left-2 -top-2 p-2 text-[#8C1F2F] hover:bg-red-50 rounded-full transition-colors"
                            aria-label="Volver"
                        >
                            <ArrowLeft className="w-6 h-6 md:w-8 md:h-8" />
                        </button>

                        <h2 className="text-2xl md:text-4xl font-bold text-center border-b-4 border-[#C7952C] pb-3 pt-1 px-8">
                            Crear Reporte
                        </h2>
                    </div>

                    {/* Contenedor del alumno (Tarjeta visual) */}
                    <div className="mb-6">
                        <label className="font-medium text-lg block mb-2 text-gray-700">Alumno Seleccionado:</label>
                        {alumnoData ? (
                            <div className="mt-2 p-4 bg-green-50 border border-green-200 rounded-xl shadow-sm">
                                <p className="font-bold text-lg text-green-900 break-words">
                                    {alumnoData.nombre_completo || `${alumnoData.nombre || ''} ${alumnoData.apellido_paterno || ''} ${alumnoData.apellido_materno || ''}`}
                                </p>
                                <div className="text-sm md:text-base text-green-800 mt-1 space-y-1">
                                    <p><span className="font-semibold">Matrícula:</span> {alumnoData.matricula}</p>
                                    <p className="break-all"><span className="font-semibold">Correo:</span> {alumnoData.correo || 'No disponible'}</p>
                                    <div className="flex flex-wrap gap-x-4">
                                        <p><span className="font-semibold">Carrera:</span> {alumnoData.carrera || 'N/A'}</p>
                                        <p><span className="font-semibold">Semestre:</span> {alumnoData.semestre || '—'}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded-xl text-center">
                                <p className="text-red-600 font-semibold"> No se recibió información del alumno.</p>
                                <button onClick={handleBackClick} className="text-sm text-red-800 underline mt-2">Volver atrás</button>
                            </div>
                        )}
                    </div>

                    {/* Formulario de reporte */}
                    <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
                        <label className="font-medium text-gray-700">
                            Comentarios del reporte:
                            <textarea
                                value={mensaje}
                                onChange={(e) => setMensaje(e.target.value)}
                                placeholder="Describe la situación, incidencia o motivo del reporte aquí..."
                                className="p-4 border border-gray-300 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#E9DBCD] mt-2 h-40 resize-none text-base shadow-inner transition-shadow focus:shadow-md"
                            />
                        </label>

                        {/* Área de alertas */}
                        {alerta && (
                            <div className={`p-3 rounded-lg text-center font-bold text-sm md:text-base animate-fadeIn ${alerta.includes('exitosamente') ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-yellow-50 text-yellow-800 border border-yellow-300'}`}>
                                {alerta}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loadingEnviar || !alumnoData}
                            className={`
                                bg-[#E4CD87] hover:bg-[#dcb95b] text-black 
                                py-3 px-6 rounded-2xl font-bold text-lg md:text-xl 
                                mt-2 flex justify-center items-center gap-3 shadow-md 
                                transition-all active:scale-95 w-full
                                ${loadingEnviar || !alumnoData ? 'opacity-70 cursor-not-allowed grayscale' : ''}
                            `}
                        >
                            {loadingEnviar ? <FaSpinner className="animate-spin" /> : <FileText className="w-6 h-6" />}
                            {loadingEnviar ? 'Enviando...' : 'Crear Reporte'}
                        </button>
                    </form>
                </div>
            </main>

            <style>{`
                @keyframes fadeIn { 
                    from { opacity: 0; transform: translateY(10px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
                .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
            `}</style>
        </div>
    );
};

export default Reportes;