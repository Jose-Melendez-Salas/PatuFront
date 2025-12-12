import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import { 
  FaSearch, FaTrashAlt, FaUserGraduate, FaIdCard, 
  FaGraduationCap, FaBook, FaUsers, FaCopy, 
  FaCheckCircle, FaPlusCircle, FaRegCopy, FaTimes,
  FaChartLine, FaFilter, FaSortAmountDown, FaSpinner
} from 'react-icons/fa';
import { 
  User, GraduationCap, Users, Copy, CheckCircle, 
  Search, Trash2, PlusCircle, AlertTriangle, X,
  ChevronRight, Shield, Calendar, BarChart3,
  UserPlus, UserMinus, Download, Filter
} from 'lucide-react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// Configuración de Toast
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

// --- Componente Ficha Mejorado ---
const AlumnoFicha = ({ nombre, matricula, carrera, semestre, puedeVerFicha, esCoordinador, onEliminar, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onEliminar();
    setShowDeleteConfirm(false);
  };

  return (
    <div
      className={`p-4 border-b border-gray-200 hover:bg-gradient-to-r from-gray-50 to-blue-50 transition-all duration-300 cursor-pointer group animate-slideDown`}
      style={{ animationDelay: `${index * 50}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Información del alumno */}
        <div className="flex items-start gap-4 flex-grow">
          <div className={`p-3 rounded-full transition-all duration-300 ${isHovered ? 'scale-110 bg-blue-100' : 'bg-gray-100'}`}>
            <User className={`w-5 h-5 ${isHovered ? 'text-blue-600' : 'text-gray-600'}`} />
          </div>
          
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-lg font-bold text-gray-800 group-hover:text-blue-900 transition-colors truncate">
                {nombre}
              </h4>
              {isHovered && (
                <ChevronRight className="w-4 h-4 text-blue-500 animate-slideInRight" />
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <FaIdCard className="text-blue-500" />
                <span className="font-medium">{matricula}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaBook className="text-green-500" />
                <span>{carrera}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaGraduationCap className="text-purple-500" />
                <span>Semestre {semestre}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          {puedeVerFicha && (
            <Link
              to={`/alumnos/${matricula}/ficha`}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 group"
            >
              <User className="w-4 h-4" />
              <span className="font-medium">Ver Ficha</span>
            </Link>
          )}

          {esCoordinador && (
            <div className="relative">
              {showDeleteConfirm ? (
                <div className="flex gap-2 animate-fadeIn">
                  <button
                    onClick={confirmDelete}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    title="Confirmar eliminación"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    title="Cancelar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleDeleteClick}
                  className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-300 transform hover:scale-110"
                  title="Eliminar del grupo"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
  const [modalAnimation, setModalAnimation] = useState(false);
  const [mensajeAccion, setMensajeAccion] = useState('');
  const [mensajeTipo, setMensajeTipo] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [stats, setStats] = useState({
    totalAlumnos: 0,
    promedioSemestre: 0,
    carrerasUnicas: 0
  });

  // Animación del modal
  useEffect(() => {
    if (mostrarModal) {
      setTimeout(() => setModalAnimation(true), 10);
    } else {
      setModalAnimation(false);
    }
  }, [mostrarModal]);

  // Copiar código con feedback
  const copiarCodigo = () => {
    navigator.clipboard.writeText(codigoGrupo);
    setCopiado(true);
    
    Toast.fire({
      icon: 'success',
      title: '✓ Código copiado',
      background: '#10B981',
      color: 'white'
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
      const alumnos = data.data || [];
      setAlumnosData(alumnos);
      
      // Calcular estadísticas
      if (alumnos.length > 0) {
        const semestres = alumnos.map(a => parseInt(a.semestre) || 0).filter(s => s > 0);
        const carrerasUnicas = new Set(alumnos.map(a => a.carrera)).size;
        
        setStats({
          totalAlumnos: alumnos.length,
          promedioSemestre: semestres.length > 0 
            ? (semestres.reduce((a, b) => a + b, 0) / semestres.length).toFixed(1)
            : 0,
          carrerasUnicas: carrerasUnicas
        });
      }
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

  // --- MANEJADORES DE ACCIÓN ---

  // 1. Buscar Alumno
  const handleBuscarAlumno = async () => {
    if (!busqueda.trim()) {
      setMensajeAccion("Ingresa una matrícula para buscar");
      setMensajeTipo('warning');
      return;
    }
    
    setMensajeAccion("");
    setMensajeTipo('');
    setResultadoBusqueda(null);

    try {
      const res = await fetch(`https://apis-patu.onrender.com/api/alumnos/matricula/${busqueda}`, {
        headers: { Authorization: `Bearer ${usuario.accessToken}` }
      });
      const data = await res.json();
      
      if (data.success && data.data) {
        setResultadoBusqueda(data.data);
        Toast.fire({ 
          icon: 'success', 
          title: '🎯 Alumno encontrado',
          background: '#10B981'
        });
      } else {
        setMensajeAccion("No se encontró ningún alumno con esa matrícula.");
        setMensajeTipo('error');
        Toast.fire({ 
          icon: 'warning', 
          title: 'Matrícula no encontrada',
          background: '#F59E0B'
        });
      }
    } catch (error) {
      setMensajeAccion("Error al buscar el alumno.");
      setMensajeTipo('error');
    }
  };

  // 2. Agregar Alumno al Grupo
  const handleAgregarAlumno = async (alumnoSeleccionado) => {
    if (!idTutorGrupo) {
      Swal.fire({
        icon: 'error',
        title: 'Error de Asignación',
        text: 'Este grupo no tiene un tutor asignado. Asigna un tutor antes de agregar alumnos.',
        showClass: { popup: 'animate-shake' }
      });
      return;
    }

    const idAlumno = alumnoSeleccionado.id_usuario || alumnoSeleccionado.id;

    Swal.fire({
      title: 'Agregando alumno...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
      showClass: { popup: 'animate-fadeIn' }
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
        Swal.fire({
          icon: 'success',
          title: '¡Agregado!',
          text: 'El alumno ha sido vinculado al grupo correctamente.',
          timer: 2000,
          showConfirmButton: false,
          showClass: { popup: 'animate-fadeIn' }
        });
        
        setResultadoBusqueda(null);
        setBusqueda("");
        fetchAlumnosList(usuario.accessToken);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'No se pudo agregar al alumno.',
          showClass: { popup: 'animate-shake' }
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'Verifique su conexión a internet.',
        showClass: { popup: 'animate-shake' }
      });
    }
  };

  // 3. Eliminar Alumno del Grupo
  const handleEliminarDeGrupo = async (idAlumno, nombreAlumno) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      html: `Vas a eliminar a <strong>${nombreAlumno}</strong> del grupo.<br><br>Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      showClass: { popup: 'animate-fadeIn' },
      background: '#FEF3C7'
    });

    if (!result.isConfirmed) return;

    Swal.fire({
      title: 'Eliminando...',
      didOpen: () => Swal.showLoading(),
      showClass: { popup: 'animate-fadeIn' }
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
        Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: 'El alumno ha sido removido del grupo.',
          timer: 1500,
          showConfirmButton: false,
          showClass: { popup: 'animate-fadeIn' }
        });
        fetchAlumnosList(usuario.accessToken);
      } else {
        const data = await res.json();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'No se pudo eliminar',
          showClass: { popup: 'animate-shake' }
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema de conexión',
        showClass: { popup: 'animate-shake' }
      });
    }
  };

  // 4. Eliminar Grupo completo
  const handleEliminarGrupo = async () => {
    const result = await Swal.fire({
      title: '¿Eliminar grupo permanentemente?',
      html: `
        <div class="text-center">
          <div class="text-6xl mb-4">⚠️</div>
          <p class="text-gray-700 mb-2">
            Esta acción <strong class="text-red-600">NO</strong> se puede deshacer.
          </p>
          <p class="text-sm text-gray-500">
            Se eliminarán todos los datos asociados al grupo.
          </p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, eliminar grupo',
      cancelButtonText: 'Cancelar',
      showClass: { popup: 'animate-fadeIn' },
      backdrop: 'rgba(0,0,0,0.8)'
    });

    if (!result.isConfirmed) return;

    Swal.fire({
      title: 'Eliminando grupo...',
      didOpen: () => Swal.showLoading(),
      showClass: { popup: 'animate-fadeIn' }
    });

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
        await Swal.fire({
          title: '¡Grupo eliminado!',
          text: 'El grupo ha sido eliminado exitosamente.',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
          showClass: { popup: 'animate-fadeIn' }
        });
        window.location.href = "/Grupos";
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || "No se pudo eliminar el grupo.",
          showClass: { popup: 'animate-shake' }
        });
      }
    } catch (err) {
      console.error("Error eliminando grupo:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al conectar con el servidor.',
        showClass: { popup: 'animate-shake' }
      });
    }
  };

  // Función para cerrar modal
  const closeModal = () => {
    setModalAnimation(false);
    setTimeout(() => setMostrarModal(false), 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 animate-fadeIn">
      <Navbar />

      <main className="pt-24 px-4 sm:px-6 md:px-8 lg:px-20 pb-8">
        {/* Header mejorado */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                  Lista de Alumnos
                </h1>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  <span className="font-medium">{nombreGrupo || "Cargando..."}</span>
                </div>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Tutor: {nombreTutor || "Sin asignar"}</span>
                </div>
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {esCoordinador && (
                <>
                  <button
                    onClick={handleEliminarGrupo}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                  >
                    <Trash2 className="w-4 h-4 group-hover:animate-bounce" />
                    Eliminar Grupo
                  </button>

                </>
              )}
              
              {idGrupo && (esCoordinador ) && (
                <Link
                  to={`/ReportesGrupo/${idGrupo}`}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                >
                  <BarChart3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Ver Sesiones
                </Link>
              )}
            </div>
          </div>
          
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
        </div>

        {/* Tarjetas de estadísticas */}
        {alumnosData.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Total Alumnos</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalAlumnos}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
            

            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 transition-all duration-300 hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 font-medium">Carreras Únicas</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.carrerasUnicas}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FaBook className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Buscador para Coordinador */}
        {esCoordinador && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-200 p-5 md:p-6 animate-slideDown">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
                <Search className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Buscar y Agregar Alumnos</h3>
            </div>
            
            <div className="h-1 w-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mb-6"></div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Ingresa la matrícula del alumno (Ej: 202100123)"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleBuscarAlumno()}
                  className="w-full p-4 pl-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                />
              </div>
              
              <button
                onClick={handleBuscarAlumno}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 group"
              >
                <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Buscar Alumno
              </button>
            </div>

            {/* Mensaje de estado */}
            {mensajeAccion && (
              <div className={`mt-4 p-3 rounded-lg text-center font-medium animate-fadeIn ${
                mensajeTipo === 'error' 
                  ? 'bg-red-50 text-red-700 border border-red-200 animate-shake'
                  : mensajeTipo === 'warning'
                  ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {mensajeAccion}
              </div>
            )}

            {/* Resultado de búsqueda */}
            {resultadoBusqueda && (
              <div className="mt-4 p-5 border-2 border-dashed border-blue-300 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 animate-slideIn">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-full shadow-sm">
                      <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-800">
                        {resultadoBusqueda.nombre_completo || `${resultadoBusqueda.nombre} ${resultadoBusqueda.apellido_paterno}`}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="px-2 py-1 bg-white rounded-full text-sm font-medium text-gray-700">
                          Matrícula: {resultadoBusqueda.matricula}
                        </span>
                        <span className="px-2 py-1 bg-white rounded-full text-sm font-medium text-gray-700">
                          Carrera: {resultadoBusqueda.carrera}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAgregarAlumno(resultadoBusqueda)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 group"
                  >
                    <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Agregar al Grupo
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lista de Alumnos */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="relative mb-6">
              <div className="w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <Users className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-500 animate-pulse" />
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-2">Cargando alumnos...</p>
            <p className="text-gray-500">Obteniendo la lista de estudiantes del grupo</p>
          </div>
        ) : error ? (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-8 text-center animate-shake">
            <div className="flex flex-col items-center">
              <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
              <p className="text-red-600 text-lg font-semibold mb-2">¡Error al cargar!</p>
              <p className="text-red-500">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : alumnosData.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header de la tabla */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-bold text-gray-800">
                    Alumnos del Grupo ({alumnosData.length})
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Filter className="w-4 h-4" />
                  <span>Orden: A-Z</span>
                </div>
              </div>
            </div>
            
            {/* Lista de alumnos */}
            {alumnosData.map((alumno, index) => (
              <AlumnoFicha
                key={alumno.id_usuario || alumno.id || alumno.matricula}
                nombre={alumno.nombre_completo || `${alumno.nombre} ${alumno.apellido_paterno} ${alumno.apellido_materno}`}
                matricula={alumno.matricula}
                carrera={alumno.carrera}
                semestre={alumno.semestre}
                puedeVerFicha={esTutor || esCoordinador}
                esCoordinador={esCoordinador}
                onEliminar={() => handleEliminarDeGrupo(alumno.id_usuario || alumno.id, alumno.nombre)}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 animate-fadeIn">
            <div className="relative mb-6">
              <div className="w-48 h-48 bg-gradient-to-br from-gray-100 to-blue-50 rounded-full flex items-center justify-center">
                <Users className="w-24 h-24 text-gray-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-white font-bold">!</span>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No hay alumnos en este grupo
            </h3>
            
            <p className="text-gray-500 max-w-md text-center mb-6">
              {esCoordinador 
                ? "Usa el buscador arriba para agregar alumnos al grupo."
                : "Este grupo no tiene alumnos asignados aún."
              }
            </p>

            {!esCoordinador && (
              <button
                onClick={() => setMostrarModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 group"
              >
                <Shield className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Ver Código de Invitación
              </button>
            )}
          </div>
        )}
      </main>

      {/* Modal del Código */}
      {mostrarModal && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
            modalAnimation 
              ? 'bg-black/50 backdrop-blur-sm' 
              : 'bg-black/0 backdrop-blur-0'
          }`}
          onClick={closeModal}
        >
          <div 
            className={`bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 ${
              modalAnimation 
                ? 'scale-100 opacity-100 translate-y-0' 
                : 'scale-95 opacity-0 translate-y-4'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Código del Grupo</h3>
                    <p className="text-white/90 text-sm">Comparte con los alumnos</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex flex-col items-center gap-4">
                    <div className="px-8 py-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-blue-300">
                      <p className="text-sm text-gray-500 mb-2">Código de acceso</p>
                      <p className="text-4xl md:text-5xl font-black tracking-wider text-gray-800 animate-pulse-subtle">
                        {codigoGrupo || 'Cargando...'}
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={copiarCodigo}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 group"
                      >
                        {copiado ? (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            ¡Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Copiar Código
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => {
                          const message = `¡Únete a mi grupo en PATU! Código: ${codigoGrupo}`;
                          navigator.clipboard.writeText(message);
                          Toast.fire({
                            icon: 'success',
                            title: '✓ Mensaje copiado',
                            background: '#10B981'
                          });
                        }}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 group"
                      >
                        <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Compartir
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-center text-xs text-gray-500 space-y-1">
                  <p>Los alumnos pueden usar este código para unirse al grupo</p>
                  <p className="text-blue-500 font-medium">Grupo: {nombreGrupo} • Tutor: {nombreTutor}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estilos CSS para animaciones */}
      <style jsx>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(20px) scale(0.98); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        @keyframes slideDown {
          from { 
            opacity: 0; 
            transform: translateY(-20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes slideIn {
          from { 
            opacity: 0; 
            transform: translateX(-20px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }
        
        @keyframes slideInRight {
          from { 
            opacity: 0; 
            transform: translateX(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes pulseSubtle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.02); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-pulse-subtle {
          animation: pulseSubtle 1.5s ease-in-out infinite;
        }
        
        /* Personalización del scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3B82F6, #1D4ED8);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #1D4ED8, #3B82F6);
        }
      `}</style>
    </div>
  );
};

export default ListaAlumnos;