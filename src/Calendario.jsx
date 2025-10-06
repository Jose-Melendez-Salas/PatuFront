import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FaPlus, FaTrash, FaEye } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import Navbar from './Navbar';

const Calendario = ({ nombreUsuario }) => {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [eventos, setEventos] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [detalleEvento, setDetalleEvento] = useState(null); // Para el modal de UN solo evento
  
  // 🟢 NUEVO ESTADO: Para el modal que muestra VARIAS sesiones de un día
  const [sesionesDelDiaModal, setSesionesDelDiaModal] = useState(null); 

  const toggleMenu = () => setMenuAbierto(!menuAbierto);

  // 🔄 Cargar eventos según rol
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setLoading(true);
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        if (!usuario || !usuario.accessToken) {
          setError("⚠️ Debes iniciar sesión primero");
          setLoading(false);
          return;
        }

        let url = '';
        if (usuario.rol === 'tutor') {
          url = `https://apis-patu.onrender.com/api/sesiones/tutor/${usuario.id}`;
        } else if (usuario.rol === 'alumno') {
          url = `https://apis-patu.onrender.com/api/sesiones/alumno/${usuario.id}`;
        }

        const res = await fetch(url, {
          headers: { "Authorization": `Bearer ${usuario.accessToken}` }
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "❌ No se pudieron cargar los eventos");
          setLoading(false);
          return;
        }

        // 🔹 Enriquecer con nombres de alumno y tutor
        const eventosConNombres = await Promise.all(
          data.data.map(async (evento) => {
            const alumnoRes = await fetch(
              `https://apis-patu.onrender.com/api/usuarios/id/${evento.id_alumno}`,
              { headers: { "Authorization": `Bearer ${usuario.accessToken}` } }
            );
            const alumnoData = await alumnoRes.json();

            const tutorRes = await fetch(
              `https://apis-patu.onrender.com/api/usuarios/id/${evento.id_tutor}`,
              { headers: { "Authorization": `Bearer ${usuario.accessToken}` } }
            );
            const tutorData = await tutorRes.json();

            return {
              ...evento,
              alumno: alumnoData.data,
              tutor: tutorData.data
            };
          })
        );

        setEventos(eventosConNombres);
        setError('');
      } catch (err) {
        console.error(err);
        setError("⚠️ Error de conexión con la API");
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, []);

  // 🔹 Resaltar fechas con color de fondo (opcional)
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const isoDate = date.toISOString().split('T')[0];
      if (eventos.some(e => e.fecha === isoDate)) {
        return 'bg-yellow-200 rounded-full';
      }
      if (date.toDateString() === new Date().toDateString()) {
        return 'bg-blue-200 rounded-full';
      }
    }
    return null;
  };
  
  // 🟢 IMPLEMENTACIÓN: Mostrar punto rojo en fechas con eventos
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const isoDate = date.toISOString().split('T')[0];
      const tieneEventos = eventos.some(e => e.fecha === isoDate);

      if (tieneEventos) {
        // Retorna un pequeño div como "punto" rojo
        return (
          <div className="flex justify-center items-center mt-1">
            <span className="h-2 w-2 rounded-full bg-red-500 block"></span>
          </div>
        );
      }
    }
    return null;
  };

  // 🔹 Eliminar sesión
  const handleEliminar = async (id_sesion) => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!window.confirm("¿Seguro que quieres eliminar esta sesión?")) return;
    try {
      const res = await fetch(`https://apis-patu.onrender.com/api/sesiones/${id_sesion}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${usuario.accessToken}` }
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "❌ Error al eliminar la sesión");
        return;
      }
      setEventos(eventos.filter(e => e.id_sesion !== id_sesion));
      alert("✅ Sesión eliminada");
      
      // Cerrar modales si se elimina el evento
      if (detalleEvento && detalleEvento.id_sesion === id_sesion) {
          setDetalleEvento(null);
      }
      if (sesionesDelDiaModal) {
          setSesionesDelDiaModal(sesionesDelDiaModal.filter(s => s.id_sesion !== id_sesion));
          // Si no quedan sesiones, cerramos el modal
          if (sesionesDelDiaModal.filter(s => s.id_sesion !== id_sesion).length === 0) {
              setSesionesDelDiaModal(null);
          }
      }
      
    } catch (err) {
      console.error(err);
      alert("⚠️ Error de conexión con la API");
    }
  };

  // 🟢 NUEVA FUNCIÓN: Maneja el clic en una fecha del calendario
  const handleDateChange = (date) => {
    setFechaSeleccionada(date);
    
    // Cerramos el modal de detalle simple por si estuviera abierto
    setDetalleEvento(null); 

    // Filtramos las sesiones para la fecha seleccionada
    const fechaISO = date.toISOString().split('T')[0];
    const sesionesDelDia = eventos.filter(evento => evento.fecha === fechaISO);
    
    // Mostramos el modal de lista de sesiones si hay alguna
    if (sesionesDelDia.length > 0) {
      setSesionesDelDiaModal(sesionesDelDia);
    } else {
      // Si no hay sesiones, limpiamos el modal
      setSesionesDelDiaModal(null); 
    }
  };


  return (
    <>
      <Navbar />
      {error && (
        <div className="bg-red-100 text-red-700 p-4 text-center font-bold">
          {error}
        </div>
      )}

      <main className="p-8 flex gap-6">
        {/* Calendario */}
        <div className="bg-white rounded-3xl shadow-xl/40 p-6 flex-1">
          <Calendar
            onChange={handleDateChange} 
            value={fechaSeleccionada}
            locale="es-ES"
            tileClassName={tileClassName}
            tileContent={tileContent}
          />
        </div>

        {/* Eventos del mes (Permanece intacto, mostrando todos los eventos) */}
        <div className="bg-white rounded-3xl shadow-xl/40 p-6 w-80 flex flex-col">
          <h3 className="text-xl font-bold mb-4 border-b-4 border-yellow-400 pb-2">Eventos del mes:</h3>

          {loading ? (
            <p className="text-gray-500">Cargando...</p>
          ) : eventos.length === 0 ? (
            <p className="text-gray-500">No hay eventos registrados</p>
          ) : (
            eventos.map((evento) => (
              <div key={evento.id_sesion} className="border-2 border-purple-400 rounded-xl p-4 mb-4">
                <p className="text-sm font-bold">{evento.fecha}</p>
                <p className="text-sm font-semibold">
                  {evento.hora_inicio && evento.hora_fin ? `${evento.hora_inicio} - ${evento.hora_fin}` : ""}
                </p>
                <h4 className="font-bold">{evento.tipo || "Sin tipo"}</h4>
                <p className="text-sm">
                  Alumno: {evento.alumno?.nombre} {evento.alumno?.apellido_paterno || ''} {evento.alumno?.apellido_materno || ''}
                </p>
                <div className="flex justify-between mt-2">
                  <button
                    onClick={() => setDetalleEvento(evento)}
                    className="text-blue-500 flex items-center gap-1 underline"
                  >
                    <FaEye /> Ver detalles
                  </button>
                  <button onClick={() => handleEliminar(evento.id_sesion)} className="text-red-500 flex items-center gap-1">
                    <FaTrash /> Eliminar
                  </button>
                </div>
              </div>
            ))
          )}

          <button
            onClick={() => navigate("/EventoCalendario")}
            className="mt-auto flex items-center justify-center gap-2 bg-yellow-400 text-black font-bold py-3 rounded-full shadow-md hover:bg-yellow-300"
          >
            <FaPlus /> Registrar evento
          </button>
        </div>
      </main>

      {/* Modal de detalles de UNA SESIÓN (Original - usado por el botón "Ver detalles") */}
      {detalleEvento && (
        <div className="fixed inset-0 bg-gray bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-gray-200 p-8 rounded-2xl w-96 relative shadow-xl/80">
            <button
              className="absolute top-3 right-3 text-red-500 font-bold text-xl"
              onClick={() => setDetalleEvento(null)}
            >
              X
            </button>
            <h2 className="text-2xl font-bold mb-4">Detalles de la sesión</h2>
            <p><strong>Fecha:</strong> {detalleEvento.fecha}</p>
            <p><strong>Hora:</strong> {detalleEvento.hora_inicio} - {detalleEvento.hora_fin}</p>
            <p><strong>tipo:</strong> {detalleEvento.tipo || "Sin tipo"}</p>
            {/* <p><strong>Comentarios:</strong> {detalleEvento.comentarios || "Sin comentarios"}</p> */}
            <p><strong>Alumno:</strong> {detalleEvento.alumno?.nombre} {detalleEvento.alumno?.apellido_paterno} {detalleEvento.alumno?.apellido_materno}</p>
            <p><strong>Tutor:</strong> {detalleEvento.tutor?.nombre} {detalleEvento.tutor?.apellido_paterno} {detalleEvento.tutor?.apellido_materno}</p>
            <p><strong>Estado:</strong> {detalleEvento.estado}</p>
          </div>
        </div>
      )}

      {/* 🟢 NUEVO MODAL: Detalle de TODAS las sesiones de un día (al hacer clic en el calendario) */}
      {sesionesDelDiaModal && sesionesDelDiaModal.length > 0 && (
        <div className="fixed inset-0 bg-gray bg-opacity-30 flex justify-center items-center z-50">
          {/* Usamos max-h-5/6 y overflow-y-auto para que sea scrollable si hay muchas sesiones */}
          <div className="bg-gray-200 p-8 rounded-2xl w-96 relative shadow-xl/80 max-h-5/6 overflow-y-auto">
            <button
              className="absolute top-3 right-3 text-red-500 font-bold text-xl"
              onClick={() => setSesionesDelDiaModal(null)}
            >
              X
            </button>
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">
                Sesiones del día: {sesionesDelDiaModal[0]?.fecha}
            </h2>
            
            {sesionesDelDiaModal.map((sesion, index) => (
                <div key={index} className="mb-4 p-4 border rounded-xl bg-white shadow-md">
                    <h3 className="font-bold text-lg mb-2">{sesion.tipo || "Sin tipo"}</h3>
                    <p><strong>Hora:</strong> {sesion.hora_inicio} - {sesion.hora_fin}</p>
                    <p><strong>Alumno:</strong> {sesion.alumno?.nombre} {sesion.alumno?.apellido_paterno} {sesion.alumno?.apellido_materno}</p>
                    <p><strong>Tutor:</strong> {sesion.tutor?.nombre} {sesion.tutor?.apellido_paterno} {sesion.tutor?.apellido_materno}</p>
                    <p><strong>Estado:</strong> {sesion.estado}</p>
                        {/* Botón para ver el detalle simple (opcional) */}
                   {/* <p><strong>Comentarios:</strong> {sesion.comentarios || "Sin comentarios"}</p> */}
                    <div className="flex justify-end mt-3 gap-3">
                        {/* Botón para ver el detalle simple (opcional) */}
   
                        <button 
                            onClick={() => handleEliminar(sesion.id_sesion)} 
                            className="text-red-500 flex items-center gap-1 text-sm"
                        >
                            <FaTrash /> Eliminar
                        </button>
                    </div>
                </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Calendario;
