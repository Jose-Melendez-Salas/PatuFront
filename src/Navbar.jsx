import React, { useState } from 'react';
import logoImg from './assets/logo.png';
import { IoHome } from "react-icons/io5";
import { BsPersonWorkspace } from "react-icons/bs"; 
import { FaRegCalendarAlt } from "react-icons/fa";
import { AiFillMessage } from "react-icons/ai";
import { CiLogout } from "react-icons/ci";
import { HiMiniUserGroup } from "react-icons/hi2"; 
import { Link } from 'react-router-dom';

const estilos = {
  contenedorAccesos: {
    contenedor: `
      group flex items-center gap-4 text-black font-bold 
      p-3 rounded-xl transition-all duration-300
      text-lg hover:bg-[#FFEDE7] hover:shadow-md
      cursor-pointer
    `,
    icono: {
      color: "#C7952C",
      fontSize: "1.5rem" 
    }
  }
};

const Navbar = () => {
    const [menuAbierto, setMenuAbierto] = useState(false);
    
    const [usuario, setUsuario] = useState(() => {
        try {
            const user = localStorage.getItem('usuario');
            return user ? JSON.parse(user) : null;
        } catch (e) {
            return null;
        }
    });

    const toggleMenu = () => setMenuAbierto(!menuAbierto);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('usuario');
        window.location.href = '/login';
    };

    return (
        <header className="fixed top-0 left-0 right-0 w-full bg-[#8C1F2F] text-white flex items-center justify-between px-4 md:px-5 h-16 md:h-20 z-50 shadow-md">
            
            {usuario && (
                <div className="flex items-center gap-4 md:gap-8">
                    {/* Botón Hamburguesa */}
                    <div
                        className="flex flex-col justify-between w-6 h-5 md:w-8 md:h-6 cursor-pointer z-50 hover:opacity-80 transition-opacity"
                        onClick={toggleMenu}
                    >
                        <span className={`block h-1 w-full bg-white rounded transition-transform duration-300 ${menuAbierto ? 'translate-y-2 md:translate-y-2.5 rotate-45' : ''}`} />
                        <span className={`block h-1 w-full bg-white rounded transition-opacity duration-300 ${menuAbierto ? 'opacity-0' : 'opacity-100'}`} />
                        <span className={`block h-1 w-full bg-white rounded transition-transform duration-300 ${menuAbierto ? '-translate-y-2 md:-translate-y-2.5 -rotate-45' : ''}`} />
                    </div>

                    <div className="hidden md:block text-xl md:text-3xl font-bold truncate max-w-[200px] lg:max-w-none">
                        ¡Hola, {usuario.nombre.split(' ')[0]}!
                    </div>
                </div>
            )}

            <div className="flex items-center gap-2 md:gap-4 ml-auto">
                <span className="text-2xl md:text-4xl font-bold">PATU</span>
                <img src={logoImg} alt="Logo" className="w-8 h-8 md:w-12 md:h-12 object-contain" />
            </div>

            {usuario && (
                <>
                    {/* Overlay oscuro */}
                    {menuAbierto && (
                        <div 
                            className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fadeIn"
                            onClick={toggleMenu}
                        />
                    )}

                    {/* --- MENÚ LATERAL CORREGIDO --- */}
                    <nav className={`
                        fixed top-16 md:top-20 left-0 
                        w-[85%] md:w-72 
                        /* CORRECCIÓN 1: Usar dvh para móviles (altura dinámica) y pb-24 (padding bottom extra) */
                        h-[calc(100dvh-64px)] md:h-[calc(100vh-80px)] 
                        bg-[#FFFBF4] 
                        p-5 pb-24 md:pb-5 
                        flex flex-col gap-2 
                        overflow-y-auto shadow-2xl z-50 
                        transition-transform duration-300 ease-in-out
                        ${menuAbierto ? 'translate-x-0' : '-translate-x-full'}
                    `}>

                        <div className="md:hidden mb-4 pb-4 border-b border-gray-300 text-[#8C1F2F] font-bold text-xl">
                            Hola, {usuario.nombre.split(' ')[0]}
                        </div>

                        {usuario.rol === 'tutor' && (
                            <Link to="/AccesosMaestros" className={estilos.contenedorAccesos.contenedor} onClick={toggleMenu}>
                                <IoHome style={estilos.contenedorAccesos.icono} /> Inicio
                            </Link>
                        )}
                        {usuario.rol === 'alumno' && (
                            <Link to={`/HomeAlumno/${usuario.matricula}`} className={estilos.contenedorAccesos.contenedor} onClick={toggleMenu}>
                                <IoHome style={estilos.contenedorAccesos.icono} /> Inicio
                            </Link>
                        )}
                        {usuario.rol === 'admin' && (
                            <Link to="/Registro" className={estilos.contenedorAccesos.contenedor} onClick={toggleMenu}>
                                <IoHome style={estilos.contenedorAccesos.icono} /> Inicio
                            </Link>
                        )}

                        

                        <Link to="/Grupos" className={estilos.contenedorAccesos.contenedor} onClick={toggleMenu}>
                            <HiMiniUserGroup style={estilos.contenedorAccesos.icono} /> Grupos
                        </Link>

                        {(usuario.rol === 'alumno' || usuario.rol === 'tutor') && (
                            <>
                                <Link to="/Calendario" className={estilos.contenedorAccesos.contenedor} onClick={toggleMenu}>
                                    <FaRegCalendarAlt style={estilos.contenedorAccesos.icono} /> Agenda
                                </Link>
                                <Link to="/Contacto" className={estilos.contenedorAccesos.contenedor} onClick={toggleMenu}>
                                    <BsPersonWorkspace style={estilos.contenedorAccesos.icono} /> Contacto
                                </Link>
                            </>
                        )}

                        {usuario.rol === 'psicologia' && (
  <>
    <Link
      to="/Homepsicologa"
      className={estilos.contenedorAccesos.contenedor}
      onClick={toggleMenu}
    >
      <IoHome style={estilos.contenedorAccesos.icono} /> Inicio
    </Link>

    <Link
      to="/CalendarioPsico"
      className={estilos.contenedorAccesos.contenedor}
      onClick={toggleMenu}
    >
      <FaRegCalendarAlt style={estilos.contenedorAccesos.icono} /> Calendario
    </Link>

    
  </>
)}

                        {(usuario.rol === 'alumno' || usuario.rol === 'admin') && (
                            <Link to={usuario.rol === 'admin' ? "/MensajesCordi" : "/Mensajes"} className={estilos.contenedorAccesos.contenedor} onClick={toggleMenu}>
                                <AiFillMessage style={estilos.contenedorAccesos.icono} /> Mensajes
                            </Link>
                        )}

                        {/* El botón ahora tiene margen superior automático para ir al fondo */}
          {/* Logout */}
                            <button
                              onClick={handleLogout}
                              className={`${estilos.contenedorAccesos.contenedor} mt-auto w-full text-left`}
                            >
                              < CiLogout className="w-9 h-9" style={estilos.contenedorAccesos.icono.base} />
                              Cerrar sesión
                        </button>
                    </nav>
                </>
            )}
        </header>
    );
};

export default Navbar;