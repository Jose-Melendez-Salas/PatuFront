import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import { FiUsers, FiBookOpen, FiUserCheck, FiChevronRight, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const NuevoGrupo = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);

  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [tutor, setTutor] = useState("");
  const [semestre, setSemestre] = useState("");
  const [tutores, setTutores] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [cargandoTutores, setCargandoTutores] = useState(false);
  const [formAnimating, setFormAnimating] = useState(false);

  // ===============================
  // CARGAR TUTORES DESDE API
  // ===============================
  const obtenerTutores = async () => {
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

  useEffect(() => {
    obtenerTutores();
    // Animar entrada del formulario
    setTimeout(() => setFormAnimating(true), 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===============================
  // CREAR GRUPO
  // ===============================
  const handleCrearGrupo = async (e) => {
    e.preventDefault();
    setFormAnimating(false);

    const usuarioGuardado = localStorage.getItem("usuario");
    if (!usuarioGuardado) {
      setError("No hay sesión iniciada.");
      setTimeout(() => setFormAnimating(true), 100);
      return;
    }

    const usuario = JSON.parse(usuarioGuardado);
    const token = usuario.accessToken;

    if (!nombre || !semestre || !tutor) {
      setError("Por favor completa todos los campos.");
      setTimeout(() => setFormAnimating(true), 100);
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
        // Animación de éxito
        setTimeout(() => {
          setFormAnimating(true);
          navigate("/grupos");
        }, 1500);
      } else {
        setError(data.message || "No se pudo crear el grupo.");
        setTimeout(() => setFormAnimating(true), 100);
      }
    } catch (err) {
      console.error("Error al crear grupo:", err);
      setError("Ocurrió un error al conectar con el servidor.");
      setTimeout(() => setFormAnimating(true), 100);
    } finally {
      setCargando(false);
    }
  };

  // Animación para el select de tutor cuando se cargan datos
  const [selectPulsing, setSelectPulsing] = useState(false);
  
  useEffect(() => {
    if (cargandoTutores) {
      const interval = setInterval(() => {
        setSelectPulsing(prev => !prev);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [cargandoTutores]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col pt-24">
      <Navbar />

      <main className="p-4 md:p-8 flex flex-col items-center justify-center flex-grow">
        <div className={`w-full max-w-xl transition-all duration-500 transform ${formAnimating ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {/* Header con icono */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#E4CD87] to-[#C7952C] rounded-full shadow-lg mb-4">
              <FiUsers className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Crear Nuevo Grupo
            </h1>
            <p className="text-gray-600 text-lg">
              Completa los datos para crear un nuevo grupo de tutorías
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-[#E4CD87] to-[#C7952C] mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Formulario */}
          <div 
            ref={formRef}
            className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-200/50 transition-all duration-500 hover:shadow-3xl"
          >
            <form onSubmit={handleCrearGrupo} className="space-y-8">
              {/* Nombre del Grupo */}
              <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                    <FiBookOpen className="text-[#C7952C] text-xl" />
                  </div>
                  <label className="text-xl font-semibold text-gray-800">
                    Nombre del Grupo
                  </label>
                </div>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    setError(null);
                  }}
                  placeholder="Ej. Tutoría A, Grupo de Matemáticas..."
                  className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:outline-none focus:border-[#C7952C] focus:ring-4 focus:ring-[#E4CD87]/20 transition-all duration-300 text-gray-700 shadow-sm hover:shadow-md"
                />
              </div>

              {/* Tutor del Grupo */}
              <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                    <FiUserCheck className="text-[#C7952C] text-xl" />
                  </div>
                  <label className="text-xl font-semibold text-gray-800">
                    Tutor del Grupo
                  </label>
                  {cargandoTutores && (
                    <span className={`inline-block w-2 h-2 rounded-full bg-[#C7952C] ${selectPulsing ? 'animate-ping' : ''}`}></span>
                  )}
                </div>
                <div className="relative">
                  <select
                    value={tutor}
                    onChange={(e) => {
                      setTutor(e.target.value);
                      setError(null);
                    }}
                    disabled={cargandoTutores}
                    className={`w-full border-2 border-gray-200 rounded-2xl p-4 focus:outline-none focus:border-[#C7952C] focus:ring-4 focus:ring-[#E4CD87]/20 transition-all duration-300 text-gray-700 shadow-sm hover:shadow-md appearance-none ${
                      cargandoTutores ? 'animate-pulse bg-gray-50' : ''
                    }`}
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
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <FiChevronRight className="text-gray-400 text-xl rotate-90" />
                  </div>
                </div>
              </div>

              {/* Semestre */}
              <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.3s" }}>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                    <FiBookOpen className="text-[#C7952C] text-xl" />
                  </div>
                  <label className="text-xl font-semibold text-gray-800">
                    Semestre
                  </label>
                </div>
                <div className="relative">
                  <select
                    value={semestre}
                    onChange={(e) => {
                      setSemestre(e.target.value);
                      setError(null);
                    }}
                    className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:outline-none focus:border-[#C7952C] focus:ring-4 focus:ring-[#E4CD87]/20 transition-all duration-300 text-gray-700 shadow-sm hover:shadow-md appearance-none"
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
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <FiChevronRight className="text-gray-400 text-xl rotate-90" />
                  </div>
                </div>
              </div>

              {/* Mensajes de estado */}
              <div className="animate-fade-in">
                {mensaje && (
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 mb-4 animate-scale-in">
                    <FiCheckCircle className="text-green-500 text-xl flex-shrink-0" />
                    <p className="text-green-700 font-medium">{mensaje}</p>
                  </div>
                )}
                {error && (
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-4 mb-4 animate-shake">
                    <FiAlertCircle className="text-red-500 text-xl flex-shrink-0" />
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                )}
              </div>

              {/* Botón de envío */}
              <div className="pt-4 animate-slide-up" style={{ animationDelay: "0.4s" }}>
                <button
                  type="submit"
                  disabled={cargando}
                  className={`group w-full bg-gradient-to-r from-[#E4CD87] to-[#C7952C] text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl flex items-center justify-center space-x-2 ${
                    cargando ? 'opacity-80 cursor-not-allowed' : ''
                  }`}
                >
                  {cargando ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creando Grupo...</span>
                    </>
                  ) : (
                    <>
                      <span>Crear Grupo</span>
                      <FiChevronRight className="group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Información adicional */}
          <div className="text-center mt-6 text-gray-500 text-sm animate-fade-in">
            <p>Los grupos creados estarán disponibles inmediatamente.</p>
            
          </div>
        </div>
      </main>

      {/* Estilos de animación CSS */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out forwards;
          opacity: 0;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default NuevoGrupo;