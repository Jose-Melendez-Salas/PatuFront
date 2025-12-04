import React, { useState, useEffect } from 'react';
import Navbar from './Navbar.jsx';
import ilustracionImg from './assets/contacto.png';
import Swal from 'sweetalert2'; // ← 🟢 Instálalo con: npm install sweetalert2

const Contacto = () => {
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [asunto, setAsunto] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        if (usuario) {
            const nombreCompleto =
                usuario.nombre_completo ||
                `${usuario.nombre || ''} ${usuario.apellido_paterno || ''} ${usuario.apellido_materno || ''}`.trim();

            setNombre(nombreCompleto);
            setCorreo(usuario.correo || '');
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!mensaje.trim() || !asunto.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor completa el asunto y el mensaje antes de enviar.',
                confirmButtonColor: '#3CB9A5'
            });
            return;
        }

        setCargando(true);

        try {
            const usuario = JSON.parse(localStorage.getItem('usuario'));
            const token = usuario?.accessToken;

            if (!token) {
                Swal.fire({
                    icon: 'error',
                    title: 'Sesión expirada',
                    text: '⚠️ No se encontró el token de autenticación. Por favor inicia sesión nuevamente.',
                    confirmButtonColor: '#E4CD87'
                });
                setCargando(false);
                return;
            }

            const respuesta = await fetch('https://apis-patu.onrender.com/api/mensajes/crear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    nombre,
                    correo,
                    asunto,
                    mensaje,
                }),
            });

            const data = await respuesta.json();

            if (respuesta.ok && data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Mensaje enviado',
                    text: 'Tu mensaje ha sido enviado al coordinador.',
                    confirmButtonColor: '#E4CD87'
                });
                setAsunto('');
                setMensaje('');
            } else {
                console.error('Error al enviar mensaje:', data);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al enviar',
                    text: data.error || '❌ Ocurrió un error. Intenta de nuevo.',
                    confirmButtonColor: '#E4CD87'
                });
            }
        } catch (error) {
            console.error('Error en la petición:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: '❌ No se pudo conectar con el servidor. Inténtalo más tarde.',
                confirmButtonColor: '#3CB9A5'
            });
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="flex flex-col md:flex-row p-4 animate-fadeIn relative z-10 max-w-8xl mx-auto">
                {/* Imagen lateral */}
                <div className="hidden md:flex md:w-1/2 lg:w-1/2 items-center justify-center p-10">
                    <img
                        src={ilustracionImg}
                        alt="Ilustración de contacto"
                        className="rounded-xl w-full max-h-[95vh] object-contain"
                    />
                </div>

                {/* Formulario */}
                <div className="flex-1 md:w-1/2 lg:w-1/2 flex flex-col items-center justify-center p-4 md:p-7 md:ml-1">
                    <div className="bg-white rounded-3xl shadow p-6 md:p-10 w-full max-w-3xl animate-fadeIn border-1 border-[#E9DBCD] flex flex-col items-center">
                        <h2 className="text-4xl font-bold mb-8 text-center border-b-4 border-[#C7952C] pb-2 w-full">
                            Contacto
                        </h2>

                        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
                            <label className="font-medium">
                                Nombre:
                                <input
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    placeholder="Tu nombre"
                                    className="p-3 border border-gray-300 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#E4CD87] mt-2"
                                />
                            </label>

                            <label className="font-medium">
                                Correo Electrónico:
                                <input
                                    type="email"
                                    value={correo}
                                    onChange={(e) => setCorreo(e.target.value)}
                                    placeholder="Tu correo electrónico"
                                    className="p-3 border border-gray-300 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#E4CD87] mt-2"
                                />
                            </label>

                            <label className="font-medium">
                                Asunto:
                                <input
                                    type="text"
                                    value={asunto}
                                    onChange={(e) => setAsunto(e.target.value)}
                                    placeholder="Asunto del mensaje"
                                    className="p-3 border border-gray-300 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#E4CD87] mt-2"
                                />
                            </label>

                            <label className="font-medium">
                                Mensaje:
                                <textarea
                                    value={mensaje}
                                    onChange={(e) => setMensaje(e.target.value)}
                                    placeholder="Escribe tu mensaje aquí..."
                                    className="p-3 border border-gray-300 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#E4CD87] mt-2 h-32 resize-none"
                                />
                            </label>

                            <button
                                type="submit"
                                disabled={cargando}
                                className={`${cargando ? 'bg-gray-400' : 'bg-[#E4CD87] hover:bg-[#C7952C]'
                                    } text-white py-3 px-6 rounded-2xl font-bold text-xl mt-4 transition duration-300`}
                            >
                                {cargando ? 'Enviando...' : 'Enviar Mensaje'}
                            </button>
                        </form>
                    </div>
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

export default Contacto;
