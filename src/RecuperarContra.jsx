import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaCheck, FaTimes } from "react-icons/fa";
import logoImg from './assets/logo.png';

const RecuperarContra = () => {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [redirigiendo, setRedirigiendo] = useState(false);

  const [validaciones, setValidaciones] = useState({
    longitudMinima: false,
    tieneMayuscula: false,
    tieneCaracterEspecial: false,
    contrasenasCoinciden: false,
    correoValido: false
  });

  useEffect(() => {
    const correoValido = correo.endsWith('@itsmante.edu.mx') && correo.length > 16;
    setValidaciones(prev => ({ ...prev, correoValido }));
  }, [correo]);

  useEffect(() => {
    const longitudMinima = password.length >= 8;
    const tieneMayuscula = /[A-Z]/.test(password);
    const tieneCaracterEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    setValidaciones(prev => ({
      ...prev,
      longitudMinima,
      tieneMayuscula,
      tieneCaracterEspecial
    }));
  }, [password]);

  useEffect(() => {
    const contrasenasCoinciden = password === confirmarPassword && confirmarPassword.length > 0;
    setValidaciones(prev => ({ ...prev, contrasenasCoinciden }));
  }, [password, confirmarPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);

    if (!correo.trim() || !password.trim() || !confirmarPassword.trim()) {
      setError(' Por favor completa todos los campos.');
      return;
    }

    if (!validaciones.correoValido) {
      setError(' Debe usar un correo institucional @itsmante.edu.mx');
      return;
    }

    if (!validaciones.longitudMinima || !validaciones.tieneMayuscula || !validaciones.tieneCaracterEspecial) {
      setError(' La contraseña no cumple con los requisitos de seguridad.');
      return;
    }

    if (!validaciones.contrasenasCoinciden) {
      setError(' Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);

    try {
      const response = await fetch(
        `https://apis-patu.onrender.com/api/usuarios/actualizar-password/${correo}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || ' Error al actualizar la contraseña');
        setCargando(false);
        return;
      }

      setMensaje(' Contraseña actualizada exitosamente. Ahora puedes iniciar sesión.');
      setCorreo('');
      setPassword('');
      setConfirmarPassword('');

      setTimeout(() => {
        setRedirigiendo(true);
        setTimeout(() => navigate('/Login'), 1000);
      }, 2000);
    } catch (err) {
      console.error(err);
      setError('⚠️ Error al conectar con el servidor. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  const ValidacionItem = ({ cumplida, texto }) => (
    <div className={`flex items-center gap-2 text-sm ${cumplida ? 'text-green-600' : 'text-red-500'}`}>
      {cumplida ? <FaCheck /> : <FaTimes />}
      <span>{texto}</span>
    </div>
  );

  return (
    <>
      {/* Header */}
      <header className="relative bg-[#4F3E9B] text-white flex flex-wrap items-center justify-between px-4 sm:px-6 md:px-10 py-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-center sm:text-left w-full sm:w-auto">
          <div className="text-lg sm:text-2xl md:text-3xl font-bold">
            Recupera tu contraseña rápido y seguro
          </div>
        </div>
        <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-4 text-2xl sm:text-3xl md:text-4xl font-bold w-full sm:w-auto mt-3 sm:mt-0">
          PATU
          <img src={logoImg} alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
        </div>
      </header>

      {/* Contenido */}
      <div className="flex flex-col items-center p-4 sm:p-6 md:p-10 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 md:p-10 w-full max-w-md sm:max-w-xl md:max-w-3xl border border-gray-300 mt-6 sm:mt-8 md:mt-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-center border-b-4 border-yellow-400 pb-2">
            Recuperar Contraseña
          </h2>

          <form className="flex flex-col gap-4 sm:gap-5" onSubmit={handleSubmit}>
            
            {/* Correo */}
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm sm:text-base">
                Correo electrónico institucional:
              </label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="correo@itsmante.edu.mx"
                className="p-2 sm:p-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 w-full"
                disabled={cargando}
              />
              {correo && (
                <div className="mt-2">
                  <ValidacionItem 
                    cumplida={validaciones.correoValido} 
                    texto={validaciones.correoValido ? "Correo institucional válido" : "Debe ser correo @itsmante.edu.mx"} 
                  />
                </div>
              )}
            </div>

            {/* Nueva contraseña */}
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm sm:text-base">
                Nueva contraseña:
              </label>
              <div className="relative">
                <input
                  type={mostrarPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nueva contraseña"
                  className="p-2 sm:p-3 border border-gray-300 rounded-2xl pr-10 focus:outline-none focus:ring-2 focus:ring-purple-400 w-full"
                  disabled={cargando}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={cargando}
                >
                  {mostrarPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>

              {password && (
                <div className="mt-3 p-3 bg-gray-50 rounded-xl space-y-1">
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-2">Requisitos de seguridad:</p>
                  <ValidacionItem cumplida={validaciones.longitudMinima} texto="Mínimo 8 caracteres" />
                  <ValidacionItem cumplida={validaciones.tieneMayuscula} texto="Al menos una letra mayúscula" />
                  <ValidacionItem cumplida={validaciones.tieneCaracterEspecial} texto="Al menos un carácter especial válido (!@#$%^&*)" />
                </div>
              )}
            </div>

            {/* Confirmar contraseña */}
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm sm:text-base">
                Confirmar nueva contraseña:
              </label>
              <div className="relative">
                <input
                  type={mostrarConfirmar ? "text" : "password"}
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  className="p-2 sm:p-3 border border-gray-300 rounded-2xl pr-10 focus:outline-none focus:ring-2 focus:ring-purple-400 w-full"
                  disabled={cargando}
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={cargando}
                >
                  {mostrarConfirmar ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>

              {confirmarPassword && (
                <div className="mt-2">
                  <ValidacionItem 
                    cumplida={validaciones.contrasenasCoinciden} 
                    texto={validaciones.contrasenasCoinciden ? "Las contraseñas coinciden" : "Las contraseñas no coinciden"} 
                  />
                </div>
              )}
            </div>

            {/* Mensajes */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-sm text-center">
                {error}
              </div>
            )}
            {mensaje && !redirigiendo && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-xl text-sm text-center">
                {mensaje}
              </div>
            )}
            {redirigiendo && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-xl text-sm text-center flex items-center justify-center gap-3">
                <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-700 rounded-full animate-spin"></div>
                <span>Redirigiendo al inicio de sesión...</span>
              </div>
            )}

            {/* Cargando */}
            {cargando && (
              <div className="flex items-center justify-center gap-3 py-3">
                <div className="w-5 h-5 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <span className="text-gray-600 font-medium text-sm">Actualizando contraseña...</span>
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              className="bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white py-3 px-6 rounded-2xl font-bold text-lg mt-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!Object.values(validaciones).every(v => v) || cargando}
            >
              {cargando ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default RecuperarContra;
