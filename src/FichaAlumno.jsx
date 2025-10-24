import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; // Importa useNavigate
// Iconos: Añadidos Clock, Trash2, Edit
import { ArrowLeft, FileText, Info, BookX, HeartHandshake, HelpCircle, ClipboardList, UserCheck, Clock, Trash2, Edit } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, YAxis, Tooltip, Cell } from "recharts";
import logoImg from './assets/logo.png';
import { FaPlus } from 'react-icons/fa';
// Swal: Añadido
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// --- Constantes de Estilo para Tipos de Sesión ---
const ESTILOS_POR_TIPO = {
    'general': { color: 'green', Icono: Info, hex: '#22c55e' },
    'problemas académicos': { color: 'orange', Icono: BookX, hex: '#f97316' },
    'seguimiento': { color: 'blue', Icono: ClipboardList, hex: '#3b82f6' },
    'problemas personales': { color: 'purple', Icono: HeartHandshake, hex: '#8b5cf6' },
    'cambio de tutor': { color: 'pink', Icono: UserCheck, hex: '#ec4899' },
    'sin tipo': { color: 'gray', Icono: HelpCircle, hex: '#6b7280' },
    'default': { color: 'gray', Icono: HelpCircle, hex: '#6b7280' }
};

// --- Función de Utilidad ---
const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
};

// --- Componente BitacoraFicha --- (Quitamos 'fecha' de props)
const BitacoraFicha = ({ asistencia, notas, acuerdos, compromisos, color }) => (
    <div
        className="p-4 mb-4 rounded-xl shadow-md border-2 transition-all hover:shadow-lg"
        style={{ borderColor: color }}
    >
        <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-base text-gray-800">
                Asistencia: {asistencia || "—"}
            </h4>
            {/* Fecha eliminada del renderizado */}
        </div>
        <p className="text-sm"><span className="font-semibold">Notas:</span> {notas || "Sin notas"}</p>
        <p className="text-sm"><span className="font-semibold">Acuerdos:</span> {acuerdos || "—"}</p>
        <p className="text-sm"><span className="font-semibold">Compromisos:</span> {compromisos || "—"}</p>
    </div>
);

