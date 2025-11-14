import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar.jsx";

const NuevoGrupo = () => {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [tutor, setTutor] = useState("");
  const [semestre, setSemestre] = useState("");
  const [tutores, setTutores] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [cargandoTutores, setCargandoTutores] = useState(false);

  // ===============================
  // CARGAR TUTORES DESDE API
  // ===============================
  const obtenerTutores = async () => {
    // Evitar recargas innecesarias
    if (cargandoTutores) return;
    setCargandoTutores(true);
    setError(null);

    try {
      const usuarioGuardado = localStorage.getItem("usuario");
      if (!usuarioGuardado) {
        setError("No hay sesión iniciada.");
        setCargandoTutores(false);
        return;
      }

      const usuario = JSON.parse(usuarioGuardado);
      const token = usuario.accessToken;

      const respuesta = await fetch("https://apis-patu.onrender.com/api/tutores/todos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await respuesta.json();
      console.log("RAW RESPONSE:", data);

      if (respuesta.ok && data.data) {
        const lista = Array.isArray(data.data) ? data.data : [data.data];
        setTutores(lista);
      } else {
        // Si es 401 u otro error, mostramos mensaje apropiado
        const msg = data?.error || data?.message || "Formato de datos no válido";
        setError(msg);
        setTutores([]);
      }
    } catch (err) {
      console.error("Error al obtener tutores:", err);
      setError("No se pudieron cargar los tutores.");
      setTutores([]);
    } finally {
      setCargandoTutores(false);
    }
  };

  // Cargar tutores al montar el componente (evita el problema del dropdown abierto antes de recibir datos)
  useEffect(() => {
    obtenerTutores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===============================
  // CREAR GRUPO
  // ===============================
  const handleCrearGrupo = async (e) => {
    e.preventDefault();

    const usuarioGuardado = localStorage.getItem("usuario");
    if (!usuarioGuardado) {
      setError("No hay sesión iniciada.");
      return;
    }

    const usuario = JSON.parse(usuarioGuardado);
    const token = usuario.accessToken;

    if (!nombre || !semestre || !tutor) {
      setError("Por favor completa todos los campos.");
      return;
    }

    const nuevoGrupo = {
      id_tutor: tutor,
      nombre,
      codigo,
      semestre,
    };

    try {
      setCargando(true);
      setError(null);
      setMensaje(null);

      const respuesta = await fetch("https://apis-patu.onrender.com/api/grupos/crear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nuevoGrupo),
      });

      const data = await respuesta.json();

      if (data.success) {
        setMensaje("Grupo creado exitosamente");
        setTimeout(() => navigate("/grupos"), 2000);
      } else {
        setError(data.message || "No se pudo crear el grupo.");
      }
    } catch (err) {
      console.error("Error al crear grupo:", err);
      setError("Ocurrió un error al conectar con el servidor.");
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
            {/* ===================== Nombre ===================== */}
            <div>
              <label className="block text-xl font-semibold text-gray-800 mb-3">
                Nombre del grupo.
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Tutoría A"
                className="w-full border border-gray-300 rounded-full p-3 focus:outline-none focus:ring-4 focus:ring-purple-200 text-gray-700 shadow-sm mb-4"
              />

              {/* ===================== Tutor ===================== */}
              <label
                className={`block text-xl font-semibold text-gray-800 mb-2`}
                title="Se cargan los tutores automáticamente"
              >
                Tutor del grupo.
              </label>

              <select
                value={tutor}
                onChange={(e) => setTutor(e.target.value)}
                disabled={cargandoTutores}
                className="w-full border border-gray-300 rounded-full p-3 focus:outline-none focus:ring-4 focus:ring-purple-200 text-gray-700 shadow-sm"
              >
                {cargandoTutores ? (
                  <option value="">Cargando tutores...</option>
                ) : (
                  <>
                    <option value="">Seleccione un tutor</option>
                    {tutores.map((t) => (
                      <option key={t.id_usuario ?? t.id} value={t.id_usuario ?? t.id}>
                        {t["nombre _ completo"] ?? t.nombre_completo ?? `${t.nombre ?? ""} ${t.apellido_paterno ?? ""}`}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            {/* ===================== Semestre ===================== */}
            <div>
              <label className="block text-xl font-semibold text-gray-800 mb-2">
                Semestre.
              </label>
              <select
                value={semestre}
                onChange={(e) => setSemestre(e.target.value)}
                className="w-full border border-gray-300 rounded-full p-3 focus:outline-none focus:ring-4 focus:ring-purple-200 text-gray-700 shadow-sm"
              >
                <option value="" disabled>
                  Seleccione un semestre
                </option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={`${i + 1}° Semestre`}>
                    {i + 1}° Semestre
                  </option>
                ))}
              </select>
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
