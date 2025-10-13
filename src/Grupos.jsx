import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar.jsx'; 
import { HiMiniUserGroup } from "react-icons/hi2";
import NoEncontrado from './assets/NoEncontrado.jpg'; 

// Ícono del grupo (personitas)
const IconoPersonas = ({ colorClase }) => (
    <HiMiniUserGroup className={`w-20 h-20 mb-2 ${colorClase}`} />
);

// Tarjeta que muestra los datos del grupo
const GrupoCard = ({ titulo, semestre, codigo, alumnos, colorClase, colorTextoClase }) => {
    return (
        <Link 
            to={`/ListaAlumnos/${codigo}`}  
            className={`p-2 rounded-xl border-4 ${colorClase} bg-white shadow-lg flex cursor-pointer 
                        hover:shadow-xl hover:scale-[1.01] transition-all duration-200`}
        >
            <div className="flex w-full">
                <div className="w-1/3 flex justify-center items-center">
                    <IconoPersonas colorClase={colorTextoClase} />
                </div>
                <div className="w-2/3 flex flex-col justify-center pl-4">
                    <h3 className="text-xl font-bold mb-1 text-gray-900">{titulo}</h3>
                    <p className="text-sm font-semibold text-gray-700">{semestre}</p>
                    <p className="text-xs text-gray-500">{codigo}</p>
                    <p className="text-sm mt-2 font-medium text-gray-700">{alumnos} Alumnos</p>
                </div>
            </div>
        </Link>
    );
};

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

        fetch(url, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
            .then(res => {
                if (!res.ok) throw new Error("Error en la respuesta de la API");
                return res.json();
            })
            .then(data => {
                if (data.success) {
                    setGrupos(data.data);
                } else {
                    setError(data.message || "No se pudieron cargar los grupos");
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error cargando grupos:", err);
                setError("Error al cargar los grupos");
                setLoading(false);
            });
    }, []);

    const handleUnirme = () => {
        if (!codigoGrupo.trim()) {
            alert("Por favor ingresa un código válido.");
            return;
        }

        // Aquí puedes hacer la llamada al endpoint para unirse a un grupo
        alert(`Intentando unirse al grupo con código: ${codigoGrupo}`);
        setMostrarModal(false);
        setCodigoGrupo('');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="p-4 md:p-8 animate-fadeIn relative z-10">
                <h2 className="text-3xl font-bold mb-1 text-gray-800">Tus Grupos</h2>
                <div className="w-full h-1 bg-yellow-400 mb-8"></div>

                {loading && <p className="text-gray-600">Cargando grupos...</p>}
                {error && <p className="text-red-600">{error}</p>}

                {grupos.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {grupos.map(grupo => (
                            <GrupoCard 
                                key={grupo.id}
                                titulo={grupo.nombre || "Sin nombre"} 
                                semestre={grupo.semestre || "Semestre no definido"}
                                codigo={grupo.codigo || "Sin código"}
                                alumnos={grupo.num_alumnos || 0}
                                colorClase="border-blue-400"
                                colorTextoClase="text-blue-500"
                            />
                        ))}
                    </div>
                ) : (
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

                        {esTutor && (
                            <Link
                                to="/NuevoGrupo"
                                className="bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white py-2 px-6 rounded-2xl font-semibold transition duration-200"
                            >
                                Crear nuevo grupo
                            </Link>
                        )}

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
            </main>

            {/* Modal para ingresar código */}
            {mostrarModal && esAlumno && (
                <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
                    <div className="bg-white border-4 border-[#F1CC5A] rounded-2xl shadow-2xl p-8 w-96 text-center relative animate-fadeIn scale-100 transition-transform duration-300 ease-out">
                        
                        {/* Botón de cerrar */}
                        <button
                            onClick={() => setMostrarModal(false)}
                            className="absolute top-3 left-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
                        >
                            ×
                        </button>

                        {/* Título */}
                        <h3 className="text-lg text-gray-800 font-semibold mb-4">
                            Ingresa el código de tu grupo
                        </h3>

                        {/* Campo para ingresar código */}
                        <input
                            type="text"
                            value={codigoGrupo}
                            onChange={(e) => setCodigoGrupo(e.target.value)}
                            placeholder="Ej. ABC123"
                            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3CB9A5] mb-4 text-center"
                        />

                        {/* Botón para unirse */}
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

