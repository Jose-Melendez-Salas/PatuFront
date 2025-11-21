import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Info, BookX, ClipboardList, UserCheck, HeartHandshake, HelpCircle, Clock, Trash2 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, YAxis, Tooltip, Cell } from "recharts";
import logoImg from './assets/logo.png';
import { FaPlus } from 'react-icons/fa';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// --- Estilos por tipo de sesión (gráfica) ---
const ESTILOS_POR_TIPO = {
    'general': { color: 'green', Icono: Info, hex: '#22c55e' },
    'problemas académicos': { color: 'orange', Icono: BookX, hex: '#f97316' },
    'seguimiento': { color: 'blue', Icono: ClipboardList, hex: '#3b82f6' },
    'problemas personales': { color: 'purple', Icono: HeartHandshake, hex: '#8b5cf6' },
    'cambio de tutor': { color: 'pink', Icono: UserCheck, hex: '#ec4899' },
    'sin tipo': { color: 'gray', Icono: HelpCircle, hex: '#6b7280' },
    'default': { color: 'gray', Icono: HelpCircle, hex: '#6b7280' }
};

// --- Utilidades ---
const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
};
const normalizar = (txt) =>
    (txt || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Validaciones de disponibilidad
const DIAS_HABILES = ["lunes", "martes", "miercoles", "jueves", "viernes"];
const toMinutes = (hhmm) => {
    const [h, m] = (hhmm || "00:00").split(":").map(Number);
    return (h * 60) + (m || 0);
};
const validarDisponibilidad = (diaUI, inicio, fin) => {
    const dia = normalizar(diaUI);
    if (!DIAS_HABILES.includes(dia)) {
        return { ok: false, msg: "Solo se permite registrar disponibilidad de lunes a viernes." };
    }
    if (!inicio || !fin) {
        return { ok: false, msg: "Debes indicar hora de inicio y fin." };
    }
    const minAllowed = toMinutes("07:00");
    const maxAllowed = toMinutes("19:00");
    const start = toMinutes(inicio);
    const end = toMinutes(fin);
    if (start < minAllowed || start > maxAllowed || end < minAllowed || end > maxAllowed) {
        return { ok: false, msg: "El horario debe estar entre 07:00 y 19:00." };
    }
    if (end <= start) {
        return { ok: false, msg: "La hora de fin debe ser mayor a la hora de inicio." };
    }
    return { ok: true, diaNormalizado: dia, start, end };
};

// --- Componente Bitácora ---
const BitacoraFicha = ({ asistencia, notas, acuerdos, compromisos, color }) => (
    <div
        className="p-4 mb-4 rounded-xl shadow-md border-2 transition-all hover:shadow-lg"
        style={{ borderColor: color }}
    >
        <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-base text-gray-800">
                Asistencia: {asistencia || "—"}
            </h4>
        </div>
        <p className="text-sm"><span className="font-semibold">Notas:</span> {notas || "Sin notas"}</p>
        <p className="text-sm"><span className="font-semibold">Acuerdos:</span> {acuerdos || "—"}</p>
        <p className="text-sm"><span className="font-semibold">Compromisos:</span> {compromisos || "—"}</p>
    </div>
);

// --- Pantalla principal ---
const FichaAlumno = () => {
    const { matricula } = useParams();
    const navigate = useNavigate();

    const [usuario, setUsuario] = useState(null); // tutor logueado
    const [alumnoData, setAlumnoData] = useState(null);
    const [bitacoraData, setBitacoraData] = useState([]);
    const [chartDataTipos, setChartDataTipos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Disponibilidad
    const [disponibilidades, setDisponibilidades] = useState([]);
    const [loadingDisponibilidad, setLoadingDisponibilidad] = useState(false);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [nuevoDia, setNuevoDia] = useState("lunes");
    const [nuevaHoraInicio, setNuevaHoraInicio] = useState("");
    const [nuevaHoraFin, setNuevaHoraFin] = useState("");
    // Filtro por día
    const [filtroDia, setFiltroDia] = useState("");

    const sinRegistrosImgUrl = "https://placehold.co/224x224/eeeeee/999999?text=Sin+Registros";

    // --- Carga inicial ---
    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuario");
        if (!usuarioGuardado) { setError("⚠️ No hay sesión activa..."); setLoading(false); return; }
        const user = JSON.parse(usuarioGuardado);
        if (!user || !user.accessToken || !user.id) { setError("⚠️ Sesión inválida..."); setLoading(false); return; }
        setUsuario(user);

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            setAlumnoData(null);
            setBitacoraData([]);
            setChartDataTipos([]);
            setDisponibilidades([]);
            setFiltroDia("");

            const headers = {
                Authorization: `Bearer ${user.accessToken}`,
                "Content-Type": "application/json",
            };

            try {
                // 1) Alumno por matrícula
                const resAlumno = await fetch(`https://apis-patu.onrender.com/api/alumnos/matricula/${matricula}`, { headers });
                if (!resAlumno.ok) {
                    const errorData = await resAlumno.json().catch(() => ({}));
                    throw new Error(errorData.message || `Error al obtener datos del alumno (${resAlumno.status})`);
                }
                const alumnoJson = await resAlumno.json();
                const alumno = alumnoJson.data;
                if (!alumno || typeof alumno.id_usuario === 'undefined' || alumno.id_usuario === null) {
                    throw new Error("Datos del alumno inválidos o falta id_usuario.");
                }
                setAlumnoData(alumno);

                // 2) Bitácora del alumno (por matrícula)
                const resBitacora = await fetch(`https://apis-patu.onrender.com/api/bitacora/alumno/${alumno.matricula}`, { headers });
                if (resBitacora.ok) {
                    const bitacoraJson = await resBitacora.json();
                    setBitacoraData(bitacoraJson.data || []);
                } else {
                    setBitacoraData([]);
                }

                // 3) Disponibilidad del alumno (semana completa por matrícula)
                await fetchDisponibilidadesPorMatricula(alumno.matricula, user.accessToken);

                // 4) Sesiones del alumno (gráfica) — por id_usuario
                const resSesiones = await fetch(`https://apis-patu.onrender.com/api/sesiones/alumno/${alumno.id_usuario}`, { headers });
                if (resSesiones.ok) {
                    const sesionesJson = await resSesiones.json();
                    const sesiones = sesionesJson.data || [];
                    const conteoPorTipo = sesiones.reduce((acc, evento) => {
                        const tipo = capitalizeFirstLetter(evento.tipo) || 'Sin tipo';
                        acc[tipo] = (acc[tipo] || 0) + 1;
                        return acc;
                    }, {});
                    const datosParaGraficaTipos = Object.keys(conteoPorTipo).map(key => ({
                        tipo: key,
                        sesiones: conteoPorTipo[key]
                    }));
                    setChartDataTipos(datosParaGraficaTipos);
                } else {
                    setChartDataTipos([]);
                }

            } catch (err) {
                console.error("❌ Error en fetchData:", err);
                setError(err.message || "Error al cargar los datos.");
                setAlumnoData(null);
                setBitacoraData([]);
                setChartDataTipos([]);
                setDisponibilidades([]);
            } finally {
                setLoading(false);
                setLoadingDisponibilidad(false);
            }
        };

        fetchData();
    }, [matricula]);

    // --- Disponibilidad por matrícula (semana completa) ---
    const fetchDisponibilidadesPorMatricula = async (matriculaAlumno, accessToken) => {
        const token = accessToken || usuario?.accessToken;
        if (!matriculaAlumno || !token) { setDisponibilidades([]); return; }
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const res = await fetch(
                `https://apis-patu.onrender.com/api/disponibilidades/alumno/${matriculaAlumno}`,
                { headers }
            );
            if (!res.ok) { setDisponibilidades([]); return; }
            const { data = [] } = await res.json();

            const diasOrden = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]; // API sin acentos
            const ordenadas = [...data].sort((a, b) => {
                const A = diasOrden.indexOf(normalizar(a.dia));
                const B = diasOrden.indexOf(normalizar(b.dia));
                if (A !== B) return (A === -1 ? 99 : A) - (B === -1 ? 99 : B);
                return (a.hora_inicio || "").localeCompare(b.hora_inicio || "");
            });

            setDisponibilidades(ordenadas);
        } catch (e) {
            console.error("Error recargando disponibilidades:", e);
            setDisponibilidades([]);
        }
    };

    // --- Disponibilidad por día (filtro) ---
    const fetchDisponibilidadesPorDia = async (matriculaAlumno, diaUI) => {
        if (!matriculaAlumno || !usuario?.accessToken || !diaUI) return;
        try {
            const headers = { Authorization: `Bearer ${usuario.accessToken}` };
            const dia = normalizar(diaUI); // "miércoles" -> "miercoles"
            const res = await fetch(
                `https://apis-patu.onrender.com/api/disponibilidades/alumno/${matriculaAlumno}/dia/${encodeURIComponent(dia)}`,
                { headers }
            );
            if (!res.ok) return;
            const { data = [] } = await res.json();
            setDisponibilidades(data);
        } catch (e) {
            console.error("Error al filtrar por día:", e);
        }
    };

    // --- Crear Disponibilidad para el ALUMNO (usa id_usuario del alumno) ---
    const handleAgregarDisponibilidad = async (event) => {
        event.preventDefault();

        const v = validarDisponibilidad(nuevoDia, nuevaHoraInicio, nuevaHoraFin);
        if (!v.ok) {
            Swal.fire('Datos inválidos', v.msg, 'warning');
            return;
        }
        if (!usuario?.accessToken || !alumnoData?.id_usuario || !alumnoData?.matricula) {
            Swal.fire('Error', 'Faltan datos del alumno o autenticación.', 'error');
            return;
        }

        setLoadingDisponibilidad(true);
        try {
            const headers = {
                Authorization: `Bearer ${usuario.accessToken}`,
                "Content-Type": "application/json"
            };

            const body = JSON.stringify({
                id_usuario: alumnoData.id_usuario,                 // ✅ ID numérico del alumno
                dia: v.diaNormalizado,                             // lun-vie sin acentos
                hora_inicio: `${nuevaHoraInicio}:00`,              // hh:mm:ss
                hora_fin: `${nuevaHoraFin}:00`
            });

            const res = await fetch(`https://apis-patu.onrender.com/api/disponibilidades/crear`, {
                method: 'POST', headers, body
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || 'Error al crear');

            Swal.fire('¡Éxito!', 'Disponibilidad agregada.', 'success');

            // Si hay filtro activo, vuelve a aplicarlo; si no, carga toda la semana
            if (filtroDia) {
                await fetchDisponibilidadesPorDia(alumnoData.matricula, filtroDia);
            } else {
                await fetchDisponibilidadesPorMatricula(alumnoData.matricula);
            }

            setNuevoDia("lunes");
            setNuevaHoraInicio("");
            setNuevaHoraFin("");
            setMostrarFormulario(false);
        } catch (err) {
            Swal.fire('Error', err.message || 'No se pudo agregar.', 'error');
        } finally {
            setLoadingDisponibilidad(false);
        }
    };

    // --- Borrar Disponibilidad y recargar respetando filtro ---
    const handleBorrarDisponibilidad = async (idDisponibilidad) => {
        if (!usuario?.accessToken) {
            Swal.fire('Error', 'No autenticado.', 'error');
            return;
        }
        const result = await Swal.fire({
            title: '¿Borrar?', text: "No se puede revertir.", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, borrar', cancelButtonText: 'Cancelar'
        });
        if (!result.isConfirmed) return;

        setLoadingDisponibilidad(true);
        try {
            const headers = { Authorization: `Bearer ${usuario.accessToken}` };
            const res = await fetch(
                `https://apis-patu.onrender.com/api/disponibilidades/${idDisponibilidad}`,
                { method: 'DELETE', headers }
            );
            if (!res.ok && res.status !== 204) {
                const errorData = await res.json().catch(() => ({ message: `Error ${res.status}` }));
                throw new Error(errorData.message);
            }
            Swal.fire('¡Borrado!', 'Disponibilidad eliminada.', 'success');

            if (alumnoData?.matricula) {
                if (filtroDia) {
                    await fetchDisponibilidadesPorDia(alumnoData.matricula, filtroDia);
                } else {
                    await fetchDisponibilidadesPorMatricula(alumnoData.matricula);
                }
            }
        } catch (err) {
            Swal.fire('Error', err.message || 'No se pudo borrar.', 'error');
        } finally {
            setLoadingDisponibilidad(false);
        }
    };

    // --- Render ---
    if (loading) {
        return <div className="min-h-screen bg-gray-50 flex justify-center items-center"><p className="text-gray-600 text-lg animate-pulse">Cargando...</p></div>;
    }
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 text-center">
                <p className="text-red-600 text-lg font-semibold mb-4">{error}</p>
                <Link to="/grupos" className="text-blue-600 underline">Volver a grupos</Link>
            </div>
        );
    }
    if (!alumnoData) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
                <p className="text-gray-600 text-lg">No se pudo cargar la información del alumno.</p>
                <Link to="/grupos" className="mt-4 text-blue-600 underline">Volver a grupos</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="relative bg-[#4F3E9B] text-white flex items-center justify-between px-5 h-20">
                {usuario && (<div className="text-3xl font-bold"> ¡Hola, {usuario.nombre}! </div>)}
                <div className="flex items-center gap-4 text-4xl font-bold ml-auto"> PATU <img src={logoImg} alt="Logo" className="w-12 h-12" /> </div>
            </header>

            <main className="p-4 animate-fadeIn relative z-10">
                <div className="max-w-6xl mx-auto">
                    {/* Cabecera */}
                    <div className="flex items-center justify-between mb-6">
                        <Link to={`/ListaAlumnos/${alumnoData.id_grupo}`} className="flex items-center text-[#4F3E9B] hover:text-[#372c7a] transition font-medium">
                            <ArrowLeft className="mr-2" /> Volver
                        </Link>
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate("/EventoCalendario")} className="flex items-center justify-center gap-2 bg-yellow-400 text-black font-bold px-5 py-2 rounded-full shadow-md hover:bg-yellow-300 transition-transform hover:scale-[1.03]">
                                <FaPlus className="text-sm" /> Registrar evento
                            </button>
                            <Link to={`/Reportes`} state={{ alumno: alumnoData }} className="flex items-center bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white px-5 py-2 rounded-full font-semibold shadow-md transition-transform hover:scale-[1.03]">
                                <FileText className="mr-2" /> Crear reporte
                            </Link>
                            <Link to={`/Reportes`} state={{ alumno: alumnoData }} className="flex items-center bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white px-5 py-2 rounded-full font-semibold shadow-md transition-transform hover:scale-[1.03]">
                                 Enviar a  psicología
                            </Link>
                            
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Ficha de Alumno:</h2>
                    <div className="w-full h-1 bg-yellow-400 mb-8"></div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Columna Izquierda */}
                        <div className="lg:w-3/5 flex flex-col gap-8">
                            {/* Info Alumno */}
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                                <h3 className="text-2xl font-bold mb-3">
                                    {alumnoData.nombre_completo || `${alumnoData.nombre || ''} ${alumnoData.apellido_paterno || ''} ${alumnoData.apellido_materno || ''}`}
                                </h3>
                                <p className="text-lg"><span className="font-semibold">Matrícula:</span> {alumnoData.matricula}</p>
                                <p className="text-lg"><span className="font-semibold">Correo:</span> {alumnoData.correo || "No disponible"}</p>
                                <p className="text-lg"><span className="font-semibold">Carrera:</span> {alumnoData.carrera || "No especificada"}</p>
                                <p className="text-lg"><span className="font-semibold">Semestre:</span> {alumnoData.semestre || "—"}</p>
                            </div>

                            {/* Bitácora */}
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col">
                                <h3 className="text-2xl font-bold mb-4">Bitácora de {alumnoData.nombre || "Alumno"}</h3>
                                <div className="w-full h-1 bg-yellow-400 mb-4"></div>
                                <div className="flex-grow space-y-4 max-h-[500px] overflow-y-auto pr-2">
                                    {bitacoraData.length > 0 ? (
                                        bitacoraData.map((item) => (
                                            <BitacoraFicha
                                                key={item.id || item.id_sesion}
                                                asistencia={item.asistencia}
                                                notas={item.notas}
                                                acuerdos={item.acuerdos}
                                                compromisos={item.compromisos}
                                                color="#4F3E9B"
                                            />
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center py-10 text-center">
                                            <img src={sinRegistrosImgUrl} alt="Sin registros" className="w-56 mb-6 opacity-80 rounded-lg" />
                                            <p className="text-gray-500 font-medium">No hay registros de bitácora para este alumno.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Columna Derecha */}
                        <div className="lg:w-2/5 flex flex-col gap-8">
                            {/* Gráfica */}
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                                <h3 className="text-xl font-bold text-gray-800 text-center mb-4">Tipos de sesiones</h3>
                                <p className="text-center text-gray-600 mb-6">Distribución de las sesiones registradas</p>
                                {chartDataTipos.length === 0 ? (
                                    <p className="text-gray-500 text-center mb-4">No hay sesiones registradas.</p>
                                ) : (
                                    <div className="h-[350px]">
                                        <ResponsiveContainer width="100%" height="80%">
                                            <BarChart data={chartDataTipos}>
                                                <YAxis domain={[0, 'dataMax + 2']} allowDecimals={false} tickFormatter={(value) => Math.floor(value)} />
                                                <Tooltip />
                                                <Bar dataKey="sesiones" barSize={50}>
                                                    {chartDataTipos.map((entry, index) => {
                                                        const estilo = ESTILOS_POR_TIPO[entry.tipo?.toLowerCase()] || ESTILOS_POR_TIPO.default;
                                                        return <Cell key={`cell-${index}`} fill={estilo.hex} />;
                                                    })}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                        <div className="flex flex-wrap justify-center gap-3 mt-4">
                                            {chartDataTipos.map((entry, index) => {
                                                const estilo = ESTILOS_POR_TIPO[entry.tipo?.toLowerCase()] || ESTILOS_POR_TIPO.default;
                                                return (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <div className="w-4 h-4 rounded" style={{ backgroundColor: estilo.hex }}></div>
                                                        <span className="text-sm font-medium text-gray-700">{entry.tipo}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Disponibilidad */}
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Disponibilidad de horario (Alumno)</h3>
                                </div>

                                {/* Filtro por día */}
                                <div className="flex items-center gap-2 mb-3">
                                    <label className="text-sm text-gray-700">Filtrar por día:</label>
                                    <select
                                        value={filtroDia}
                                        onChange={async (e) => {
                                            const d = e.target.value;
                                            setFiltroDia(d);
                                            if (!d) {
                                                await fetchDisponibilidadesPorMatricula(alumnoData.matricula);
                                            } else {
                                                await fetchDisponibilidadesPorDia(alumnoData.matricula, d);
                                            }
                                        }}
                                        className="px-3 py-2 border rounded-md"
                                    >
                                        <option value="">Todos</option>
                                        <option value="lunes">Lunes</option>
                                        <option value="martes">Martes</option>
                                        <option value="miércoles">Miércoles</option>
                                        <option value="jueves">Jueves</option>
                                        <option value="viernes">Viernes</option>
                                    </select>
                                </div>

                                {/* Botón para abrir formulario */}
                                {!mostrarFormulario && (
                                    <button
                                        onClick={() => setMostrarFormulario(true)}
                                        className="mb-4 flex items-center justify-center gap-2 bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white font-bold py-2 px-4 rounded-full shadow-md transition-all w-full"
                                    >
                                        <FaPlus /> Agregar Disponibilidad
                                    </button>
                                )}

                                {/* Formulario agregar */}
                                {mostrarFormulario && (
                                    <form onSubmit={handleAgregarDisponibilidad} className="mb-6 p-4 border rounded-lg bg-gray-50">
                                        <div className="mb-3">
                                            <label htmlFor="dia" className="block text-sm font-medium text-gray-700 mb-1">Día:</label>
                                            <select
                                                id="dia"
                                                value={nuevoDia}
                                                onChange={(e) => setNuevoDia(e.target.value)}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            >
                                                <option value="lunes">Lunes</option>
                                                <option value="martes">Martes</option>
                                                <option value="miércoles">Miércoles</option>
                                                <option value="jueves">Jueves</option>
                                                <option value="viernes">Viernes</option>
                                            </select>
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="hora_inicio" className="block text-sm font-medium text-gray-700 mb-1">Hora Inicio:</label>
                                            <input
                                                type="time"
                                                id="hora_inicio"
                                                value={nuevaHoraInicio}
                                                onChange={(e) => setNuevaHoraInicio(e.target.value)}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                min="07:00"
                                                max="19:00"
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label htmlFor="hora_fin" className="block text-sm font-medium text-gray-700 mb-1">Hora Fin:</label>
                                            <input
                                                type="time"
                                                id="hora_fin"
                                                value={nuevaHoraFin}
                                                onChange={(e) => setNuevaHoraFin(e.target.value)}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                min="07:00"
                                                max="19:00"
                                            />
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                type="submit"
                                                disabled={loadingDisponibilidad}
                                                className="flex-1 bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white font-bold py-2 px-4 rounded-md transition disabled:opacity-50"
                                            >
                                                {loadingDisponibilidad ? 'Agregando...' : 'Agregar'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setMostrarFormulario(false)}
                                                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* Lista */}
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                    {loadingDisponibilidad && disponibilidades.length === 0 ? (
                                        <p className="text-center text-gray-500 animate-pulse">Cargando disponibilidad...</p>
                                    ) : !loadingDisponibilidad && disponibilidades.length === 0 ? (
                                        <p className="text-center text-gray-500">No hay horarios registrados para este alumno.</p>
                                    ) : (
                                        disponibilidades.map((disp) => (
                                            <div key={disp.id} className="flex items-center justify-between p-3 border rounded-lg bg-indigo-50 border-indigo-200">
                                                <div className="flex items-center gap-2 overflow-hidden mr-2">
                                                    <Clock className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                                                    <span className="font-medium text-indigo-800 text-sm truncate">
                                                        {capitalizeFirstLetter(disp.dia || '')}: {(disp.hora_inicio || '').substring(0, 5)} - {(disp.hora_fin || '').substring(0, 5)}
                                                    </span>
                                                </div>
                                                <div className="flex gap-1 flex-shrink-0">
                                                    <button
                                                        onClick={() => disp.id && handleBorrarDisponibilidad(disp.id)}
                                                        title="Borrar"
                                                        className="p-1 text-red-600 hover:text-red-800 transition rounded-full hover:bg-red-100 disabled:opacity-50"
                                                        disabled={!disp.id}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FichaAlumno;