import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar.jsx";

const NuevoGrupo = () => {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [semestre, setSemestre] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleCrearGrupo = async (e) => {
    e.preventDefault();

    const usuarioGuardado = localStorage.getItem("usuario");
    if (!usuarioGuardado) {
      setError("⚠️ No hay sesión iniciada.");
      return;
    }

    const usuario = JSON.parse(usuarioGuardado);
    const idTutor = usuario.id;
    const token = usuario.accessToken;

    if (!nombre || !semestre) {
      setError("⚠️ Por favor completa todos los campos.");
      return;
    }

    const nuevoGrupo = {
      id_tutor: idTutor,
      nombre: nombre,
      codigo: codigo,
      semestre: semestre,
    };

    try {
      setCargando(true);
      setError(null);
      setMensaje(null);

      const respuesta = await fetch("https://apis-patu.onrender.com/api/grupos/crear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(nuevoGrupo),
      });

      const data = await respuesta.json();

      if (data.success) {
        setMensaje(" Grupo creado exitosamente ");
        setTimeout(() => navigate("/grupos"), 2000);
      } else {
        setError(data.message || " No se pudo crear el grupo.");
      }
    } catch (err) {
      console.error("Error al crear grupo:", err);
      setError(" Ocurrió un error al conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="p-6 md:p-10 flex flex-col items-center justify-center flex-grow">
        <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-200 w-full max-w-lg">
          <h2 className="text-3xl font-bold mb-2 text-gray-800">Nuevo grupo</h2>
          <div className="w-full h-1 bg-yellow-400 mb-6"></div>

          <form onSubmit={handleCrearGrupo} className="space-y-6">
            <div>
              <label className="block text-xl font-semibold text-gray-800 mb-2">
                Nombre del grupo
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Tutoría A"
                className="w-full border border-gray-300 rounded-full p-3 focus:outline-none focus:ring-4 focus:ring-purple-200 text-gray-700 shadow-sm"
              />
            </div>

            

            <div>
              <label className="block text-xl font-semibold text-gray-800 mb-2">
                Semestre
              </label>
              <input
                type="text"
                value={semestre}
                onChange={(e) => setSemestre(e.target.value)}
                placeholder="Ej. 5° Semestre"
                className="w-full border border-gray-300 rounded-full p-3 focus:outline-none focus:ring-4 focus:ring-purple-200 text-gray-700 shadow-sm"
              />
            </div>

            {mensaje && <p className="text-green-600 text-center">{mensaje}</p>}
            {error && <p className="text-red-600 text-center">{error}</p>}

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={cargando}
                className={`bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg transition duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                  cargando && "opacity-70 cursor-not-allowed"
                }`}
              >
                {cargando ? "Creando..." : "Crear Grupo"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default NuevoGrupo;
