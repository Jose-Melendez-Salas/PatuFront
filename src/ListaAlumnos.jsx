import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import { FaSearch } from 'react-icons/fa';

// Componente para mostrar cada alumno en la lista
const AlumnoFicha = ({ nombre, matricula }) => {
  return (
    <div className="flex justify-between items-center p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <div>
        <h4 className="text-xl font-medium text-gray-800">{nombre}</h4>
        <p className="text-sm text-gray-500">Matrícula: {matricula}</p>
      </div>
      {/* Link que lleva a la ficha individual del alumno */}
      <Link
        to={`/alumnos/${matricula}/ficha`}
        className="text-blue-600 hover:text-blue-800 text-sm underline font-medium"
      >
        Ver ficha
      </Link>
    </div>
  );
};

//Agregar acces tokens de las apis 

const ListaAlumnos = () => {
  // Sacamos el código del grupo desde la URL
  const { codigoGrupo } = useParams();

  // Estado donde guardaremos los alumnos traídos de la API
  const [alumnosData, setAlumnosData] = useState([]);
  // Estado para la búsqueda de alumnos
  const [busqueda, setBusqueda] = useState('');
  // Indicador de carga y error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Título dinámico según el grupo
  const tituloPagina = `Lista de alumnos – ${codigoGrupo || 'Grupo Desconocido'}`;

  useEffect(() => {
    const fetchAlumnos = async () => {
      try {
        setLoading(true);
        setError(null);

        // Aquí va la URL base + endpoint según tu API en Postman
        const res = await fetch(`https://apis-patu.onrender.com/api/grupos/${codigoGrupo}/alumnos`);
        if (!res.ok) throw new Error('Error al traer los alumnos');

        const data = await res.json();
        setAlumnosData(data); // Guardamos los alumnos
        setLoading(false);
      } catch (err) {
        console.error("Error al traer los alumnos:", err);
        setError("No se pudieron cargar los alumnos");
        setLoading(false);
      }
    };

    if (codigoGrupo) {
      fetchAlumnos();
    }
  }, [codigoGrupo]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar fijo arriba */}
      <Navbar />

      <main className="p-4 animate-fadeIn relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Título de la página y link para invitar alumno */}
          <div className="flex justify-between items-end mb-1">
            <h2 className="text-3xl font-bold text-gray-800">{tituloPagina}</h2>
            <Link
              to="/InvitarAlumno"
              className="text-blue-600 hover:text-blue-800 font-medium text-base md:text-lg underline"
            >
              Invitar Alumno
            </Link>
          </div>

          <div className="w-full h-1 bg-yellow-400 mb-8"></div>

          {/* Buscador de alumnos */}
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

          {/* Mensaje de carga o error */}
          {loading && <p className="text-gray-600">Cargando alumnos...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {/* Listado de alumnos */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            {alumnosData
              .filter(alumno =>
                alumno.nombre.toLowerCase().includes(busqueda.toLowerCase())
              )
              .map((alumno, index) => (
                <AlumnoFicha
                  key={index}
                  nombre={alumno.nombre}
                  matricula={alumno.matricula}
                />
            ))}
          </div>

          {/* Mostramos el código del grupo */}
          {codigoGrupo && (
            <p className="mt-4 text-sm text-gray-500">
              Mostrando lista para el grupo con código: {codigoGrupo}
            </p>
          )}
        </div>

        {/* Animación suave al entrar */}
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        `}</style>
      </main>
    </div>
  );
};

export default ListaAlumnos;


