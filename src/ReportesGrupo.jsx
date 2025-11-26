import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from 'react-router-dom';
import Navbar from "./Navbar.jsx";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Info, BookX, ClipboardList, HeartHandshake, UserCheck, HelpCircle } from "lucide-react";
import { useParams } from "react-router-dom";

const TIPO_META = {
    general: { label: "General", hex: "#22c55e", Icono: Info },
    problemas_academicos: { label: "Problemas académicos", hex: "#f97316", Icono: BookX },
    seguimiento: { label: "Seguimiento", hex: "#3b82f6", Icono: ClipboardList },
    problemas_personales: { label: "Problemas personales", hex: "#8b5cf6", Icono: HeartHandshake },
    cambio_tutor: { label: "Cambio de tutor", hex: "#ec4899", Icono: UserCheck },
    sin_tipo: { label: "Sin tipo", hex: "#6b7280", Icono: HelpCircle },
};

const TIPOS = Object.keys(TIPO_META);

function aggregateData(dataSemanal, start, end, granularity) {
    const filtered = dataSemanal
        .filter((d) => d.semanaNumero >= start && d.semanaNumero <= end)
        .map((d) => ({ ...d, label: `Semana ${d.semanaNumero}` }));


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

            if (!token) {
                throw new Error("No hay token de sesión. Inicia sesión nuevamente.");
            }

                const res = await fetch(
                    `https://apis-patu.onrender.com/api/sesiones/reporte-grupo-semana/${idGrupo}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                             Authorization: `Bearer ${token}`,
                        },
                    }
                );
                console.log(res);



                const body = await res.json();
                console.log("📌 Respuesta completa del backend:", body);
                console.log("📌 body.data (lo que debería tener las semanas):", body.data);



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
                    



            console.log("Normalizados:", normalizados);


                setDatos(normalizados);
            } catch (err) {
                console.error(err);
                setErrorMsg(err.message || "Error al cargar los datos");
                setDatos([]);
            } finally {
                setLoading(false);
            }
        };

        if (idGrupo) {
            fetchDatos();
        } else {
            setLoading(false);
            setErrorMsg("No se proporcionó un id de grupo en la ruta.");
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
        toggleTipo(e.value);
    };

    const legendFormatter = (value) => value;

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <Navbar />

            <main className="p-6 md:p-10 max-w-7xl mx-auto">
                <h2 className="text-4xl font-extrabold mb-1 text-gray-800">Reportes por Grupo</h2>
                <div className="w-full h-1 bg-yellow-400 mb-8"></div>

                <div className="bg-white shadow rounded-2xl border border-gray-200 p-4 md:p-6 mb-6">
                    <div className="flex flex-wrap items-center gap-3">

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 mr-1">Rangos rápidos:</span>
                            {[1, 5, 9, 13].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => {
                                        setWeekStart(s);
                                        setWeekEnd(Math.min(s + 3, 16));
                                    }}
                                    className={`px-3 py-1 rounded-xl border text-sm ${weekStart === s && weekEnd === Math.min(s + 3, 16)
                                        ? "bg-gray-100 border-gray-400"
                                        : "border-gray-300 hover:bg-gray-50"
                                        }`}
                                >
                                    Sem {s}-{Math.min(s + 3, 16)}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 ml-auto">
                            <label className="text-sm text-gray-600">Inicio</label>
                            <input
                                type="range"
                                min="1"
                                max="16"
                                value={weekStart}
                                onChange={(e) => {
                                    const v = Number(e.target.value);
                                    setWeekStart(Math.min(v, weekEnd));
                                }}
                            />
                            <label className="text-sm text-gray-600">Fin</label>
                            <input
                                type="range"
                                min="1"
                                max="16"
                                value={weekEnd}
                                onChange={(e) => {
                                    const v = Number(e.target.value);
                                    setWeekEnd(Math.max(v, weekStart));
                                }}
                            />
                            <span className="text-sm text-gray-600">Sem {weekStart}-{weekEnd}</span>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Granularidad:</span>
                            <select
                                className="border rounded-lg px-3 py-1 text-sm"
                                value={granularity}
                                onChange={(e) => setGranularity(e.target.value)}
                            >
                                <option value="semanal">Semanal</option>
                                <option value="quincenal">Quincenal</option>
                                <option value="mensual">Mensual (4 semanas)</option>
                            </select>
                        </div>

                        {/* Apilado */}
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={stacked}
                                onChange={(e) => setStacked(e.target.checked)}
                            />
                            Apilar barras
                        </label>
                    </div>
                </div>

                {errorMsg && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
                        {errorMsg}
                    </div>
                )}

                {loading ? (
                    <p className="text-gray-600 text-center mt-10">Cargando datos del grupo...</p>
                ) : datos.length === 0 ? (
                    <p className="text-gray-500 text-center mt-10">
                        No hay datos para mostrar en este rango o grupo.
                    </p>
                ) : (
                    <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8 border border-gray-200 mb-8">
                        <h3 className="text-2xl font-bold mb-6 text-gray-700 text-center">
                            Distribución por tipo
                        </h3>

                        {/* Leyenda con iconos */}
                        <div className="flex flex-wrap gap-4 justify-center mb-6">
                            {Object.entries(TIPO_META).map(([key, { label, hex, Icono }]) => (
                                <button
                                    key={key}
                                    onClick={() => toggleTipo(key)}
                                    className={`flex items-center gap-2 px-3 py-1 rounded-xl border text-sm ${visibleTipos.has(key)
                                        ? "border-gray-300"
                                        : "border-dashed border-gray-300 opacity-60"
                                        }`}
                                    title={visibleTipos.has(key) ? "Ocultar" : "Mostrar"}
                                >
                                    <Icono size={18} style={{ color: hex }} />
                                    <span className="text-gray-700">{label}</span>
                                </button>
                            ))}
                        </div>

                        <ResponsiveContainer width="100%" height={430}>
                            <BarChart
                                data={dataAgregada.map((d) => ({ ...d }))}
                                layout="vertical"
                                margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                                barCategoryGap={12}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                {/* X = valores */}
                                <XAxis type="number" />
                                {/* Y = etiqueta (Semana N o rango) */}
                                <YAxis type="category" dataKey="label" width={110} />
                                <Tooltip />
                                <Legend onClick={onLegendClick} formatter={legendFormatter} />

                            {TIPOS.filter((t) => visibleTipos.has(t)).map((t) => (
                                <Bar
                                    key={t}
                                    dataKey={t}
                                    name={TIPO_META[t].label}
                                    stackId={stacked ? "a" : undefined}
                                    fill={TIPO_META[t].hex}
                                />
                            ))}

                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ReportesGrupo;