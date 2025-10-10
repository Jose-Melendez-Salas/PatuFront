import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import { FaSearch } from 'react-icons/fa';
import NoEncontrado from './assets/NoEncontrado.jpg'; // ✅ Ruta corregida

// ✅ Componente para mostrar cada alumno
const AlumnoFicha = ({ nombre, matricula }) => (
  <div className="flex justify-between items-center p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
    <div>
      <h4 className="text-xl font-medium text-gray-800">{nombre}</h4>
      <p className="text-sm text-gray-500">Matrícula: {matricula}</p>
    </div>
    <Link
      to={`/alumnos/${matricula}/ficha`}
      className="text-blue-600 hover:text-blue-800 text-sm underline font-medium"
    >
      Ver ficha
    </Link>
  </div>
);

const ListaAlumnos = () => {
  const { codigoGrupo } = useParams(); // ✅ recibe el parámetro de la URL

  const [alumnosData, setAlumnosData] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tituloPagina = `Lista de alumnos – ${codigoGrupo || 'Grupo desconocido'}`;

  useEffect(() => {
    const fetchAlumnos = async () => {
      try {
        setLoading(true);
        setError(null);

        const usuarioGuardado = localStorage.getItem('usuario');
        if (!usuarioGuardado) {
          setError('⚠️ No hay sesión activa. Inicia sesión de nuevo.');
          setLoading(false);
          return;
        }

        const usuario = JSON.parse(usuarioGuardado);
        const token = usuario.accessToken;

        // ✅ URL corregida con el parámetro codigoGrupo
        const res = await fetch(
          `https://apis-patu.onrender.com/api/grupo-alumnos/grupo/${codigoGrupo}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!res.ok) throw new Error('Error al traer los alumnos');

        const data = await res.json();
        console.log('Respuesta API:', data);

        // ✅ La API devuelve IDs; los mostramos temporalmente
        setAlumnosData(data.data || []);
      } catch (err) {
        console.error('Error al traer los alumnos:', err);
        setError(' Sin alumnos aun.');
      } finally {
        setLoading(false);
      }
    };

    if (codigoGrupo) fetchAlumnos();
  }, [codigoGrupo]);

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      <Navbar />

      <main className="p-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* ✅ Título y botón */}
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

          {/* ✅ Buscador */}
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

          {/* ✅ Mensajes de estado */}
          {loading && <p className="text-gray-600">Cargando alumnos...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {/* ✅ Grupo vacío */}
          {!loading && !error && alumnosData.length === 0 && (
            <div className="flex flex-col items-center text-center py-10">
              <img
                src={NoEncontrado}
                alt="Sin alumnos"
                className="w-64 mb-6 opacity-80"
              />
              <p className="text-lg font-semibold text-gray-700 mb-6">
                Este grupo está vacío
              </p>
              <Link to="/InvitarAlumno">
                <button
                  type="button"
                  className="bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg transition duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Invitar alumnos
                </button>
              </Link>
            </div>
          )}

          {/* ✅ Lista de alumnos */}
          {!loading && alumnosData.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              {alumnosData
                .filter((alumno) =>
                  alumno.id_alumno
                    ?.toString()
                    .toLowerCase()
                    .includes(busqueda.toLowerCase())
                )
                .map((alumno, index) => (
                  <AlumnoFicha
                    key={index}
                    nombre={`Alumno ${alumno.id_alumno}`}
                    matricula={alumno.id_alumno}
                  />
                ))}
            </div>
          )}

          {codigoGrupo && (
            <p className="mt-4 text-sm text-gray-500">
              Mostrando lista para el grupo con código: {codigoGrupo}
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default ListaAlumnos;
