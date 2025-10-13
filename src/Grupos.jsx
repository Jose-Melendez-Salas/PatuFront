import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar.jsx'; 
import { HiMiniUserGroup } from "react-icons/hi2";
import { IoAddCircleSharp } from "react-icons/io5"; // Se importa el icono de suma
import NoEncontrado from './assets/NoEncontrado.jpg'; 

// Colores para los cuadritos de los grupos
const colorPalette = [
    { border: "border-blue-400", text: "text-blue-500" },      // Azul
    { border: "border-orange-500", text: "text-orange-500" },  // Naranja
    { border: "border-green-500", text: "text-green-500" },   // Verde
    { border: "border-purple-400", text: "text-purple-500" },  // Moradito 
];

// Ícono del grupo (personitas) 
const IconoPersonas = ({ colorClase }) => (
    <HiMiniUserGroup className={`w-16 h-16 md:w-20 md:h-20 ${colorClase}`} />
);

// Tarjeta que muestra los datos del grupo 
const GrupoCard = ({ titulo, semestre, codigo, alumnos, colorClase, colorTextoClase }) => {
    return (
        <Link 
            to={`/ListaAlumnos/${codigo}`}  
            // Borde delgado (border-2) y sin padding externo. Rectangular.
            className={`p-0 rounded-xl border-2 ${colorClase} bg-white shadow-lg flex cursor-pointer 
                        hover:shadow-xl hover:scale-[1.01] transition-all duration-200 min-h-[140px]`} 
        >
            <div className="flex w-full">
                {/* Contenedor del Ícono 30% del ancho */}
                <div className="w-[30%] flex justify-center items-center p-4">
                    <IconoPersonas colorClase={colorTextoClase} />
                </div>
                {/* Contenedor del Texto 70%*/}
                <div className="w-[70%] flex flex-col justify-center p-4">
                    <h3 className="text-xl font-extrabold mb-1 text-gray-900 leading-tight">{titulo}</h3>
                    <p className="text-sm font-semibold text-gray-700">{semestre}</p>
                    
                    <p className="text-sm mt-2 font-medium text-gray-700">{alumnos} Alumnos</p>
                </div>
            </div>
        </Link>
    );
};

// Componente para el botón "Nuevo Grupo" 
const NuevoGrupoBoton = () => (
    <Link
        to="/NuevoGrupo"
        className="flex items-center text-sm font-bold text-gray-600 
                   hover:text-yellow-600 transition-colors duration-200 w-fit ml-auto"
    >
        <IoAddCircleSharp className="w-6 h-6 text-yellow-500 mr-1" /> {/* Icono de suma */}
        Nuevo Grupo
    </Link>
);


const Grupos = () => {
    const [grupos, setGrupos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [codigoGrupo, setCodigoGrupo] = useState('');

    const usuarioGuardado = localStorage.getItem('usuario');
    const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
    const esTutor = usuario?.rol === 'tutor';
    const esAlumno = usuario?.rol === 'alumno';

    useEffect(() => {
        if (!usuario) {
            setError("No hay sesión iniciada");
            setLoading(false);
            return;
        }

        const userId = usuario.id;
        const token = usuario.accessToken;

        const url = esTutor
            ? `https://apis-patu.onrender.com/api/grupos/tutor/${userId}`
            : `https://apis-patu.onrender.com/api/grupos/alumno/${userId}`;

        const fetchGrupos = async () => {
            try {
                const res = await fetch(url, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (res.status === 404) { 
                     setGrupos([]);
                     setLoading(false);
                     return;
                }
                
                if (!res.ok) throw new Error("Error en la respuesta de la API");
                
                const data = await res.json();
                
                if (data.success) {
                    
                    const dataArray = Array.isArray(data.data) ? data.data : (data.data ? [data.data] : []);
                    setGrupos(dataArray);
                } else {
                    setError(data.message || "No se pudieron cargar los grupos");
                }

            } catch (err) {
                console.error("Error cargando grupos:", err);
                setError("Error al cargar los grupos");
            } finally {
                setLoading(false);
            }
        };

        fetchGrupos();
    }, [usuario?.id, usuario?.accessToken, esTutor]); // Dependencias

    const handleUnirme = () => {
        // Lógica de unirse al grupo 
        if (!codigoGrupo.trim()) {
            alert("Por favor ingresa un código válido.");
            return;
        }
        alert(`Intentando unirse al grupo con código: ${codigoGrupo}`);
        setMostrarModal(false);
        setCodigoGrupo('');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="p-4 md:p-8 relative z-10 max-w-7xl mx-auto">
                {/* Título y rayita amarilla*/}
                <h2 className="text-4xl font-extrabold mb-1 text-gray-800">Tus Grupos</h2>
                <div className="w-full h-1 bg-yellow-400 mb-8"></div> 

                {loading && <p className="text-gray-600 mt-10 text-center">Cargando grupos...</p>}
                {error && <p className="text-red-600 mt-10 text-center">{error}</p>}

                {!loading && !error && (
                    <>
                        {grupos.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {grupos.map((grupo, index) => {
                                    const colors = colorPalette[index % colorPalette.length]; // Alternar colores de los cuadritos 
                                    return (
                                        <GrupoCard 
                                            key={grupo.id}
                                            titulo={grupo.nombre || "Sin nombre"} 
                                            semestre={grupo.semestre || "Semestre no definido"}
                                            codigo={grupo.codigo || "Sin código"}
                                            alumnos={grupo.num_alumnos || 0}
                                            colorClase={colors.border}
                                            colorTextoClase={colors.text}
                                        />
                                    );
                                })}
                            </div>
                        ) : (
                             // Mensaje de No Encontrado
                            <div className="flex flex-col items-center justify-center mt-10 text-center">
                                <img 
                                    src={NoEncontrado} 
                                    alt="Sin grupo" 
                                    className="w-72 h-72 object-contain mb-4 opacity-90"
                                />
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
                        
                        {/* BOTÓN DE NUEVO GRUPO*/}
                        {esTutor && <NuevoGrupoBoton />}
                    </>
                )}
            </main>

            {/* Modal para ingresar código */}
            {mostrarModal && esAlumno && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    {/* Fondo con blur */}
                    <div className="absolute inset-0 backdrop-blur-sm bg-transparent"></div>

                    <div className="bg-white border-4 border-[#F1CC5A] rounded-2xl shadow-2xl p-8 w-96 text-center relative animate-fadeIn">
                        {/* Botón de cerrar */}
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
                            placeholder="Ej. ABC123"
                            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3CB9A5] mb-4 text-center"
                        />

                        <button
                            onClick={handleUnirme}
                            className="bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white py-2 px-8 rounded-2xl font-semibold transition duration-200"
                        >
                            Unirme
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Grupos;

