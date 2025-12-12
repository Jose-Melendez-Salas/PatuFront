import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { FaPlus, FaTrash, FaEye, FaCalendarAlt, FaChevronRight, FaClock, FaUser, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import Navbar from './Navbar';

const Calendario = ({ nombreUsuario }) => {
  const navigate = useNavigate();
  const calendarRef = useRef(null);
  // 1. ÚNICA FUENTE DE VERDAD para los eventos.
  const [eventosOriginales, setEventosOriginales] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [detalleEvento, setDetalleEvento] = useState(null);
  const [modalAnimation, setModalAnimation] = useState(false);
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const rolUsuario = usuario ? usuario.rol : null;

  // Animación de entrada para el modal
  useEffect(() => {
    if (detalleEvento) {
      setTimeout(() => setModalAnimation(true), 10);
    }
  }, [detalleEvento]);

  const closeModal = () => {
    setModalAnimation(false);
    setTimeout(() => setDetalleEvento(null), 300);
  };

  // Función para manejar la navegación al registrar evento
  const handleRegistrarEvento = () => {
    // Animación de pulso en el botón
    const button = document.activeElement;
    button.classList.add('animate-pulse');
    setTimeout(() => button.classList.remove('animate-pulse'), 300);

    if (rolUsuario === 'psicologia') {
      navigate("/EventoPsicologia");
    } else {
      navigate("/EventoCalendario");
    }
  };

  // Cargar eventos según rol
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setLoading(true);
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        if (!usuario || !usuario.accessToken) {
          setError("Debes iniciar sesión primero");
          setLoading(false);
          return;
        }

        let url = '';
        if (usuario.rol === 'tutor' || usuario.rol === 'psicologia') {
          url = `https://apis-patu.onrender.com/api/sesiones/tutor/${usuario.id}`;
        } else if (usuario.rol === 'alumno') {
          url = `https://apis-patu.onrender.com/api/sesiones/alumno/${usuario.id}`;
        }

        const res = await fetch(url, {
          headers: { "Authorization": `Bearer ${usuario.accessToken}` }
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "No se pudieron cargar los eventos");
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
        setError("Error de conexión con la API");
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, []);

  // 2. DERIVAMOS EL ESTADO: Creamos el formato para FullCalendar
  const eventosParaCalendario = eventosOriginales.map(evento => ({
    id: evento.id_sesion,
    title: `${evento.tipo || 'Sesión'} - ${evento.alumno?.nombre}`,
    start: `${evento.fecha}T${evento.hora_inicio}`,
    end: `${evento.fecha}T${evento.hora_fin}`,
    backgroundColor: evento.estado === 'completada' ? '#10b981' : '#E4CD87',
    borderColor: evento.estado === 'completada' ? '#059669' : '#E4CD87',
    extendedProps: { ...evento }
  }));

  // 🔹 Manejar clic en evento del calendario con animación
  const handleEventClick = (clickInfo) => {
    clickInfo.el.style.transform = 'scale(0.95)';
    setTimeout(() => {
      clickInfo.el.style.transform = 'scale(1)';
    }, 200);
    setTimeout(() => {
      setDetalleEvento(clickInfo.event.extendedProps);
    }, 100);
  };

  // 3. FUNCIÓN DE ELIMINAR con mejor feedback visual
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
        popup: 'rounded-2xl shadow-2xl animate__animated animate__fadeIn',
        title: 'font-bold text-xl text-gray-800',
        confirmButton: 'rounded-full px-6 py-2 transition-transform hover:scale-105',
        cancelButton: 'rounded-full px-6 py-2 transition-transform hover:scale-105'
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
          showClass: {
            popup: 'animate__animated animate__headShake'
          }
        });
        return;
      }
      
      // Animación de eliminación
      const eventoElement = document.querySelector(`[data-event-id="${id_sesion}"]`);
      if (eventoElement) {
        eventoElement.style.transition = 'all 0.3s ease';
        eventoElement.style.opacity = '0';
        eventoElement.style.transform = 'scale(0.8)';
      }

      setTimeout(() => {
        setEventosOriginales(prevEventos =>
          prevEventos.filter(e => e.id_sesion !== id_sesion)
        );
        closeModal();
      }, 300);

      await Swal.fire({
        icon: 'success',
        title: '¡Eliminado!',
        text: 'La sesión se eliminó correctamente.',
        timer: 1800,
        showConfirmButton: false,
        showClass: {
          popup: 'animate__animated animate__bounceIn'
        }
      });

    } catch (err) {
      console.error(err);
      await Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar con la API.',
        showClass: {
          popup: 'animate__animated animate__shakeX'
        }
      });
    }
  };

  return (
    <>
      <Navbar />
      {error && (
        <div className="bg-red-100 text-red-700 p-4 text-center font-bold pt-20 animate__animated animate__fadeInDown">
          {error}
        </div>
      )}

      <main className="p-8 flex flex-col lg:flex-row gap-6 pt-28 animate__animated animate__fadeIn">
        {/* Calendario FullCalendar - Izquierda */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 flex-1 border-4 border-[#E9DBCD] transform transition-all duration-300 hover:shadow-2xl">
          <style>{`
            /* Estilos mejorados para FullCalendar */
            .fc { font-family: inherit; }
            .fc .fc-toolbar { 
              padding: 1.2rem; 
              background: linear-gradient(135deg, #8C1F2F 0%, #A82C3E 100%); 
              border-radius: 1.5rem; 
              margin-bottom: 2rem;
              box-shadow: 0 8px 20px rgba(140, 31, 47, 0.2);
            }
            .fc .fc-toolbar-title { 
              font-size: 1.6rem !important; 
              font-weight: 800; 
              color: white; 
              text-shadow: 0 2px 4px rgba(0,0,0,0.1);
              letter-spacing: 0.5px;
            }
            .fc .fc-button { 
              background: rgba(255, 255, 255, 0.15) !important; 
              backdrop-filter: blur(10px);
              border: 2px solid rgba(255, 255, 255, 0.3) !important; 
              color: white !important; 
              font-weight: 600; 
              padding: 0.5rem 1rem; 
              font-size: 0.9rem; 
              border-radius: 0.75rem; 
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              margin: 0 2px;
            }
            .fc .fc-button:hover { 
              background: rgba(255, 255, 255, 0.3) !important; 
              transform: translateY(-3px) scale(1.05);
              box-shadow: 0 6px 12px rgba(0,0,0,0.15);
            }
            .fc .fc-button:active { transform: translateY(-1px); }
            .fc .fc-button-active { 
              background: rgba(255, 255, 255, 0.4) !important; 
              border-color: white !important;
              box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
            }
            .fc-event { 
              cursor: pointer; 
              border-radius: 0.75rem !important; 
              padding: 0.3rem 0.6rem; 
              font-weight: 600; 
              font-size: 0.85rem; 
              margin: 2px 0; 
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              border-width: 2px !important;
              box-shadow: 0 3px 6px rgba(0,0,0,0.1);
            }
            .fc-event:hover { 
              transform: translateY(-2px) scale(1.02); 
              box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
              z-index: 10;
            }
            .fc-daygrid-day { transition: background-color 0.3s ease; }
            .fc-daygrid-day:hover { background-color: rgba(232, 205, 205, 0.1); }
            .fc-day-today { background-color: rgba(232, 205, 205, 0.2) !important; }
            
            @media (max-width: 768px) {
              .fc .fc-toolbar { flex-direction: column; gap: 0.8rem; padding: 1rem; }
              .fc .fc-toolbar-title { font-size: 1.3rem !important; }
              .fc .fc-button { font-size: 0.8rem; padding: 0.4rem 0.8rem; }
            }
          `}</style>

          {loading ? (
            <div className="text-center py-16 animate-pulse">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#8C1F2F] mb-4"></div>
              <p className="text-gray-600 font-medium">Cargando eventos...</p>
            </div>
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
              events={eventosParaCalendario}
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
        <div className="bg-white rounded-3xl shadow-2xl p-6 w-full lg:w-96 flex flex-col border-4 border-[#E9DBCD] transform transition-all duration-300 hover:shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <FaCalendarAlt className="text-2xl text-[#8C1F2F]" />
            <h3 className="text-xl font-bold bg-gradient-to-r from-[#8C1F2F] to-[#C7952C] bg-clip-text text-transparent">
              Eventos del mes
            </h3>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border-2 border-gray-200 rounded-xl p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : eventosOriginales.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-5xl mb-4"></div>
              <p className="text-gray-500 font-medium">No hay eventos registrados</p>
              <p className="text-gray-400 text-sm mt-2">¡Comienza agregando tu primer evento!</p>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[40rem] mb-4 pr-2 space-y-4">
              {eventosOriginales.map((evento) => (
                <div 
                  key={evento.id_sesion} 
                  className="border-2 border-[#8C1F2F] rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:border-[#C7952C] hover:translate-x-1 group"
                  data-event-id={evento.id_sesion}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-3 h-3 rounded-full ${evento.estado === 'completada' ? 'bg-green-500' : 'bg-[#E4CD87]'}`}></span>
                        <h4 className="font-bold text-gray-800 group-hover:text-[#8C1F2F] transition-colors">Tipo: 
                          {evento.tipo || "Sesión"}
                        </h4>
                      </div>
                      <p className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                        <FaCalendarAlt className="text-xs" />
                        {evento.fecha}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <FaClock className="text-xs" />
                        {`${evento.hora_inicio} - ${evento.hora_fin}`}
                      </p>
                      <p className="text-sm font-bold mt-2 flex items-center gap-1">
                        <FaUser className="text-xs" />
                        {evento.alumno?.nombre}
                      </p>
                    </div>
                    <FaChevronRight className="text-gray-400 group-hover:text-[#8C1F2F] transform group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
                    <button 
                      onClick={() => setDetalleEvento(evento)}
                      className="text-[#8C1F2F] flex items-center gap-2 text-sm font-semibold hover:text-[#C7952C] transition-all hover:gap-3"
                    >
                      <FaEye className="text-base" /> Ver detalles
                    </button>
                    <button 
                      onClick={() => handleEliminar(evento.id_sesion)}
                      className="text-red-500 flex items-center gap-2 text-sm font-semibold hover:text-red-600 transition-all hover:gap-3 hover:scale-105"
                    >
                      <FaTrash className="text-sm" /> Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <button
            onClick={handleRegistrarEvento}
            className="mt-auto flex items-center justify-center gap-3 bg-gradient-to-r from-[#E4CD87] to-[#F5E6C8] text-black font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:from-[#F5E6C8] hover:to-[#E4CD87] active:scale-95 group"
          >
            <FaPlus className="group-hover:rotate-90 transition-transform duration-300" />
            <span>Registrar nuevo evento</span>
          </button>
        </div>
      </main>

      {/* Modal de detalles con animaciones */}
      {detalleEvento && (
        <div className={`fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 transition-all duration-300 ${modalAnimation ? 'opacity-100' : 'opacity-0'}`}
             onClick={closeModal}
        >
          <div 
            className={`bg-white p-8 rounded-3xl w-full max-w-md relative shadow-2xl transform transition-all duration-300 ${modalAnimation ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 font-bold text-2xl transition-transform hover:rotate-90 duration-300"
              onClick={closeModal}
            >
              ×
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-2xl ${detalleEvento.estado === 'completada' ? 'bg-green-100' : 'bg-[#E4CD87]/20'}`}>
                {detalleEvento.estado === 'completada' ? 
                  <FaCheckCircle className="text-2xl text-green-600" /> : 
                  <FaClock className="text-2xl text-[#C7952C]" />
                }
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#8C1F2F] to-[#C7952C] bg-clip-text text-transparent">
                Detalles de la sesión
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <FaCalendarAlt className="text-[#8C1F2F]" />
                <div>
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="font-semibold">{detalleEvento.fecha}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <FaClock className="text-[#8C1F2F]" />
                <div>
                  <p className="text-sm text-gray-500">Horario</p>
                  <p className="font-semibold">{detalleEvento.hora_inicio} - {detalleEvento.hora_fin}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Tipo</p>
                  <p className="font-semibold">{detalleEvento.tipo || "Sin tipo"}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Estado</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${detalleEvento.estado === 'completada' ? 'bg-green-100 text-green-700' : 'bg-[#E4CD87] text-black-900'}`}>
                    {detalleEvento.estado}
                  </span>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Alumno</p>
                <p className="font-semibold">{`${detalleEvento.alumno?.nombre} ${detalleEvento.alumno?.apellido_paterno}`}</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Responsable</p>
                <p className="font-semibold">{`${detalleEvento.tutor?.nombre} ${detalleEvento.tutor?.apellido_paterno}`}</p>
              </div>
            </div>
            
            <div className="mt-8 space-y-4">
              <button
                onClick={() => handleEliminar(detalleEvento.id_sesion)}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 group"
              >
                <FaTrash className="group-hover:animate-bounce" />
                Eliminar sesión
              </button>

              {JSON.parse(localStorage.getItem('usuario'))?.rol === 'tutor' && (
                <button
                  onClick={() => navigate(`/bitacora/${detalleEvento.id_sesion}`)}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#E4CD87] to-[#F5E6C8] text-black font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 group"
                >
                  <span>Registrar Bitácora</span>
                  <FaChevronRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Calendario;