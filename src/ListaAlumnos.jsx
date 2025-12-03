import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import { FaSearch } from 'react-icons/fa';
import { FaRegCopy } from 'react-icons/fa6';
import { FaTrashAlt } from 'react-icons/fa';

// 1. IMPORTAR SWEETALERT2
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// Configuración de una alerta pequeña (Toast) para notificaciones sutiles
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

// --- COMPONENTE FICHA MEJORADO ---
const AlumnoFicha = ({ nombre, matricula, carrera, semestre, puedeVerFicha, esCoordinador, onEliminar }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors gap-3 group animate-fadeIn">
    {/* Info del alumno */}
    <div className="w-full sm:w-auto">
      <h4 className="text-lg sm:text-xl font-medium text-gray-800 break-words">{nombre}</h4>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
        <p className="text-sm text-gray-500"><span className="font-semibold">Mat:</span> {matricula}</p>
        <p className="text-sm text-gray-500"><span className="font-semibold">Carr:</span> {carrera}</p>
        <p className="text-sm text-gray-500"><span className="font-semibold">Sem:</span> {semestre}</p>
      </div>
    </div>

    {/* Botones de acción */}
    <div className="flex items-center gap-3 self-end sm:self-center">
      {puedeVerFicha && (
        <Link
          to={`/alumnos/${matricula}/ficha`}
          className="text-blue-600 hover:text-blue-800 text-sm underline font-medium"
        >
          Ver ficha
        </Link>
      )}

      {/* Botón Eliminar (Solo Coordinador) */}
      {esCoordinador && (
        <button
          onClick={onEliminar}
          className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors transform hover:scale-110"
          title="Sacar alumno del grupo"
        >
          <FaTrashAlt />
        </button>
      )}
    </div>
  </div>
);

