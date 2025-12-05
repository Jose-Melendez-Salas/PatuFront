import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

// 1. Mapeo completo de colores según tu lista de situaciones
const ESTILOS_POR_SITUACION = {
  "problemas académicos": "#f97316", // Naranja
  "problemas personales": "#8b5cf6", // Violeta
  "problemas familiares": "#ec4899", // Rosa fuerte
  "problemas económicos": "#22c55e", // Verde
  "problemas de salud": "#3b82f6", // Azul
  "trabaja medio tiempo": "#0d9488", // Teal
  "trabaja fines de semana": "#0891b2", // Cyan oscuro
  "trabaja entre semestres": "#0284c7", // Azul cielo
  foráneo: "#4f46e5", // Indigo
  "tiene hijos": "#be123c", // Rose (Rojo vino)
  estrés: "#eab308", // Amarillo/Dorado
  otros: "#6b7280", // Gris
  default: "#9ca3af",
};

const normalizarTexto = (txt) => (txt ? txt.toLowerCase().trim() : "");

export default function EstadisticasGrupo() {
  const [datos, setDatos] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detectar cambio de tamaño de pantalla para ocultar etiquetas en móviles
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        setLoading(true);
        const usuario = JSON.parse(localStorage.getItem("usuario"));

        if (!usuario || !usuario.accessToken) {
          setError("⚠️ Debes iniciar sesión.");
          return;
        }

        const token = usuario.accessToken;

        // 1. Obtener Grupo
        const resGrupo = await fetch(
          `https://apis-patu.onrender.com/api/grupos/tutor/${usuario.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const dataGrupo = await resGrupo.json();
        if (!resGrupo.ok || !dataGrupo.data.length) {
          setError("⚠️ No se encontró un grupo asociado.");
          return;
        }

        const idGrupo = dataGrupo.data[0].id;

        // 2. Obtener Estadísticas
        const resEst = await fetch(
          `https://apis-patu.onrender.com/api/estadisticas/grupo/${idGrupo}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const dataEst = await resEst.json();

        if (!resEst.ok) {
          setError(dataEst.message || "Error al cargar estadísticas.");
          return;
        }

        const resumen = dataEst.data.resumen || [];

        // Transformar datos asegurando que porcentaje sea número
        setDatos(
          resumen.map((item) => ({
            name: item.situacion,
            value: item.cantidad,
            porcentaje: parseFloat(item.porcentaje),
          }))
        );

        setTotal(dataEst.data.total_registros_situaciones);
        setError("");
      } catch (err) {
        console.error(err);
        setError("⚠️ Error de conexión.");
      } finally {
        setLoading(false);
      }
    };

    cargarEstadisticas();
  }, []);

  // Renderizado del Tooltip personalizado (Cuadro flotante)
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg text-sm">
          <p className="font-bold text-gray-800 mb-1">{data.name}</p>
          <p className="text-gray-600">
            Cantidad: <span className="font-semibold">{data.value}</span>
          </p>
          <p className="text-gray-600">
            Porcentaje:{" "}
            <span className="font-semibold">{data.porcentaje}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 w-full  flex flex-col">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 border-b-4 border-yellow-400 pb-2 text-gray-800">
        Situaciones del Grupo
      </h2>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <p className="text-red-500 bg-red-50 px-4 py-2 rounded-lg border border-red-100 font-medium">
            {error}
          </p>
        </div>
      ) : datos.length === 0 ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <p className="text-gray-400 italic">No hay registros disponibles.</p>
        </div>
      ) : (
        <div className="w-full h-[400px] sm:h-[450px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={datos}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                // Hacemos el radio responsivo visualmente usando porcentajes
                innerRadius="45%"
                outerRadius={isMobile ? "65%" : "75%"}
                paddingAngle={2}
                // SOLO mostramos etiquetas si NO es móvil para evitar empalmes
                label={
                  isMobile
                    ? false
                    : ({ percent }) => `${(percent * 100).toFixed(0)}%`
                }
                labelLine={!isMobile}
              >
                {datos.map((entry, i) => {
                  const key = normalizarTexto(entry.name);
                  const color =
                    ESTILOS_POR_SITUACION[key] || ESTILOS_POR_SITUACION.default;
                  return <Cell key={`cell-${i}`} fill={color} stroke="none" />;
                })}
              </Pie>

              <Tooltip content={<CustomTooltip />} />

              <Legend
                verticalAlign="bottom"
                wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }}
              />

              {/* Texto central (Total) */}
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-gray-700"
              >
                <tspan
                  x="50%"
                  dy="-0.5em"
                  className="text-2xl sm:text-3xl font-bold"
                >
                  {total}
                </tspan>
                <tspan
                  x="50%"
                  dy="1.5em"
                  className="text-xs sm:text-sm font-medium fill-gray-500"
                >
                  Total
                </tspan>
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
