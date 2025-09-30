import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AccesosMaestros from './accesosMaestros'; // Header y navegación
import { FaSearch } from 'react-icons/fa';

// --- Componente para mostrar cada alumno ---
const AlumnoFicha = ({ nombre, matricula }) => {
  return (
    <div className="flex justify-between items-center p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
      {/* Información del alumno */}
      <div>
        <h4 className="text-xl font-medium text-gray-800">{nombre}</h4>
        <p className="text-sm text-gray-500">Matrícula: {matricula}</p>
      </div>

      {/* Enlace para ver ficha */}
      <Link
        to={`/alumnos/${matricula}/ficha`}
        className="text-blue-600 hover:text-blue-800 text-sm underline font-medium"
      >
        Ver ficha
      </Link>
    </div>
  );
};

// --- Componente principal de la pantalla de Lista de Alumnos ---
const ListaAlumnos = () => {
  const { codigoGrupo } = useParams(); // Captura el parámetro dinámico de la URL

  // Simulación de grupos según el código recibido
  const gruposSimulados = {
    G25123456: { nombre: 'Ingeniería Química', semestre: '7° Semestre' },
    G25234567: { nombre: 'Ingeniería Industrial', semestre: '5° Semestre' },
    G25345678: { nombre: 'ISC', semestre: '7° Semestre' },
  };

  // Si el código no coincide con ningún grupo, mostrar por defecto uno
  const grupoSeleccionado = gruposSimulados[codigoGrupo] || {
    nombre: 'Grupo Desconocido',
    semestre: '',
  };

  // Lista de alumnos estática
  const alumnosData = [
    { nombre: "Miguel Hidalgo Y Su Costilla", matricula: "2201F0654" },
    { nombre: "José María Morelos Y Un Pavón", matricula: "2201F05678" },
    { nombre: "Emiliano Y Su Zapato", matricula: "2201F05678" },
    { nombre: "Benito Pablo Juárez García", matricula: "2201F09999" },
    { nombre: "Francisco I Madero", matricula: "2201F00001" },
  ];

  const nombreUsuario = "Juan"; // Simulación del nombre de usuario
  const [busqueda, setBusqueda] = useState('');

  const tituloPagina = `Lista de alumnos – ${grupoSeleccionado.nombre} ${grupoSeleccionado.semestre}`;

  return (
    <>
      {/* Header y barra lateral */}
      <AccesosMaestros nombreUsuario={nombreUsuario} />
      {/* Ocultar el contenido extra dentro de AccesosMaestros */}
      <style jsx>{`main { display: none; }`}</style>

      {/* Contenido principal */}
      <div className="min-h-full bg-gray-50 p-4 md:p-8 animate-fadeIn relative z-10">

        {/* Título y botón para invitar alumno */}
        <div className="flex justify-between items-end mb-1">
          <h2 className="text-3xl font-bold text-gray-800">{tituloPagina}</h2>
          <Link
            to="/InvitarAlumno"
            className="text-blue-600 hover:text-blue-800 font-medium text-base md:text-lg underline"
          >
            Invitar Alumno
          </Link>
        </div>

        {/* Línea separadora amarilla */}
        <div className="w-full h-1 bg-yellow-400 mb-8"></div>

        {/* Barra de búsqueda */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Buscar alumno"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full p-4 pl-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm"
          />
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        {/* Lista de alumnos */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          {alumnosData.map((alumno, index) => (
            <AlumnoFicha
              key={index}
              nombre={alumno.nombre}
              matricula={alumno.matricula}
            />
          ))}
        </div>

        {/* Nota sobre el grupo (para depuración) */}
        {codigoGrupo && (
          <p className="mt-4 text-sm text-gray-500">
            Mostrando lista para el grupo con código: {codigoGrupo}
          </p>
        )}

        {/* Animación fadeIn */}
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

export default ListaAlumnos;
