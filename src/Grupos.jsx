import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import { 
  HiMiniUserGroup, HiOutlineUserGroup,
  HiUserGroup, HiUsers
} from "react-icons/hi2";
import { 
  IoAddCircleSharp, IoCopyOutline, IoCheckmarkCircle,
  IoArrowForward, IoQrCode, IoSearch, IoClose
} from "react-icons/io5";
import { 
  FaRegCopy, FaUsers, FaUserTie, FaGraduationCap,
  FaClipboardCheck, FaExclamationTriangle, FaSpinner
} from 'react-icons/fa';
import { 
  CheckCircle, Users, GraduationCap, UserCheck,
  Copy, PlusCircle, ArrowRight, X, Key, Shield
} from 'lucide-react';
import NoEncontrado from './assets/NoEncontrado.jpg';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// Colores de las tarjetas con gradientes
const colorPalette = [
    { 
      border: "border-l-4 border-blue-500", 
      text: "text-blue-600",
      bg: "from-blue-50 to-blue-100",
      gradient: "bg-gradient-to-br from-blue-50 to-blue-100",
      iconBg: "bg-blue-100"
    },
    { 
      border: "border-l-4 border-orange-500", 
      text: "text-orange-600",
      bg: "from-orange-50 to-amber-100",
      gradient: "bg-gradient-to-br from-orange-50 to-amber-100",
      iconBg: "bg-orange-100"
    },
    { 
      border: "border-l-4 border-green-500", 
      text: "text-green-600",
      bg: "from-green-50 to-emerald-100",
      gradient: "bg-gradient-to-br from-green-50 to-emerald-100",
      iconBg: "bg-green-100"
    },
    { 
      border: "border-l-4 border-purple-500", 
      text: "text-purple-600",
      bg: "from-purple-50 to-violet-100",
      gradient: "bg-gradient-to-br from-purple-50 to-violet-100",
      iconBg: "bg-purple-100"
    },
    { 
      border: "border-l-4 border-pink-500", 
      text: "text-pink-600",
      bg: "from-pink-50 to-rose-100",
      gradient: "bg-gradient-to-br from-pink-50 to-rose-100",
      iconBg: "bg-pink-100"
    },
    { 
      border: "border-l-4 border-cyan-500", 
      text: "text-cyan-600",
      bg: "from-cyan-50 to-sky-100",
      gradient: "bg-gradient-to-br from-cyan-50 to-sky-100",
      iconBg: "bg-cyan-100"
    },
];

// Ícono de grupo animado
const IconoPersonas = ({ colorClase, iconBg, isHovered }) => (
  <div className={`relative ${isHovered ? 'scale-110' : 'scale-100'} transition-transform duration-300`}>
    <div className={`${iconBg} p-3 md:p-4 rounded-full`}>
      <HiUserGroup className={`w-12 h-12 md:w-14 md:h-14 ${colorClase} transition-all duration-300 ${isHovered ? 'rotate-12' : ''}`} />
    </div>
    <div className={`absolute -top-1 -right-1 w-5 h-5 ${iconBg} rounded-full flex items-center justify-center animate-pulse`}>
      <Users className="w-3 h-3" />
    </div>
  </div>
);

