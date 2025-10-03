import React, { useState } from 'react'
import logoImg from './assets/logo.png'
import iconCasita from './assets/casita.png'
import iconAlumnos from './assets/alumnos.png'
import iconAgenda from './assets/agenda.png'
import iconConfig from './assets/config.png'
import iconCerrarsesion from './assets/cerrarsesion.png'
import { FaSearch } from 'react-icons/fa';

const EventoCalendario = ({ nombreUsuario }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Estados del formulario
  const [busqueda, setBusqueda] = useState('');
  const [alumnoEncontrado, setAlumnoEncontrado] = useState(null);
  const [errorBusqueda, setErrorBusqueda] = useState('');
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [tema, setTema] = useState('');
  const [comentarios, setComentarios] = useState('');

  const toggleMenu = () => setMenuAbierto(!menuAbierto);

  // 🔍 Buscar alumno por matrícula en la API
  const handleBuscarAlumno = async () => {
    try {
      setErrorBusqueda('');
      setAlumnoEncontrado(null);

      if (!busqueda.trim()) {
        setErrorBusqueda("⚠️ Ingresa una matrícula por favor");
        return;
      }

      const usuario = JSON.parse(localStorage.getItem('usuario'));
      if (!usuario || !usuario.accessToken) {
        setErrorBusqueda("⚠️ Debes iniciar sesión primero");
        return;
      }

      const res = await fetch(
        `https://apis-patu.onrender.com/api/alumnos/matricula/${busqueda}`,
        {
          headers: {
            "Authorization": `Bearer ${usuario.accessToken}`
          }
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setErrorBusqueda(data.message || "❌ Alumno no encontrado");
        return;
      }

      setAlumnoEncontrado(data);
    } catch (err) {
      console.error(err);
      setErrorBusqueda("⚠️ Error al conectar con la API");
    }
  };

  // Guardar evento en la API
  const handleGuardar = async () => {
    try {
      const usuario = JSON.parse(localStorage.getItem('usuario'));
      if (!usuario || !usuario.accessToken) {
        alert("⚠️ No hay usuario logueado");
        return;
      }

      if (!alumnoEncontrado) {
        alert("⚠️ Debes buscar y seleccionar un alumno primero");
        return;
      }

      const nuevoEvento = {
        id_alumno: alumnoEncontrado.id, // ✅ alumno real desde la API
        id_tutor: usuario.id,
        fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        tema,
        comentarios
      };

      const res = await fetch("https://apis-patu.onrender.com/api/sesiones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${usuario.accessToken}`
        },
        body: JSON.stringify(nuevoEvento)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "❌ Error al guardar el evento");
        return;
      }

      alert("✅ Evento guardado con éxito");
      console.log("Evento creado:", data);
    } catch (err) {
      console.error(err);
      alert("⚠️ Error de conexión con el servidor");
    }
  };

  return (
    <>
      {/* Navbar */}
      <header className="relative bg-[#4F3E9B] text-white flex items-center justify-between px-5 h-20">
        <div className="flex items-center gap-8">
          {/* Hamburguesa */}
          <div
            className="flex flex-col justify-between w-8 h-6 cursor-pointer"
            onClick={toggleMenu}
          >
            <span className={`block h-1 w-full bg-white rounded transition-transform duration-300 ${menuAbierto ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block h-1 w-full bg-white rounded transition-opacity duration-300 ${menuAbierto ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`block h-1 w-full bg-white rounded transition-transform duration-300 ${menuAbierto ? '-translate-y-2 -rotate-45' : ''}`} />
          </div>
          <div className="text-4xl font-bold">¡Hola, {nombreUsuario}!</div>
        </div>

        <div className="flex items-center gap-4 text-5xl font-bold">
          PATU
          <img src={logoImg} alt="Logo" className="w-12 h-12" />
        </div>

        {/* Menú lateral */}
        <nav className={`absolute top-20 left-0 w-72 h-[calc(100vh-80px)] bg-[#F7F4FF] p-5 flex-col gap-3 overflow-y-auto shadow-lg z-50 ${menuAbierto ? 'flex' : 'hidden'}`}>
          <a href="/accesosMaestros" className="flex items-center gap-2 text-black text-xl font-bold p-3 hover:bg-purple-100">
            <img src={iconCasita} alt="Casita" className="w-9 h-9" />
            Inicio
          </a>
          <a href="/ListaAlumnos" className="flex items-center gap-2 text-black text-xl font-bold p-3 hover:bg-purple-100">
            <img src={iconAlumnos} alt="Alumnos" className="w-9 h-9" />
            Alumnos
          </a>
          <a href="/Calendario" className="flex items-center gap-2 text-black text-xl font-bold p-3 hover:bg-purple-100">
            <img src={iconAgenda} alt="Agenda" className="w-9 h-9" />
            Agenda
          </a>
          <a href="/configuracion" className="flex items-center gap-2 text-black text-xl font-bold p-3 hover:bg-purple-100">
            <img src={iconConfig} alt="Configuración" className="w-9 h-9" />
            Configuración
          </a>
          <a href="/Login" className="flex items-center gap-2 mt-auto text-black text-xl font-bold p-3 hover:bg-purple-100">
            <img src={iconCerrarsesion} alt="Cerrar sesión" className="w-9 h-9 rotate-180" />
            Cerrar sesión
          </a>
        </nav>
      </header>

      {/* Contenido principal */}
      <main className="p-8 flex flex-col items-center">
        <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-4xl border border-gray-200">
          <h2 className="text-3xl font-bold mb-6 border-b-4 border-yellow-400 pb-3">
            Nuevo evento
          </h2>

          {/* Buscar alumno */}
          <div className="mb-6">
            <label className="block text-xl font-bold mb-2">Alumno:</label>
            <div className="relative flex gap-2">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por matrícula"
                className="flex-1 p-4 border border-gray-300 rounded-2xl shadow-md"
              />
              <button
                onClick={handleBuscarAlumno}
                className="bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white px-5 rounded-2xl font-bold"
              >
                <FaSearch />
              </button>
            </div>

            {/* Resultado de la búsqueda */}
            {errorBusqueda && (
              <p className="text-red-500 mt-2">{errorBusqueda}</p>
            )}
            {alumnoEncontrado && (
              <div className="mt-3 p-3 bg-green-100 border border-green-400 rounded-xl">
                <p><span className="font-bold">Nombre:</span> {alumnoEncontrado.nombre}</p>
                <p><span className="font-bold">Matrícula:</span> {alumnoEncontrado.matricula}</p>
              </div>
            )}
          </div>

          {/* Tema */}
          <div className="mb-6">
            <label className="block text-xl font-bold mb-2">Tema</label>
            <select
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-md text-gray-500"
            >
              <option value="">Selecciona ...</option>
              <option value="seguimiento">Seguimiento</option>
              <option value="general">General</option>
              <option value="problemas academicos">Problemas académicos</option>
              <option value="problemas personales">Problemas personales</option>
            </select>
          </div>

          {/* Comentarios */}
          <div className="mb-6">
            <label className="block text-xl font-bold mb-2">Comentarios</label>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              placeholder="Agrega notas del evento..."
              className="w-full p-4 border border-gray-300 rounded-2xl"
            />
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xl font-bold mb-2">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-2xl"
              />
            </div>
            <div>
              <label className="block text-xl font-bold mb-2">Hora inicio</label>
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-2xl"
              />
            </div>
            <div>
              <label className="block text-xl font-bold mb-2">Hora fin</label>
              <input
                type="time"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-2xl"
              />
            </div>
          </div>

          {/* Botón Guardar */}
          <div className="flex justify-center">
            <button
              onClick={handleGuardar}
              className="bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white px-10 py-3 rounded-2xl font-bold text-lg shadow-md"
            >
              Guardar
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default EventoCalendario;
