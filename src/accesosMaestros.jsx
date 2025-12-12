import React, { useState, useEffect, useRef } from "react";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts";
import {
  Info,
  BookX,
  HeartHandshake,
  HelpCircle,
  ClipboardList,
  UserCheck,
  PieChart as PieChartIcon,
  CalendarDays,
  ChevronRight,
} from "lucide-react";
import { FaEye, FaTrash, FaChartPie, FaCalendarAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import EstadisticasGrupo from "./GraficaSituaciones";

const ESTILOS_POR_TIPO = {
  general: { 
    color: "green", 
    Icono: Info, 
    hex: "#22c55e",
    name: "General"
  },
  "problemas académicos": { 
    color: "orange", 
    Icono: BookX, 
    hex: "#f97316",
    name: "Problemas Académicos"
  },
  seguimiento: { 
    color: "blue", 
    Icono: ClipboardList, 
    hex: "#3b82f6",
    name: "Seguimiento"
  },
  "problemas personales": {
    color: "purple",
    Icono: HeartHandshake,
    hex: "#8b5cf6",
    name: "Problemas Personales"
  },
  "cambio de tutor": { 
    color: "pink", 
    Icono: UserCheck, 
    hex: "#ec4899",
    name: "Cambio de Tutor"
  },
  psicologia: {
    color: "indigo",
    Icono: HeartHandshake,
    hex: "#6366f1",
    name: "Psicología"
  },
  "sin tipo": { 
    color: "gray", 
    Icono: HelpCircle, 
    hex: "#6b7280",
    name: "Sin Tipo"
  },
  default: { 
    color: "gray", 
    Icono: HelpCircle, 
    hex: "#6b7280",
    name: "Sin Tipo"
  },
};

const capitalizeFirstLetter = (string) => {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const EventoCard = ({ evento, onVerDetalles }) => {
  const tipoEvento = evento.tipo?.toLowerCase() || "default";
  const { color, Icono, hex } = ESTILOS_POR_TIPO[tipoEvento] || ESTILOS_POR_TIPO.default;
  const [isHovered, setIsHovered] = useState(false);

  const formatEventTime = (fecha, hora) => {
    const hoy = new Date();
    const manana = new Date();
    manana.setDate(hoy.getDate() + 1);
    const fechaEvento = new Date(`${fecha}T00:00:00`);

    let diaTexto = new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "numeric",
    }).format(fechaEvento);
    diaTexto = diaTexto.charAt(0).toUpperCase() + diaTexto.slice(1);
    
    if (hoy.toDateString() === fechaEvento.toDateString()) diaTexto = "Hoy";
    else if (manana.toDateString() === fechaEvento.toDateString())
      diaTexto = "Mañana";

    return `${diaTexto}, ${hora.substring(0, 5)}`;
  };

  return (
    <div
      className={`p-4 rounded-2xl border-3 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer transform ${isHovered ? 'scale-[1.02] -translate-y-1' : ''}`}
      style={{ 
        borderColor: hex,
        backgroundColor: `${hex}10`
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onVerDetalles(evento)}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <Icono className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0" style={{ color: hex }} />
          <div 
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
            style={{ backgroundColor: hex }}
          >
            <FaEye className="text-white text-xs" />
          </div>
        </div>

        <div className="flex flex-col flex-grow">
          <div className="flex justify-between items-start">
            <p className="font-bold text-lg" style={{ color: hex }}>
              {formatEventTime(evento.fecha, evento.hora_inicio)}
            </p>
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${evento.estado === 'completada' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {evento.estado || 'pendiente'}
            </span>
          </div>
          
          <p className="font-semibold text-gray-800 mt-1 text-base">
            {capitalizeFirstLetter(evento.tipo) || "Sesión"}
          </p>
          
          <p className="text-gray-600 mt-1">
            <span className="font-medium">Alumno:</span>{" "}
            {`${evento.alumno?.nombre} ${evento.alumno?.apellido_paterno || ""}`}
          </p>
          
          <div className="flex items-center gap-2 mt-3 group">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onVerDetalles(evento);
              }}
              className="flex items-center gap-1 font-semibold text-sm transition-all duration-300 group-hover:gap-2"
              style={{ color: hex }}
            >
              <FaEye className="transition-transform group-hover:scale-110" />
              Ver detalles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AccesosMaestros = () => {
  const [eventosProximos, setEventosProximos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detalleEvento, setDetalleEvento] = useState(null);
  const [modalAnimation, setModalAnimation] = useState(false);
  const [problemasData, setProblemasData] = useState([]);
  const [totalSesiones, setTotalSesiones] = useState(0);
  const [activeIndex, setActiveIndex] = useState(null);
  const [chartLoaded, setChartLoaded] = useState(false);
  const chartContainerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setLoading(true);
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        if (!usuario || !usuario.accessToken) {
          setError("⚠️ Debes iniciar sesión primero");
          return;
        }

        let url = "";
        if (usuario.rol === "tutor")
          url = `https://apis-patu.onrender.com/api/sesiones/tutor/${usuario.id}`;
        else if (usuario.rol === "alumno")
          url = `https://apis-patu.onrender.com/api/sesiones/alumno/${usuario.id}`;
        if (!url) {
          setError("Rol de usuario no válido.");
          return;
        }

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${usuario.accessToken}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "❌ No se pudieron cargar los eventos");
          return;
        }

        const eventosConNombres = await Promise.all(
          data.data.map(async (evento) => {
            const [alumnoRes, tutorRes] = await Promise.all([
              fetch(
                `https://apis-patu.onrender.com/api/usuarios/id/${evento.id_alumno}`,
                { headers: { Authorization: `Bearer ${usuario.accessToken}` } }
              ),
              fetch(
                `https://apis-patu.onrender.com/api/usuarios/id/${evento.id_tutor}`,
                { headers: { Authorization: `Bearer ${usuario.accessToken}` } }
              ),
            ]);
            const alumnoData = await alumnoRes.json();
            const tutorData = await tutorRes.json();
            return {
              ...evento,
              alumno: alumnoData.data,
              tutor: tutorData.data,
            };
          })
        );

        const conteoPorTipo = eventosConNombres.reduce((acc, evento) => {
          const tipo = evento.tipo?.toLowerCase() || "sin tipo";
          acc[tipo] = (acc[tipo] || 0) + 1;
          return acc;
        }, {});

        const datosParaGrafica = Object.keys(conteoPorTipo).map((key) => {
          const estilo = ESTILOS_POR_TIPO[key] || ESTILOS_POR_TIPO.default;
          return {
            name: estilo.name || capitalizeFirstLetter(key),
            value: conteoPorTipo[key],
            tipo: key,
            color: estilo.hex
          };
        });

        setProblemasData(datosParaGrafica);
        setTotalSesiones(eventosConNombres.length);

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const unaSemanaDespues = new Date();
        unaSemanaDespues.setDate(hoy.getDate() + 7);
        const eventosFiltrados = eventosConNombres.filter(
          (evento) =>
            new Date(evento.fecha + "T00:00:00") >= hoy &&
            new Date(evento.fecha + "T00:00:00") <= unaSemanaDespues
        );
        eventosFiltrados.sort(
          (a, b) =>
            new Date(`${a.fecha}T${a.hora_inicio}`) -
            new Date(`${b.fecha}T${b.hora_inicio}`)
        );
        setEventosProximos(eventosFiltrados);
        setError("");
      } catch (err) {
        console.error(err);
        setError("⚠️ Error de conexión con la API");
      } finally {
        setLoading(false);
      }
    };
    fetchEventos();
  }, []);

  // Forzar re-render del chart después de cargar
  useEffect(() => {
    if (problemasData.length > 0) {
      setChartLoaded(false);
      const timer = setTimeout(() => {
        setChartLoaded(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [problemasData]);

  // Animación del modal
  useEffect(() => {
    if (detalleEvento) {
      setTimeout(() => setModalAnimation(true), 10);
    }
  }, [detalleEvento]);

  const closeModal = () => {
    setModalAnimation(false);
    setTimeout(() => setDetalleEvento(null), 300);
  };

  const handleEventClick = (evento) => {
    const card = document.activeElement;
    if (card) {
      card.style.transform = 'scale(0.95)';
      setTimeout(() => {
        card.style.transform = 'scale(1)';
      }, 200);
    }
    
    setTimeout(() => {
      setDetalleEvento(evento);
    }, 100);
  };

  const handleEliminar = async (id_sesion) => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const result = await Swal.fire({
      title: "¿Eliminar sesión?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#8C1F2F",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      showClass: {
        popup: 'animate-fadeIn'
      },
      hideClass: {
        popup: 'animate-fadeOut'
      }
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(
        `https://apis-patu.onrender.com/api/sesiones/${id_sesion}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${usuario.accessToken}` },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "No se pudo eliminar la sesión",
          showClass: {
            popup: 'animate-shake'
          }
        });
        return;
      }

      setEventosProximos((prevEventos) =>
        prevEventos.filter((e) => e.id_sesion !== id_sesion)
      );
      closeModal();

      await Swal.fire({
        icon: "success",
        title: "✓ Sesión eliminada",
        timer: 1800,
        showConfirmButton: false,
        showClass: {
          popup: 'animate-fadeIn'
        }
      });
    } catch (err) {
      await Swal.fire(
        "Error de conexión",
        "No se pudo conectar con la API.",
        "error"
      );
    }
  };

  // Obtener estilo del tipo de evento
  const getEventStyle = (tipo) => {
    const tipoLower = tipo?.toLowerCase() || 'default';
    return ESTILOS_POR_TIPO[tipoLower] || ESTILOS_POR_TIPO.default;
  };

  // Custom Tooltip para la gráfica
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-bold" style={{ color: payload[0].payload.color }}>
            {payload[0].payload.name}
          </p>
          <p className="text-gray-700">
            Cantidad: <span className="font-bold">{payload[0].value}</span>
          </p>
          <p className="text-gray-600 text-sm">
            {((payload[0].value / totalSesiones) * 100).toFixed(1)}% del total
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom Legend para móviles
  const CustomLegend = () => {
    return (
      <div className="mt-4 sm:mt-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {problemasData.map((entry, index) => (
            <div 
              key={`legend-${index}`}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <div className="flex-grow min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                  {entry.name}
                </p>
                <p className="text-xs text-gray-500 font-bold">
                  {entry.value} sesiones
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render condicional de la gráfica
  const renderChart = () => {
    if (!chartLoaded || problemasData.length === 0) return null;

    return (
      <ResponsiveContainer width="100%" height="100%" minHeight={300}>
        <PieChart>
          <Pie
            data={problemasData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="30%"
            outerRadius="60%"
            paddingAngle={2}
            labelLine={false}
            label={({ name, value, percent }) => 
              `${value}\n${(percent * 100).toFixed(0)}%`
            }
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {problemasData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                stroke="#fff"
                strokeWidth={2}
                opacity={activeIndex === null || activeIndex === index ? 1 : 0.5}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            layout="vertical"
            verticalAlign="middle"
            align="right"
            wrapperStyle={{ paddingLeft: '20px' }}
            formatter={(value, entry) => (
              <span className="text-sm font-medium text-gray-700">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // Render condicional de la gráfica móvil
  const renderMobileChart = () => {
    if (!chartLoaded || problemasData.length === 0) return null;

    return (
      <ResponsiveContainer width="100%" height={250} minHeight={200}>
        <PieChart>
          <Pie
            data={problemasData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="25%"
            outerRadius="50%"
            paddingAngle={1}
            labelLine={false}
            label={({ value }) => value}
          >
            {problemasData.map((entry, index) => (
              <Cell 
                key={`cell-mobile-${index}`} 
                fill={entry.color}
                stroke="#fff"
                strokeWidth={1}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <main className="pt-24 px-4 sm:px-6 md:px-8 lg:px-20 animate-fadeIn">
        {/* BARRA SUPERIOR */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b-4 border-[#C7952C] pb-4 mb-6 text-center md:text-left gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#E4CD87] rounded-full">
              <PieChartIcon className="text-white text-xl" />
            </div>
            <div>
              <h2 className="font-bold text-2xl sm:text-3xl text-gray-800">
                Tipos de Sesiones
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {totalSesiones} sesiones totales
              </p>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <h2 className="font-bold text-3xl text-gray-800">
              Próximos eventos
            </h2>
          </div>
        </div>

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* --- GRAFICA MEJORADA CON DIMENSIONES FIJAS --- */}
          <div 
            ref={chartContainerRef}
            className="bg-white rounded-2xl shadow-xl p-4 sm:p-5 min-h-[400px] sm:min-h-[450px] lg:min-h-[500px] border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#3CB9A5] rounded-lg">
                  <FaChartPie className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">Distribución de Sesiones</h3>
              </div>
              <div className="bg-gray-100 px-3 py-1 rounded-full">
                <span className="text-sm font-bold text-gray-700">{totalSesiones} total</span>
              </div>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center h-64 sm:h-72">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-[#E4CD87] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Cargando estadísticas...</p>
                </div>
              </div>
            ) : problemasData.length > 0 ? (
              <>
                {/* Gráfica para escritorio */}
                <div className="hidden sm:block" style={{ height: '280px' }}>
                  {renderChart()}
                </div>
                
                {/* Versión móvil: Gráfica simplificada + leyenda */}
                <div className="sm:hidden">
                  <div style={{ height: '200px' }}>
                    {renderMobileChart()}
                  </div>
                  
                  {/* Leyenda con cantidades para móvil */}
                  <CustomLegend />
                </div>
                
                {/* Resumen de total */}
                <div className="mt-4 sm:mt-6 text-center">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 rounded-full">
                    <span className="text-gray-700 font-medium">Total de sesiones:</span>
                    <span className="text-2xl font-bold text-gray-900">{totalSesiones}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 sm:h-72">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <PieChartIcon className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg font-medium">
                  No hay sesiones registradas
                </p>
                <p className="text-gray-400 text-sm mt-2 text-center">
                  Comienza agendando tu primera sesión
                </p>
              </div>
            )}
          </div>

          {/* --- EVENTOS PRÓXIMOS --- */}
          <div className="flex flex-col">
            {/* Título para móvil */}
            <div className="block lg:hidden mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <h2 className="font-bold text-2xl text-gray-800">
                  Próximos eventos
                </h2>
              </div>
              <div className="h-1 w-24 bg-gradient-to-r from-[#C7952C] to-[#E4CD87] rounded-full"></div>
            </div>

            <div className="flex-grow space-y-4 max-h-[450px] sm:max-h-[550px] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 rounded-2xl bg-gray-100 animate-pulse">
                      <div className="flex gap-4">
                        <div className="w-14 h-14 bg-gray-300 rounded-xl"></div>
                        <div className="flex-grow space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center p-6 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl animate-shake">
                  <div className="text-red-600 font-semibold text-lg">{error}</div>
                  <p className="text-red-500 mt-2">Por favor, intenta de nuevo más tarde</p>
                </div>
              ) : eventosProximos.length > 0 ? (
                eventosProximos.map((evento, index) => (
                  <EventoCard
                    key={evento.id_sesion}
                    evento={evento}
                    onVerDetalles={handleEventClick}
                  />
                ))
              ) : (
                <div className="text-center p-8 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-dashed border-amber-200 rounded-2xl">
                  <FaCalendarAlt className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium text-lg">
                    No hay eventos programados
                  </p>
                  <p className="text-gray-500 mt-2">
                    No tienes sesiones para los próximos 7 días
                  </p>
                  <a
                    href="/calendario/nuevo"
                    className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-[#E4CD87] to-[#C7952C] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    Agendar nueva sesión
                  </a>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <a
                href="/Calendario"
                className="flex items-center justify-end gap-2 text-[#3CB9A5] hover:text-[#2da894] font-semibold text-lg group transition-all duration-300"
              >
                Ver agenda completa
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </div>
          </div>
        </div>

        {/* COMPONENTE ESTADÍSTICAS */}
        <div className="mt-10 animate-fadeIn" style={{ animationDelay: '200ms' }}>
          <EstadisticasGrupo />
        </div>
      </main>

      {/* MODAL DE DETALLES */}
      {detalleEvento && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
            modalAnimation 
              ? 'bg-black/50 backdrop-blur-sm' 
              : 'bg-black/0 backdrop-blur-0'
          }`}
          onClick={closeModal}
        >
          <div 
            className={`bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all duration-300 ${
              modalAnimation 
                ? 'scale-100 opacity-100 translate-y-0' 
                : 'scale-95 opacity-0 translate-y-4'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div 
              className="p-6 rounded-t-2xl text-white relative"
              style={{ 
                backgroundColor: getEventStyle(detalleEvento.tipo).hex,
                backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)'
              }}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
              >
                <span className="text-white text-xl font-bold">×</span>
              </button>
              
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  {React.createElement(getEventStyle(detalleEvento.tipo).Icono, {
                    className: "w-8 h-8"
                  })}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Detalles de la sesión</h2>
                  <p className="text-white/90 mt-1">
                    {capitalizeFirstLetter(detalleEvento.tipo) || "Sesión general"}
                  </p>
                </div>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 space-y-5">
              {/* Estado */}
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="font-semibold text-gray-700">Estado:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 ${
                  detalleEvento.estado === 'completada'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {detalleEvento.estado || 'Pendiente'}
                </span>
              </div>

              {/* Información de fecha y hora */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <CalendarDays className="w-4 h-4" />
                    <span className="font-medium">Fecha</span>
                  </div>
                  <p className="font-semibold text-gray-800">{detalleEvento.fecha}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <CalendarDays className="w-4 h-4" />
                    <span className="font-medium">Horario</span>
                  </div>
                  <p className="font-semibold text-gray-800">
                    {detalleEvento.hora_inicio} - {detalleEvento.hora_fin}
                  </p>
                </div>
              </div>

              {/* Información de participantes */}
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <UserCheck className="w-4 h-4" />
                    <span className="font-semibold">Alumno</span>
                  </div>
                  <p className="font-bold text-gray-800">
                    {detalleEvento.alumno?.nombre} {detalleEvento.alumno?.apellido_paterno}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {detalleEvento.alumno?.correo}
                  </p>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl">
                  <div className="flex items-center gap-2 text-amber-600 mb-2">
                    <UserCheck className="w-4 h-4" />
                    <span className="font-semibold">Tutor / Psicóloga</span>
                  </div>
                  <p className="font-bold text-gray-800">
                    {detalleEvento.tutor?.nombre} {detalleEvento.tutor?.apellido_paterno}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {detalleEvento.tutor?.correo}
                  </p>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEliminar(detalleEvento.id_sesion)}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#8C1F2F] to-[#a82a3d] text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
                >
                  <FaTrash className="group-hover:animate-bounce" />
                  Eliminar sesión
                </button>

                {JSON.parse(localStorage.getItem("usuario"))?.rol === "tutor" && (
                  <button
                    onClick={() => navigate(`/bitacora/${detalleEvento.id_sesion}`)}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#E4CD87] to-[#C7952C] text-gray-800 font-bold py-3 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
                  >
                    <ClipboardList className="group-hover:rotate-12 transition-transform" />
                    Registrar Bitácora
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estilos CSS para animaciones */}
      <style jsx>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(20px) scale(0.98); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        @keyframes fadeOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(20px); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-fadeOut {
          animation: fadeOut 0.3s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        /* Scrollbar personalizado */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #E4CD87, #C7952C);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #C7952C, #E4CD87);
        }
      `}</style>
    </div>
  );
};

export default AccesosMaestros;