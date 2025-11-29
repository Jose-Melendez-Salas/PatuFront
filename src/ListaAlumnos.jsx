import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import { FaSearch } from 'react-icons/fa';
import { FaRegCopy } from 'react-icons/fa6';
// import NoEncontrado from './assets/NoEncontrado.jpg'; // Descomentar si se usa

// --- COMPONENTE FICHA MEJORADO ---
const AlumnoFicha = ({ nombre, matricula, carrera, semestre, puedeVerFicha }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors gap-3">
    {/* Info del alumno */}
    <div className="w-full sm:w-auto">
      <h4 className="text-lg sm:text-xl font-medium text-gray-800 break-words">{nombre}</h4>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
        <p className="text-sm text-gray-500"><span className="font-semibold">Mat:</span> {matricula}</p>
        <p className="text-sm text-gray-500"><span className="font-semibold">Carr:</span> {carrera}</p>
        <p className="text-sm text-gray-500"><span className="font-semibold">Sem:</span> {semestre}</p>
      </div>
    </div>

    {/* Botón de acción */}
    {puedeVerFicha && (
      <Link
        to={`/alumnos/${matricula}/ficha`}
        className="text-blue-600 hover:text-blue-800 text-sm underline font-medium mt-2 sm:mt-0 self-end sm:self-center"
      >
        Ver ficha
      </Link>
    )}
  </div>
);

