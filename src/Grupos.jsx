import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar.jsx'; 
import { HiMiniUserGroup } from "react-icons/hi2";

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
                {/* Ícono del grupo */}
                <div className="w-1/3 flex justify-center items-center">
                    <IconoPersonas colorClase={colorTextoClase} />
                </div>

                {/* Datos del grupo */}
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
    const [grupos, setGrupos] = useState([]); // Guardamos los grupos que trae la API
    const [loading, setLoading] = useState(true); // Indicador de carga
    const [error, setError] = useState(null); // Mensaje de error si falla

    // ID de tutor temporal, luego se reemplaza con el del usuario que hace login
    const userId = 1;

    useEffect(() => {
        // Llamada a la API para traer los grupos del tutor
        fetch(`https://apis-patu.onrender.com/api/grupos/por-tutor/${userId}`)
            .then(res => {
                if (!res.ok) throw new Error("Error en la respuesta de la API");
                return res.json();
            })
            .then(data => {
                setGrupos(data); // Guardamos los grupos en el estado
                setLoading(false); // Ya no está cargando
            })
            .catch(err => {
                console.error("Error cargando grupos:", err);
                setError("Error al cargar los grupos");
                setLoading(false);
            });
    }, [userId]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header que ocupa todo el ancho */}
            <Navbar />

            {/* Contenido principal */}
            <main className="p-4 md:p-8 animate-fadeIn relative z-10">
                <h2 className="text-3xl font-bold mb-1 text-gray-800">Tus Grupos</h2>
                <div className="w-full h-1 bg-yellow-400 mb-8"></div>

                {/* Indicadores de carga o error */}
                {loading && <p className="text-gray-600">Cargando grupos...</p>}
                {error && <p className="text-red-600">{error}</p>}

                {/* Lista de grupos */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {grupos.map(grupo => (
                        <GrupoCard 
                            key={grupo.id}
                            titulo={grupo.nombre || "Sin nombre"} 
                            semestre={grupo.semestre || "Semestre no definido"}
                            codigo={grupo.codigo_grupo || "Sin código"}
                            alumnos={grupo.num_alumnos || 0}
                            colorClase="border-blue-400"
                            colorTextoClase="text-blue-500"
                        />
                    ))}
                </div>

                {/* Enlace para crear un grupo nuevo */}
                <div className="mt-8 text-right">
                    <Link 
                        to="/NuevoGrupo" 
                        className="text-blue-600 hover:text-blue-800 font-medium text-base md:text-lg underline"
                    >
                        Nuevo Grupo
                    </Link>
                </div>
            </main>

            {/* Animación de entrada */}
            <style jsx>{`
                @keyframes fadeIn { 
                    from { opacity: 0; transform: translateY(10px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
                .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
            `}</style>
        </div>
    );
};

export default Grupos;
