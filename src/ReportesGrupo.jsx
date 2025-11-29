import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from "./Navbar.jsx";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Info, BookX, ClipboardList, HeartHandshake, UserCheck, HelpCircle } from "lucide-react";

const TIPO_META = {
    general: { label: "General", hex: "#22c55e", Icono: Info },
    problemas_academicos: { label: "Académicos", hex: "#f97316", Icono: BookX }, // Label acortado para móvil
    seguimiento: { label: "Seguimiento", hex: "#3b82f6", Icono: ClipboardList },
    problemas_personales: { label: "Personales", hex: "#8b5cf6", Icono: HeartHandshake }, // Label acortado
    cambio_tutor: { label: "Cambio Tutor", hex: "#ec4899", Icono: UserCheck }, // Label acortado
    sin_tipo: { label: "Sin tipo", hex: "#6b7280", Icono: HelpCircle },
};

const TIPOS = Object.keys(TIPO_META);

function aggregateData(dataSemanal, start, end, granularity) {
    const filtered = dataSemanal
        .filter((d) => d.semanaNumero >= start && d.semanaNumero <= end)
        .map((d) => ({ ...d, label: `Sem ${d.semanaNumero}` }));

    if (granularity === "semanal") return filtered;

    const bucketSize = granularity === "quincenal" ? 2 : 4;
    const buckets = new Map();

    filtered.forEach((d) => {
        const idx = Math.floor((d.semanaNumero - start) / bucketSize);
        const from = start + idx * bucketSize;
        const to = Math.min(from + bucketSize - 1, end);
        const key = `${from}-${to}`;

        if (!buckets.has(key)) {
            const seed = { label: `Sem ${key}` };
            TIPOS.forEach((t) => (seed[t] = 0));
            buckets.set(key, seed);
        }
        const agg = buckets.get(key);
        TIPOS.forEach((t) => (agg[t] += d[t] || 0));
    });

    return Array.from(buckets.values());
}

