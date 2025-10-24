import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import { FaSearch } from 'react-icons/fa';
import { FaRegCopy } from 'react-icons/fa6';
import NoEncontrado from './assets/NoEncontrado.jpg';

// Componente para mostrar cada alumno
const AlumnoFicha = ({ nombre, matricula, carrera, semestre, esTutor }) => (
  <div className="flex justify-between items-center p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
    <div>
      <h4 className="text-xl font-medium text-gray-800">{nombre}</h4>
      <p className="text-sm text-gray-500">Matrícula: {matricula}</p>
      <p className="text-sm text-gray-500">Carrera: {carrera}</p>
      <p className="text-sm text-gray-500">Semestre: {semestre}</p>

    </div>

    {esTutor && (
      <Link
        to={`/alumnos/${matricula}/ficha`}
        className="text-blue-600 hover:text-blue-800 text-sm underline font-medium"
      >
        Ver ficha
      </Link>
    )}
  </div>
);

const ListaAlumnos = () => {
  const { idGrupo } = useParams(); 
  const [codigoGrupo, setCodigoGrupo] = useState('');
  const [nombreGrupo, setNombreGrupo] = useState('');
  const [alumnosData, setAlumnosData] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [esTutor, setEsTutor] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (!usuarioGuardado) {
      setError('⚠️ No hay sesión activa. Inicia sesión de nuevo.');
      setLoading(false);
      return;
    }

    const user = JSON.parse(usuarioGuardado);
    if (!user || !user.accessToken) {
      setError('⚠️ Sesión inválida. Por favor, inicia sesión nuevamente.');
      setLoading(false);
      return;
    }

    setUsuario(user);
    setEsTutor(user.rol === 'tutor');

    const fetchAlumnos = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = user.accessToken;
        const res = await fetch(
          `https://apis-patu.onrender.com/api/alumnos/grupo/${idGrupo}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!res.ok) throw new Error('Error al cargar los alumnos');
        const data = await res.json();
        setAlumnosData(data.data || []);
      } catch (err) {
        setError(err.message || 'Error al cargar los datos.');
      } finally {
        setLoading(false);
      }
    };

      const fetchGrupo = async () => {
        try {
          const resGrupo = await fetch(`https://apis-patu.onrender.com/api/grupos/id/${idGrupo}`, {
            headers: {
              Authorization: `Bearer ${user.accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (!resGrupo.ok) throw new Error('Error al obtener datos del grupo');
          const dataGrupo = await resGrupo.json();

          if (dataGrupo.success && dataGrupo.data) {
            setCodigoGrupo(dataGrupo.data.codigo || '');
            setNombreGrupo(dataGrupo.data.nombre || 'Sin nombre'); 
          }
        } catch (err) {
          console.error('Error obteniendo datos del grupo:', err);
        }
      };


  if (idGrupo) {
    fetchAlumnos();
    fetchGrupo();
  }
}, [idGrupo]);

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn relative">
      <Navbar />

      <main className={`p-4 relative z-10 transition-all duration-300 ${mostrarModal ? 'blur-sm' : ''}`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-1">
            <h2 className="text-3xl font-bold text-gray-800">Lista de alumnos del grupo {nombreGrupo}</h2>


            {esTutor && (
              <button
                type="button"
                onClick={() => setMostrarModal(true)}
                className="text-blue-600 hover:text-blue-800 font-medium text-base md:text-lg underline"
              >
                Invitar alumnos
              </button>
            )}
          </div>

          <div className="w-full h-1 bg-yellow-400 mb-8"></div>

          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Buscar alumno por matrícula"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full p-4 pl-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          {loading && <p className="text-gray-600">Cargando alumnos...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!loading && !error && alumnosData.length === 0 && (
            <div className="flex flex-col items-center text-center py-10">
              <img src={NoEncontrado} alt="Sin alumnos" className="w-64 mb-6 opacity-80" />
              <p className="text-lg font-semibold text-gray-700 mb-6">Este grupo está vacío</p>
              {esTutor && (
                <button
                  type="button"
                  onClick={() => setMostrarModal(true)}
                  className="bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg transition duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Invitar alumnos
                </button>
              )}
            </div>
          )}

          {!loading && alumnosData.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              {alumnosData
              .filter((alumno) =>
                alumno.matricula.toLowerCase().includes(busqueda.toLowerCase()) ||
                (alumno.nombre_completo?.toLowerCase().includes(busqueda.toLowerCase()))
              )
                .map((alumno) => (
                  <AlumnoFicha
                    key={alumno.id_alumno}
                     nombre={alumno.nombre_completo || `${alumno.nombre} ${alumno.apellido_paterno || ''} ${alumno.apellido_materno || ''}`}
                    matricula={alumno.matricula}
                    carrera={alumno.carrera}
                    semestre={alumno.semestre}
                    esTutor={esTutor}
                  />
                ))}
            </div>
          )}
        </div>
      </main>

      {mostrarModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-white border-4 border-[#F1CC5A] rounded-2xl shadow-2xl p-8 w-96 text-center relative animate-fadeIn">
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

export default ListaAlumnos;
