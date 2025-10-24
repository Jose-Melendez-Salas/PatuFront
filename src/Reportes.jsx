import React, { useState, useEffect } from 'react';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoImg from './assets/logo.png';

const Reportes = () => {
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [alumnoEncontrado, setAlumnoEncontrado] = useState(null);
    const [errorBusqueda, setErrorBusqueda] = useState('');
    const [loadingBuscar, setLoadingBuscar] = useState(false);
    const [loadingEnviar, setLoadingEnviar] = useState(false);
    const [alerta, setAlerta] = useState('');
    const [mensajes, setMensajes] = useState([]);
    const navigate = useNavigate();

    const usuario = JSON.parse(localStorage.getItem('usuario'));

    useEffect(() => {
        if (usuario) {
            setNombre(usuario.nombre_completo || '');
            setCorreo(usuario.correo || '');
        }
    }, [usuario]);

    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        const date = new Date(fecha);
        return date.toLocaleDateString('es-MX', {
            timeZone: 'America/Mexico_City',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const handleBuscar = async () => {
        try {
            setErrorBusqueda('');
            setAlumnoEncontrado(null);

            if (!busqueda.trim()) {
                setErrorBusqueda('Ingresa una matrícula para buscar.');
                return;
            }

            if (!usuario || !usuario.accessToken) {
                setErrorBusqueda('Debes iniciar sesión primero.');
                return;
            }

            setLoadingBuscar(true);

            const res = await fetch(
                `https://apis-patu.onrender.com/api/alumnos/matricula/${busqueda}`,
                { headers: { Authorization: `Bearer ${usuario.accessToken}` } }
            );
            const data = await res.json();

            if (!res.ok || !data.success) {
                setErrorBusqueda(data.message || 'No se encontró ningún alumno con esa matrícula.');
                return;
            }

            setAlumnoEncontrado(data.data || data);
        } catch (err) {
            console.error(err);
            setErrorBusqueda('Error al conectar con la API.');
        } finally {
            setLoadingBuscar(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAlerta('');

        if (!mensaje.trim()) {
            alert('Por favor escribe un mensaje antes de enviar.');
            return;
        }

        if (!alumnoEncontrado) {
            alert('Debes buscar y seleccionar un alumno antes de enviar el reporte.');
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
                    matricula: alumnoEncontrado.matricula,
                    contenido: mensaje,
                    correo_tutor: correo,
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setAlerta('✅ Reporte enviado exitosamente.');
                setMensaje('');
                setBusqueda('');
                setAlumnoEncontrado(null);

                setMensajes((prev) => [data.data, ...prev]);
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

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ======= Navbar sin menú hamburguesa ======= */}
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
                            onClick={() => navigate('/FichaAlumno')}
                        />
                        <h2 className="text-4xl font-bold mb-8 text-center border-b-4 border-yellow-400 pb-2">
                            Enviar Reporte
                        </h2>
                    </div>

                    <div className="mb-6">
                        <label className="font-medium text-lg block mb-2">
                            Buscar Alumno por Matrícula:
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                placeholder="Ejemplo: 2023123456"
                                className="p-3 border border-gray-300 rounded-xl flex-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                            <button
                                type="button"
                                onClick={handleBuscar}
                                disabled={loadingBuscar}
                                className={`bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white py-3 px-5 rounded-2xl font-bold flex items-center gap-2 ${loadingBuscar ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loadingBuscar ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                                Buscar
                            </button>
                        </div>

                        {errorBusqueda && <p className="text-red-500 mt-2 font-semibold">{errorBusqueda}</p>}

                        {alumnoEncontrado && (
                            <div className="mt-3 p-3 bg-green-100 border border-green-400 rounded-xl">
                                <p className="font-bold">
                                    {alumnoEncontrado.nombre} {alumnoEncontrado.apellido_paterno} {alumnoEncontrado.apellido_materno}
                                </p>
                                <p>Matrícula: {alumnoEncontrado.matricula}</p>
                            </div>
                        )}
                    </div>

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
                            disabled={loadingEnviar}
                            className={`bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white py-3 px-6 rounded-2xl font-bold text-xl mt-4 flex justify-center items-center gap-2 ${loadingEnviar ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loadingEnviar && <FaSpinner className="animate-spin" />}
                            {loadingEnviar ? 'Enviando...' : 'Enviar'}
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
