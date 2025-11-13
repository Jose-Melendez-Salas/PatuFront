import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import { HiMiniUserGroup } from "react-icons/hi2";
import { IoAddCircleSharp } from "react-icons/io5";
import { FaRegCopy } from 'react-icons/fa6';
import NoEncontrado from './assets/NoEncontrado.jpg';

// Colores de las tarjetas
const colorPalette = [
    { border: "border-blue-400", text: "text-blue-500" },
    { border: "border-orange-500", text: "text-orange-500" },
    { border: "border-green-500", text: "text-green-500" },
    { border: "border-purple-400", text: "text-purple-500" },
];

// Ícono de grupo
const IconoPersonas = ({ colorClase }) => (
    <HiMiniUserGroup className={`w-16 h-16 md:w-20 md:h-20 ${colorClase}`} />
);

// Tarjeta de grupo
const GrupoCard = ({ id, titulo, semestre, codigo, alumnos, colorClase, colorTextoClase }) => (
    <Link
        to={`/ListaAlumnos/${id}`} 
        className={`p-0 rounded-xl border-2 ${colorClase} bg-white shadow-lg flex cursor-pointer 
                    hover:shadow-xl hover:scale-[1.01] transition-all duration-200 min-h-[140px]`}
    >

        <div className="flex w-full">
            <div className="w-[30%] flex justify-center items-center p-4">
                <IconoPersonas colorClase={colorTextoClase} />
            </div>
            <div className="w-[70%] flex flex-col justify-center p-4">
                <h3 className="text-xl font-extrabold mb-1 text-gray-900 leading-tight">{titulo}</h3>
                <p className="text-sm font-semibold text-gray-700">{semestre}</p>
               {/* <p className="text-sm mt-2 font-medium text-gray-700">{alumnos} Alumnos</p>  */}

            </div>
        </div>
    </Link>
);

// Botón de crear grupo (solo Coordinador)
const NuevoGrupoBoton = () => (
    <Link
        to="/NuevoGrupo"
        className="flex items-center text-sm font-bold text-gray-600 
                   hover:text-yellow-600 transition-colors duration-200 w-fit ml-auto"
    >
        <IoAddCircleSharp className="w-6 h-6 text-yellow-500 mr-1" />
        Nuevo Grupo
    </Link>
);

