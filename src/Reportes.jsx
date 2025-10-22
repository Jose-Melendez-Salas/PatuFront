import React, { useState, useEffect } from 'react';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import logoImg from './assets/logo.png';
import Navbar from './Navbar';

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

    const usuario = JSON.parse(localStorage.getItem('usuario'));

    useEffect(() => {
        if (usuario) {
            setNombre(usuario.nombre_completo || '');
            setCorreo(usuario.correo || '');
        }
    }, [usuario]);

    // 🔍 Buscar alumno por matrícula
    const handleBuscar = async () => {
        try {
            setErrorBusqueda('');
            setAlumnoEncontrado(null);

            if (!busqueda.trim()) {
                setErrorBusqueda(' Ingresa una matrícula para buscar.');
                return;
            }

            if (!usuario || !usuario.accessToken) {
                setErrorBusqueda(' Debes iniciar sesión primero.');
                return;
            }

            setLoadingBuscar(true);

            const res = await fetch(
                `https://apis-patu.onrender.com/api/alumnos/matricula/${busqueda}`,
                { headers: { Authorization: `Bearer ${usuario.accessToken}` } }
            );
            const data = await res.json();

            if (!res.ok || !data.success) {
                setErrorBusqueda(data.message || ' No se encontró ningún alumno con esa matrícula.');
                return;
            }

            setAlumnoEncontrado(data.data || data);
        } catch (err) {
            console.error(err);
            setErrorBusqueda(' Error al conectar con la API.');
        } finally {
            setLoadingBuscar(false);
        }
    };

    // 📨 Enviar reporte
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

        try {
            setLoadingEnviar(true);

            const reporte = {
                nombre_tutor: nombre,
                correo_tutor: correo,
                id_alumno: alumnoEncontrado?.id || null,
                matricula_alumno: alumnoEncontrado?.matricula || null,
                mensaje,
            };

            console.log('📦 Enviando reporte:', reporte);

            // Simulación de envío (puedes cambiarlo por el POST real)
            await new Promise((resolve) => setTimeout(resolve, 1500));

            setMensaje('');
            setBusqueda('');
            setAlumnoEncontrado(null);
            setAlerta('✅ Tu reporte ha sido enviado con éxito.');
        } catch (err) {
            console.error(err);
            setAlerta('❌ Error al enviar el reporte.');
        } finally {
            setLoadingEnviar(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <Navbar />

            {/* Contenido principal */}
            <main className="flex flex-col items-center p-4 md:p-8 animate-fadeIn relative z-10 max-w-8xl mx-auto">
                <div className="bg-white rounded-3xl shadow-3xl p-6 md:p-10 w-full max-w-3xl border-7 border-gray-300">
                    <h2 className="text-4xl font-bold mb-8 text-center border-b-4 border-yellow-400 pb-2">
                        Enviar Reporte
                    </h2>

                    {/* 🔍 Buscar alumno por matrícula */}
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
                                className={`bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white py-3 px-5 rounded-2xl font-bold flex items-center gap-2 ${loadingBuscar ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                            >
                                {loadingBuscar ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                                Buscar
                            </button>
                        </div>

                        {errorBusqueda && (
                            <p className="text-red-500 mt-2 font-semibold">{errorBusqueda}</p>
                        )}

                        {alumnoEncontrado && (
                            <div className="mt-3 p-3 bg-green-100 border border-green-400 rounded-xl">
                                <p className="font-bold">
                                    {alumnoEncontrado.nombre} {alumnoEncontrado.apellido_paterno}{' '}
                                    {alumnoEncontrado.apellido_materno}
                                </p>
                                <p>Matrícula: {alumnoEncontrado.matricula}</p>
                            </div>
                        )}
                    </div>

                    {/* 📝 Campo del mensaje */}
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
                            <p
                                className={`text-center font-bold mt-2 ${alerta.includes('✅') ? 'text-green-600' : 'text-red-600'
                                    }`}
                            >
                                {alerta}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loadingEnviar}
                            className={`bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white py-3 px-6 rounded-2xl font-bold text-xl mt-4 flex justify-center items-center gap-2 ${loadingEnviar ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
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