const ListaAlumnos = () => {
  const { idGrupo } = useParams();
  // Estados originales...
  const [nombreTutor, setNombreTutor] = useState("");
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
  
  // Asumo que tienes estas variables de estado por el JSX original, 
  // si no las tienes, agrégalas al useState:
  const [copiado, setCopiado] = useState(false); 

  const copiarCodigo = () => {
     navigator.clipboard.writeText(codigoGrupo);
     setCopiado(true);
     setTimeout(() => setCopiado(false), 2000);
  };

  useEffect(() => {
    // ... Tu lógica del useEffect se mantiene igual ...
    const usuarioGuardado = localStorage.getItem('usuario');
    if (!usuarioGuardado) {
      setError('No hay sesión activa. Inicia sesión de nuevo.');
      setLoading(false);
      return;
    }

    const user = JSON.parse(usuarioGuardado);
    if (!user || !user.accessToken) {
      setError('Sesión inválida.');
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
          headers: { Authorization: `Bearer ${user.accessToken}`, 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error('Error al cargar los alumnos');
        const data = await res.json();
        setAlumnosData(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchGrupo = async () => {
         // ... Tu lógica de fetchGrupo se mantiene igual ...
         // (Resumida para brevedad de la respuesta, pero el código lógico no cambia)
         try {
            const resGrupo = await fetch(`https://apis-patu.onrender.com/api/grupos/id/${idGrupo}`, {
                headers: { Authorization: `Bearer ${user.accessToken}`, 'Content-Type': 'application/json' },
            });
            const dataGrupo = await resGrupo.json();
            if (dataGrupo.success && dataGrupo.data) {
                setCodigoGrupo(dataGrupo.data.codigo || '');
                setNombreGrupo(dataGrupo.data.nombre || 'Sin nombre');
                setIdTutorGrupo(dataGrupo.data.id_tutor || null);
                
                // Fetch simple del tutor si existe
                if (dataGrupo.data.id_tutor) {
                    fetch(`https://apis-patu.onrender.com/api/tutores/id/${dataGrupo.data.id_tutor}`, {
                        headers: { Authorization: `Bearer ${user.accessToken}` }
                    })
                    .then(r => r.json())
                    .then(d => d.success && setNombreTutor(d.data.nombre_completo));
                }
            }
         } catch (e) { console.error(e); }
    };

    if (idGrupo) {
      fetchAlumnos();
      fetchGrupo();
    }
  }, [idGrupo]);

  // ... Tienes tus funciones handleBuscarAlumno, handleAgregarAlumno, handleEliminarGrupo aquí ...
  // (Se mantienen igual, no afectan la responsividad visual)
  const handleBuscarAlumno = async () => { /* ... */ };
  const handleAgregarAlumno = async (alumno) => { /* ... */ };
  const handleEliminarGrupo = async () => { /* ... */ };

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn relative pt-20">
      <Navbar />

      <main className={`p-4 relative z-10 transition-all duration-300 ${mostrarModal ? 'blur-sm' : ''}`}>
        <div className="max-w-6xl mx-auto">
          
          {/* --- HEADER RESPONSIVE --- */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="w-full md:w-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-700 break-words">
                Lista de alumnos: <span className="text-blue-900">{nombreGrupo || "Cargando..."}</span>
              </h2>
              <p className="text-md md:text-lg font-medium text-gray-600 mt-1">
                Tutor: {nombreTutor || "Cargando..."}
              </p>
            </div>
            
            {/* Botones de acción del coordinador */}
            {esCoordinador && (
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                 <button
                  onClick={handleEliminarGrupo}
                  className="bg-[#8C1F2F] hover:bg-[#7a1b29] text-white font-semibold px-4 py-2 rounded-xl text-center w-full sm:w-auto shadow-sm"
                >
                  Eliminar grupo
                </button>
                
                {idGrupo && (
                    <Link
                    to={`/ReportesGrupo/${idGrupo}`}
                    className="bg-white border border-[#3C7DD9] text-[#3C7DD9] hover:bg-blue-50 px-4 py-2 rounded-xl font-semibold text-center w-full sm:w-auto"
                    >
                    Ver reportes
                    </Link>
                )}
              </div>
            )}
          </div>

          <div className="w-full h-1 bg-[#C7952C] mb-8 rounded-full"></div>

          {/* --- BUSCADOR RESPONSIVE (Solo Coordinador) --- */}
          {esCoordinador && (
            <div className="mb-8 bg-white p-4 md:p-6 rounded-xl shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Buscar alumno por matrícula</h3>
              
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
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
                  className="bg-[#E4CD87] hover:bg-[#E9DBCD] text-black px-6 py-3 rounded-xl font-semibold w-full sm:w-auto transition-colors"
                >
                  Buscar
                </button>
              </div>

              {mensajeAccion && <p className="mt-3 text-gray-600 text-sm">{mensajeAccion}</p>}

              {/* Resultado de búsqueda Responsive */}
              {resultadoBusqueda && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="text-lg font-bold text-gray-800">{resultadoBusqueda.nombre_completo}</p>
                    <div className="text-sm text-gray-600 flex flex-wrap gap-2">
                        <span>Mat: {resultadoBusqueda.matricula}</span> | 
                        <span>{resultadoBusqueda.carrera}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 w-full sm:w-auto">
                    <Link
                      to={`/alumnos/${resultadoBusqueda.matricula}/ficha`}
                      className="flex-1 sm:flex-none text-center border border-blue-600 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium"
                    >
                      Ver ficha
                    </Link>
                    <button
                      onClick={() => handleAgregarAlumno(resultadoBusqueda)}
                      className="flex-1 sm:flex-none bg-[#E4CD87] hover:bg-[#E9DBCD] text-black font-semibold px-4 py-2 rounded-lg text-sm"
                    >
                      ➕ Agregar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- LISTA DE ALUMNOS --- */}
          {loading && <p className="text-gray-600 text-center py-4">Cargando alumnos...</p>}
          {error && <p className="text-red-600 text-center py-4">{error}</p>}

          {!loading && alumnosData.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              {alumnosData.map((alumno) => (
                <AlumnoFicha
                  key={alumno.id_usuario || alumno.id || alumno.matricula}
                  nombre={alumno.nombre_completo || `${alumno.nombre} ${alumno.apellido_paterno} ${alumno.apellido_materno}`}
                  matricula={alumno.matricula}
                  carrera={alumno.carrera}
                  semestre={alumno.semestre}
                  puedeVerFicha={esTutor || esCoordinador}
                />
              ))}
            </div>
          )}
          
          {!loading && alumnosData.length === 0 && (
             <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                No hay alumnos en este grupo.
             </div>
          )}
        </div>
      </main>

      {/* --- MODAL RESPONSIVE --- */}
      {mostrarModal && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50 p-4">
          <div className="bg-white border-4 border-[#F1CC5A] rounded-2xl shadow-2xl p-6 w-full max-w-md text-center relative animate-fadeIn">
            <button
              onClick={() => setMostrarModal(false)}
              className="absolute top-2 left-3 text-gray-400 hover:text-gray-700 text-2xl font-bold p-2"
            >
              ×
            </button>

            <h3 className="text-sm text-gray-500 font-semibold mb-2 mt-2">Código del grupo</h3>

            <div className="flex flex-col items-center justify-center gap-2 mb-4 relative">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#4F3E9B] break-all">
                  {codigoGrupo || 'Cargando...'}
              </p>
              
              <button 
                onClick={copiarCodigo}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 bg-gray-100 px-3 py-1 rounded-full mt-2"
              >
                  <FaRegCopy /> Copiar código
              </button>

              {copiado && (
                <div className="mt-2 bg-gray-800 text-white text-xs py-1 px-3 rounded-lg shadow-lg animate-fadeIn">
                  Copiado al portapapeles ✓
                </div>
              )}
            </div>

            <p className="text-gray-600 text-sm px-2">
              Comparte este código con tus alumnos para que puedan unirse.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaAlumnos;