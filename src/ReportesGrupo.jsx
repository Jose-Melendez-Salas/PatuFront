import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from "./Navbar.jsx";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Info, BookX, ClipboardList, HeartHandshake, UserCheck, HelpCircle, ArrowLeft, BarChart3, Filter, Calendar, Layers, TrendingUp } from "lucide-react";

const TIPO_META = {
    general: { label: "General", hex: "#22c55e", Icono: Info },
    problemas_academicos: { label: "Académicos", hex: "#f97316", Icono: BookX },
    seguimiento: { label: "Seguimiento", hex: "#3b82f6", Icono: ClipboardList },
    problemas_personales: { label: "Personales", hex: "#8b5cf6", Icono: HeartHandshake },
    cambio_tutor: { label: "Cambio Tutor", hex: "#ec4899", Icono: UserCheck },
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
    const navigate = useNavigate();
    const [datos, setDatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    const [weekStart, setWeekStart] = useState(1);
    const [weekEnd, setWeekEnd] = useState(4);
    const [granularity, setGranularity] = useState("semanal");
    const [stacked, setStacked] = useState(true);
    const [visibleTipos, setVisibleTipos] = useState(new Set(TIPOS));
    const [animationKey, setAnimationKey] = useState(0);

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

    // Trigger animation when data changes
    useEffect(() => {
        setAnimationKey(prev => prev + 1);
    }, [dataAgregada, stacked, visibleTipos]);

    const toggleTipo = (t) => {
        const next = new Set(visibleTipos);
        if (next.has(t)) {
            next.delete(t);
        } else {
            next.add(t);
            // Animate the button when adding a type
            const button = document.getElementById(`tipo-btn-${t}`);
            if (button) {
                button.classList.add('animate-pulse-once');
                setTimeout(() => button.classList.remove('animate-pulse-once'), 300);
            }
        }
        setVisibleTipos(next);
    };

    const handleQuickRange = (start) => {
        const end = Math.min(start + 3, 16);
        setWeekStart(start);
        setWeekEnd(end);
        
        // Animation feedback
        document.querySelectorAll('.range-btn').forEach(btn => {
            btn.classList.remove('active-range');
        });
        const activeBtn = document.querySelector(`[data-start="${start}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active-range');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
            <Navbar />

            <div className="max-w-7xl mx-auto p-4 md:p-8 pt-4 md:pt-8 animate-fade-in">
                {/* Header with back button */}
                <div className="mb-8 animate-slide-down">
                    <button
                        onClick={() => navigate(`/ListaAlumnos/${idGrupo}`)}
                        className="group flex items-center text-[#8C1F2F] hover:text-[#C7952C] transition-all duration-300 font-medium mb-6 px-4 py-2 rounded-xl hover:bg-white/50 backdrop-blur-sm"
                    >
                        <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        Volver al grupo
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2">
                                Reportes Analíticos
                            </h2>
                            <p className="text-gray-600 text-lg">
                                Distribución y tendencias de sesiones del grupo
                            </p>
                        </div>
                        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm border border-gray-200">
                            <BarChart3 className="text-[#C7952C]" />
                            <span className="text-sm text-gray-700 font-medium">
                                {datos.length} semanas de datos
                            </span>
                        </div>
                    </div>
                    <div className="w-32 h-1.5 bg-gradient-to-r from-[#C7952C] to-[#E4CD87] mt-4 rounded-full"></div>
                </div>

                {/* Stats Cards */}
                {!loading && datos.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Sesiones Totales</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {datos.reduce((sum, d) => sum + d.general, 0)}
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-xl">
                                    <TrendingUp className="text-blue-500" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Semanas Activas</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {datos.filter(d => d.general > 0).length}
                                    </p>
                                </div>
                                <div className="p-3 bg-green-50 rounded-xl">
                                    <Calendar className="text-green-500" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Tipos Usados</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {Object.keys(TIPO_META).filter(key => 
                                            datos.some(d => d[key] > 0)
                                        ).length}
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-xl">
                                    <Layers className="text-purple-500" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Período</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        Sem {weekStart}-{weekEnd}
                                    </p>
                                </div>
                                <div className="p-3 bg-orange-50 rounded-xl">
                                    <Filter className="text-orange-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Control Panel */}
                <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl border border-gray-200/50 p-6 mb-8 animate-scale-in">
                    <div className="flex flex-col gap-8">
                        
                        {/* Quick Ranges */}
                        <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                                    <Calendar className="text-gray-600" size={20} />
                                </div>
                                <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Rangos rápidos</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {[1, 5, 9, 13].map((s) => (
                                    <button
                                        key={s}
                                        data-start={s}
                                        className={`range-btn px-4 py-2.5 rounded-xl border text-sm transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                                            weekStart === s && weekEnd === Math.min(s + 3, 16)
                                                ? "active-range bg-gradient-to-r from-[#E4CD87] to-[#C7952C] border-transparent text-white font-bold shadow-lg"
                                                : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                                        }`}
                                        onClick={() => handleQuickRange(s)}
                                    >
                                        Sem {s}-{Math.min(s + 3, 16)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Range Sliders */}
                        <div className="bg-gradient-to-r from-gray-50/50 to-gray-100/50 p-5 rounded-2xl border border-gray-200 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <Filter className="text-[#8C1F2C]" size={18} />
                                    </div>
                                    <span className="text-sm font-bold text-gray-700">Rango personalizado</span>
                                </div>
                                <span className="text-xs bg-white border px-3 py-1.5 rounded-lg text-gray-600 font-mono shadow-sm">
                                    Semana {weekStart} → {weekEnd}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <div className="flex justify-between mb-3">
                                        <label className="text-sm font-medium text-gray-700">Inicio</label>
                                        <span className="text-sm font-bold text-[#8C1F2C] bg-white/50 px-2 py-1 rounded">Sem {weekStart}</span>
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
                                        className="w-full h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-[#8C1F2C] [&::-webkit-slider-thumb]:to-[#C7952C] [&::-webkit-slider-thumb]:shadow-lg hover:[&::-webkit-slider-thumb]:scale-110"
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-3">
                                        <label className="text-sm font-medium text-gray-700">Fin</label>
                                        <span className="text-sm font-bold text-[#8C1F2C] bg-white/50 px-2 py-1 rounded">Sem {weekEnd}</span>
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
                                        className="w-full h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-[#8C1F2C] [&::-webkit-slider-thumb]:to-[#C7952C] [&::-webkit-slider-thumb]:shadow-lg hover:[&::-webkit-slider-thumb]:scale-110"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bottom Filters */}
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-t border-gray-100 pt-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="p-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                                    <Layers className="text-gray-600" size={18} />
                                </div>
                                <select
                                    className="border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#E4CD87] focus:ring-4 focus:ring-[#E4CD87]/20 transition-all duration-300 flex-1 sm:flex-none shadow-sm hover:shadow-md"
                                    value={granularity}
                                    onChange={(e) => {
                                        setGranularity(e.target.value);
                                        // Animation feedback
                                        const select = e.target;
                                        select.classList.add('animate-bounce-slight');
                                        setTimeout(() => select.classList.remove('animate-bounce-slight'), 300);
                                    }}
                                >
                                    <option value="semanal">Semanal</option>
                                    <option value="quincenal">Quincenal</option>
                                    <option value="mensual">Mensual</option>
                                </select>
                            </div>

                            <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer select-none bg-gray-50/80 px-4 py-3 rounded-xl border border-gray-200 hover:bg-white hover:border-gray-300 transition-all duration-300 w-full sm:w-auto justify-center sm:justify-start group">
                                <div className={`relative w-10 h-6 rounded-full transition-all duration-300 ${stacked ? 'bg-gradient-to-r from-[#E4CD87] to-[#C7952C]' : 'bg-gray-300'}`}>
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transform transition-all duration-300 ${stacked ? 'left-5' : 'left-1'}`}></div>
                                </div>
                                <span className="font-medium">Apilar barras</span>
                                <input
                                    type="checkbox"
                                    checked={stacked}
                                    onChange={(e) => setStacked(e.target.checked)}
                                    className="sr-only"
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {errorMsg && (
                    <div className="animate-shake bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8 text-sm flex items-center gap-3">
                        <Info size={20} />
                        <span className="font-medium">{errorMsg}</span>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500 animate-pulse">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-[#8C1F2C] rounded-full animate-spin"></div>
                        </div>
                        <p className="mt-4 text-gray-600 font-medium">Cargando datos analíticos...</p>
                    </div>
                ) : datos.length === 0 ? (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12 text-center border-2 border-dashed border-gray-300 animate-fade-in">
                        <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                            <BarChart3 className="text-gray-400" size={32} />
                        </div>
                        <p className="text-gray-500 font-medium text-lg">No hay datos disponibles para este grupo.</p>
                        <p className="text-gray-400 mt-2">Los reportes aparecerán cuando se registren sesiones.</p>
                    </div>
                ) : (
                    <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl p-6 md:p-8 border border-gray-200/50 animate-scale-in">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                                Distribución de Sesiones
                            </h3>
                            <p className="text-gray-600">
                                Análisis visual por tipo de sesión
                            </p>
                        </div>

                        {/* Custom Legend */}
                        <div className="flex flex-wrap gap-2 md:gap-3 justify-center mb-10">
                            {Object.entries(TIPO_META).map(([key, { label, hex, Icono }]) => (
                                <button
                                    id={`tipo-btn-${key}`}
                                    key={key}
                                    onClick={() => toggleTipo(key)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98] group ${
                                        visibleTipos.has(key)
                                            ? "bg-white border-gray-300 shadow-lg"
                                            : "bg-gray-100/50 border-gray-200 text-gray-400 opacity-60 hover:opacity-80"
                                    }`}
                                >
                                    <div className={`p-1.5 rounded-lg transition-all duration-300 ${
                                        visibleTipos.has(key) 
                                            ? 'scale-110' 
                                            : 'group-hover:scale-105'
                                    }`}>
                                        <Icono size={16} style={{ color: visibleTipos.has(key) ? hex : '#9CA3AF' }} />
                                    </div>
                                    <span className={`font-medium transition-all duration-300 ${
                                        visibleTipos.has(key) 
                                            ? "text-gray-800" 
                                            : "group-hover:text-gray-600"
                                    }`}>
                                        {label}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Chart */}
                        <div className="h-[450px] md:h-[550px] w-full animate-fade-in" key={animationKey}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={dataAgregada}
                                    layout="vertical"
                                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                    barCategoryGap={12}
                                >
                                    <CartesianGrid 
                                        strokeDasharray="3 3" 
                                        horizontal={true} 
                                        vertical={true} 
                                        stroke="#e5e7eb" 
                                    />
                                    
                                    <XAxis 
                                        type="number" 
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: '#6b7280' }}
                                    />
                                    
                                    <YAxis 
                                        type="category" 
                                        dataKey="label" 
                                        width={70}
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: '#4b5563' }}
                                    />
                                    
                                    <Tooltip 
                                        cursor={{ fill: '#f3f4f6' }}
                                        contentStyle={{ 
                                            borderRadius: '12px', 
                                            border: 'none', 
                                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                            background: 'rgba(255, 255, 255, 0.95)',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                        animationDuration={300}
                                    />
                                    
                                    {TIPOS.filter((t) => visibleTipos.has(t)).map((t, index) => (
                                        <Bar
                                            key={t}
                                            dataKey={t}
                                            name={TIPO_META[t].label}
                                            stackId={stacked ? "a" : undefined}
                                            fill={TIPO_META[t].hex}
                                            radius={[0, 6, 6, 0]}
                                            animationDuration={800}
                                            animationEasing="ease-out"
                                            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                                        />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Chart Footer */}
                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                            <p className="text-sm text-gray-500">
                                Visualización actualizada en tiempo real • {dataAgregada.length} períodos mostrados
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Animation Styles */}
            <style jsx>{`
                .animate-fade-in {
                    animation: fadeIn 0.6s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-down {
                    animation: slideDown 0.5s ease-out forwards;
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slideUp 0.5s ease-out forwards;
                    opacity: 0;
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-scale-in {
                    animation: scaleIn 0.4s ease-out forwards;
                }
                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-pulse-once {
                    animation: pulseOnce 0.3s ease-in-out;
                }
                @keyframes pulseOnce {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                .animate-bounce-slight {
                    animation: bounceSlight 0.3s ease-in-out;
                }
                @keyframes bounceSlight {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                input[type="range"]::-webkit-slider-thumb {
                    transition: all 0.2s ease;
                }
                input[type="range"]::-moz-range-thumb {
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: linear-gradient(to right, #8C1F2C, #C7952C);
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .active-range {
                    animation: pulseActive 2s infinite;
                }
                @keyframes pulseActive {
                    0%, 100% { box-shadow: 0 4px 6px -1px rgba(139, 31, 44, 0.1); }
                    50% { box-shadow: 0 4px 25px -1px rgba(139, 31, 44, 0.3); }
                }
            `}</style>
        </div>
    );
};

export default ReportesGrupo;