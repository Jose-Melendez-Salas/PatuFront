import React, { useState, useEffect } from 'react';
import Navbar from './Navbar.jsx';
import ilustracionImg from './assets/contacto.png';

const Contacto = () => {
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [asunto, setAsunto] = useState('');
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        if (usuario) {
            setNombre(usuario.nombre_completo || ''); // <-- aquí usamos nombre_completo
            setCorreo(usuario.correo || '');
        }
    }, []);


    const handleSubmit = (e) => {
        e.preventDefault();
        if (!mensaje.trim()) {
            alert("Por favor escribe un mensaje antes de enviar.");
            return;
        }

        console.log("Mensaje enviado:", { nombre, correo, asunto, mensaje });
        alert("Tu mensaje ha sido enviado al coordinador.");
        setAsunto('');
        setMensaje('');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="flex flex-col md:flex-row p-4 animate-fadeIn relative z-10 max-w-8xl mx-auto">
                {/* Lado izquierdo: imagen */}
                <div className="hidden md:flex md:w-1/2 lg:w-1/2 items-center justify-center p-10">
                    <img
                        src={ilustracionImg}
                        alt="Ilustración de contacto"
                        className="rounded-xl w-full max-h-[95vh] object-contain"
                    />
                </div>

                {/* Lado derecho: contenedor */}
                <div className="flex-1 md:w-1/2 lg:w-1/2 flex flex-col items-center justify-center p-4 md:p-7 md:ml-1">
                    <div className="bg-white rounded-3xl shadow-3xl p-6 md:p-10 w-full max-w-3xl animate-fadeIn border-7 border-gray-300 flex flex-col items-center">
                        <h2 className="text-4xl font-bold mb-8 text-center border-b-4 border-yellow-400 pb-2 w-full">
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
                                    className="p-3 border border-gray-300 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-purple-400 mt-2 placeholder-normal"
                                />
                            </label>

                            <label className="font-medium">
                                Correo Electrónico:
                                <input
                                    type="email"
                                    value={correo}
                                    onChange={(e) => setCorreo(e.target.value)}
                                    placeholder="Tu correo electrónico"
                                    className="p-3 border border-gray-300 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-purple-400 mt-2 placeholder-normal"
                                />
                            </label>

                            <label className="font-medium">
                                Asunto:
                                <input
                                    type="text"
                                    value={asunto}
                                    onChange={(e) => setAsunto(e.target.value)}
                                    placeholder="Asunto del mensaje"
                                    className="p-3 border border-gray-300 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-purple-400 mt-2 placeholder-normal"
                                />
                            </label>

                            <label className="font-medium">
                                Mensaje:
                                <textarea
                                    value={mensaje}
                                    onChange={(e) => setMensaje(e.target.value)}
                                    placeholder="Escribe tu mensaje aquí..."
                                    className="p-3 border border-gray-300 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-purple-400 mt-2 h-32 resize-none placeholder-normal"
                                />
                            </label>

                            <button
                                type="submit"
                                className="bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white py-3 px-6 rounded-2xl font-bold text-xl mt-4"
                            >
                                Enviar Mensaje
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
