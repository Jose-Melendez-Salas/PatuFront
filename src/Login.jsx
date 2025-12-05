import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import ITSM from "./assets/ITSM.png";
import TecNM from "./assets/tecNM.png";
import Logo from "./assets/PATU-Logo.png";
import Maestro from "./assets/Maestroo.jpeg";

import { Eye, EyeOff } from "lucide-react";

const Login = ({ onLogin }) => {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!correo.trim() || !contraseña.trim()) {
      setError("Por favor completa todos los campos.");
      return;
    }
    setError("");
    setLoading(true); // ✅ inicia loading
    try {
      const res = await fetch(
        "https://apis-patu.onrender.com/api/usuarios/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            correo: correo,
            password: contraseña, // backend espera "password"
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error en el inicio de sesión");
        return;
      }

      // Guardar datos en localStorage
      localStorage.setItem(
        "usuario",
        JSON.stringify({
          id: data.data.id,
          nombre: data.data.nombre, // nombre corto
          nombre_completo: data.data.nombre_completo, // nombre completo
          rol: data.data.rol,
          matricula: data.data.matricula, // matrícula
          carrera: data.data.carrera, // <--- AÑADES ESTO
          semestre: data.data.semestre,
          correo: data.data.correo,
          accessToken: data.data.accessToken,
        })
      );

      console.log("rol", data.data.rol);

      // Redirección
      if (data.data.rol === "tutor") {
        navigate("/accesosMaestros");
      } else if (data.data.rol === "alumno") {
        navigate(`/HomeAlumno/${data.data.matricula}`); // usar matrícula
      } else if (data.data.rol === "admin") {
        navigate("/Registro"); // <-- admin va a registro
        } else if (data.data.rol === "psicologia") {
        navigate("/Homepsicologa"); // <-- psicologia va a Homepsicologa
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con el servidor");
    } finally {
      setLoading(false); // ✅ termina loading
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="w-full bg-[#8C1F2F] text-white p-4 flex items-center justify-between fixed top-0 z-10 shadow-lg">
        {/* Contenedor del logo ITSM y títulos */}
        <div className="flex items-center gap-3">
          <img src={ITSM} alt="Logo del ITSM" className="h-12 w-auto" />
          <div className="hidden sm:block">
            <h1 className="font-bold text-lg leading-tight">
              Instituto Tecnológico Superior de El Mante
            </h1>
            <p className="text-sm leading-snug">
              Programa Académico de Tutorías (PATU)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <img src={Logo} alt="Logo PATU" className="h-10 w-auto" />
          <img
            src={TecNM}
            alt="Logo del TecNM"
            className="h-12 w-auto hidden md:block"
          />
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 flex mt-16">
        {" "}
        {/* mt-16 para compensar el header fijo */}
        {/* Lado izquierdo - Imagen Maestro */}
        <div className="hidden md:flex md:w-1/2">
          <img
            src={Maestro}
            alt="Maestro"
            className="w-full h-full object-cover"
            style={{
              minHeight: "calc(100vh - 8rem)",
            }} /* Altura desde header hasta footer */
          />
        </div>
        {/* Lado derecho - Formulario */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-10">
          <div className="bg-white rounded-3xl shadow-3xl p-8 md:p-10 w-full max-w-3xl animate-fadeIn border-2 border-gray-300">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center border-b-4 border-[#C7952C] pb-2">
              Iniciar Sesión
            </h2>

            <form
              className="flex flex-col items-center gap-6 w-full"
              onSubmit={handleSubmit}
            >
              <label className="text-gray-700 font-medium w-full max-w-md relative group">
                Correo Electrónico <span className="text-red-500">*</span>
                <input
                  type="text"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="Correo Electrónico"
                  className="p-4 border border-gray-300 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-[#C7952C] mt-2"
                />
                {/* Tooltip informativo */}
                <span className="absolute top-full left-0 mt-1 text-sm text-gray-600 bg-yellow-100 border border-yellow-400 px-3 py-1 rounded-xl shadow-sm opacity-0 group-focus-within:opacity-100 transition-opacity duration-300">
                  Debe ser un correo institucional{" "}
                  <strong>@itsmante.edu.mx</strong>
                </span>
              </label>

              <label className="text-gray-700 font-medium w-full max-w-md flex flex-col">
                Contraseña:
                <div className="relative w-full mt-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={contraseña}
                    onChange={(e) => setContraseña(e.target.value)}
                    placeholder="Ingresa tu contraseña aquí"
                    className="p-4 pr-12 border border-gray-300 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-[#C7952C] text-base sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-4 flex items-center"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff size={22} color="#4F3E9B" />
                    ) : (
                      <Eye size={22} color="#4F3E9B" />
                    )}
                  </button>
                </div>
              </label>

              {error && (
                <p className="text-red-600 text-sm text-center">{error}</p>
              )}

              {/* Olvidaste tu contraseña */}
              <div className="w-full max-w-md text-center">
                <a
                  href="/RecuperarContra"
                  className="text-lg text-gray-400 underline font-medium hover:text-gray-600"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`bg-[#E4CD87] hover:bg-[#C7952C] text-white py-3 px-6 rounded-2xl font-bold text-xl md:text-2xl mt-4 flex justify-center items-center gap-2 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <>
                    <svg
                      className="w-6 h-6 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="bg-[#8D1B3D] text-white text-center p-6 text-sm border-t-4 border-[#C7952C]">
        <p>
          © {new Date().getFullYear()} Instituto Tecnológico Superior de El
          Mante · PATU — Programa Académico de Tutorías
        </p>
        <p className="mt-2">
          Contacto:{" "}
          <a
            href="mailto:soportePATU@itsmante.edu.mx"
            className="underline hover:text-[#E4CD87]"
          >
            soportePATU@itsmante.edu.mx
          </a>
        </p>
      </footer>

      {/* Animación */}
      <style>{`
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
  `}</style>
    </div>
  );
};

export default Login;