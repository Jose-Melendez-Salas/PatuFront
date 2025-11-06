// Archivo: src/api/chat.js
// ¡VERSIÓN CORREGIDA para Google Gemini (Gratis)!

// Esta función convierte tu historial (formato OpenAI) al formato que Google necesita
function convertirHistorialParaGoogle(historial) {
    return historial
        // Filtramos mensajes de error del sistema, Google no los entiende
        .filter(msg => msg.role !== 'system')
        // Convertimos 'assistant' a 'model'
        .map(msg => ({
            role: msg.role === 'assistant' ? 'model' : msg.role,
            parts: [{ text: msg.content }]
        }));
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    // 1. Obtenemos el historial (formato OpenAI) que envió el frontend
    const { messages } = req.body;

    if (!messages) {
        return res.status(400).json({ error: 'Faltan mensajes en el cuerpo' });
    }

    // 2. Usamos la API Key de Google (de nuestro archivo .env)
    //    Asegúrate de que tu .env tenga la línea: GOOGLE_API_KEY=AIzaSy...
    const API_KEY = process.env.GOOGLE_API_KEY;
    const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

    if (!API_KEY) {
        console.error("¡ERROR! La variable GOOGLE_API_KEY no se encontró.");
        return res.status(500).json({ error: 'El servidor no tiene API key configurada.' });
    }

    // 3. Convertimos el historial al formato de Google
    const historialGoogle = convertirHistorialParaGoogle(messages.slice(0, -1));
    const ultimoMensajeGoogle = convertirHistorialParaGoogle(messages.slice(-1))[0];

    try {
        // 4. Llamamos a la API de Google Gemini
        const apiRes = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "contents": [
                    ...historialGoogle,
                    ultimoMensajeGoogle
                ],
                "generationConfig": {
                    "temperature": 0.7,
                }
            }),
        });

        const data = await apiRes.json();

        // 5. Devolvemos la respuesta al frontend
        if (data.candidates && data.candidates[0].content) {
            const respuestaGemini = data.candidates[0].content.parts[0].text;

            // La devolvemos en el formato que tu frontend (ChatIA.jsx) espera
            res.status(200).json({
                respuesta: {
                    role: 'assistant',
                    content: respuestaGemini
                }
            });

        } else {
            // Si Google da un error
            console.error("Respuesta inesperada de Google:", data);
            res.status(500).json({ error: 'Respuesta inesperada de Google', details: data.promptFeedback || data });
        }

    } catch (error) {
        console.error("Error en la función serverless (Google):", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}