import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import { FaSearch } from 'react-icons/fa';
import { FaRegCopy } from 'react-icons/fa6';
import NoEncontrado from './assets/NoEncontrado.jpg';

// Componente para mostrar cada alumno
const AlumnoFicha = ({ nombre, matricula, carrera, semestre, puedeVerFicha }) => (
  <div className="flex justify-between items-center p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
    <div>
      <h4 className="text-xl font-medium text-gray-800">{nombre}</h4>
      <p className="text-sm text-gray-500">Matrícula: {matricula}</p>
      <p className="text-sm text-gray-500">Carrera: {carrera}</p>
      <p className="text-sm text-gray-500">Semestre: {semestre}</p>
    </div>

    {puedeVerFicha && (
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
  const [resultadoBusqueda, setResultadoBusqueda] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [idTutorGrupo, setIdTutorGrupo] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [esTutor, setEsTutor] = useState(false);
  const [esCoordinador, setEsCoordinador] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mensajeAccion, setMensajeAccion] = useState('');

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (!usuarioGuardado) {
      setError('No hay sesión activa. Inicia sesión de nuevo.');
      setLoading(false);
      return;
    }

    const user = JSON.parse(usuarioGuardado);
    if (!user || !user.accessToken) {
      setError('Sesión inválida. Por favor, inicia sesión nuevamente.');
      setLoading(false);
      return;
    }

    setUsuario(user);
    setEsTutor(user.rol === 'tutor');
    setEsCoordinador(user.rol === 'admin');

    const fetchAlumnos = async () => {
      try {
        setLoading(true);
        const res = await fetch(`https://apis-patu.onrender.com/api/alumnos/grupo/${idGrupo}`, {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
            'Content-Type': 'application/json',
          },
        });

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
           setIdTutorGrupo(dataGrupo.data.id_tutor || null);
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

  // 🔎 Buscar alumno por matrícula (solo coordinador)
  const handleBuscarAlumno = async () => {
    if (!busqueda.trim()) {
      setResultadoBusqueda(null);
      return;
    }

    try {
      setMensajeAccion('Buscando alumno...');
      const res = await fetch(`https://apis-patu.onrender.com/api/alumnos/matricula/${busqueda}`, {
        headers: {
          Authorization: `Bearer ${usuario.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      if (res.ok && data.success && data.data) {
        setResultadoBusqueda(data.data);
        setMensajeAccion('');
      } else {
        setResultadoBusqueda(null);
        setMensajeAccion('No se encontró ningún alumno con esa matrícula.');
      }
    } catch (err) {
      console.error('Error al buscar alumno:', err);
      setMensajeAccion('Error al conectar con el servidor.');
    }
  };

  // ➕ Agregar alumno al grupo (solo coordinador)
  const handleAgregarAlumno = async (alumno) => {
    try {
      setMensajeAccion('Agregando alumno al grupo...');
      const body = { id_tutor: alumno.id_tutor || null, id_grupo: parseInt(idGrupo) };

      const res = await fetch(`https://apis-patu.onrender.com/api/alumnos/${alumno.id_usuario}/asignacion`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${usuario.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMensajeAccion('Alumno agregado correctamente ');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMensajeAccion(data.message || 'No se pudo agregar al grupo.');
      }
    } catch (err) {
      console.error('Error al agregar alumno:', err);
      setMensajeAccion('Error al conectar con el servidor.');
    }
    console.log("Alumno recibido:", alumno);

  };

const handleEliminarGrupo = async () => {
  if (!window.confirm("¿Seguro que deseas eliminar este grupo? Esta acción no se puede deshacer.")) {
    return;
  }

  try {
    const res = await fetch(
      `https://apis-patu.onrender.com/api/grupos/eliminar/${idGrupo}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${usuario.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    if (res.ok && data.success) {
      alert("Grupo eliminado correctamente.");
      window.location.href = "/Grupos"; // o la ruta a donde quieres regresar
    } else {
      alert(data.message || "No se pudo eliminar el grupo.");
    }
  } catch (err) {
    console.error("Error eliminando grupo:", err);
    alert("Error al conectar con el servidor.");
  }
};




  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn relative">
      <Navbar />

      <main className={`p-4 relative z-10 transition-all duration-300 ${mostrarModal ? 'blur-sm' : ''}`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-1">
            <h2 className="text-3xl font-bold text-gray-800">Lista de alumnos del grupo {nombreGrupo}</h2>
            {esCoordinador && (
              <button
                onClick={handleEliminarGrupo}
                className="bg-[#8C1F2F] hover:bg-[#8C1F2F] text-white font-semibold px-4 py-2 rounded-xl ml-4"
              >
                 Eliminar grupo
              </button>
)}

        {/*    
            Boton de invitar alumnos solo para tutores opcional

            {esTutor && (
              <button
                type="button"
                onClick={() => setMostrarModal(true)}
                className="text-blue-600 hover:text-blue-800 font-medium text-base md:text-lg underline"
              >
                Invitar alumnos
              </button>
            )}
        */}

          {esCoordinador  && idGrupo && (
            <Link
              to={`/ReportesGrupo/${idGrupo}`}
              className="text-[#3C7DD9] hover:text-blue-700 underline mt-4 text-lg text-right font-semibold"
            >
              Ver reportes del grupo
            </Link>
          )}

          </div>

          <div className="w-full h-1 bg-[#C7952C]  mb-8"></div>

          {/* 🔍 Buscador solo visible para coordinador */}
          {esCoordinador && (
            <div className="mb-8 bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Buscar alumno por matrícula</h3>
              <div className="flex gap-2 items-center">
                <div className="relative flex-grow">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ej. 202100123"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full p-3 pl-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E9DBCD]"
                  />
                </div>
                <button
                  onClick={handleBuscarAlumno}
                  className="bg-[#E4CD87] hover:bg-[#E9DBCD] text-black px-6 py-3 rounded-xl font-semibold"
                >
                  Buscar
                </button>
              </div>

              {mensajeAccion && <p className="mt-3 text-gray-600">{mensajeAccion}</p>}

              {/* Resultado de búsqueda */}
              {resultadoBusqueda && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50 shadow-sm">
                  <p className="text-lg font-bold text-gray-800">{resultadoBusqueda.nombre_completo}</p>
                  <p className="text-sm text-gray-600">Matrícula: {resultadoBusqueda.matricula}</p>
                  <p className="text-sm text-gray-600">Carrera: {resultadoBusqueda.carrera}</p>
                  <p className="text-sm text-gray-600 mb-2">Semestre: {resultadoBusqueda.semestre}</p>

                  <div className="flex gap-3">
                    <Link
                      to={`/alumnos/${resultadoBusqueda.matricula}/ficha`}
                      className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
                    >
                      Ver ficha
                    </Link>
                    <button
                      onClick={() => handleAgregarAlumno(resultadoBusqueda)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-4 py-2 rounded-xl text-sm"
                    >
                      ➕ Agregar al grupo
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {loading && <p className="text-gray-600">Cargando alumnos...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!loading && alumnosData.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              {alumnosData.map((alumno) => (
                <AlumnoFicha
                  key={alumno.id_usuario || alumno.id || alumno.matricula}
                  nombre={alumno.nombre_completo || `${alumno.nombre} ${alumno.apellido_paterno || ''} ${alumno.apellido_materno || ''}`}
                  matricula={alumno.matricula}
                  carrera={alumno.carrera}
                  semestre={alumno.semestre}
                  puedeVerFicha={esTutor || esCoordinador}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal para tutor */}
      {mostrarModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-white border-4 border-[#F1CC5A] rounded-2xl shadow-2xl p-8 w-96 text-center relative animate-fadeIn">
            <button
              onClick={() => setMostrarModal(false)}
              className="absolute top-3 left-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ×
            </button>

            <h3 className="text-sm text-gray-500 font-semibold mb-2">Código del grupo</h3>

            <div className="flex items-center justify-center gap-2 mb-3 relative">
              <p className="text-4xl font-extrabold text-[#4F3E9B]">{codigoGrupo || 'Cargando...'}</p>
              <FaRegCopy
                className="text-gray-500 hover:text-gray-700 cursor-pointer text-2xl"
                onClick={copiarCodigo}
              />

              {/* 🟣 Mini ventanita de "copiado" */}
              {copiado && (
                <div className="absolute right-[-90px] bg-gray-800 text-white text-xs py-1 px-3 rounded-lg shadow-lg animate-fadeIn">
                  Copiado ✓
                </div>
              )}
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
