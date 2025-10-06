import React, { useState, useEffect } from 'react';
import logoImg from './assets/logo.png';
import patoImg from './assets/pato.png';
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';


const Registro = () => {
  const [nombre, setNombre] = useState('');
  const [apellidoP, setApellidoP] = useState('');
  const [apellidoM, setApellidoM] = useState('');
  const [correo, setCorreo] = useState('');
  const [rol, setRol] = useState('');
  const [matricula, setMatricula] = useState('');
  const [carrera, setCarrera] = useState('');
  const [semestre, setSemestre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [academia, setAcademia] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [formValido, setFormValido] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);


  const [errores, setErrores] = useState({
    correo: '',
    contraseña: '',
    confirmar: ''
  });

  // Detectar rol según correo
  useEffect(() => {
    const correoNormalizado = correo.trim().toLowerCase();
    if (correoNormalizado.endsWith('@itsmante.edu.mx')) {
      const localPart = correoNormalizado.split('@')[0];
      const rolDetectado = /\.\d+$/.test(localPart) ? 'alumno' : 'tutor';
      setRol(rolDetectado);
    } else {
      setRol('');
    }
  }, [correo]);

  // Validación en tiempo real
  useEffect(() => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    const nuevosErrores = { ...errores };
    const correoNormalizado = correo.trim().toLowerCase();

    nuevosErrores.correo = correo && !correoNormalizado.endsWith('@itsmante.edu.mx')
      ? 'Debe ser un correo institucional @itsmante.edu.mx'
      : '';

    nuevosErrores.contraseña = contraseña && !passwordRegex.test(contraseña)
      ? '8 caracteres, 1 mayúscula y 1 especial'
      : '';

    nuevosErrores.confirmar = confirmar && contraseña !== confirmar
      ? 'Las contraseñas no coinciden'
      : '';

    setErrores(nuevosErrores);

    // Campos obligatorios según roll
    let obligatorioCompleto = nombre && apellidoP && correo && contraseña && confirmar && rol !== '';

    if (rol === 'alumno') {
      obligatorioCompleto = obligatorioCompleto && matricula && carrera && semestre;
    } else if (rol === 'tutor') {
      obligatorioCompleto = obligatorioCompleto && telefono && academia;
    }

    const correoValido = correoNormalizado.endsWith('@itsmante.edu.mx');
    const contraseñaValida = passwordRegex.test(contraseña);

    setFormValido(obligatorioCompleto && correoValido && contraseñaValida);
  }, [nombre, apellidoP, correo, contraseña, confirmar, matricula, carrera, semestre, telefono, academia, rol]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formValido) return;

    try {
      // Registrar usuario
      const resUsuario = await fetch('https://apis-patu.onrender.com/api/usuarios/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          apellido_paterno: apellidoP,
          apellido_materno: apellidoM,
          correo,
          password: contraseña,
          rol,
          estado: 'activo'
        })
      });

      const dataUsuario = await resUsuario.json();



      if (!resUsuario.ok) throw new Error(dataUsuario.message || 'Error registrando usuario');

      // ... el resto del código

      const usuarioId = dataUsuario.data.id;
      let detalle = {};

      if (rol === 'tutor') {
        const resTutor = await fetch('https://apis-patu.onrender.com/api/tutores/crear', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: usuarioId,
            academia,
            telefono
          })
        });
        const dataTutor = await resTutor.json();
        if (!resTutor.ok) throw new Error(dataTutor.message || 'Error creando tutor');
        detalle = { id: usuarioId, telefono, academia };

      } else if (rol === 'alumno') {
        const resAlumno = await fetch('https://apis-patu.onrender.com/api/alumnos/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_alumno: usuarioId,
            matricula,
            carrera,
            semestre,
            id_tutor: 1
          })
        });
        const dataAlumno = await resAlumno.json();
        if (!resAlumno.ok) throw new Error(dataAlumno.message || 'Error creando alumno');
        detalle = { matricula, carrera, semestre, id_tutor: 1 };
      }


      // Guardar usuario general
      localStorage.setItem(
        "usuario",
        JSON.stringify({
          id: usuarioId,
          nombre,
          apellido_paterno: apellidoP,
          apellido_materno: apellidoM,
          correo,
          rol,
          estado: 'activo'
        })
      );

      // Guardar tutor (solo si aplica)
      if (rol === "tutor") {
        localStorage.setItem(
          "tutor",
          JSON.stringify({
            id: usuarioId,
            telefono,
            academia
          })
        );
      }

      // Guardar alumno (solo si aplica)
      if (rol === "alumno") {
        localStorage.setItem(
          "alumno",
          JSON.stringify({
            id: usuarioId,
            matricula,
            carrera,
            semestre,
            id_tutor: 1
          })
        );
      }


      setMostrarExito(true);
      setTimeout(() => {
        window.location.href = "/Login";
      }, 2500);


    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-[#4F3E9B] text-white flex items-center justify-end px-10 h-20">
        <div className="flex items-center gap-4 text-5xl font-bold">
          PATU
          <img src={logoImg} alt="Logo" className="w-12 h-12" />
        </div>
      </header>

      <main className="flex-1 bg-white">
        <div className="flex flex-col md:flex-row h-full">
          <div className="hidden md:flex md:w-[55%] items-center justify-center">
            <img src={patoImg} alt="pato" className="rounded-xl w-[90%] max-h-[90vh] object-contain" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-7 md:-ml-65">
            <div className="bg-white rounded-3xl shadow-3xl p-10 w-full max-w-3xl animate-fadeIn border-7 border-gray-300">
              <h2 className="text-4xl font-bold mb-8 text-center border-b-4 border-yellow-400 pb-2">Registro</h2>

              <form className="flex flex-col gap-6 items-center relative w-full" onSubmit={handleSubmit}>
                <InputField label="Nombre (s)" value={nombre} onChange={setNombre} obligatorio />
                <InputField label="Apellido paterno" value={apellidoP} onChange={setApellidoP} obligatorio />
                <InputField label="Apellido materno" value={apellidoM} onChange={setApellidoM} />

                <InputField
                  label="Correo Electrónico"
                  value={correo}
                  onChange={setCorreo}
                  tipo="email"
                  tooltip
                  error={errores.correo}
                  obligatorio
                />

                {rol === 'alumno' && (
                  <>
                    <InputField label="Matrícula" value={matricula} onChange={setMatricula} obligatorio />
                    <InputField label="Carrera" value={carrera} onChange={setCarrera} obligatorio />
                    <InputField label="Semestre" value={semestre} onChange={setSemestre} obligatorio />
                  </>
                )}

                {rol === 'tutor' && (
                  <>
                    <InputField label="Teléfono" value={telefono} onChange={setTelefono} obligatorio />
                    <InputField label="Academia" value={academia} onChange={setAcademia} obligatorio />
                  </>
                )}

                <PasswordField
                  label="Contraseña"
                  value={contraseña}
                  onChange={setContraseña}
                  error={errores.contraseña}
                  show={showPassword}
                  setShow={setShowPassword}
                  obligatorio
                />

                <PasswordField
                  label="Confirma tu contraseña"
                  value={confirmar}
                  onChange={setConfirmar}
                  error={errores.confirmar}
                  show={showConfirmPassword}
                  setShow={setShowConfirmPassword}
                  obligatorio
                />

                {error && <p className="text-red-600 text-sm text-center">{error}</p>}

                <button
                  type="submit"
                  disabled={!formValido}
                  className={`bg-[#3CB9A5] hover:bg-[#1f6b5e] text-white py-3 px-6 rounded-2xl font-bold text-2xl mt-4 mx-auto w-[80%] sm:w-1/2 transition-all duration-300 ${!formValido ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  Comenzar
                </button>

              </form>

              <p className="mt-6 text-medium text-center font-medium">
                ¿Ya tienes cuenta?{' '}
                <Link to="/Login" className="text-[#4F3E9B] underline font-medium">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {mostrarExito && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-10 w-[90%] max-w-md text-center border-4 border-[#3CB9A5] animate-fadeIn">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#3CB9A5] text-white text-4xl font-bold">
                ✓
              </div>
              <h3 className="text-2xl font-bold text-[#4F3E9B]">¡Registro exitoso!</h3>
              <p className="text-gray-700 text-lg">
                Tu cuenta ha sido creada correctamente.<br />Redirigiendo al inicio de sesión...
              </p>
            </div>
          </div>
        </div>
      )}


      <style>{`
        @keyframes fadeIn { from {opacity:0; transform: translateY(10px);} to {opacity:1; transform: translateY(0);} }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .tooltip { 
          position: absolute; top: 100%; left: 0; 
          background: #fef3c7; color: #92400e; 
          border: 1px solid #facc15; 
          padding: 4px 8px; border-radius: 8px; 
          font-size: 0.8rem; 
          margin-top: 4px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          z-index: 10;
        }
      `}</style>
    </div>
  );
};

export default Registro;

// COMPONENTES REUTILIZABLES
const InputField = ({ label, value, onChange, error, tipo = "text", tooltip = false, obligatorio = false }) => (
  <label className="text-gray-700 font-medium w-4/5 relative">
    {label} {obligatorio && <span className="text-red-500">*</span>}
    <input
      type={tipo}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={label}
      className="p-4 border border-gray-300 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-purple-400 mt-1"
    />
    {error && value && tooltip && (
      <div className="tooltip">{error}</div>
    )}
  </label>
);

const PasswordField = ({ label, value, onChange, error, show, setShow, obligatorio = false }) => (
  <label className="text-gray-700 font-medium w-4/5 relative">
    {label} {obligatorio && <span className="text-red-500">*</span>}

    {/* Campo de contraseña responsivo */}
    <div className="relative w-full mt-2">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={label}
        className="p-4 pr-12 border border-gray-300 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-purple-400 text-base sm:text-sm"
      />

      {/* Ícono del ojito dentro del input */}
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute inset-y-0 right-4 flex items-center"
        tabIndex={-1}
      >
        {show ? (
          <EyeOff size={22} color="#4F3E9B" className="transition-transform duration-200 hover:scale-110" />
        ) : (
          <Eye size={22} color="#4F3E9B" className="transition-transform duration-200 hover:scale-110" />
        )}
      </button>
    </div>

    {error && value && <div className="tooltip">{error}</div>}
  </label>
);