const ReportesGrupo = () => {
    const { idGrupo } = useParams();
    const [datos, setDatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    const [weekStart, setWeekStart] = useState(1);
    const [weekEnd, setWeekEnd] = useState(4);
    const [granularity, setGranularity] = useState("semanal");
    const [stacked, setStacked] = useState(true);
    const [visibleTipos, setVisibleTipos] = useState(new Set(TIPOS));

    useEffect(() => {
        const fetchDatos = async () => {
            try {
                setLoading(true);
                setErrorMsg("");
                const usuario = JSON.parse(localStorage.getItem("usuario"));
                const token = usuario?.accessToken;

                if (!token) throw new Error("No hay token de sesión.");

                const res = await fetch(
                    `https://apis-patu.onrender.com/api/sesiones/reporte-grupo-semana/${idGrupo}`,
                    { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
                );

                const body = await res.json();
                
                const normalizados = (body.data || []).map((item) => {
                    const tipos = item.conteoPorTipo || {};
                    const semanaNumero = parseInt(item.semana.match(/\d+/)[0]);
                    return {
                        semana: item.semana,
                        semanaNumero,
                        label: `Semana ${semanaNumero}`,
                        general: Object.values(tipos).reduce((a, b) => a + b, 0),
                        problemas_academicos: tipos["problemas académicos"] ?? 0,
                        seguimiento: tipos["seguimiento"] ?? 0,
                        problemas_personales: tipos["problemas personales"] ?? 0,
                        cambio_tutor: tipos["cambio de tutor"] ?? 0,
                        sin_tipo: tipos["sin tipo"] ?? 0,
                    };
                });

                setDatos(normalizados);
            } catch (err) {
                console.error(err);
                setErrorMsg(err.message || "Error al cargar los datos");
                setDatos([]);
            } finally {
                setLoading(false);
            }
        };

        if (idGrupo) fetchDatos();
        else {
            setLoading(false);
            setErrorMsg("No se proporcionó un id de grupo.");
        }
    }, [idGrupo]);

    useEffect(() => {
        if (datos.length > 0) {
            setWeekStart(datos[0].semanaNumero);
            setWeekEnd(datos[datos.length - 1].semanaNumero);
        }
    }, [datos]);

    const dataAgregada = useMemo(
        () => aggregateData(datos, weekStart, weekEnd, granularity),
        [datos, weekStart, weekEnd, granularity]
    );

    const toggleTipo = (t) => {
        const next = new Set(visibleTipos);
        next.has(t) ? next.delete(t) : next.add(t);
        setVisibleTipos(next);
    };

    const onLegendClick = (e) => {
        if (!e?.value) return;
        // La librería recharts a veces devuelve payload distinto, buscamos la key correcta
        // Aquí asumimos que e.value o e.dataKey corresponde a nuestras keys
        const key = TIPOS.find(t => t === e.dataKey) || e.value; 
        if(key) toggleTipo(key);
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <Navbar />

            <main className="p-4 md:p-8 max-w-7xl mx-auto animate-fadeIn">
                <div className="mb-6">
                    <h2 className="text-2xl md:text-4xl font-extrabold text-gray-800">Reportes por Grupo</h2>
                    <div className="w-full h-1 bg-[#C7952C] mt-2 mb-6 rounded-full"></div>
                </div>

                <div className="bg-white shadow-lg rounded-2xl border border-gray-100 p-4 md:p-6 mb-6">
                    
                    {/* --- CONTROLES RESPONSIVOS --- */}
                    <div className="flex flex-col gap-6">
                        
                        {/* 1. Rangos Rápidos */}
                        <div>
                            <span className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wide mb-2 block">Rangos rápidos</span>
                            <div className="flex flex-wrap gap-2">
                                {[1, 5, 9, 13].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => {
                                            setWeekStart(s);
                                            setWeekEnd(Math.min(s + 3, 16));
                                        }}
                                        className={`px-3 py-1.5 rounded-lg border text-xs md:text-sm transition-all ${
                                            weekStart === s && weekEnd === Math.min(s + 3, 16)
                                                ? "bg-[#E4CD87] border-[#E4CD87] text-black font-bold shadow-sm"
                                                : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                        }`}
                                    >
                                        Sem {s}-{Math.min(s + 3, 16)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Sliders de Rango */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm font-bold text-gray-700">Rango personalizado</span>
                                <span className="text-xs bg-white border px-2 py-1 rounded text-gray-600 font-mono">
                                    Semana {weekStart} a {weekEnd}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <label className="text-xs text-gray-500">Inicio: Sem {weekStart}</label>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="16"
                                        value={weekStart}
                                        onChange={(e) => {
                                            const v = Number(e.target.value);
                                            setWeekStart(Math.min(v, weekEnd));
                                        }}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#8C1F2F]"
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <label className="text-xs text-gray-500">Fin: Sem {weekEnd}</label>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="16"
                                        value={weekEnd}
                                        onChange={(e) => {
                                            const v = Number(e.target.value);
                                            setWeekEnd(Math.max(v, weekStart));
                                        }}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#8C1F2F]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 3. Filtros Inferiores */}
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-t pt-4">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <span className="text-sm text-gray-600">Ver como:</span>
                                <select
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#E4CD87] flex-1 sm:flex-none"
                                    value={granularity}
                                    onChange={(e) => setGranularity(e.target.value)}
                                >
                                    <option value="semanal">Semanal</option>
                                    <option value="quincenal">Quincenal</option>
                                    <option value="mensual">Mensual</option>
                                </select>
                            </div>

                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none bg-gray-50 px-3 py-2 rounded-lg border hover:bg-gray-100 transition w-full sm:w-auto justify-center sm:justify-start">
                                <input
                                    type="checkbox"
                                    checked={stacked}
                                    onChange={(e) => setStacked(e.target.checked)}
                                    className="w-4 h-4 text-[#8C1F2F] rounded focus:ring-[#8C1F2F]"
                                />
                                Apilar barras
                            </label>
                        </div>
                    </div>
                </div>

                {errorMsg && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                        <Info size={18} /> {errorMsg}
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8C1F2F] mb-4"></div>
                        <p>Cargando datos...</p>
                    </div>
                ) : datos.length === 0 ? (
                    <div className="bg-gray-100 rounded-2xl p-10 text-center border border-dashed border-gray-300">
                        <p className="text-gray-500 font-medium">No hay datos disponibles para este grupo.</p>
                    </div>
                ) : (
                    <div className="bg-white shadow-xl rounded-2xl p-4 md:p-8 border border-gray-200">
                        <h3 className="text-xl md:text-2xl font-bold mb-6 text-gray-800 text-center">
                            Distribución de Sesiones
                        </h3>

                        {/* Leyenda Personalizada (Botones) */}
                        <div className="flex flex-wrap gap-2 md:gap-3 justify-center mb-8">
                            {Object.entries(TIPO_META).map(([key, { label, hex, Icono }]) => (
                                <button
                                    key={key}
                                    onClick={() => toggleTipo(key)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs md:text-sm transition-all duration-200 ${
                                        visibleTipos.has(key)
                                            ? "bg-white border-gray-300 shadow-sm"
                                            : "bg-gray-50 border-gray-100 text-gray-400 grayscale"
                                    }`}
                                >
                                    <Icono size={14} style={{ color: visibleTipos.has(key) ? hex : 'inherit' }} />
                                    <span className={visibleTipos.has(key) ? "font-medium text-gray-700" : ""}>{label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Gráfica */}
                        <div className="h-[400px] md:h-[500px] w-full">
                            <ResponsiveContainer width="99%" height="100%">
                                <BarChart
                                    data={dataAgregada}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                                    barCategoryGap={10}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#eee" />
                                    
                                    <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                                    
                                    <YAxis 
                                        type="category" 
                                        dataKey="label" 
                                        width={80} // Ancho reducido para móvil
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    
                                    <Tooltip 
                                        cursor={{fill: '#f9fafb'}}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    
                                    {/* Nota: Ocultamos la leyenda default de Recharts porque usamos la personalizada arriba */}
                                    {/* <Legend /> */}

                                    {TIPOS.filter((t) => visibleTipos.has(t)).map((t) => (
                                        <Bar
                                            key={t}
                                            dataKey={t}
                                            name={TIPO_META[t].label}
                                            stackId={stacked ? "a" : undefined}
                                            fill={TIPO_META[t].hex}
                                            radius={[0, 4, 4, 0]} // Bordes redondeados al final
                                            animationDuration={1000}
                                        />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </main>
            
            <style>{`
                .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
                @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
            `}</style>
        </div>
    );
};

export default ReportesGrupo;