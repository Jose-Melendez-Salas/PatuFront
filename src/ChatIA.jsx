// Archivo: ChatIA.jsx
// ¡Con la función 'enviarPregunta' CORREGIDA!

import React, { Component } from 'react';
import Navbar from './Navbar.jsx';
import patoImg from './assets/pato.png';

class ChatIA extends Component {

    // ... (El constructor se queda igual) ...
    constructor(props) {
        super(props);
        this.state = {
            pregunta: "",
            historial: [],
            loading: false
        };
    }

    // ... (El componentDidMount se queda igual) ...
    componentDidMount() {
        this.setState({
            historial: [
                { role: 'assistant', content: '¡Hola! Soy tu asistente de IA. ¿En qué puedo ayudarte hoy?' }
            ]
        });
    }

    // ===================================================================
    // AQUÍ ESTÁ EL ÚNICO CAMBIO QUE NECESITAS
    // Esta es la nueva función que llama a tu backend en /api/chat
    // ===================================================================
    enviarPregunta = async () => {
        const { pregunta, historial } = this.state;
        if (!pregunta.trim()) return;

        const nuevaPregunta = { role: "user", content: pregunta };
        const newHistorial = [...historial, nuevaPregunta];

        this.setState({
            historial: newHistorial,
            loading: true,
            pregunta: ""
        });

        try {
            // 1. ¡URL CAMBIADA! Ahora llamamos a nuestro "mesero" (backend)
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // 2. ¡SIN API KEY! Ya no se pone aquí. Está segura en el backend.
                },
                body: JSON.stringify({
                    // 3. Enviamos los mensajes dentro de un objeto 'messages'
                    messages: newHistorial,
                }),
            });

            const data = await res.json();

            // 4. Revisamos si la respuesta de NUESTRO backend fue exitosa
            if (res.ok) {
                // 5. Nuestro backend nos devuelve la respuesta en 'data.respuesta'
                const respuestaIA = data.respuesta;
                this.setState(prevState => ({
                    historial: [...prevState.historial, respuestaIA]
                }));
            } else {
                // Si nuestro backend falló, mostramos el error
                throw new Error(data.error || 'Error al obtener respuesta');
            }

        } catch (error) {
            // 6. El 'catch' ahora captura errores de /api/chat
            console.error("Error al contactar el backend (/api/chat):", error);
            this.setState(prevState => ({
                // Mostramos el error que nos dio nuestro backend
                historial: [...prevState.historial, { role: 'system', content: `Error: ${error.message}` }]
            }));
        }

        this.setState({ loading: false });
    };

    // ===================================================================
    // (El método 'render' se queda exactamente igual)
    // ===================================================================
    render() {
        const { pregunta, historial, loading } = this.state;

        return (
            // 1. Contenedor Principal (simple)
            <div className="bg-gray-100">

                <Navbar /> {/* 2. Tu Navbar (ocupa 80px) */}

                {/* 3. Área del Chat (ocupa el resto de la pantalla y tiene márgenes) */}
                <div className="flex flex-col h-[calc(100vh-80px)] p-4 md:p-8">

                    {/* Cabecera del Chat */}
                    <h1 className="text-3xl font-bold text-gray-800 mb-4 flex-shrink-0">ChatIA</h1>

                    {/* 4. Historial de mensajes (Caja Blanca Principal) */}
                    <div className="relative flex-grow bg-white rounded-lg shadow-md overflow-hidden mb-4">

                        {/* 5. FONDO PATO */}
                        <div
                            className="absolute inset-0 z-0 bg-contain bg-center bg-no-repeat opacity-20 blur-[2px]"
                            style={{ backgroundImage: `url(${patoImg})` }}
                        />

                        {/* 6. CONTENEDOR DE MENSAJES */}
                        <div className="relative z-10 h-full overflow-y-auto p-6 space-y-4">
                            {historial.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`rounded-lg px-4 py-3 max-w-lg ${msg.role === 'user'
                                        ? 'bg-[#4F3E9B] text-white'
                                        : (msg.role === 'system'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-gray-200 text-gray-800')
                                        }`}>
                                        <strong className="font-bold text-sm block mb-1">
                                            {msg.role === 'user' ? 'Tú' : (msg.role === 'system' ? 'Sistema' : 'ChatIA')}
                                        </strong>
                                        <p className="text-sm">{msg.content}</p>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="rounded-lg px-4 py-3 max-w-lg bg-gray-200 text-gray-800">
                                        <p className="text-sm italic">Pensando...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 7. Área de entrada de texto */}
                    <div className="flex gap-2 flex-shrink-0">
                        <input
                            type="text"
                            value={pregunta}
                            onChange={(e) => this.setState({ pregunta: e.target.value })}
                            onKeyPress={(e) => e.key === 'Enter' && !loading && this.enviarPregunta()}
                            placeholder="Escribe tu pregunta..."
                            disabled={loading}
                            className="flex-grow border rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-[#4F3E9B] focus:border-transparent bg-white"
                        />
                        <button
                            onClick={this.enviarPregunta}
                            disabled={loading}
                            className="bg-[#4F3E9B] text-white font-semibold rounded-full px-6 py-3
                                       hover:bg-[#3a2d7a] transition-colors
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? '...' : 'Enviar'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default ChatIA;