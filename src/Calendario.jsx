import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { FaPlus, FaTrash, FaEye } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import Navbar from './Navbar';

const Calendario = ({ nombreUsuario }) => {
  const navigate = useNavigate();
  const calendarRef = useRef(null);
  // 1. ÚNICA FUENTE DE VERDAD para los eventos.
  const [eventosOriginales, setEventosOriginales] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [detalleEvento, setDetalleEvento] = useState(null);

  //  Cargar eventos según rol
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setLoading(true);
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        if (!usuario || !usuario.accessToken) {
          setError(" Debes iniciar sesión primero");
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
          setError(data.message || " No se pudieron cargar los eventos");
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

        // Guardamos los datos en nuestra única fuente de verdad.
        setEventosOriginales(eventosConNombres);
        setError('');
      } catch (err) {
        console.error(err);
        setError(" Error de conexión con la API");
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, []);

  // 2. DERIVAMOS EL ESTADO: Creamos el formato para FullCalendar a partir de los datos originales.
  // Esto se re-calcula en cada render, asegurando que el calendario siempre esté sincronizado.
  const eventosParaCalendario = eventosOriginales.map(evento => ({
    id: evento.id_sesion,
    title: `${evento.tipo || 'Sesión'} - ${evento.alumno?.nombre}`,
    start: `${evento.fecha}T${evento.hora_inicio}`,
    end: `${evento.fecha}T${evento.hora_fin}`,
    backgroundColor: evento.estado === 'completada' ? '#10b981' : '#E4CD87',
    borderColor: evento.estado === 'completada' ? '#059669' : '#E4CD87',
    extendedProps: { ...evento }
  }));

  // 🔹 Manejar clic en evento del calendario
  const handleEventClick = (clickInfo) => {
    setDetalleEvento(clickInfo.event.extendedProps);
  };

  // 3. FUNCIÓN DE ELIMINAR SIMPLIFICADA: Solo actualiza el estado principal.
  const handleEliminar = async (id_sesion) => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    const result = await Swal.fire({
      title: '¿Eliminar sesión?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#fff',
      customClass: {
        popup: 'rounded-2xl shadow-lg',
        title: 'font-bold text-xl text-gray-800',
        confirmButton: 'rounded-full px-6 py-2',
        cancelButton: 'rounded-full px-6 py-2'
      }
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`https://apis-patu.onrender.com/api/sesiones/${id_sesion}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${usuario.accessToken}` }
      });

      const data = await res.json();
      if (!res.ok) {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'No se pudo eliminar la sesión',
        });
        return;
      }
      
      // Al actualizar el estado principal, React re-renderiza todo lo que depende de él.
      // Tanto el calendario como la lista se actualizan al mismo tiempo.
      setEventosOriginales(prevEventos =>
        prevEventos.filter(e => e.id_sesion !== id_sesion)
      );
      setDetalleEvento(null);

      await Swal.fire({
        icon: 'success',
        title: 'Sesión eliminada',
        text: 'La sesión se eliminó correctamente.',
        timer: 1800,
        showConfirmButton: false
      });

    } catch (err) {
      console.error(err);
      await Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar con la API.',
      });
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

      <main className="p-8 flex flex-col lg:flex-row gap-6">
        {/* Calendario FullCalendar - Izquierda */}
        <div className="bg-white rounded-3xl shadow-xl/40 p-6 flex-1">
          <style>{`
            /* Estilos personalizados para FullCalendar (sin cambios) */
            .fc { font-family: inherit; }
            .fc .fc-toolbar { padding: 1rem; background: linear-gradient(135deg, #8C1F2F 0%, #8C1F2F 100%); border-radius: 1rem; margin-bottom: 1.5rem; }
            .fc .fc-toolbar-title { font-size: 1.5rem !important; font-weight: 700; color: white; text-transform: capitalize; }
            .fc .fc-button { background: rgba(255, 255, 255, 0.2) !important; border: 2px solid rgba(255, 255, 255, 0.3) !important; color: white !important; font-weight: 600; padding: 0.4rem 0.8rem; font-size: 0.85rem; border-radius: 0.5rem; transition: all 0.3s ease; }
            .fc .fc-button:hover { background: rgba(255, 255, 255, 0.3) !important; transform: translateY(-2px); }
            .fc .fc-button-active { background: rgba(255, 255, 255, 0.4) !important; border-color: white !important; }
            .fc-event { cursor: pointer; border-radius: 0.5rem !important; padding: 0.2rem 0.4rem; font-weight: 600; font-size: 0.8rem; margin: 2px 0; transition: all 0.2s ease; }
            .fc-event:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
            @media (max-width: 768px) {
              .fc .fc-toolbar { flex-direction: column; gap: 0.5rem; }
              .fc .fc-toolbar-title { font-size: 1.2rem !important; }
              .fc .fc-button { font-size: 0.75rem; padding: 0.3rem 0.6rem; }
            }
          `}</style>

          {loading ? (
            <div className="text-center py-12"><p>Cargando eventos...</p></div>
          ) : (
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale={esLocale}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              buttonText={{ today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día' }}
              events={eventosParaCalendario} // Usamos la variable derivada
              eventClick={handleEventClick}
              height="auto"
              slotMinTime="07:00:00"
              slotMaxTime="22:00:00"
              allDaySlot={false}
              nowIndicator={true}
              eventTimeFormat={{
                hour: '2-digit', minute: '2-digit', hour12: false
              }}
            />
          )}
        </div>

        {/* Eventos del mes - Derecha */}
        <div className="bg-white rounded-3xl shadow-xl/40 p-6 w-full lg:w-90 flex flex-col">
          <h3 className="text-xl font-bold mb-4 border-b-4 border-[#C7952C] pb-2">Eventos del mes:</h3>
          {loading ? (
            <p className="text-gray-500">Cargando...</p>
          ) : eventosOriginales.length === 0 ? (
            <p className="text-gray-500">No hay eventos registrados</p>
          ) : (
            <div className="overflow-y-auto max-h-96 mb-4">
              {eventosOriginales.map((evento) => (
                <div key={evento.id_sesion} className="border-2 border-purple-400 rounded-xl p-4 mb-4">
                  <p className="text-sm font-bold">{evento.fecha}</p>
                  <p className="text-sm font-semibold">{`${evento.hora_inicio} - ${evento.hora_fin}`}</p>
                  <h4 className="font-bold">{evento.tipo || "Sin tipo"}</h4>
                  <p className="text-sm">Alumno: {evento.alumno?.nombre}</p>
                  <div className="flex justify-between mt-2">
                    <button onClick={() => setDetalleEvento(evento)} className="text-blue-500 flex items-center gap-1 underline text-sm">
                      <FaEye /> Ver detalles
                    </button>
                    <button onClick={() => handleEliminar(evento.id_sesion)} className="text-red-500 flex items-center gap-1 text-sm">
                      <FaTrash /> Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => navigate("/EventoCalendario")}
            className="mt-auto flex items-center justify-center gap-2 bg-yellow-400 text-black font-bold py-3 rounded-full shadow-md hover:bg-yellow-300 transition-all"
          >
            <FaPlus /> Registrar evento
          </button>
        </div>
      </main>

      {/* Modal de detalles */}
      {detalleEvento && (
        <div className="fixed inset-0 bg-gray bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl w-96 relative shadow-xl/40 max-w-full mx-4">
            <button
              className="absolute top-4 right-4 text-red-500 font-bold text-2xl hover:text-red-700"
              onClick={() => setDetalleEvento(null)}
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6 text-black-600 border-b-4 border-[#C7952C] pb-2">
              Detalles de la sesión
            </h2>
            <div className="space-y-3">
              <p><strong>Fecha:</strong> {detalleEvento.fecha}</p>
              <p><strong>Hora:</strong> {detalleEvento.hora_inicio} - {detalleEvento.hora_fin}</p>
              <p><strong>Tipo:</strong> {detalleEvento.tipo || "Sin tipo"}</p>
              <p><strong>Alumno:</strong> {`${detalleEvento.alumno?.nombre} ${detalleEvento.alumno?.apellido_paterno}`}</p>
              <p><strong>Tutor:</strong> {`${detalleEvento.tutor?.nombre} ${detalleEvento.tutor?.apellido_paterno}`}</p>
              <p>
                <strong>✓ Estado:</strong>
                <span className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${detalleEvento.estado === 'completada' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                  {detalleEvento.estado}
                </span>
              </p>
            </div>
            <button
              onClick={() => handleEliminar(detalleEvento.id_sesion)}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition-all"
            >
              <FaTrash /> Eliminar sesión
            </button>

            {JSON.parse(localStorage.getItem('usuario'))?.rol === 'tutor' && (
              <button
                onClick={() => navigate(`/bitacora/${detalleEvento.id_sesion}`)}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-[#E4CD87] text-blac font-bold py-3 rounded-lg hover:bg-[#E9DBCD] transition-all"
              >
                Registrar Bitácora
              </button>
            )}


          </div>
        </div>
      )}
    </>
  );
};

export default Calendario;
