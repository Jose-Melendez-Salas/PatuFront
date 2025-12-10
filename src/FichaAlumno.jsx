import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {ArrowLeft,FileText,Clock,Trash2,AlertOctagon,Pencil,} from "lucide-react";
import { Cell,ResponsiveContainer,BarChart,Bar,YAxis,XAxis,Tooltip,CartesianGrid,Legend,} from "recharts";
import Navbar from "./Navbar";
import { FaAnchor, FaArrowUp, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { FaArrowTrendUp } from "react-icons/fa6";

const ESTILOS_POR_TIPO = {
  general: { color: "green", hex: "#22c55e" },
  "problemas académicos": { color: "orange", hex: "#f97316" },
  seguimiento: { color: "blue", hex: "#3b82f6" },
  "problemas personales": { color: "purple", hex: "#8b5cf6" },
  "cambio de tutor": { color: "pink", hex: "#ec4899" },
  "sin tipo": { color: "gray", hex: "#6b7280" },
  default: { color: "gray", hex: "#6b7280" },
};
// --- Utilidades ---
const capitalizeFirstLetter = (string) => {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
};
const normalizar = (txt) =>
  (txt || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// Validaciones de disponibilidad (se mantienen)
const DIAS_HABILES = ["lunes", "martes", "miercoles", "jueves", "viernes"];
const toMinutes = (hhmm) => {
  const [h, m] = (hhmm || "00:00").split(":").map(Number);
  return h * 60 + (m || 0);
};
const validarDisponibilidad = (diaUI, inicio, fin) => {
  const dia = normalizar(diaUI);
  if (!DIAS_HABILES.includes(dia)) {
    return {
      ok: false,
      msg: "Solo se permite registrar disponibilidad de lunes a viernes.",
    };
  }
  if (!inicio || !fin) {
    return { ok: false, msg: "Debes indicar hora de inicio y fin." };
  }
  const minAllowed = toMinutes("07:00");
  const maxAllowed = toMinutes("19:00");
  const start = toMinutes(inicio);
  const end = toMinutes(fin);
  if (
    start < minAllowed ||
    start > maxAllowed ||
    end < minAllowed ||
    end > maxAllowed
  ) {
    return { ok: false, msg: "El horario debe estar entre 07:00 y 19:00." };
  }
  if (end <= start) {
    return {
      ok: false,
      msg: "La hora de fin debe ser mayor a la hora de inicio.",
    };
  }
  return { ok: true, diaNormalizado: dia, start, end };
};

const BitacoraFicha = ({ asistencia, notas, acuerdos, compromisos, color }) => (
  <div
    className="p-4 mb-4 rounded-xl shadow-md border-2 transition-all hover:shadow-lg w-full"
    style={{ borderColor: color }}
  >
    <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
      <h4 className="font-bold text-base text-gray-800 break-words">
        Asistencia: {asistencia || "—"}
      </h4>
    </div>
    <p className="text-sm break-words">
      <span className="font-semibold">Notas:</span> {notas || "Sin notas"}
    </p>
    <p className="text-sm break-words">
      <span className="font-semibold">Acuerdos:</span> {acuerdos || "—"}
    </p>
    <p className="text-sm break-words">
      <span className="font-semibold">Compromisos:</span> {compromisos || "—"}
    </p>
  </div>
);

// --- Componente principal ---
const FichaAlumno = () => {
  const { matricula } = useParams();
  const navigate = useNavigate();

  // Usuario / alumno
  const [usuario, setUsuario] = useState(null);
  const [alumnoData, setAlumnoData] = useState(null);
 const [chartDataVisual, setChartDataVisual] = useState([]); 
  // Bitácora y disponibilidades (mantengo lo que ya tenías)
  const [bitacoraData, setBitacoraData] = useState([]);
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [loadingDisponibilidad, setLoadingDisponibilidad] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoDia, setNuevoDia] = useState("lunes");
  const [nuevaHoraInicio, setNuevaHoraInicio] = useState("");
  const [nuevaHoraFin, setNuevaHoraFin] = useState("");
  const [filtroDia, setFiltroDia] = useState("");

  // --- NUEVOS ESTADOS: DETALLES ALUMNO ---
  const [tiposSituacion, setTiposSituacion] = useState([]);
  const [selectedSituacion, setSelectedSituacion] = useState("");
  const [observacionesDetalle, setObservacionesDetalle] = useState("");
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  // --- NUEVO: HISTORIAL DE DETALLES ---
  const [listaDetalles, setListaDetalles] = useState([]);

  // Función para obtener la lista de detalles
  // Función para obtener la lista de detalles (CON DIAGNÓSTICO)
  // Función para obtener la lista de detalles
  // Función para obtener la lista de detalles (RECIBE TOKEN)
  const fetchDetallesAlumno = async (idAlumno, tokenAcceso) => {
    // Si no hay ID o Token, no hacemos nada
    if (!idAlumno || !tokenAcceso) return;

    try {
      // Usamos el token que recibimos por parámetro
      const headers = {
        Authorization: `Bearer ${tokenAcceso}`,
        "Content-Type": "application/json",
      };

      const res = await fetch(
        `https://apis-patu.onrender.com/api/detalles/alumno/${idAlumno}`,
        { headers }
      );

      if (res.ok) {
        const json = await res.json();
        setListaDetalles(json.data || []);
      } else {
        console.error("Error cargando historial:", res.status);
      }
    } catch (error) {
      console.error("Error cargando historial:", error);
    }
  };

  // Materias / cursada / calificaciones
  const [materias, setMaterias] = useState([]);
  const [cursadas, setCursadas] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [curso, setCurso] = useState("");

  // Formularios para materias / cursada / calificación
  const [crearMateriaOpen, setCrearMateriaOpen] = useState(false);
  const [nClave, setNClave] = useState("");
  const [nNombre, setNNombre] = useState("");
  const [nGrupo, setNGrupo] = useState("");

  const [editarCalifOpen, setEditarCalifOpen] = useState(false);
  const [materiaAEditar, setMateriaAEditar] = useState(null);
  const [unidadAEditar, setUnidadAEditar] = useState("");
  const [calificacionAEditar, setCalificacionAEditar] = useState("");

  const [asignarMateriaOpen, setAsignarMateriaOpen] = useState(false);
  const [materiaSeleccionadaParaAsignar, setMateriaSeleccionadaParaAsignar] =
    useState(null);

  const [asignarCalifOpen, setAsignarCalifOpen] = useState(false);
  const [materiaParaCalif, setMateriaParaCalif] = useState(null);
  const [unidadCalif, setUnidadCalif] = useState(1);
  const [valorCalif, setValorCalif] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sinRegistrosImgUrl =
    "https://placehold.co/224x224/eeeeee/999999?text=Sin+Registros";

  // --- Carga inicial (alumno + bitacora + disponibilidades + materias/cursadas/calificaciones) ---
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (!usuarioGuardado) {
      setError("⚠️ No hay sesión activa...");
      setLoading(false);
      return;
    }
    const user = JSON.parse(usuarioGuardado);
    if (!user || !user.accessToken || !user.id) {
      setError("⚠️ Sesión inválida...");
      setLoading(false);
      return;
    }
    setUsuario(user);

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setAlumnoData(null);
      setBitacoraData([]);
      setMaterias([]);
      setCursadas([]);
      setCalificaciones([]);
      setDisponibilidades([]);
      setFiltroDia("");

      const headers = {
        Authorization: `Bearer ${user.accessToken}`,
        "Content-Type": "application/json",
      };

      try {
        // 1) Alumno por matrícula
        const resAlumno = await fetch(
          `https://apis-patu.onrender.com/api/alumnos/matricula/${matricula}`,
          { headers }
        );
        if (!resAlumno.ok) {
          const errorData = await resAlumno.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `Error al obtener datos del alumno (${resAlumno.status})`
          );
        }
        const alumnoJson = await resAlumno.json();
        const alumno = alumnoJson.data;
        if (
          !alumno ||
          typeof alumno.id_usuario === "undefined" ||
          alumno.id_usuario === null
        ) {
          throw new Error("Datos del alumno inválidos o falta id.");
        }
        setAlumnoData(alumno);

         const resSesiones = await fetch(`https://apis-patu.onrender.com/api/sesiones/alumno/${alumno.id_usuario}`, { headers });
                if (resSesiones.ok) {
                    const sesJson = await resSesiones.json();
                    const sesiones = sesJson.data || [];
                    const conteo = sesiones.reduce((acc, curr) => {
                        const tipo = capitalizeFirstLetter(curr.tipo) || 'Sin tipo';
                        acc[tipo] = (acc[tipo] || 0) + 1;
                        return acc;
                    }, {});
                    setChartDataVisual(Object.keys(conteo).map(k => ({ tipo: k, sesiones: conteo[k] })));
                }

        // 2) Bitácora del alumno (por matrícula)
        const resBitacora = await fetch(
          `https://apis-patu.onrender.com/api/bitacora/alumno/${alumno.matricula}`,
          { headers }
        );
        if (resBitacora.ok) {
          const bitacoraJson = await resBitacora.json();
          setBitacoraData(
            (bitacoraJson.data || [])
              .filter((item) => item !== null && item !== undefined)
              .map((item) => ({
                ...item,
                asistencia: item.asistencia ?? "—",
                notas: item.notas ?? "",
                acuerdos: item.acuerdos ?? "",
                compromisos: item.compromisos ?? "",
              }))
          );
        } else {
          setBitacoraData([]);
        }

        // 3) Disponibilidades
        await fetchDisponibilidadesPorMatricula(
          alumno.matricula,
          user.accessToken
        );

        // 4) Materias (todas)
        const resMaterias = await fetch(
          `https://apis-patu.onrender.com/api/materias/`,
          { headers }
        );
        if (resMaterias.ok) {
          const matJson = await resMaterias.json();
          setMaterias(matJson.data || []);
        } else {
          setMaterias([]);
        }

        // 5) Cursadas del alumno (materias que cursa)
        const resCursadas = await fetch(
          `https://apis-patu.onrender.com/api/cursada/alumno/${alumno.id_usuario}`,
          { headers }
        );
        if (resCursadas.ok) {
          const cursJson = await resCursadas.json();
          setCursadas(cursJson.data || []);
        } else {
          setCursadas([]);
        }

        // 6) Calificaciones del alumno
        const resCalif = await fetch(
          `https://apis-patu.onrender.com/api/calificacion/alumno/${alumno.id_usuario}`,
          { headers }
        );
        if (resCalif.ok) {
          const calJson = await resCalif.json();
          setCalificaciones(calJson.data || []);
        } else {
          setCalificaciones([]);
        }
        // 7) Tipos de Situación (VERSIÓN CORREGIDA Y ROBUSTA)
        try {
          console.log("Intentando cargar tipos de situación...");
          const resTipos = await fetch(
            `https://apis-patu.onrender.com/api/situacion/`,
            { headers }
          );

          if (resTipos.ok) {
            const tiposJson = await resTipos.json();
            console.log("Respuesta API Tipos:", tiposJson); // Mira esto en la consola (F12)

            // Verificamos si 'data' es un array o un objeto único
            let datosRecibidos = tiposJson.data;

            if (datosRecibidos) {
              // Si la API devuelve un solo objeto en lugar de un array, lo convertimos en array
              if (!Array.isArray(datosRecibidos)) {
                datosRecibidos = [datosRecibidos];
              }
              setTiposSituacion(datosRecibidos);
            } else {
              setTiposSituacion([]);
            }
          } else {
            console.error(
              "Error al cargar tipos:",
              resTipos.status,
              resTipos.statusText
            );
            setTiposSituacion([]);
          }
          // 8) Cargar Historial de Detalles
          if (alumno.id_usuario) {
            await fetchDetallesAlumno(alumno.id_usuario, user.accessToken);
          }
        } catch (errorTipos) {
          console.error("Error de red al pedir tipos:", errorTipos);
        }
      } catch (err) {
        console.error(" Error en fetchData:", err);
        setError(err.message || "Error al cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [matricula]);

  // --- Disponibilidad helpers (mantenidos) ---
  const fetchDisponibilidadesPorMatricula = async (
    matriculaAlumno,
    accessToken
  ) => {
    const token = accessToken || usuario?.accessToken;
    if (!matriculaAlumno || !token) {
      setDisponibilidades([]);
      return;
    }
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(
        `https://apis-patu.onrender.com/api/disponibilidades/alumno/${matriculaAlumno}`,
        { headers }
      );
      if (!res.ok) {
        setDisponibilidades([]);
        return;
      }
      const { data = [] } = await res.json();
      const diasOrden = [
        "lunes",
        "martes",
        "miercoles",
        "jueves",
        "viernes",
        "sabado",
        "domingo",
      ];
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

  const fetchDisponibilidadesPorDia = async (matriculaAlumno, diaUI) => {
    if (!matriculaAlumno || !usuario?.accessToken || !diaUI) return;
    try {
      const headers = { Authorization: `Bearer ${usuario.accessToken}` };
      const dia = normalizar(diaUI);
      const res = await fetch(
        `https://apis-patu.onrender.com/api/disponibilidades/alumno/${matriculaAlumno}/dia/${encodeURIComponent(
          dia
        )}`,
        { headers }
      );
      if (!res.ok) return;
      const { data = [] } = await res.json();
      setDisponibilidades(data);
    } catch (e) {
      console.error("Error al filtrar por día:", e);
    }
  };

  // --- Formulario crear materia (MANTENIDO) ---
  const handleCrearMateria = async (e) => {
    e.preventDefault();
    if (!nClave || !nNombre || !nGrupo) {
      Swal.fire(
        "Campos incompletos",
        "Completa clave, nombre y grupo.",
        "warning"
      );
      return;
    }
    if (!usuario?.accessToken) {
      Swal.fire("Error", "No autenticado.", "error");
      return;
    }
    try {
      const headers = {
        Authorization: `Bearer ${usuario.accessToken}`,
        "Content-Type": "application/json",
      };
      const body = {
        clave: nClave,
        nombre: nNombre,
        grupo: nGrupo,
        id_tutor: usuario.id,
      };
      const res = await fetch(`https://apis-patu.onrender.com/api/materias/`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Error al crear materia.");
      Swal.fire("¡Materia creada!", "", "success");
      // refrescar materias
      const resMat = await fetch(
        `https://apis-patu.onrender.com/api/materias/`,
        { headers }
      );
      const matJson = await resMat.json();
      setMaterias(matJson.data || []);
      // limpiar formulario
      setNClave("");
      setNNombre("");
      setNGrupo("");
      setCrearMateriaOpen(false);
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error",
        err.message || "No se pudo crear la materia.",
        "error"
      );
    }
  };

  // --- Asignar materia (cursada) al alumno (MANTENIDO) ---
  const handleAsignarMateria = async (e) => {
    console.log("HANDLE ASIGNAR MATERIA EJECUTADO");
    e.preventDefault();
    if (!materiaSeleccionadaParaAsignar) {
      Swal.fire("Selecciona una materia", "", "warning");
      return;
    }
    if (!usuario?.accessToken || !alumnoData?.id_usuario) {
      Swal.fire("Error", "Faltan datos.", "error");
      return;
    }
    try {
      const headers = {
        Authorization: `Bearer ${usuario.accessToken}`,
        "Content-Type": "application/json",
      };
      const body = {
        id_alumno: alumnoData.id_usuario,
        id_materia: Number(materiaSeleccionadaParaAsignar),
        curso: curso,
      };
      console.log("Datos enviados al backend para asignar materia:", body);
      const res = await fetch(`https://apis-patu.onrender.com/api/cursada/`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Error al asignar materia.");
      Swal.fire("¡Asignada!", "Materia asignada al alumno.", "success");
      // refrescar cursadas
      const resCurs = await fetch(
        `https://apis-patu.onrender.com/api/cursada/alumno/${alumnoData.id_usuario}`,
        { headers }
      );
      if (resCurs.ok) {
        const cursJson = await resCurs.json();
        setCursadas(cursJson.data || []);
      }
      setAsignarMateriaOpen(false);
      setMateriaSeleccionadaParaAsignar(null);
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error",
        err.message || "No se pudo asignar la materia.",
        "error"
      );
    }
  };

  // --- FUNCIÓN PARA BORRAR MATERIA Y SUS CALIFICACIONES ---
  const handleBorrarMateria = async (idMateria) => {
    // 1. Validaciones básicas
    if (!usuario?.accessToken || !alumnoData?.id_usuario) return;

    // 2. Confirmación con el usuario
    const result = await Swal.fire({
      title: "¿Eliminar materia?",
      text: "Se borrará la materia y TODAS sus calificaciones registradas.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar todo",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const headers = { Authorization: `Bearer ${usuario.accessToken}` };
      const idAlumno = alumnoData.id_usuario;

      // PASO A: Filtrar qué calificaciones pertenecen a esta materia
      const notasDeEstaMateria = calificaciones.filter(
        (c) => Number(c.id_materia) === Number(idMateria)
      );

      // PASO B: Si hay notas, las borramos todas juntas
      if (notasDeEstaMateria.length > 0) {
        // Creamos una "promesa" de borrado por cada unidad encontrada
        const promesasDeBorrado = notasDeEstaMateria.map((nota) => {
          return fetch(
            `https://apis-patu.onrender.com/api/calificacion/${idAlumno}/${idMateria}/${nota.unidad}`,
            {
              method: "DELETE",
              headers,
            }
          );
        });

        // Promise.all espera a que todas se borren antes de seguir
        await Promise.all(promesasDeBorrado);
      }

      // PASO C: Ahora que está limpia de notas, borramos la materia (cursada)
      const res = await fetch(
        `https://apis-patu.onrender.com/api/cursada/${idAlumno}/${idMateria}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!res.ok) throw new Error("Error al eliminar la materia");

      Swal.fire("Eliminado", "Materia y calificaciones eliminadas.", "success");

      // PASO D: Actualizamos la pantalla (quitamos lo borrado de la lista visualmente)
      setCursadas((prev) =>
        prev.filter((c) => Number(c.id_materia) !== Number(idMateria))
      );
      setCalificaciones((prev) =>
        prev.filter((c) => Number(c.id_materia) !== Number(idMateria))
      );
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Hubo un problema al eliminar.", "error");
    }
  };

  // --- ACTUALIZAR CALIFICACIÓN ---
  const handleActualizarCalificacion = async (e) => {
    e.preventDefault();

    if (!materiaAEditar || !unidadAEditar || calificacionAEditar === "") {
      Swal.fire(
        "Campos incompletos",
        "Indica unidad y calificación",
        "warning"
      );
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${usuario.accessToken}`,
        "Content-Type": "application/json",
      };
      const idAlumno = alumnoData.id_usuario;

      // El cuerpo solo lleva el dato que cambia (la calificación)
      const body = { calificacion: Number(calificacionAEditar) };

      // URL: api/calificacion/(id_alumno)/(id_materia)/(unidad)
      const res = await fetch(
        `https://apis-patu.onrender.com/api/calificacion/${idAlumno}/${materiaAEditar}/${unidadAEditar}`,
        {
          method: "PUT", // Usamos PUT para actualizar
          headers,
          body: JSON.stringify(body),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.message || "Error al actualizar.");

      Swal.fire(
        "Actualizado",
        "La calificación ha sido modificada.",
        "success"
      );

      // Refrescar la lista de calificaciones para que se vea el cambio en la gráfica
      const resCal = await fetch(
        `https://apis-patu.onrender.com/api/calificacion/alumno/${idAlumno}`,
        { headers }
      );
      if (resCal.ok) {
        const calJson = await resCal.json();
        setCalificaciones(calJson.data || []);
      }

      // Cerrar modal y limpiar
      setEditarCalifOpen(false);
      setMateriaAEditar(null);
      setUnidadAEditar("");
      setCalificacionAEditar("");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message, "error");
    }
  };

  // --- Asignar calificación (MANTENIDO) ---
  const handleAsignarCalificacion = async (e) => {
    console.log("HANDLE ASIGNAR CALIFICACION EJECUTADO");
    e.preventDefault();
    if (!materiaParaCalif || !unidadCalif || valorCalif === "") {
      Swal.fire("Completa los campos", "", "warning");
      return;
    }
    if (!usuario?.accessToken || !alumnoData?.id_usuario) {
      Swal.fire("Error", "Faltan datos.", "error");
      return;
    }

    const valNum = Number(valorCalif);
    if (isNaN(valNum) || valNum < 0 || valNum > 100) {
      Swal.fire(
        "Valor inválido",
        "La calificación debe ser un número entre 0 y 100.",
        "warning"
      );
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${usuario.accessToken}`,
        "Content-Type": "application/json",
      };
      const body = {
        id_alumno: alumnoData.id_usuario,
        id_materia: Number(materiaParaCalif),
        unidad: Number(unidadCalif),
        calificacion: Number(valorCalif),
      };
      console.log("Datos enviados al backend para asignar calificación:", body);
      const res = await fetch(
        `https://apis-patu.onrender.com/api/calificacion/`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data.message || "Error al asignar calificación.");
      Swal.fire("¡Guardada!", "Calificación registrada.", "success");
      // refrescar calificaciones
      const resCal = await fetch(
        `https://apis-patu.onrender.com/api/calificacion/alumno/${alumnoData.id_usuario}`,
        { headers }
      );
      if (resCal.ok) {
        const calJson = await resCal.json();
        setCalificaciones(calJson.data || []);
      }
      setAsignarCalifOpen(false);
      setMateriaParaCalif(null);
      setUnidadCalif(1);
      setValorCalif("");
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error",
        err.message || "No se pudo guardar la calificación.",
        "error"
      );
    }
  };

  // --- Borrar disponibilidad (MANTENIDO) ---
  const handleBorrarDisponibilidad = async (idDisponibilidad) => {
    if (!usuario?.accessToken) {
      Swal.fire("Error", "No autenticado.", "error");
      return;
    }
    const result = await Swal.fire({
      title: "¿Borrar?",
      text: "No se puede revertir.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, borrar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;

    setLoadingDisponibilidad(true);
    try {
      const headers = { Authorization: `Bearer ${usuario.accessToken}` };
      const res = await fetch(
        `https://apis-patu.onrender.com/api/disponibilidades/${idDisponibilidad}`,
        { method: "DELETE", headers }
      );
      if (!res.ok && res.status !== 204) {
        const errorData = await res
          .json()
          .catch(() => ({ message: `Error ${res.status}` }));
        throw new Error(errorData.message);
      }
      Swal.fire("¡Borrado!", "Disponibilidad eliminada.", "success");
      if (filtroDia) {
        await fetchDisponibilidadesPorDia(alumnoData.matricula, filtroDia);
      } else {
        await fetchDisponibilidadesPorMatricula(alumnoData.matricula);
      }
    } catch (err) {
      Swal.fire("Error", err.message || "No se pudo borrar.", "error");
    } finally {
      setLoadingDisponibilidad(false);
    }
  };

  // --- Registrar Detalle del Alumno
  const handleRegistrarDetalle = async (e) => {
    e.preventDefault();

    if (!selectedSituacion)
      return Swal.fire("Atención", "Selecciona una situación", "warning");
    if (!observacionesDetalle.trim())
      return Swal.fire("Atención", "Escribe observaciones", "warning");

    setLoadingDetalle(true);

    try {
      const headers = {
        Authorization: `Bearer ${usuario.accessToken}`,
        "Content-Type": "application/json",
      };

      const body = {
        id_alumno: Number(alumnoData.id_usuario),
        // VOLVEMOS AL NOMBRE CORRECTO SEGÚN TU MIGRACIÓN:
        id_tipo_situacion: Number(selectedSituacion),
        observaciones: observacionesDetalle,
      };

      console.log("Enviando detalle:", body);

      const res = await fetch(`https://apis-patu.onrender.com/api/detalles`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error del servidor:", errorText);
        // Si aquí sale "Unknown column", es problema de migración en el servidor
        throw new Error("Error al guardar. Posible falta de migración en BD.");
      }

      Swal.fire("Registrado", "Detalle guardado correctamente", "success");
      await fetchDetallesAlumno(alumnoData.id_usuario, usuario.accessToken);
      setSelectedSituacion("");
      setObservacionesDetalle("");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo guardar. Revisa la consola.", "error");
    } finally {
      setLoadingDetalle(false);
    }
  };

  // --- Crear disponibilidad (MANTENIDO) ---
  const handleAgregarDisponibilidad = async (event) => {
    event.preventDefault();
    const v = validarDisponibilidad(nuevoDia, nuevaHoraInicio, nuevaHoraFin);
    if (!v.ok) {
      Swal.fire("Datos inválidos", v.msg, "warning");
      return;
    }
    if (
      !usuario?.accessToken ||
      !alumnoData?.id_usuario ||
      !alumnoData?.matricula
    ) {
      Swal.fire("Error", "Faltan datos del alumno o autenticación.", "error");
      return;
    }
    setLoadingDisponibilidad(true);
    try {
      const headers = {
        Authorization: `Bearer ${usuario.accessToken}`,
        "Content-Type": "application/json",
      };
      const body = {
        id_usuario: alumnoData.id_usuario,
        dia: v.diaNormalizado,
        hora_inicio: `${nuevaHoraInicio}:00`,
        hora_fin: `${nuevaHoraFin}:00`,
      };
      const res = await fetch(
        `https://apis-patu.onrender.com/api/disponibilidades/crear`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Error al crear");
      Swal.fire("¡Éxito!", "Disponibilidad agregada.", "success");
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
      Swal.fire("Error", err.message || "No se pudo agregar.", "error");
    } finally {
      setLoadingDisponibilidad(false);
    }
  };

  // --- Preparar datos para la gráfica de calificaciones ---
  // Resultado: array de objetos, cada objeto = { nombre: 'Materia', unidad_1: 69.99, unidad_2: 0, ... }
  const materiasCursadasConDetalle = (() => {
    // crear mapa de materias por id para nombre
    const mapaMaterias = {};
    materias.forEach((m) => {
      mapaMaterias[m.id] = m;
    });

    return cursadas.map((c) => {
      const matInfo = mapaMaterias[c.id_materia];
      const califs = calificaciones.filter(
        (cal) => Number(cal.id_materia) === Number(c.id_materia)
      );
      const objeto = {
        nombre: matInfo ? matInfo.nombre : `Materia ${c.id_materia}`,
      };
      califs.forEach((cal) => {
        // usar unidad_1, unidad_2...
        objeto[`unidad_${cal.unidad}`] = Number(cal.calificacion);
      });
      return objeto;
    });
  })();

  // --- Render helpers ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-gray-600 text-lg animate-pulse">Cargando...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 text-center">
        <p className="text-red-600 text-lg font-semibold mb-4">{error}</p>
        <Link to="/grupos" className="text-blue-600 underline">
          Volver a grupos
        </Link>
      </div>
    );
  }
  if (!alumnoData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <p className="text-gray-600 text-lg">
          No se pudo cargar la información del alumno.
        </p>
        <Link to="/grupos" className="mt-4 text-blue-600 underline">
          Volver a grupos
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Navbar />

      <main className="p-4 animate-fadeIn relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* --- HEADER RESPONSIVE --- */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
            <Link
              to={`/ListaAlumnos/${alumnoData.id_grupo}`}
              className="flex items-center text-[#8C1F2F] hover:text-[#8C1F2F] transition font-medium w-fit"
            >
              <ArrowLeft className="mr-2" /> Volver
            </Link>

            {/* Botones de acción principales en Grid para móviles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
                {usuario?.rol !== "admin" && (
              <Link
                to={`/EventoCalendario`}
                state={{ alumno: alumnoData }}
                className="flex justify-center items-center bg-[#E4CD87] hover:bg-[#E9DBCD] text-black px-4 py-2 rounded-xl font-semibold shadow-md transition-transform hover:scale-[1.02] text-sm text-center"
              >
                <FaPlus className="mr-2" /> Registrar evento
              </Link>
                )}
              <Link
                to={`/Reportes`}
                state={{ alumno: alumnoData }}
                className="flex justify-center items-center bg-[#E4CD87] hover:bg-[#E9DBCD] text-black px-4 py-2 rounded-xl font-semibold shadow-md transition-transform hover:scale-[1.02] text-sm text-center"
              >
                <FileText className="mr-2" /> Crear reporte
              </Link>
              <Link
                to={`/Reportes`}
                state={{ alumno: alumnoData }}
                className="flex justify-center items-center bg-[#E4CD87] hover:bg-[#E9DBCD] text-black px-4 py-2 rounded-xl font-semibold shadow-md transition-transform hover:scale-[1.02] text-sm text-center"
              >
                <FaArrowUp className="mr-2" /> Psicología
              </Link>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Ficha del Alumno: {alumnoData.nombre_completo}.
          </h2>
          <div className="w-full h-1 bg-[#C7952C] mb-8"></div>

          {/* ------------------- GRÁFICAS DE CALIFICACIONES (REDISEÑADO) ------------------- */}
          {/* --- SECCIÓN CALIFICACIONES (RESPONSIVE) --- */}
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-200 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <h3 className="text-xl md:text-2xl font-bold">Calificaciones</h3>

              {/* Botones de gestión de materia (Responsive Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto">
                <button
                  onClick={() => setAsignarCalifOpen(true)}
                  className="bg-[#E4CD87] hover:bg-[#E9DBCD] text-black px-3 py-2 rounded-lg font-semibold shadow-sm text-sm transition text-center"
                >
                  + Calificación
                </button>
                <button
                  onClick={() => setAsignarMateriaOpen(true)}
                  className="bg-[#E4CD87] hover:bg-[#E9DBCD] text-black px-3 py-2 rounded-lg font-semibold shadow-sm text-sm transition text-center"
                >
                  + Asignar Mat.
                </button>
                <button
                  onClick={() => setCrearMateriaOpen(true)}
                  className="bg-[#E4CD87] hover:bg-[#E9DBCD] text-black px-3 py-2 rounded-lg font-semibold shadow-sm text-sm transition text-center"
                >
                  Crear Nueva
                </button>
              </div>
            </div>

            {materiasCursadasConDetalle.length === 0 ? (
              <div className="text-center py-8">
                <img
                  src={sinRegistrosImgUrl}
                  alt="Sin calificaciones"
                  className="mx-auto mb-4 w-48 rounded"
                />
                <p className="text-gray-600">
                  No hay materias o calificaciones asignadas aún.
                </p>
              </div>
            ) : (
              // AQUÍ ESTÁ EL CAMBIO PRINCIPAL DE DISEÑO: GRID EN LUGAR DE SPACE-Y-8
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {materiasCursadasConDetalle.map((mat, idx) => {
                  // tomar las claves de unidad
                  const unidadesKeys = Object.keys(mat)
                    .filter((k) => k.startsWith("unidad_"))
                    .sort((a, b) => {
                      const na = Number(a.split("_")[1]),
                        nb = Number(b.split("_")[1]);
                      return na - nb;
                    });
                  // data con un solo elemento para mostrar barras por unidad para esa materia
                  const data = [mat];
                  return (
                    <div
                      key={idx}
                      className="bg-gray-50 p-3 rounded-lg border-[#E9DBCD] border-2 shadow-sm"
                    >
                      {/* Título truncado para que quepa en el grid */}
                      <h4
                        className="font-semibold mb-2 text-center text-sm truncate"
                        title={mat.nombre}
                      >
                        {mat.nombre}
                      </h4>
                      {/* Altura reducida a 200px para ahorrar espacio */}
                      <div style={{ width: "100%", height: 200 }}>
                        <ResponsiveContainer>
                          <BarChart
                            data={data}
                            margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                            />
                            {/* Ocultamos el eje X para ahorrar espacio, ya que el título está arriba */}
                            <XAxis dataKey="nombre" hide={true} />
                            <YAxis
                              domain={[0, 100]}
                              allowDecimals={false}
                              fontSize={12}
                            />
                            <Tooltip />
                            {/* Leyenda opcional, si quieres más espacio la puedes comentar */}
                            {/* <Legend iconSize={8} /> */}
                            {unidadesKeys.map((uk, i) => (
                              <Bar
                                key={uk}
                                dataKey={uk}
                                name={`U${uk.split("_")[1]}`}
                                fill={
                                  [
                                    "#8C1F2F",
                                    "#f97316",
                                    "#3b82f6",
                                    "#22c55e",
                                    "#8b5cf6",
                                  ][i % 5]
                                }
                              />
                            ))}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

                                              {/* --- SECCIÓN GRÁFICAS --- */}
                                        <div className="flex flex-col lg:flex-row gap-6 mb-8">
                                            {/* 1. GRÁFICA DE TIPOS DE SESIONES (RECUPERADA) */}
                                            <div className="lg:w-1/3 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                                                <h3 className="text-xl font-bold text-center mb-4">Tipos de Sesiones</h3>
                                                <div style={{ width: '100%', height: 250 }}>
                                                    {chartDataVisual.length === 0 ? <p className="text-center text-gray-500 mt-10">Sin sesiones registradas.</p> :
                                                        <ResponsiveContainer>
                                                            <BarChart data={chartDataVisual}>
                                                                <YAxis allowDecimals={false} />
                                                                <Tooltip />
                                                                <Bar dataKey="sesiones" barSize={40}>
                                                                    {chartDataVisual.map((e, i) => <Cell key={i} fill={ESTILOS_POR_TIPO[e.tipo?.toLowerCase()]?.hex || '#6b7280'} />)}
                                                                </Bar>
                                                            </BarChart>
                                                        </ResponsiveContainer>
                                                    }
                                                </div>
                                                <div className="flex flex-wrap justify-center gap-2 mt-4">
                                                    {chartDataVisual.map((e, i) => (
                                                        <div key={i} className="flex items-center gap-1 text-xs">
                                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ESTILOS_POR_TIPO[e.tipo?.toLowerCase()]?.hex }}></div>
                                                            <span>{e.tipo}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
            


          {/* --- LAYOUT COLUMNAS INFO / BITÁCORA --- */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* COLUMNA IZQUIERDA (Info y Bitácora) */}
            <div className="lg:w-3/5 flex flex-col gap-6">
              {/* Info Alumno */}
              <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-xl md:text-2xl font-bold mb-3 break-words">
                  {alumnoData.nombre_completo}
                </h3>
                <div className="space-y-1 text-sm md:text-base">
                  <p>
                    <span className="font-semibold">Matrícula:</span>{" "}
                    {alumnoData.matricula}
                  </p>
                  <p className="break-all">
                    <span className="font-semibold">Correo:</span>{" "}
                    {alumnoData.correo || "No disponible"}
                  </p>
                  <p>
                    <span className="font-semibold">Carrera:</span>{" "}
                    {alumnoData.carrera || "No especificada"}
                  </p>
                  <p>
                    <span className="font-semibold">Semestre:</span>{" "}
                    {alumnoData.semestre || "—"}
                  </p>
                </div>
              </div>

              {/* Bitácora */}
              <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200 flex flex-col h-full">
                <h3 className="text-xl font-bold mb-4">Bitácora</h3>
                <div className="w-full h-1 bg-[#C7952C] mb-4"></div>
                <div className="flex-grow space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {bitacoraData.length > 0 ? (
                    bitacoraData
                      .filter((item) => item !== null && item !== undefined)
                      .map((item, index) => (
                        <BitacoraFicha
                          key={item.id || item.id_sesion || index}
                          asistencia={item.asistencia}
                          notas={item.notas}
                          acuerdos={item.acuerdos}
                          compromisos={item.compromisos}
                          color="#4F3E9B"
                        />
                      ))
                  ) : (
                    <div className="flex flex-col items-center py-8 text-center">
                      <p className="text-gray-500 font-medium">
                        No hay registros de bitácora.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA (Materias Lista y Disponibilidad) */}
            <div className="lg:w-2/5 flex flex-col gap-6">
              {/* Lista Materias Simple */}
              <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-lg md:text-xl font-bold mb-3">
                  Materias inscritas
                </h3>
                {cursadas.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    Sin materias asignadas.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                    {cursadas.map((c) => {
                      const mat = materias.find(
                        (m) => Number(m.id) === Number(c.id_materia)
                      );
                      return (
                        <div
                          key={`${c.id_materia}-${c.id_alumno}`}
                          className="p-3 rounded-lg flex justify-between items-center bg-gray-50 border-[#E9DBCD] border shadow-sm"
                        >
                          <div className="min-w-0 flex-1 mr-2">
                            <div
                              className="font-semibold text-sm truncate"
                              title={mat ? mat.nombre : ""}
                            >
                              {mat ? mat.nombre : `Materia ${c.id_materia}`}
                            </div>
                            <div className="text-xs text-gray-500">
                              Curso: {c.curso || "—"}
                            </div>
                          </div>

                          <div className="flex gap-1 items-center flex-shrink-0">
                            <button
                              onClick={() => {
                                setMateriaAEditar(c.id_materia);
                                setEditarCalifOpen(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition"
                              title="Editar notas"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              onClick={() => {
                                setMateriaParaCalif(c.id_materia);
                                setAsignarCalifOpen(true);
                              }}
                              className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-full transition"
                              title="Calificar"
                            >
                              <FaPlus size={14} />
                            </button>

                            <button
                              onClick={() => handleBorrarMateria(c.id_materia)}
                              className="p-2 text-red-500 hover:bg-red-100 rounded-full transition"
                              title="Eliminar materia"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Disponibilidad */}
              <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
                  Disponibilidad
                </h3>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-3">
                  <label className="text-sm text-gray-700 whitespace-nowrap">
                    Ver día:
                  </label>
                  <select
                    value={filtroDia}
                    onChange={async (e) => {
                      const d = e.target.value;
                      setFiltroDia(d);
                      d
                        ? await fetchDisponibilidadesPorDia(
                            alumnoData.matricula,
                            d
                          )
                        : await fetchDisponibilidadesPorMatricula(
                            alumnoData.matricula
                          );
                    }}
                    className="w-full sm:w-auto flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E9DBCD] border-gray-300 text-sm"
                  >
                    <option value="">Todos</option>
                    <option value="lunes">Lunes</option>
                    <option value="martes">Martes</option>
                    <option value="miercoles">Miércoles</option>
                    <option value="jueves">Jueves</option>
                    <option value="viernes">Viernes</option>
                  </select>
                </div>

                {!mostrarFormulario && (
                  <button
                    onClick={() => setMostrarFormulario(true)}
                    className="mb-4 w-full flex items-center justify-center gap-2 bg-[#E4CD87] hover:bg-[#E9DBCD] text-black font-bold py-2 px-4 rounded-xl shadow-md transition text-sm"
                  >
                    <FaPlus /> Agregar Horario
                  </button>
                )}

                {/* Botón para abrir formulario */}
                {!mostrarFormulario && (
                  <button
                    onClick={() => setMostrarFormulario(true)}
                    className="mb-4 flex items-center justify-center gap-2 bg-[#E4CD87] hover:bg-[#E9DBCD] text-black font-bold py-2 px-4 rounded-full shadow-md transition-all w-full"
                  >
                    <FaPlus /> Agregar Disponibilidad
                  </button>
                )}

                {/* Formulario agregar */}
                {mostrarFormulario && (
                  <form
                    onSubmit={handleAgregarDisponibilidad}
                    className="mb-6 p-4  rounded-lg bg-gray-50 border-[#E9DBCD] shadow-sm border-2"
                  >
                    <div className="mb-3">
                      <label
                        htmlFor="dia"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Día:
                      </label>
                      <select
                        id="dia"
                        value={nuevoDia}
                        onChange={(e) => setNuevoDia(e.target.value)}
                        required
                        className="w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9DBCD] border-gray-300 rounded-md shadow-sm"
                      >
                        <option value="lunes">Lunes</option>
                        <option value="martes">Martes</option>
                        <option value="miércoles">Miércoles</option>
                        <option value="jueves">Jueves</option>
                        <option value="viernes">Viernes</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label
                        htmlFor="hora_inicio"
                        className="block text-sm font-medium text-gray-700 mb-1 "
                      >
                        Hora Inicio:
                      </label>
                      <input
                        type="time"
                        id="hora_inicio"
                        value={nuevaHoraInicio}
                        onChange={(e) => setNuevaHoraInicio(e.target.value)}
                        required
                        className="w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9DBCD] border-gray-300 rounded-md shadow-sm"
                        min="07:00"
                        max="19:00"
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="hora_fin"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Hora Fin:
                      </label>
                      <input
                        type="time"
                        id="hora_fin"
                        value={nuevaHoraFin}
                        onChange={(e) => setNuevaHoraFin(e.target.value)}
                        required
                        className="w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E9DBCD] border-gray-300 rounded-md shadow-sm"
                        min="07:00"
                        max="19:00"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={loadingDisponibilidad}
                        className="flex-1 bg-[#E4CD87] hover:bg-[#E9DBCD] text-black font-bold py-2 px-4 rounded-md transition-transform disabled:opacity-50 hover:scale-[1.03]"
                      >
                        {loadingDisponibilidad ? "Agregando..." : "Agregar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMostrarFormulario(false)}
                        className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md  transition-transform hover:scale-[1.03]"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}

                {/* Lista de disponibilidades */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {loadingDisponibilidad && disponibilidades.length === 0 ? (
                    <p className="text-center text-gray-500 animate-pulse">
                      Cargando disponibilidad...
                    </p>
                  ) : !loadingDisponibilidad &&
                    disponibilidades.length === 0 ? (
                    <p className="text-center text-gray-500">
                      No hay horarios registrados para este alumno.
                    </p>
                  ) : (
                    disponibilidades.map((disp) => (
                      <div
                        key={disp.id}
                        className="flex items-center justify-between p-3 border rounded-lg bg-indigo-50 border-indigo-200"
                      >
                        <div className="flex items-center gap-2 overflow-hidden mr-2">
                          <Clock className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                          <span className="font-medium text-indigo-800 text-sm truncate">
                            {capitalizeFirstLetter(disp.dia || "")}:{" "}
                            {(disp.hora_inicio || "").substring(0, 5)} -{" "}
                            {(disp.hora_fin || "").substring(0, 5)}
                          </span>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() =>
                              disp.id && handleBorrarDisponibilidad(disp.id)
                            }
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
              {/* --- NUEVO COMPONENTE: REGISTRAR DETALLES --- */}
              <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <AlertOctagon className="text-[#8C1F2F]" size={20} />
                  Registrar Detalle
                </h3>

                <form
                  onSubmit={handleRegistrarDetalle}
                  className="flex flex-col gap-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Situación
                    </label>
                    <select
                      value={selectedSituacion}
                      onChange={(e) => setSelectedSituacion(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E9DBCD] border-gray-300 bg-white"
                      disabled={loadingDetalle}
                    >
                      <option value="">-- Seleccionar --</option>
                      {tiposSituacion.map((tipo) => (
                        <option key={tipo.id} value={tipo.id}>
                          {tipo.situacion}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Observaciones
                    </label>
                    <textarea
                      rows="3"
                      value={observacionesDetalle}
                      onChange={(e) => setObservacionesDetalle(e.target.value)}
                      placeholder="Escribe los detalles aquí..."
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#E9DBCD] border-gray-300 resize-none"
                      disabled={loadingDetalle}
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingDetalle}
                    className="w-full bg-[#8C1F2F] hover:bg-[#7a1b29] text-white font-bold py-2 px-4 rounded-xl shadow-md transition-transform hover:scale-[1.02] disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {loadingDetalle ? (
                      "Guardando..."
                    ) : (
                      <>
                        <FileText size={18} /> Guardar Detalle
                      </>
                    )}
                  </button>
                </form>
              </div>
              {/* --- COMPONENTE NUEVO: HISTORIAL DE DETALLES --- */}
              <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="text-[#8C1F2F]" size={20} />
                  Historial de Situaciones
                </h3>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {listaDetalles.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4 bg-gray-50 rounded-lg border border-gray-100">
                      No hay detalles registrados para este alumno.
                    </p>
                  ) : (
                    listaDetalles.map((detalle) => {
                      // Buscar nombre del tipo de situación
                      const nombreSituacion =
                        tiposSituacion.find(
                          (t) =>
                            Number(t.id) === Number(detalle.id_tipo_situacion)
                        )?.situacion || "Situación no especificada";

                      return (
                        <div
                          key={detalle.id}
                          className="p-3 rounded-lg border-l-4 bg-gray-50 border shadow-sm hover:shadow-md transition-all"
                          style={{ borderLeftColor: "#E4CD87" }}
                        >
                          <h4 className="font-bold text-[#8C1F2F] text-sm mb-1">
                            {nombreSituacion}
                          </h4>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                            {detalle.observaciones || "Sin observaciones."}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ------------------- Modales / formularios emergentes (simples) ------------------- */}
          {/* Crear materia */}
          {crearMateriaOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/20">
              <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
                <h4 className="text-lg font-bold mb-3">Crear Materia</h4>
                <form onSubmit={handleCrearMateria} className="space-y-3">
                  <input
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#E9DBCD] border-gray-300"
                    placeholder="Clave"
                    value={nClave}
                    onChange={(e) => setNClave(e.target.value)}
                  />
                  <input
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#E9DBCD] border-gray-300"
                    placeholder="Nombre"
                    value={nNombre}
                    onChange={(e) => setNNombre(e.target.value)}
                  />
                  <input
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#E9DBCD] border-gray-300"
                    placeholder="Grupo"
                    value={nGrupo}
                    onChange={(e) => setNGrupo(e.target.value)}
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setCrearMateriaOpen(false)}
                      className="px-4 py-2 rounded bg-gray-300 transition-transform hover:scale-[1.03]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded bg-[#E4CD87] hover:bg-[#E9DBCD] transition-transform hover:scale-[1.03]"
                    >
                      Crear
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Asignar materia */}
          {asignarMateriaOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/20">
              <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
                <h4 className="text-lg font-bold mb-3">
                  Asignar materia al alumno
                </h4>
                <form onSubmit={handleAsignarMateria} className="space-y-3">
                  <select
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#E9DBCD] border-gray-300"
                    value={materiaSeleccionadaParaAsignar || ""}
                    onChange={(e) =>
                      setMateriaSeleccionadaParaAsignar(e.target.value)
                    }
                  >
                    <option value="">Selecciona una materia</option>
                    {materias.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre} — {m.clave}
                      </option>
                    ))}
                  </select>
                  <select
                    className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#E9DBCD] border-gray-300 w-full"
                    value={curso}
                    onChange={(e) => setCurso(e.target.value)}
                    required
                  >
                    <option value="">Seleccione curso...</option>
                    <option value="CN">Curso Normal</option>
                    <option value="CR">Curso Repetido</option>
                    <option value="CE">Curso Especial</option>
                  </select>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setAsignarMateriaOpen(false)}
                      className="px-4 py-2 rounded bg-gray-300 transition-transform hover:scale-[1.03]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      onClick={() => console.log("Click en boton asignar")}
                      className="px-4 py-2 rounded bg-[#E4CD87] hover:bg-[#E9DBCD] transition-transform hover:scale-[1.03]"
                    >
                      Asignar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Asignar calificación */}
          {asignarCalifOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/20">
              <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
                <h4 className="text-lg font-bold mb-3">Asignar Calificación</h4>
                <form
                  onSubmit={handleAsignarCalificacion}
                  className="space-y-3"
                >
                  <select
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#E9DBCD] border-gray-300"
                    value={materiaParaCalif || ""}
                    onChange={(e) => setMateriaParaCalif(e.target.value)}
                  >
                    <option value="">Selecciona materia</option>
                    {cursadas.map((c) => {
                      const m = materias.find(
                        (mm) => Number(mm.id) === Number(c.id_materia)
                      );
                      return (
                        <option key={c.id_materia} value={c.id_materia}>
                          {m ? m.nombre : `Materia ${c.id_materia}`}
                        </option>
                      );
                    })}
                  </select>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      className="w-1/3 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#E9DBCD] border-gray-300"
                      value={unidadCalif}
                      onChange={(e) => setUnidadCalif(e.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#E9DBCD] border-gray-300"
                      placeholder="Calificación (0-100)"
                      value={valorCalif}
                      onChange={(e) => setValorCalif(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setAsignarCalifOpen(false)}
                      className="px-4 py-2 rounded bg-gray-300 transition-transform hover:scale-[1.03]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      onClick={() => console.log("Click en boton guardar")}
                      className="px-4 py-2 rounded bg-[#E4CD87] hover:bg-[#E9DBCD] transition-transform hover:scale-[1.03]"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Actualizar Calificación */}
          {editarCalifOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
              <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
                <h4 className="text-lg font-bold mb-3">Editar Calificación</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Ingresa la unidad que deseas corregir y la nueva nota.
                </p>

                <form
                  onSubmit={handleActualizarCalificacion}
                  className="space-y-3"
                >
                  {/* Mostramos el nombre de la materia seleccionada (solo lectura) */}
                  <div className="p-2 bg-gray-100 rounded text-gray-700 font-medium">
                    Materia:{" "}
                    {materias.find(
                      (m) => Number(m.id) === Number(materiaAEditar)
                    )?.nombre || "Cargando..."}
                    {/* Si quieres mostrar el nombre, busca la materia en el array 'materias' usando el ID */}
                  </div>

                  <div className="flex gap-2">
                    <div className="w-1/3">
                      <label className="text-xs font-bold text-gray-00">
                        Unidad
                      </label>
                      <input
                        type="number"
                        placeholder="Ej. 1"
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#E9DBCD] border-gray-300"
                        value={unidadAEditar}
                        onChange={(e) => setUnidadAEditar(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-bold text-gray-500">
                        Nueva Calificación
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0-100"
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#E9DBCD] border-gray-300"
                        value={calificacionAEditar}
                        onChange={(e) => setCalificacionAEditar(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end mt-4">
                    <button
                      type="button"
                      onClick={() => setEditarCalifOpen(false)}
                      className="px-4 py-2 rounded bg-gray-300 transition-transform hover:scale-[1.03] font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded bg-[#E4CD87] hover:bg-[#E9DBCD] transition-transform hover:scale-[1.03] font-bold"
                    >
                      Actualizar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      <style>{`
                @keyframes fadeIn { 
                    from { opacity: 0; transform: translateY(10px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
                .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
            `}</style>
    </div>
  );
};

export default FichaAlumno;