const ListaAlumnos = () => {
  const { idGrupo } = useParams();
  
  // Estados
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
  const [copiado, setCopiado] = useState(false); 

  // --- Helpers ---
  const copiarCodigo = () => {
     navigator.clipboard.writeText(codigoGrupo);
     setCopiado(true);
     // Usamos Toast en lugar de solo estado para mejor feedback
     Toast.fire({
        icon: 'success',
        title: 'Código copiado al portapapeles'
     });
     setTimeout(() => setCopiado(false), 2000);
  };

  // Función para recargar la lista de alumnos
  const fetchAlumnosList = useCallback(async (token) => {
    try {
      const res = await fetch(`https://apis-patu.onrender.com/api/alumnos/grupo/${idGrupo}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Error al cargar los alumnos');
      const data = await res.json();
      setAlumnosData(data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [idGrupo]);

  // --- EFECTO INICIAL ---
  useEffect(() => {
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

    const inicializarDatos = async () => {
      try {
        setLoading(true);
        await fetchAlumnosList(user.accessToken);

        const resGrupo = await fetch(`https://apis-patu.onrender.com/api/grupos/id/${idGrupo}`, {
            headers: { Authorization: `Bearer ${user.accessToken}`, 'Content-Type': 'application/json' },
        });
        const dataGrupo = await resGrupo.json();
        
        if (dataGrupo.success && dataGrupo.data) {
            setCodigoGrupo(dataGrupo.data.codigo || '');
            setNombreGrupo(dataGrupo.data.nombre || 'Sin nombre');
            setIdTutorGrupo(dataGrupo.data.id_tutor || null);
            
            if (dataGrupo.data.id_tutor) {
                fetch(`https://apis-patu.onrender.com/api/tutores/id/${dataGrupo.data.id_tutor}`, {
                    headers: { Authorization: `Bearer ${user.accessToken}` }
                })
                .then(r => r.json())
                .then(d => d.success && setNombreTutor(d.data.nombre_completo));
            }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (idGrupo) {
      inicializarDatos();
    }
  }, [idGrupo, fetchAlumnosList]);


  // --- MANEJADORES DE ACCIÓN (CON ANIMACIONES) ---

  // 1. Buscar Alumno
  const handleBuscarAlumno = async () => {
    if (!busqueda.trim()) return;
    setMensajeAccion("");
    setResultadoBusqueda(null);

    try {
        const res = await fetch(`https://apis-patu.onrender.com/api/alumnos/matricula/${busqueda}`, {
            headers: { Authorization: `Bearer ${usuario.accessToken}` }
        });
        const data = await res.json();
        
        if (data.success && data.data) {
            setResultadoBusqueda(data.data);
            Toast.fire({ icon: 'success', title: 'Alumno encontrado' });
        } else {
            setMensajeAccion("No se encontró ningún alumno con esa matrícula.");
            Toast.fire({ icon: 'warning', title: 'Matrícula no encontrada' });
        }
    } catch (error) {
        setMensajeAccion("Error al buscar el alumno.");
    }
  };

  // 2. Agregar Alumno al Grupo
  const handleAgregarAlumno = async (alumnoSeleccionado) => {
    if (!idTutorGrupo) {
      Swal.fire({
        icon: 'error',
        title: 'Error de Asignación',
        text: 'Este grupo no tiene un tutor asignado. Asigna un tutor antes de agregar alumnos.',
      });
      return;
    }

    const idAlumno = alumnoSeleccionado.id_usuario || alumnoSeleccionado.id;

    // Mostramos loader
    Swal.fire({
      title: 'Agregando alumno...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const res = await fetch(`https://apis-patu.onrender.com/api/alumnos/${idAlumno}`, { 
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${usuario.accessToken}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          id_grupo: idGrupo,
          id_tutor: idTutorGrupo 
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Éxito
        Swal.fire({
          icon: 'success',
          title: '¡Agregado!',
          text: 'El alumno ha sido vinculado al grupo correctamente.',
          timer: 2000,
          showConfirmButton: false
        });
        
        setResultadoBusqueda(null);
        setBusqueda("");
        fetchAlumnosList(usuario.accessToken);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'No se pudo agregar al alumno.',
        });
      }

    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'Verifique su conexión a internet.',
      });
    }
  };

  // 3. Eliminar Alumno del Grupo
  const handleEliminarDeGrupo = async (idAlumno) => {
    // Confirmación con SweetAlert
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "El alumno será removido de este grupo.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    // Loading
    Swal.fire({
        title: 'Desvinculando...',
        didOpen: () => Swal.showLoading()
    });

    try {
        const res = await fetch(`https://apis-patu.onrender.com/api/alumnos/${idAlumno}`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${usuario.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_grupo: '-1', 
                id_tutor: '-1'  
            })
        });

        if (res.ok) {
            Swal.fire(
                '¡Eliminado!',
                'El alumno ha sido removido del grupo.',
                'success'
            );
            fetchAlumnosList(usuario.accessToken);
        } else {
            const data = await res.json();
            Swal.fire('Error', data.message || 'No se pudo eliminar', 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'Hubo un problema de conexión', 'error');
    }
  };

  // 4. Eliminar Grupo completo 
  const handleEliminarGrupo = async () => {
    const result = await Swal.fire({
      title: '¿Eliminar grupo permanentemente?',
      text: "Esta acción no se puede deshacer. Se perderán los datos asociados.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar grupo',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    Swal.fire({ title: 'Eliminando...', didOpen: () => Swal.showLoading() });

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
        await Swal.fire('Eliminado', 'El grupo ha sido eliminado.', 'success');
        window.location.href = "/Grupos";
      } else {
        Swal.fire('Error', data.message || "No se pudo eliminar el grupo.", 'error');
      }
    } catch (err) {
      console.error("Error eliminando grupo:", err);
      Swal.fire('Error', 'Error al conectar con el servidor.', 'error');
    }
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn relative pt-20">
      <Navbar />

      <main className={`p-4 relative z-10 transition-all duration-300 ${mostrarModal ? 'blur-sm' : ''}`}>
        <div className="max-w-6xl mx-auto">
          
          {/* --- HEADER --- */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="w-full md:w-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-700 break-words">
                Lista de alumnos: <span className="text-blue-900">{nombreGrupo || "Cargando..."}</span>
              </h2>
              <p className="text-md md:text-lg font-medium text-gray-600 mt-1">
                Tutor: {nombreTutor || "Sin asignar"}
              </p>
            </div>
            
            {/* Botones de Coordinador */}
            {esCoordinador && (
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                 <button
                  onClick={handleEliminarGrupo}
                  className="bg-[#8C1F2F] hover:bg-[#7a1b29] text-white font-semibold px-4 py-2 rounded-xl text-center w-full sm:w-auto shadow-sm transition-transform hover:scale-105"
                >
                  Eliminar grupo
                </button>
                
                {idGrupo && (
                    <Link
                    to={`/ReportesGrupo/${idGrupo}`}
                    className="bg-white border border-[#3C7DD9] text-[#3C7DD9] hover:bg-blue-50 px-4 py-2 rounded-xl font-semibold text-center w-full sm:w-auto transition-transform hover:scale-105"
                    >
                    Ver reportes
                    </Link>
                )}
              </div>
            )}
          </div>

          <div className="w-full h-1 bg-[#C7952C] mb-8 rounded-full"></div>

          {/* --- BUSCADOR (Solo Coordinador) --- */}
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
                    className="w-full p-3 pl-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E9DBCD] transition-all"
                  />
                </div>
                <button
                  onClick={handleBuscarAlumno}
                  className="bg-[#E4CD87] hover:bg-[#E9DBCD] text-black px-6 py-3 rounded-xl font-semibold w-full sm:w-auto transition-transform hover:scale-105"
                >
                  Buscar
                </button>
              </div>

              {mensajeAccion && <p className="mt-3 text-gray-600 text-sm font-medium animate-pulse">{mensajeAccion}</p>}

              {/* Resultado de búsqueda */}
              {resultadoBusqueda && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-slideIn">
                  <div>
                    <p className="text-lg font-bold text-gray-800">{resultadoBusqueda.nombre_completo || `${resultadoBusqueda.nombre} ${resultadoBusqueda.apellido_paterno}`}</p>
                    <div className="text-sm text-gray-600 flex flex-wrap gap-2">
                        <span>Mat: {resultadoBusqueda.matricula}</span> | 
                        <span>{resultadoBusqueda.carrera}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => handleAgregarAlumno(resultadoBusqueda)}
                      className="flex-1 sm:flex-none bg-[#E4CD87] hover:bg-[#E9DBCD] text-black font-semibold px-4 py-2 rounded-lg text-sm transition-transform hover:scale-105"
                    >
                      ➕ Agregar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- LISTA DE ALUMNOS --- */}
          {loading && (
             <div className="flex justify-center py-10">
                 <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900"></div>
             </div>
          )}
          
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
                  esCoordinador={esCoordinador}
                  onEliminar={() => handleEliminarDeGrupo(alumno.id_usuario || alumno.id)}
                />
              ))}
            </div>
          )}
          
          {!loading && alumnosData.length === 0 && (
             <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                No hay alumnos en este grupo.
                <br/>
                {esCoordinador ? " Usa el buscador para agregar alumnos." : 
                <button 
                    onClick={() => setMostrarModal(true)}
                    className="mt-4 text-blue-600 underline hover:text-blue-800"
                >
                    Ver código de invitación
                </button>
                }
             </div>
          )}
        </div>
      </main>

      {/* --- MODAL CÓDIGO --- */}
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
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 bg-gray-100 px-3 py-1 rounded-full mt-2 transition-transform hover:scale-105 active:scale-95"
              >
                  <FaRegCopy /> Copiar código
              </button>
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