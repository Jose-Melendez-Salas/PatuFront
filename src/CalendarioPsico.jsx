import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import Swal from "sweetalert2";
import Navbar from './Navbar'; 



export default function CalendarioPsico() {
  const [eventos, setEventos] = useState([]);
  const calendarRef = useRef(null);
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const psicologoId = usuario?.id;

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const url = `https://apis-patu.onrender.com/api/sesiones/tutor/${psicologoId}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${usuario.accessToken}` },
        });
        const data = await res.json();

        const eventosCalendario = data.data.map((s) => ({
          id: s.id_sesion,
          title: `Sesión – ${s.alumno?.nombre}`,
          start: `${s.fecha}T${s.hora_inicio}`,
          end: `${s.fecha}T${s.hora_fin}`,
          backgroundColor: s.estado === "completada" ? "#3A8A4F" : "#D9792B",
          borderColor: s.estado === "completada" ? "#3A8A4F" : "#D9792B",
        }));

        setEventos(eventosCalendario);
      } catch (err) {
        console.error(err);
      }
    };

    fetchEventos();
  }, [psicologoId]);


  const handleEventClick = (clickInfo) => {
    Swal.fire({
      title: clickInfo.event.title,
      text: `Horario: ${clickInfo.event.startStr}`,
      icon: "info",
    });
  };


  
  return (
    <>
      
      <Navbar />

      <div className="p-8 pt-24">
        <h1 className="text-2xl font-bold mb-6">Calendario de Psicología</h1>

        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={esLocale}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          buttonText={{
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día",
          }}
          events={eventos}
          eventClick={handleEventClick}
          height="auto"
        />
      </div>
    </>
  );
}
