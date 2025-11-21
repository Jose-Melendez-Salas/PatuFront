import React, { useState, useEffect } from 'react';
import Navbar from './Navbar.jsx';
import ilustracionImg from './assets/Registro02.png';
import { Eye, EyeOff } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);

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
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>°¬¿¡´¨~`\[\]]).{8,}$/;
    const nuevosErrores = { ...errores };
    const correoNormalizado = correo.trim().toLowerCase();

    nuevosErrores.correo = correo && !correoNormalizado.endsWith('@itsmante.edu.mx')
      ? 'Debe ser un correo institucional @itsmante.edu.mx'
      : '';

    nuevosErrores.contraseña = contraseña && !passwordRegex.test(contraseña)
      ? 'Debe tener al menos 8 caracteres, una mayúscula y un carácter especial (!@#$%^&*(),.?":{}|<>°¬¿¡´¨~`[]).'
      : '';

    nuevosErrores.confirmar = confirmar && contraseña !== confirmar
      ? 'Las contraseñas no coinciden'
      : '';

    setErrores(nuevosErrores);

    const camposBase = [nombre, apellidoP, apellidoM, correo, contraseña, confirmar].every(c => c.trim() !== '');
    let camposRol = false;

    if (rol === 'alumno') camposRol = [matricula, carrera, semestre].every(c => c.trim() !== '');
    else if (rol === 'tutor') camposRol = [telefono, academia].every(c => c.trim() !== '');

    const correoValido = correoNormalizado.endsWith('@itsmante.edu.mx');
    const contraseñaValida = passwordRegex.test(contraseña);
    const contraseñasCoinciden = contraseña === confirmar;

    setFormValido(camposBase && camposRol && correoValido && contraseñaValida && contraseñasCoinciden);
  }, [nombre, apellidoP, correo, contraseña, confirmar, matricula, carrera, semestre, telefono, academia, rol]);

  const limpiarFormulario = () => {
    setNombre('');
    setApellidoP('');
    setApellidoM('');
    setCorreo('');
    setRol('');
    setMatricula('');
    setCarrera('');
    setSemestre('');
    setTelefono('');
    setAcademia('');
    setContraseña('');
    setConfirmar('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formValido) return;

    setError('');
    setLoading(true);

    try {
      // Crear usuario
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
      if (!resUsuario.ok) throw new Error(dataUsuario.message || 'Error al registrar usuario');
      const usuarioId = dataUsuario.data.id;

      // Crear perfil según rol
      if (rol === 'tutor') {
        const resTutor = await fetch('https://apis-patu.onrender.com/api/tutores/crear', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_usuario: usuarioId, academia, telefono })
        });
        const dataTutor = await resTutor.json();
        if (!resTutor.ok) throw new Error(dataTutor.message || 'Error creando perfil tutor');
      }

      if (rol === 'alumno') {
        const resAlumno = await fetch('https://apis-patu.onrender.com/api/alumnos/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_usuario: usuarioId, matricula, carrera, semestre })
        });
        const dataAlumno = await resAlumno.json();
        if (!resAlumno.ok) throw new Error(dataAlumno.message || 'Error creando perfil alumno');
      }

      // ❌ NO guardar usuario registrado en localStorage, así el coordinador sigue con su sesión

      setMostrarExito(true);
      limpiarFormulario();
      setTimeout(() => { setMostrarExito(false); }, 2500);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />

      <main className="flex-1 bg-white">
        <div className="flex flex-col md:flex-row h-full">
          <div className="hidden md:flex md:w-[55%] items-center justify-center">
            <img src={ilustracionImg} alt="ilustracion" className="rounded-xl w-full max-w-md md:max-w-lg lg:max-w-xl h-auto object-contain" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-7 md:-ml-65">
            <div className="bg-white rounded-3xl shadow-3xl p-10 w-full max-w-3xl animate-fadeIn border-7 border-gray-300">
              <h2 className="text-4xl font-bold mb-8 text-center border-b-4 border-[#C7952C] pb-2">Registro</h2>

              <form className="flex flex-col gap-6 items-center relative w-full" onSubmit={handleSubmit}>
                <InputField label="Nombre (s)" value={nombre} onChange={setNombre} obligatorio />
                <InputField label="Apellido paterno" value={apellidoP} onChange={setApellidoP} obligatorio />
                <InputField label="Apellido materno" value={apellidoM} onChange={setApellidoM} obligatorio />
                <InputField label="Correo Electrónico" value={correo} onChange={setCorreo} tipo="email" tooltip error={errores.correo} obligatorio />

                {rol === 'alumno' && (
                  <>
                    <InputField label="Matrícula" value={matricula} onChange={setMatricula} obligatorio />
                    <SelectField label="Carrera" value={carrera} onChange={setCarrera} options={['Sistemas Computacionales', 'Gestión Empresarial', 'Química', 'Industrial', 'Innovación Agrícola Sustentable']} obligatorio />
                    <SelectField label="Semestre" value={semestre} onChange={setSemestre} options={['1ro', '2do', '3ro', '4to', '5to', '6to', '7mo', '8vo', '9no', '10mo', '11vo', '12mo']} obligatorio />
                  </>
                )}

                {rol === 'tutor' && (
                  <>
                    <InputField label="Teléfono" value={telefono} onChange={setTelefono} obligatorio />
                    <SelectField label="Academia" value={academia} onChange={setAcademia} options={['Sistemas Computacionales', 'Gestión Empresarial', 'Química', 'Ciencias Básicas', 'Industrial', 'Innovación Agrícola Sustentable']} obligatorio />
                  </>
                )}

                <PasswordField label="Contraseña" value={contraseña} onChange={setContraseña} error={errores.contraseña} show={showPassword} setShow={setShowPassword} obligatorio />
                <PasswordField label="Confirma tu contraseña" value={confirmar} onChange={setConfirmar} error={errores.confirmar} show={showConfirmPassword} setShow={setShowConfirmPassword} obligatorio />

                {error && <p className="text-red-600 text-sm text-center font-bold">{error}</p>}

                <button
                  type="submit"
                  disabled={!formValido || loading}
                  className={`bg-[#E4CD87] hover:bg-[#C7952C] text-white py-3 px-6 rounded-2xl font-bold text-2xl mt-4 mx-auto w-[80%] sm:w-1/2 transition-all duration-300 ${(!formValido || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-6 h-6 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      Registrando...
                    </span>
                  ) : (
                    'Comenzar'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {mostrarExito && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-10 w-[90%] max-w-md text-center border-4 border-[#E4CD87] animate-fadeIn">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#E4CD87] text-white text-4xl font-bold">✓</div>
              <h3 className="text-2xl font-bold text-[#4F3E9B]">¡Registro exitoso!</h3>
              <p className="text-gray-700 text-lg">Tu cuenta ha sido creada correctamente.</p>
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
    <input type={tipo} value={value} onChange={e => onChange(e.target.value)} placeholder={label} className="p-4 border border-gray-300 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-purple-400 mt-1" />
    {error && value && tooltip && <div className="tooltip">{error}</div>}
  </label>
);

const PasswordField = ({ label, value, onChange, error, show, setShow, obligatorio = false }) => (
  <label className="text-gray-700 font-medium w-4/5 relative">
    {label} {obligatorio && <span className="text-red-500">*</span>}
    <div className="relative w-full mt-2">
      <input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)} placeholder={label} className="p-4 pr-12 border border-gray-300 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-purple-400 text-base sm:text-sm" />
      <button type="button" onClick={() => setShow(!show)} className="absolute inset-y-0 right-4 flex items-center" tabIndex={-1}>
        {show ? <EyeOff size={22} color="#4F3E9B" className="transition-transform duration-200 hover:scale-110" /> : <Eye size={22} color="#4F3E9B" className="transition-transform duration-200 hover:scale-110" />}
      </button>
    </div>
    {error && value && <div className="tooltip">{error}</div>}
  </label>
);

const SelectField = ({ label, value, onChange, options, obligatorio = false }) => (
  <label className="text-gray-700 font-medium w-4/5">
    {label} {obligatorio && <span className="text-red-500">*</span>}
    <select value={value} onChange={e => onChange(e.target.value)} className="p-4 border border-gray-300 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-purple-400 mt-1 bg-white">
      <option value="" disabled>Selecciona una opción</option>
      {options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
    </select>
  </label>
);