// Tarjeta de grupo mejorada
const GrupoCard = ({ id, titulo, semestre, tutor, colorClase, colorTextoClase, bg, gradient, iconBg, codigo }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();

    const handleCopyCode = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (codigo) {
            navigator.clipboard.writeText(codigo);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`rounded-xl ${colorClase} ${gradient} shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group`}
        >
            <Link
                to={`/ListaAlumnos/${id}`}
                className="block p-0 h-full"
            >
                <div className="flex w-full h-full">
                    <div className="w-1/3 flex justify-center items-center p-4 md:p-6">
                        <IconoPersonas 
                            colorClase={colorTextoClase} 
                            iconBg={iconBg}
                            isHovered={isHovered}
                        />
                    </div>
                    
                    <div className="w-2/3 flex flex-col justify-center p-4 md:p-6 relative">
                        {/* Efecto de brillo al hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-start justify-between">
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 line-clamp-1" title={titulo}>
                                    {titulo}
                                </h3>
                                {codigo && (
                                    <button
                                        onClick={handleCopyCode}
                                        className="flex items-center gap-1 text-xs px-2 py-1 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                                        title={copied ? "¡Copiado!" : "Copiar código"}
                                    >
                                        {copied ? (
                                            <CheckCircle className="w-3 h-3 text-green-500" />
                                        ) : (
                                            <Copy className="w-3 h-3 text-gray-500" />
                                        )}
                                        <span className="font-semibold">{codigo}</span>
                                    </button>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <GraduationCap className="w-4 h-4" />
                                <span className="font-semibold">{semestre || "Semestre no definido"}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <UserCheck className="w-4 h-4" />
                                <span className="font-medium">Tutor:</span>
                                <span className="font-semibold truncate" title={tutor}>
                                    {tutor || "No disponible"}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-3 text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">
                                <span>Ver estudiantes</span>
                                <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

// Botón de crear grupo (solo Coordinador)
const NuevoGrupoBoton = () => (
    <Link
        to="/NuevoGrupo"
        className="flex items-center justify-center gap-2 text-white font-bold py-3 px-6 rounded-xl 
                   hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 
                   bg-gradient-to-r from-[#C7952C] to-[#E4CD87] shadow-md w-fit ml-auto group"
    >
        <PlusCircle className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
        <span>Crear Nuevo Grupo</span>
    </Link>
);

const Grupos = () => {
    const [grupos, setGrupos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modalAnimation, setModalAnimation] = useState(false);
    const [codigoGrupo, setCodigoGrupo] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [mensajeTipo, setMensajeTipo] = useState(''); // 'success' | 'error' | 'info'
    const [unirseLoading, setUnirseLoading] = useState(false);
    const [codigoCopiado, setCodigoCopiado] = useState(false);
    
    const usuarioGuardado = localStorage.getItem('usuario');
    const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
    const esTutor = usuario?.rol === 'tutor';
    const esAlumno = usuario?.rol === 'alumno';
    const esCoordinador = usuario?.rol === 'admin';

    // Animación del modal
    useEffect(() => {
        if (mostrarModal) {
            setTimeout(() => setModalAnimation(true), 10);
        } else {
            setModalAnimation(false);
        }
    }, [mostrarModal]);

    // Cargar grupos según rol
    useEffect(() => {
        if (!usuario) {
            setError("No hay sesión iniciada");
            setLoading(false);
            return;
        }

        const userId = usuario.id;
        const token = usuario.accessToken;

        const fetchGrupos = async () => {
            try {
                let gruposData = [];

                // ---- TUTOR ----
                if (esTutor) {
                    const res = await fetch(`https://apis-patu.onrender.com/api/grupos/tutor/${userId}`, {
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    });

                    if (res.ok) {
                        const data = await res.json();
                        gruposData = Array.isArray(data.data) ? data.data : [data.data];
                    }
                }

                // ---- COORDINADOR (admin) ----
                else if (esCoordinador) {
                    const resGrupos = await fetch(`https://apis-patu.onrender.com/api/grupos/todos`, {
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    });

                    if (resGrupos.ok) {
                        const dataGrupos = await resGrupos.json();
                        gruposData = Array.isArray(dataGrupos.data) ? dataGrupos.data : [dataGrupos.data];
                    }
                }

                // ---- ALUMNO ----
                else if (esAlumno) {
                    const resAlumno = await fetch(`https://apis-patu.onrender.com/api/alumnos/${userId}`, {
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    });

                    if (!resAlumno.ok) throw new Error("Error obteniendo datos del alumno");

                    const dataAlumno = await resAlumno.json();
                    if (dataAlumno.success && dataAlumno.data.id_grupo) {
                        const idGrupo = dataAlumno.data.id_grupo;

                        const resGrupo = await fetch(`https://apis-patu.onrender.com/api/grupos/id/${idGrupo}`, {
                            headers: {
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                            }
                        });

                        const dataGrupo = await resGrupo.json();
                        if (dataGrupo.success && dataGrupo.data) gruposData = [dataGrupo.data];
                    }
                }

                // Obtener nombre del tutor
                const gruposConTutor = await Promise.all(
                    gruposData.map(async (grupo) => {
                        if (!grupo.id_tutor)
                            return { ...grupo, tutor_nombre: "No asignado", codigo: grupo.codigo };

                        try {
                            const resTutor = await fetch(
                                `https://apis-patu.onrender.com/api/tutores/id/${grupo.id_tutor}`,
                                {
                                    headers: {
                                        "Authorization": `Bearer ${token}`,
                                        "Content-Type": "application/json"
                                    }
                                }
                            );

                            const dataTutor = await resTutor.json();

                            return {
                                ...grupo,
                                tutor_nombre: dataTutor?.data?.nombre_completo || "No disponible",
                                codigo: grupo.codigo
                            };

                        } catch (error) {
                            console.error("Error obteniendo tutor:", error);
                            return { ...grupo, tutor_nombre: "Error", codigo: grupo.codigo };
                        }
                    })
                );

                setGrupos(gruposConTutor);
            } catch (err) {
                console.error("Error cargando grupos:", err);
                setError("Error al cargar los grupos");
            } finally {
                setLoading(false);
            }
        };

        fetchGrupos();
    }, [usuario?.id, usuario?.accessToken, esTutor, esAlumno, esCoordinador]);

    // Función para que el alumno se una a un grupo
    const handleUnirme = async () => {
        if (!codigoGrupo.trim()) {
            setMensaje("Ingresa un código de grupo válido.");
            setMensajeTipo('error');
            return;
        }

        try {
            setUnirseLoading(true);
            setMensaje("Buscando grupo...");
            setMensajeTipo('info');
            
            const token = usuario.accessToken;
            const idAlumno = usuario.id;

            const resGrupo = await fetch(
                `https://apis-patu.onrender.com/api/grupos/codigo/${codigoGrupo}`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const dataGrupo = await resGrupo.json();

            if (!resGrupo.ok || !dataGrupo.success || !dataGrupo.data) {
                setMensaje("No se encontró un grupo con ese código.");
                setMensajeTipo('error');
                setUnirseLoading(false);
                return;
            }

            const { id: id_grupo, id_tutor } = dataGrupo.data;

            setMensaje("Asignando grupo y tutor...");
            setMensajeTipo('info');

            const bodyActualizar = { id_tutor, id_grupo };

            const resAsignar = await fetch(
                `https://apis-patu.onrender.com/api/alumnos/${idAlumno}/asignacion`,
                {
                    method: "PATCH",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(bodyActualizar),
                }
            );

            const dataAsignar = await resAsignar.json();

            if (!resAsignar.ok || !dataAsignar.success) {
                setMensaje(dataAsignar.message || "No se pudo unir al grupo.");
                setMensajeTipo('error');
                setUnirseLoading(false);
                return;
            }

            setMensaje("¡Te has unido al grupo correctamente!");
            setMensajeTipo('success');

            // Mostrar SweetAlert de éxito
            Swal.fire({
                title: '¡Éxito!',
                text: 'Te has unido al grupo correctamente.',
                icon: 'success',
                confirmButtonColor: '#3CB9A5',
                confirmButtonText: 'Continuar',
                showClass: {
                    popup: 'animate-fadeIn'
                }
            });

            setTimeout(() => {
                setMostrarModal(false);
                setUnirseLoading(false);
                window.location.reload();
            }, 1500);

        } catch (error) {
            console.error("Error inesperado al unirse al grupo:", error);
            setMensaje("Error al conectarse con el servidor.");
            setMensajeTipo('error');
            setUnirseLoading(false);
        }
    };

    const closeModal = () => {
        setModalAnimation(false);
        setTimeout(() => {
            setMostrarModal(false);
            setCodigoGrupo('');
            setMensaje('');
            setMensajeTipo('');
        }, 300);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 animate-fadeIn">
            <Navbar />

            <main className="pt-24 px-4 sm:px-6 md:px-8 lg:px-20 pb-8">
                {/* Header mejorado */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-[#3CB9A5] to-emerald-600 rounded-lg">
                                    <HiUsers className="w-6 h-6 text-white" />
                                </div>
                                Grupos Académicos
                            </h1>
                            <p className="text-gray-600 mt-2">
                                {esTutor ? 'Grupos asignados como tutor' : 
                                 esAlumno ? 'Tu grupo de estudio' : 
                                 'Gestión de grupos académicos'}
                            </p>
                        </div>
                        
                        {esCoordinador && <NuevoGrupoBoton />}
                    </div>
                    
                    <div className="h-1 w-24 bg-gradient-to-r from-[#3CB9A5] to-emerald-600 rounded-full"></div>
                </div>

                {/* Contenido principal */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="relative mb-6">
                            <div className="w-24 h-24 border-4 border-[#3CB9A5] border-t-transparent rounded-full animate-spin"></div>
                            <HiUserGroup className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-[#3CB9A5] animate-pulse" />
                        </div>
                        <p className="text-lg font-semibold text-gray-700 mb-2">Cargando grupos...</p>
                        <p className="text-gray-500">Estamos obteniendo la información de tus grupos</p>
                    </div>
                ) : error ? (
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-8 text-center animate-shake">
                        <div className="flex flex-col items-center">
                            <FaExclamationTriangle className="w-16 h-16 text-red-500 mb-4" />
                            <p className="text-red-600 text-lg font-semibold mb-2">¡Ups! Algo salió mal</p>
                            <p className="text-red-500">{error}</p>
                            <button 
                                onClick={() => window.location.reload()}
                                className="mt-4 px-6 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors"
                            >
                                Reintentar
                            </button>
                        </div>
                    </div>
                ) : grupos.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {grupos.map((grupo, index) => {
                            const colors = colorPalette[index % colorPalette.length];
                            return (
                                <GrupoCard
                                    key={grupo.id}
                                    id={grupo.id}
                                    titulo={grupo.nombre || "Sin nombre"}
                                    semestre={grupo.semestre || "Semestre no definido"}
                                    tutor={grupo.tutor_nombre || "No disponible"}
                                    colorClase={colors.border}
                                    colorTextoClase={colors.text}
                                    bg={colors.bg}
                                    gradient={colors.gradient}
                                    iconBg={colors.iconBg}
                                    
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 animate-fadeIn">
                        <div className="relative mb-6">
                            <div className="w-48 h-48 bg-gradient-to-br from-gray-100 to-blue-50 rounded-full flex items-center justify-center">
                                <img 
                                    src={NoEncontrado} 
                                    alt="Sin grupo" 
                                    className="w-40 h-40 object-contain opacity-90" 
                                />
                            </div>
                            <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-r from-[#3CB9A5] to-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                                <span className="text-white font-bold">!</span>
                            </div>
                        </div>
                        
                        <h3 className="text-2xl font-bold text-gray-700 mb-2">
                            {esTutor
                                ? "Aún no tienes grupos asignados"
                                : esAlumno
                                ? "Aún no te has inscrito a un grupo"
                                : "No hay grupos registrados"}
                        </h3>
                        
                        <p className="text-gray-500 max-w-md text-center mb-6">
                            {esTutor
                                ? "Los grupos que administres aparecerán aquí cuando sean asignados."
                                : esAlumno
                                ? "Únete a un grupo usando el código que te proporcionó tu tutor."
                                : "Comienza creando tu primer grupo académico."}
                        </p>

                        {esAlumno && (
                            <button
                                onClick={() => setMostrarModal(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3CB9A5] to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 group"
                            >
                                <Key className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                Ingresar código de grupo
                            </button>
                        )}
                    </div>
                )}

                {/* Botón flotante para unirse (solo alumno sin grupos) */}
                {esAlumno && grupos.length === 0 && !loading && !error && (
                    <div className="fixed bottom-6 right-6 z-30">
                        <button
                            onClick={() => setMostrarModal(true)}
                            className="p-4 bg-gradient-to-r from-[#3CB9A5] to-emerald-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 animate-bounce-subtle"
                            title="Unirse a un grupo"
                        >
                            <Key className="w-6 h-6" />
                        </button>
                    </div>
                )}
            </main>

            {/* Modal para alumno (unirse a grupo) */}
            {mostrarModal && esAlumno && (
                <div 
                    className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
                        modalAnimation 
                            ? 'bg-black/50 backdrop-blur-sm' 
                            : 'bg-black/0 backdrop-blur-0'
                    }`}
                    onClick={closeModal}
                >
                    <div 
                        className={`bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 ${
                            modalAnimation 
                                ? 'scale-100 opacity-100 translate-y-0' 
                                : 'scale-95 opacity-0 translate-y-4'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header del modal */}
                        <div className="p-6 bg-gradient-to-r from-[#3CB9A5] to-emerald-600 rounded-t-2xl text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <Key className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Unirse a un Grupo</h3>
                                        <p className="text-white/90 text-sm">Ingresa el código proporcionado</p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Contenido del modal */}
                        <div className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Código del Grupo
                                    </label>
                                    <div className="relative">
                                        <IoQrCode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            value={codigoGrupo}
                                            onChange={(e) => setCodigoGrupo(e.target.value.toUpperCase())}
                                            placeholder="Ej: ABC123"
                                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#3CB9A5] focus:ring-2 focus:ring-[#3CB9A5] focus:ring-opacity-30 text-center text-lg font-bold tracking-wider"
                                            maxLength={10}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Pídele el código a tu tutor o coordinador
                                    </p>
                                </div>

                                {/* Mensaje de estado */}
                                {mensaje && (
                                    <div className={`p-3 rounded-lg text-center font-medium ${
                                        mensajeTipo === 'success' 
                                            ? 'bg-green-50 text-green-700 border border-green-200 animate-pulse-subtle'
                                            : mensajeTipo === 'error'
                                            ? 'bg-red-50 text-red-700 border border-red-200 animate-shake'
                                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                                    }`}>
                                        {mensaje}
                                    </div>
                                )}

                                <button
                                    onClick={handleUnirme}
                                    disabled={unirseLoading}
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#3CB9A5] to-emerald-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {unirseLoading ? (
                                        <>
                                            <FaSpinner className="animate-spin w-5 h-5" />
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            <FaClipboardCheck className="w-5 h-5" />
                                            Unirse al Grupo
                                        </>
                                    )}
                                </button>

                                <div className="text-center text-xs text-gray-500">
                                    Al unirte, serás asignado al tutor correspondiente
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal tutor (mostrar código) */}
            {mostrarModal && esTutor && (
                <div 
                    className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
                        modalAnimation 
                            ? 'bg-black/50 backdrop-blur-sm' 
                            : 'bg-black/0 backdrop-blur-0'
                    }`}
                    onClick={closeModal}
                >
                    <div 
                        className={`bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 ${
                            modalAnimation 
                                ? 'scale-100 opacity-100 translate-y-0' 
                                : 'scale-95 opacity-0 translate-y-4'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header del modal */}
                        <div className="p-6 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-t-2xl text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Código del Grupo</h3>
                                        <p className="text-white/90 text-sm">Comparte con tus alumnos</p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Contenido del modal */}
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 rounded-xl border-2 border-dashed border-gray-300 mb-4">
                                        <span className="text-4xl font-black tracking-wider text-gray-800">
                                            {grupos[0]?.codigo || 'Cargando...'}
                                        </span>
                                        <button
                                            onClick={() => {
                                                if (grupos[0]?.codigo) {
                                                    navigator.clipboard.writeText(grupos[0].codigo);
                                                    setCodigoCopiado(true);
                                                    setTimeout(() => setCodigoCopiado(false), 2000);
                                                }
                                            }}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            title={codigoCopiado ? "¡Copiado!" : "Copiar código"}
                                        >
                                            {codigoCopiado ? (
                                                <CheckCircle className="w-6 h-6 text-green-500" />
                                            ) : (
                                                <Copy className="w-6 h-6 text-gray-500" />
                                            )}
                                        </button>
                                    </div>
                                    
                                    <p className="text-gray-600 text-sm">
                                        Comparte este código con tus alumnos para que puedan unirse fácilmente a tu grupo.
                                    </p>
                                </div>

                                <button
                                    onClick={() => {
                                        if (grupos[0]?.codigo) {
                                            navigator.clipboard.writeText(grupos[0].codigo);
                                            setCodigoCopiado(true);
                                            setTimeout(() => setCodigoCopiado(false), 2000);
                                        }
                                    }}
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                                >
                                    {codigoCopiado ? (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            ¡Copiado!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-5 h-5" />
                                            Copiar Código
                                        </>
                                    )}
                                </button>
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
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                
                @keyframes bounceSubtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                
                @keyframes pulseSubtle {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.8; }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
                
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
                
                .animate-bounce-subtle {
                    animation: bounceSubtle 1s ease-in-out infinite;
                }
                
                .animate-pulse-subtle {
                    animation: pulseSubtle 1.5s ease-in-out infinite;
                }
                
                /* Line clamp para textos largos */
                .line-clamp-1 {
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 1;
                }
                
                /* Personalización del scrollbar */
                ::-webkit-scrollbar {
                    width: 8px;
                }
                
                ::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                
                ::-webkit-scrollbar-thumb {
                    background: linear-gradient(to bottom, #3CB9A5, #1f6b5e);
                    border-radius: 10px;
                }
                
                ::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(to bottom, #1f6b5e, #3CB9A5);
                }
            `}</style>
        </div>
    );
};

export default Grupos;