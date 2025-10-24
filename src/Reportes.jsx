import React, { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoImg from './assets/logo.png';

const Reportes = () => {
    const [mensaje, setMensaje] = useState('');
    const [loadingEnviar, setLoadingEnviar] = useState(false);
    const [alerta, setAlerta] = useState('');
    const [mensajes, setMensajes] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const alumnoData = location.state?.alumno; // Alumno que viene de FichaAlumno

    const usuario = JSON.parse(localStorage.getItem('usuario'));

    useEffect(() => {
        if (!usuario) {
            navigate('/login'); // Redirigir si no hay sesión
        }
    }, [usuario, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlerta('');

        if (!mensaje.trim()) {
            // Reemplazamos alert() con setAlerta() para un mejor feedback
            setAlerta('❌ Por favor escribe un mensaje antes de enviar.');
            return;
        }

        if (!alumnoData) {
            setAlerta('❌ No se recibió información del alumno.');
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
                setAlerta('✅ Reporte enviado exitosamente.');
                setMensaje('');
                // Opcional: podrías querer actualizar una lista de reportes enviados si la hubiera
                // setMensajes((prev) => [data.data, ...prev]);
            } else {
                setAlerta(`❌ Error: ${data.message || 'No se pudo enviar el reporte.'}`);
            }
        } catch (err) {
            console.error(err);
            setAlerta('❌ Error al conectar con el servidor.');
        } finally {
            setLoadingEnviar(false);
        }
    };

    const handleBackClick = () => {
        // Navegar de regreso a la ficha del alumno usando su matrícula
        if (alumnoData && alumnoData.matricula) {
            navigate(`/alumnos/${alumnoData.matricula}/ficha`);
        } else {
            // Fallback: si no hay datos del alumno, volver a la página anterior o a una ruta por defecto
            navigate(-1);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Navbar */}
            <header className="relative bg-[#4F3E9B] text-white flex items-center justify-between px-5 h-20">
                {usuario && (
                    <div className="text-3xl font-bold">
                        ¡Hola, {usuario.nombre}!
                    </div>
                )}
                <div className="flex items-center gap-4 text-4xl font-bold ml-auto">
                    PATU
                    <img src={logoImg} alt="Logo" className="w-12 h-12" />
                </div>
            </header>

            <main className="flex flex-col items-center p-4 md:p-8 animate-fadeIn relative z-10 max-w-8xl mx-auto">
                <div className="bg-white rounded-3xl shadow-3xl p-6 md:p-10 w-full max-w-3xl border-7 border-gray-300">
                    <div className="relative">
                        <ArrowLeft
                            className="w-6 h-6 absolute top-4 left-4 text-gray-600 hover:text-gray-800 cursor-pointer"
                            // --- CAMBIO AQUÍ ---
                            // Se llama a la nueva función handleBackClick
                            onClick={handleBackClick}
                        />

                        <h2 className="text-4xl font-bold mb-8 text-center border-b-4 border-yellow-400 pb-2">
                            Crear Reporte
                        </h2>
                    </div>

                    {/* Contenedor del alumno */}
                    <div className="mb-6">
                        <label className="font-medium text-lg block mb-2">Alumno Seleccionado:</label>
                        {alumnoData ? (
                            <div className="mt-3 p-3 bg-green-100 border border-green-400 rounded-xl">
                                <p className="font-bold">
                                    {alumnoData.nombre_completo || `${alumnoData.nombre || ''} ${alumnoData.apellido_paterno || ''} ${alumnoData.apellido_materno || ''}`}
                                </p>
                                <p>Matrícula: {alumnoData.matricula}</p>
                                <p>Correo: {alumnoData.correo || 'No disponible'}</p>
                                <p>Carrera: {alumnoData.carrera || 'No especificada'}</p>
                                <p>Semestre: {alumnoData.semestre || '—'}</p>
                            </div>
                        ) : (
                            <p className="text-red-500 font-semibold">No se recibió información del alumno.</p>
                        )}
                    </div>

                    {/* Formulario de reporte */}
                    <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
                        <label className="font-medium">
                            Comentarios del reporte:
                            <textarea
                                value={mensaje}
                                onChange={(e) => setMensaje(e.target.value)}
                                placeholder="Añade tus comentarios aquí..."
                                className="p-3 border border-gray-300 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-purple-400 mt-2 h-32 resize-none placeholder-normal"
                            />
                        </label>

                        {alerta && (
                            <p className={`text-center font-bold mt-2 ${alerta.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                                {alerta}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loadingEnviar || !alumnoData} // Deshabilitar si no hay alumno
                            className={`bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white py-3 px-6 rounded-2xl font-bold text-xl mt-4 flex justify-center items-center gap-2 ${loadingEnviar || !alumnoData ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loadingEnviar && <FaSpinner className="animate-spin" />}
                            <FileText className="w-5 h-5" />
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
                .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
            `}</style>
        </div>
    );
};

export default Reportes;