const Grupos = () => {
    const [grupos, setGrupos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [codigoGrupo, setCodigoGrupo] = useState('');
    const [mensaje, setMensaje] = useState('');
    const usuarioGuardado = localStorage.getItem('usuario');
    const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
    const esTutor = usuario?.rol === 'tutor';
    const esAlumno = usuario?.rol === 'alumno';
    const esCoordinador = usuario?.rol === 'admin';

    //  Cargar grupos según rol
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

                if (esTutor) {
                    // Mantiene la lógica de tutor
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

                }else if (esCoordinador) {
                    //  Aquí usamos GET /grupos para coordinador
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

                } else if (esAlumno) {
                    //  Aquí usamos únicamente GET /alumnos/:id
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

                        // GET /grupos/id/:id_grupo
                        const resGrupo = await fetch(`https://apis-patu.onrender.com/api/grupos/id/${idGrupo}`, {
                            headers: {
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                            }
                        });

                        if (!resGrupo.ok) throw new Error("Error obteniendo datos del grupo");
                        const dataGrupo = await resGrupo.json();

                        if (dataGrupo.success && dataGrupo.data) {
                            gruposData = [dataGrupo.data];
                        }
                    }
                }

                setGrupos(gruposData);
            } catch (err) {
                console.error("Error cargando grupos:", err);
                setError("Error al cargar los grupos");
            } finally {
                setLoading(false);
            }
        };

        fetchGrupos();
    }, [usuario?.id, usuario?.accessToken, esTutor, esAlumno]);


    // Función para que el alumno se una a un grupo
    const handleUnirme = async () => {
        if (!codigoGrupo.trim()) {
            setMensaje(" Ingresa un código de grupo válido.");
            return;
        }

        try {
            setMensaje(" Buscando grupo...");
            const token = usuario.accessToken;
            const idAlumno = usuario.id;

            // 1 GET grupo por código
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
                setMensaje(" No se encontró un grupo con ese código.");
                console.error("Error GET grupo:", dataGrupo);
                return;
            }

            const { id: id_grupo, id_tutor } = dataGrupo.data;
            console.log(" Grupo encontrado:", { id_grupo, id_tutor });

            setMensaje(" Asignando grupo y tutor...");

            // 2️ PATCH actualizar alumno con grupo y tutor
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
                setMensaje(` ${dataAsignar.message || "No se pudo unir al grupo."}`);
                console.error("Error PATCH alumno:", dataAsignar);
                return;
            }

            console.log(" Asignación exitosa:", dataAsignar);
            setMensaje(" ¡Te has unido al grupo correctamente!");

            setTimeout(() => {
                setMostrarModal(false);
                window.location.reload();
            }, 1500);

        } catch (error) {
            console.error("Error inesperado al unirse al grupo:", error);
            setMensaje(" Error al conectarse con el servidor.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="p-4 md:p-8 relative z-10 max-w-7xl mx-auto">
                <h2 className="text-4xl font-extrabold mb-1 text-gray-800">Tus Grupos</h2>
                <div className="w-full h-1 bg-yellow-400 mb-8"></div>

                {loading && <p className="text-gray-600 mt-10 text-center">Cargando grupos...</p>}
                {error && <p className="text-red-600 mt-10 text-center">{error}</p>}

                {!loading && !error && (
                    <>
                        {grupos.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {grupos.map((grupo, index) => {
                                const colors = colorPalette[index % colorPalette.length];
                                return (
                                    <GrupoCard
                                    key={grupo.id}
                                    id={grupo.id} 
                                    titulo={grupo.nombre || "Sin nombre"}
                                    semestre={grupo.semestre || "Semestre no definido"}
                                    codigo={grupo.codigo || "Sin código"}
                                    //alumnos={grupo.num_alumnos || 0}
                                    colorClase={colors.border}
                                    colorTextoClase={colors.text}
                                    />
                                );
                                })}

                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center mt-10 text-center">
                                <img src={NoEncontrado} alt="Sin grupo" className="w-72 h-72 object-contain mb-4 opacity-90" />
                                <p className="text-gray-600 text-lg font-medium mb-6">
                                    {esTutor
                                        ? "Aún no has creado ningún grupo"
                                        : "Aún no te has inscrito a un grupo"}
                                </p>

                                {esAlumno && (
                                    <button
                                        onClick={() => setMostrarModal(true)}
                                        className="bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white py-2 px-6 rounded-2xl font-semibold transition duration-200"
                                    >
                                        Ingresar código de grupo
                                    </button>
                                )}
                            </div>
                        )}
             {/* Visibilidad del botón */}
                        {esCoordinador && <NuevoGrupoBoton />}
                    </>
                )}
            </main>

            {/* Modal para alumno */}
            {mostrarModal && esAlumno && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 backdrop-blur-sm bg-transparent"></div>

                    <div className="bg-white border-4 border-[#F1CC5A] rounded-2xl shadow-2xl p-8 w-96 text-center relative animate-fadeIn">
                        <button
                            onClick={() => setMostrarModal(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                        >
                            ×
                        </button>

                        <h3 className="text-lg text-gray-800 font-semibold mb-4">
                            Ingresa el código de tu grupo
                        </h3>

                        <input
                            type="text"
                            value={codigoGrupo}
                            onChange={(e) => setCodigoGrupo(e.target.value)}
                            placeholder="Ej. 123 o ABC"
                            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3CB9A5] mb-4 text-center"
                        />

                        <button
                            onClick={handleUnirme}
                            className="bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white py-2 px-8 rounded-2xl font-semibold transition duration-200"
                        >
                            Unirme
                        </button>

                        {mensaje && (
                            <p className="mt-4 text-sm font-medium text-gray-700">{mensaje}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Modal para tutor (compartir código) */}
            {mostrarModal && esTutor && (
                <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
                    <div className="bg-white border-4 border-[#F1CC5A] rounded-2xl shadow-2xl p-8 w-96 text-center relative animate-fadeIn scale-100 transition-transform duration-300 ease-out">
                        <button
                            onClick={() => setMostrarModal(false)}
                            className="absolute top-3 left-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
                        >
                            ×
                        </button>

                        <h3 className="text-sm text-gray-500 font-semibold mb-2">
                            Código del grupo
                        </h3>

                        <div className="flex items-center justify-center gap-2 mb-3">
                            <p className="text-4xl font-extrabold text-[#4F3E9B]">{codigoGrupo || 'Cargando...'}</p>
                            <FaRegCopy
                                className="text-gray-500 hover:text-gray-700 cursor-pointer text-2xl"
                                onClick={() => {
                                    navigator.clipboard.writeText(codigoGrupo || '');
                                    alert('Código copiado al portapapeles');
                                }}
                            />
                        </div>

                        <p className="text-gray-600 text-sm">
                            Comparte este código con tus alumnos para que puedan unirse a tu grupo fácilmente.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Grupos;