import React from 'react';
import { Link } from 'react-router-dom';
import AccesosMaestros from './accesosMaestros';
import { HiMiniUserGroup } from "react-icons/hi2";

// Ícono de Personas
const IconoPersonas = ({ colorClase }) => (
    <HiMiniUserGroup className={`w-20 h-20 mb-2 ${colorClase}`} />
);

// Cada tarjeta representa un grupo con su ícono y datos (nombre, semestre, código, alumnos)
const GrupoCard = ({ titulo, semestre, codigo, alumnos, colorClase, colorTextoClase }) => {
    return (
        // Al hacer clic, redirige a la pantalla ListaAlumnos con el código del grupo
        <Link 
    to={`/ListaAlumnos/${codigo}`}  // codigo es G25123456, G25234567, etc.
    className={`p-2 rounded-xl border-4 ${colorClase} bg-white shadow-lg flex cursor-pointer 
                hover:shadow-xl hover:scale-[1.01] transition-all duration-200`}
>

            {/* Contenedor horizontal principal de la tarjeta, de colores */}
            <div className="flex w-full">
                {/* ícono del grupo  */}
                <div className="w-1/3 flex justify-center items-center">
                    <IconoPersonas colorClase={colorTextoClase} />
                </div>

                {/* información del grupo*/}
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
    // Datos de ejemplo de los grupos
    const gruposData = [
        {
            id: 1,
            titulo: 'Ingeniería Química',
            semestre: '7° Semestre',
            codigo: 'G25123456',
            alumnos: 25,
            colorClase: 'border-blue-400',
            colorTextoClase: 'text-blue-500'
        },
        {
            id: 2,
            titulo: 'Ingeniería Industrial',
            semestre: '5° Semestre',
            codigo: 'G25234567',
            alumnos: 32,
            colorClase: 'border-orange-400',
            colorTextoClase: 'text-orange-500'
        },
        {
            id: 3,
            titulo: 'ISC',
            semestre: '7° Semestre',
            codigo: 'G25345678',
            alumnos: 20,
            colorClase: 'border-green-400',
            colorTextoClase: 'text-green-600'
        },
    ];

    const nombreUsuario = "Juan"; // Nombre que se muestra en el header

    return (
        <>
            {/* Header y barra lateral */}
            <AccesosMaestros nombreUsuario={nombreUsuario} />

            {/* Ocultar el contenido extra del main dentro de AccesosMaestros */}
            <style jsx>{`
                main {
                    display: none;
                }
            `}</style>

            {/* Contenido principal*/}
            <div className="min-h-full bg-gray-50 p-4 md:p-8 animate-fadeIn relative z-10">
                
                {/* Título*/}
                <h2 className="text-3xl font-bold mb-1 text-gray-800">Tus Grupos</h2>
                
                {/* Línea amarilla */}
                <div className="w-[100%] h-1 bg-yellow-400 mb-8 mx-auto"></div>

                {/* Contenedor de las tarjetas*/}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {gruposData.map(grupo => (
                        <GrupoCard 
                            key={grupo.id}
                            titulo={grupo.titulo}
                            semestre={grupo.semestre}
                            codigo={grupo.codigo}
                            alumnos={grupo.alumnos}
                            colorClase={grupo.colorClase}
                            colorTextoClase={grupo.colorTextoClase}
                        />
                    ))}
                </div>

                {/* Enlace para crear un nuevo grupo */}
                <div className="mt-8 text-right">
                    <Link 
                        to="/NuevoGrupo" 
                        className="text-blue-600 hover:text-blue-800 font-medium text-base md:text-lg underline"
                    >
                        Nuevo Grupo
                    </Link>
                </div>

                {/* Estilos de animación */}
                <style jsx>{`
                    @keyframes fadeIn { 
                        from { opacity: 0; transform: translateY(10px); } 
                        to { opacity: 1; transform: translateY(0); } 
                    }
                    .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
                `}</style>
            </div>
        </>
    );
};

export default Grupos;
