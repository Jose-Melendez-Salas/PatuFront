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

  // Campos del formulario
  const [busqueda, setBusqueda] = useState('');
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [tema, setTema] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [tipo, setTipo] = useState('');

  const toggleMenu = () => setMenuAbierto(!menuAbierto);

  // Guardar evento en la API
  const handleGuardar = async () => {
    try {
      const usuario = JSON.parse(localStorage.getItem('usuario'))
      if (!usuario) {
        alert("⚠️ No hay usuario logueado")
        return
      }

      const nuevoEvento = {
        id_alumno: 1, // TODO: aquí deberías poner el alumno real seleccionado
        id_tutor: usuario.id,
        fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        tema,
        comentarios
      }

      const res = await fetch("https://apis-patu.onrender.com/api/sesiones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${usuario.accessToken}` // Token JWT
        },
        body: JSON.stringify(nuevoEvento)
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.message || "❌ Error al guardar el evento")
        return
      }

      alert("✅ Evento guardado con éxito")
      console.log("Evento creado:", data)
    } catch (err) {
      console.error(err)
      alert("⚠️ Error de conexión con el servidor")
    }
  }

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
            <div className="relative">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar alumno"
                className="w-full p-4 pr-10 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-md"
              />
              <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Tipo */}
          <div className="mb-6">
            <label className="block text-xl font-bold mb-2">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-md text-gray-500"
            >
              <option value="">Selecciona ...</option>
              <option value="tutoria">Tutoría</option>
              <option value="examen">Examen</option>
              <option value="trabajo">Trabajo</option>
            </select>
          </div>

          {/* Tema */}
          <div className="mb-6">
            <label className="block text-xl font-bold mb-2">Tema</label>
            <input
              type="text"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              placeholder="Ej. Fundamentos de bases de datos"
              className="w-full p-4 border border-gray-300 rounded-2xl"
            />
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
  )
}

export default EventoCalendario