// --- Componente Principal ---
const FichaAlumno = () => {
    const { matricula } = useParams();
    const navigate = useNavigate();
    const [alumnoData, setAlumnoData] = useState(null);
    const [bitacoraData, setBitacoraData] = useState([]);
    const [chartDataTipos, setChartDataTipos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [usuario, setUsuario] = useState(null); // Usuario logueado (Tutor)

    // --- 👇 ESTADOS NUEVOS PARA DISPONIBILIDAD 👇 ---
    const [disponibilidades, setDisponibilidades] = useState([]);
    const [loadingDisponibilidad, setLoadingDisponibilidad] = useState(false); // Carga específica
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [nuevoDia, setNuevoDia] = useState("lunes"); // Valor inicial
    const [nuevaHoraInicio, setNuevaHoraInicio] = useState("");
    const [nuevaHoraFin, setNuevaHoraFin] = useState("");
    // --- FIN ESTADOS NUEVOS ---

    const sinRegistrosImgUrl = "https://placehold.co/224x224/eeeeee/999999?text=Sin+Registros";

    // --- Hook para cargar datos iniciales ---
    useEffect(() => {

        const usuarioGuardado = localStorage.getItem("usuario");
        if (!usuarioGuardado) { setError("⚠️ No hay sesión activa..."); setLoading(false); return; }
        const user = JSON.parse(usuarioGuardado);
        if (!user || !user.accessToken || !user.id) { setError("⚠️ Sesión inválida..."); setLoading(false); return; }

        setUsuario(user);
        fetchDisponibilidades(user); // ✅ Llamada con datos válidos inmediatamente



        const fetchData = async () => {
            setLoading(true); // Loading general ON
            setError(null);
            // Reiniciar estados
            setAlumnoData(null);
            setBitacoraData([]);
            setChartDataTipos([]);
            setDisponibilidades([]); // Reinicia disponibilidades

            const headers = {
                Authorization: `Bearer ${user.accessToken}`,
                "Content-Type": "application/json",
            };

            try {
                // --- 1. Fetch Alumno (Crítico) ---
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
                setAlumnoData(alumno); // Guardamos alumno

                // --- 👇 LLAMADA INICIAL A fetchDisponibilidades 👇 ---
                // Llama a la función (definida más abajo)
                // setLoadingDisponibilidad(false); // Se quita en el 'finally' general
                // --- FIN LLAMADA INICIAL ---

                // --- 2. Fetch Bitácora (Usando /api/bitacora y filtrando después) ---
                const resBitacora = await fetch(`https://apis-patu.onrender.com/api/bitacora`, { headers });
                if (resBitacora.ok) {
                    const bitacoraJson = await resBitacora.json();
                    // Usar todos los datos tal cual vienen de la API
                    setBitacoraData(bitacoraJson.data || []);
                } else {
                    console.warn(`⚠️ No se pudo cargar la bitácora (Status: ${resBitacora.status})`);
                    setBitacoraData([]);
                }


                // --- 4. Fetch Sesiones (Gráfica) ---
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
                    console.warn(`⚠️ No se pudo cargar las sesiones (Status: ${resSesiones.status})`);
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
                setLoading(false); // Loading general OFF
                setLoadingDisponibilidad(false); // Loading específico OFF
            }
        };

        // Solo ejecutar si tenemos user.id válido
        fetchData();

    }, [matricula]); // Quitamos user?.id de dependencias

    // --- 👇 FUNCIONES NUEVAS PARA DISPONIBILIDAD (van antes del return) 👇 ---

    // --- Función separada para Fetch Disponibilidades ---
    // --- Función separada para Fetch Disponibilidades ---
    const fetchDisponibilidades = async (userParam = usuario) => {
        const userToUse = userParam || usuario;
        if (!userToUse?.id || !userToUse?.accessToken) {
            console.warn("fetchDisponibilidades: No hay usuario o ID de usuario para buscar.");
            setDisponibilidades([]);
            return;
        }

        try {
            const headers = { Authorization: `Bearer ${userToUse.accessToken}` };
            const res = await fetch(`https://apis-patu.onrender.com/api/disponibilidades/usuario/${userToUse.id}`, { headers });
            if (res.ok) {
                const dispJson = await res.json();
                const diasOrden = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
                const disponibilidadesOrdenadas = (dispJson.data || []).sort((a, b) => {
                    const diaA = diasOrden.indexOf(a.dia?.toLowerCase() ?? '');
                    const diaB = diasOrden.indexOf(b.dia?.toLowerCase() ?? '');
                    if (diaA === -1 && diaB === -1) return 0;
                    if (diaA === -1) return 1;
                    if (diaB === -1) return -1;
                    if (diaA !== diaB) return diaA - diaB;
                    return (a.hora_inicio || "").localeCompare(b.hora_inicio || "");
                });
                setDisponibilidades(disponibilidadesOrdenadas);
            } else {
                console.warn(`⚠️ No se pudo recargar la disponibilidad (Status: ${res.status})`);
                setDisponibilidades([]);
            }
        } catch (error) {
            console.error("Error recargando disponibilidades:", error);
            setDisponibilidades([]);
        }
    };


    // --- Función para Agregar Disponibilidad ---
    const handleAgregarDisponibilidad = async (event) => {
        event.preventDefault();
        if (!nuevaHoraInicio || !nuevaHoraFin || nuevaHoraInicio >= nuevaHoraFin) {
            Swal.fire('Datos inválidos', 'Revisa las horas.', 'warning'); return;
        }
        if (!usuario?.id) { Swal.fire('Error', 'Usuario no identificado.', 'error'); return; }

        setLoadingDisponibilidad(true);
        try {
            const headers = { Authorization: `Bearer ${usuario.accessToken}`, "Content-Type": "application/json" };
            const body = JSON.stringify({ id_usuario: usuario.id, dia: nuevoDia, hora_inicio: nuevaHoraInicio, hora_fin: nuevaHoraFin });
            const res = await fetch(`https://apis-patu.onrender.com/api/disponibilidades/crear`, { method: 'POST', headers, body });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Error al crear');
            Swal.fire('¡Éxito!', 'Agregada.', 'success');
            await fetchDisponibilidades(); // Recargar
            setNuevoDia("lunes"); setNuevaHoraInicio(""); setNuevaHoraFin(""); setMostrarFormulario(false);
        } catch (err) { Swal.fire('Error', err.message || 'No se pudo agregar.', 'error'); }
        finally { setLoadingDisponibilidad(false); }
    };

    // --- Función para Borrar Disponibilidad ---
    const handleBorrarDisponibilidad = async (idDisponibilidad) => {
        if (!usuario?.accessToken) { Swal.fire('Error', 'No autenticado.', 'error'); return; }
        const result = await Swal.fire({ title: '¿Borrar?', text: "No se puede revertir.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí, borrar', cancelButtonText: 'Cancelar' });
        if (result.isConfirmed) {
            setLoadingDisponibilidad(true);
            try {
                const headers = { Authorization: `Bearer ${usuario.accessToken}` };
                const res = await fetch(`https://apis-patu.onrender.com/api/disponibilidades/${idDisponibilidad}`, { method: 'DELETE', headers });
                // Manejar respuesta vacía (204 No Content) en DELETE exitoso
                if (!res.ok && res.status !== 204) {
                    const errorData = await res.json().catch(() => ({ message: `Error ${res.status}` }));
                    throw new Error(errorData.message);
                }
                Swal.fire('¡Borrado!', 'Eliminada.', 'success');
                await fetchDisponibilidades(); // Recargar
            } catch (err) { Swal.fire('Error', err.message || 'No se pudo borrar.', 'error'); }
            finally { setLoadingDisponibilidad(false); }
        }
    };

    // --- Función para Actualizar Disponibilidad (Placeholder) ---

    // --- FIN FUNCIONES NUEVAS ---

    // --- Renderizado Condicional ---
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
    // Si terminó de cargar pero no hay datos de alumno
    if (!alumnoData) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
                <p className="text-gray-600 text-lg">No se pudo cargar la información del alumno.</p>
                <Link to="/grupos" className="mt-4 text-blue-600 underline">Volver a grupos</Link>
            </div>
        );
    }

    // --- JSX Principal ---
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
                        <Link to={`/ListaAlumnos/${alumnoData.id_grupo}`} className="flex items-center text-[#4F3E9B] hover:text-[#372c7a] transition font-medium"> <ArrowLeft className="mr-2" /> Volver </Link>
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate("/EventoCalendario")} className="flex items-center justify-center gap-2 bg-yellow-400 text-black font-bold px-5 py-2 rounded-full shadow-md hover:bg-yellow-300 transition-transform hover:scale-[1.03]"> <FaPlus className="text-sm" /> Registrar evento </button>
                            <Link to={`/Reportes`} state={{ alumno: alumnoData }} className="flex items-center bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white px-5 py-2 rounded-full font-semibold shadow-md transition-transform hover:scale-[1.03]"> <FileText className="mr-2" /> Crear reporte </Link>
                        </div>
                    </div>


                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Ficha de Alumno:</h2>
                    <div className="w-full h-1 bg-yellow-400 mb-8"></div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Columna Izquierda */}
                        <div className="lg:w-3/5 flex flex-col gap-8">
                            {/* Info Alumno */}
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                                <h3 className="text-2xl font-bold mb-3"> {alumnoData.nombre_completo || `${alumnoData.nombre || ''} ${alumnoData.apellido_paterno || ''} ${alumnoData.apellido_materno || ''}`} </h3>
                                <p className="text-lg"><span className="font-semibold">Matrícula:</span> {alumnoData.matricula}</p>
                                <p className="text-lg"><span className="font-semibold">Correo:</span> {alumnoData.correo || "No disponible"}</p>
                                <p className="text-lg"><span className="font-semibold">Carrera:</span> {alumnoData.carrera || "No especificada"}</p>
                                <p className="text-lg"><span className="font-semibold">Semestre:</span> {alumnoData.semestre || "—"}</p>
                            </div>
                            {/* Bitácora */}
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col">
                                <h3 className="text-2xl font-bold mb-4">Bitácora</h3>
                                <div className="w-full h-1 bg-yellow-400 mb-4"></div>
                                <div className="flex-grow space-y-4 max-h-[500px] overflow-y-auto pr-2">
                                    {bitacoraData.length > 0 ? (
                                        // Asegura usar clave única y props correctas
                                        bitacoraData.map((item) => (
                                            <BitacoraFicha
                                                key={item.id_bitacora || item.id_sesion /* Clave Única */}
                                                asistencia={item.asistencia}
                                                notas={item.notas}
                                                acuerdos={item.acuerdos}
                                                compromisos={item.compromisos}
                                                color="#4F3E9B"
                                            />
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center py-10 text-center">
                                            {/* Mensaje ajustado para reflejar que puede haber bitácoras de otros */}
                                            <img src={sinRegistrosImgUrl} alt="Sin registros" className="w-56 mb-6 opacity-80 rounded-lg" />
                                            <p className="text-gray-500 font-medium">No hay registros de bitácora disponibles.</p>
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
                                        {/* Leyenda */}
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


                            {/* --- 👇 JSX NUEVO PARA DISPONIBILIDAD 👇 --- */}
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Disponibilidad de horario</h3>
                                {/* Botón +/- Formulario */}
                                {!mostrarFormulario && (
                                    <button onClick={() => setMostrarFormulario(true)} className="mb-4 flex items-center justify-center gap-2 bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white font-bold py-2 px-4 rounded-full shadow-md transition-all w-full">
                                        <FaPlus /> Agregar Disponibilidad
                                    </button>
                                )}
                                {mostrarFormulario && (
                                    <form onSubmit={handleAgregarDisponibilidad} className="mb-6 p-4 border rounded-lg bg-gray-50">
                                        {/* Select Día */}
                                        <div className="mb-3">
                                            <label htmlFor="dia" className="block text-sm font-medium text-gray-700 mb-1">Día:</label>
                                            <select id="dia" value={nuevoDia} onChange={(e) => setNuevoDia(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                                                <option value="lunes">Lunes</option>
                                                <option value="martes">Martes</option>
                                                <option value="miércoles">Miércoles</option>
                                                <option value="jueves">Jueves</option>
                                                <option value="viernes">Viernes</option>

                                            </select>
                                        </div>
                                        {/* Input Hora Inicio */}
                                        <div className="mb-3">
                                            <label htmlFor="hora_inicio" className="block text-sm font-medium text-gray-700 mb-1">Hora Inicio:</label>
                                            <input type="time" id="hora_inicio" value={nuevaHoraInicio} onChange={(e) => setNuevaHoraInicio(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                min="07:00"
                                                max="19:00" />
                                        </div>
                                        {/* Input Hora Fin */}
                                        <div className="mb-4">
                                            <label htmlFor="hora_fin" className="block text-sm font-medium text-gray-700 mb-1">Hora Fin:</label>
                                            <input type="time" id="hora_fin" value={nuevaHoraFin} onChange={(e) => setNuevaHoraFin(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                min="07:00"
                                                max="19:00" />
                                        </div>
                                        {/* Botones Formulario */}
                                        <div className="flex gap-3">
                                            <button type="submit" disabled={loadingDisponibilidad} className="flex-1 bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white font-bold py-2 px-4 rounded-md transition disabled:opacity-50"> {loadingDisponibilidad ? 'Agregando...' : 'Agregar'} </button>
                                            <button type="button" onClick={() => setMostrarFormulario(false)} className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition"> Cancelar </button>
                                        </div>
                                    </form>
                                )}
                                {/* Lista de Disponibilidades */}
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                    {/* Lógica para mostrar carga/vacío/lista */}
                                    {loadingDisponibilidad && disponibilidades.length === 0 ? (
                                        <p className="text-center text-gray-500 animate-pulse">Cargando disponibilidad...</p>
                                    ) : !loadingDisponibilidad && disponibilidades.length === 0 ? (
                                        <p className="text-center text-gray-500">No hay horarios registrados.</p>
                                    ) : (
                                        disponibilidades.map((disp) => (
                                            <div key={disp.id} className="flex items-center justify-between p-3 border rounded-lg bg-indigo-50 border-indigo-200">
                                                <div className="flex items-center gap-2 overflow-hidden mr-2">
                                                    <Clock className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                                                    <span className="font-medium text-indigo-800 text-sm truncate">
                                                        {/* Añadidos '?' por si acaso */}
                                                        {capitalizeFirstLetter(disp.dia || '')}: {(disp.hora_inicio || '').substring(0, 5)} - {(disp.hora_fin || '').substring(0, 5)}
                                                    </span>
                                                </div>
                                                <div className="flex gap-1 flex-shrink-0">

                                                    <button onClick={() => disp.id && handleBorrarDisponibilidad(disp.id)} title="Borrar" className="p-1 text-red-600 hover:text-red-800 transition rounded-full hover:bg-red-100 disabled:opacity-50" disabled={!disp.id}> <Trash2 className="w-4 h-4" /> </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                            {/* --- FIN JSX DISPONIBILIDAD --- */}

                        </div> {/* Fin Columna Derecha */}
                    </div> {/* Fin flex lg:flex-row */}
                </div> {/* Fin max-w-6xl */}
            </main>
        </div>
    );
};

export default FichaAlumno;