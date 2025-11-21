import React, { useState } from 'react';
import logoImg from './assets/logo.png';
//import iconCasita from './assets/casita.png';
import { IoHome } from "react-icons/io5";
import { BsPersonWorkspace } from "react-icons/bs"; // Maestro
import { FaRegCalendarAlt } from "react-icons/fa";// Agenda
import { AiFillMessage } from "react-icons/ai";// Mensajes
import { CiLogout } from "react-icons/ci";// Cerrar sesión
import { HiMiniUserGroup } from "react-icons/hi2"; // Grupos

import iconAlumnos from './assets/alumnos.png';
import iconAgenda from './assets/agenda.png';
import iconMail from './assets/mail.png';
import iconCerrarsesion from './assets/cerrarsesion.png';
import iconMensajes from './assets/mensajes.png';
import iconChatIA from './assets/ia.png';
import { Link } from 'react-router-dom';

// Creacion de los estilos del Navbar
const colores = {
  icono: "#C7952C",
  fondoHover: "#FFEDE7",
  sombraHover: "rgba(190,162,106,0.45)",
  sombraInterior: "#A14B12",
};

const estilos = {
  contenedorAccesos: {
    contenedor: `
      group flex items-center gap-2 text-black text-xl font-bold 
      p-3 rounded-xl transition-all duration-300
      hover:bg-[#FFEDE7]
      hover:shadow-[0_4px_10px_rgba(190,162,106,0.45)]
    `,
    icono: {
      base: {
        color: colores.icono,
        transition: "all 0.3s",
        filter: "drop-shadow(0 0 0 transparent)" // sin sombra por defecto
      },
      hover: {
        filter: "drop-shadow(2px 4px 6px #A14B12)" // sombra interior al hacer hover
      }
    }
  }
};



const Navbar = () => {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [usuario, setUsuario] = useState(() => {
        const user = localStorage.getItem('usuario');
        return user ? JSON.parse(user) : null;
    });

    const toggleMenu = () => setMenuAbierto(!menuAbierto);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('usuario');
        window.location.href = '/login';
    };

    return (
        <header className="relative bg-[#8C1F2F] text-white flex items-center justify-between px-5 h-20">
            {usuario && (
                <div className="flex items-center gap-8">
                    <div
                        className="flex flex-col justify-between w-8 h-6 cursor-pointer"
                        onClick={toggleMenu}
                    >
                        <span className={`block h-1 w-full bg-white rounded transition-transform duration-300 ${menuAbierto ? 'translate-y-2 rotate-45' : ''}`} />
                        <span className={`block h-1 w-full bg-white rounded transition-opacity duration-300 ${menuAbierto ? 'opacity-0' : 'opacity-100'}`} />
                        <span className={`block h-1 w-full bg-white rounded transition-transform duration-300 ${menuAbierto ? '-translate-y-2 -rotate-45' : ''}`} />
                    </div>

                    <div className="text-3xl font-bold">
                        ¡Hola, {usuario.nombre}!
                    </div>
                </div>
            )}

            <div className="flex items-center gap-4 text-4xl font-bold ml-auto">
                PATU
                <img src={logoImg} alt="Logo" className="w-12 h-12" />
            </div>

            {usuario && (
  <nav className={`absolute top-20 left-0 w-72 h-[calc(100vh-80px)] bg-[#FFFBF4] p-5 flex-col gap-3 overflow-y-auto shadow-lg z-50 ${menuAbierto ? 'flex' : 'hidden'}`}>

    {/* Inicio según rol */}
    {usuario.rol === 'tutor' && (
        
        //ICONOS DE CASITA

      <a href="/AccesosMaestros" className={estilos.contenedorAccesos.contenedor}>
        <IoHome className="w-9 h-9" style={estilos.contenedorAccesos.icono.base} />
        <style>{`.group:hover .w-9 { filter: ${estilos.contenedorAccesos.icono.hover.filter}; }`}</style>
        Inicio
      </a>
    )}
    {usuario.rol === 'alumno' && (
      <a href={`/HomeAlumno/${usuario.matricula}`} className={estilos.contenedorAccesos.contenedor}>
        <IoHome className="w-9 h-9" style={estilos.contenedorAccesos.icono.base} />
        <style>{`.group:hover .w-9 { filter: ${estilos.contenedorAccesos.icono.hover.filter}; }`}</style>
        Inicio
      </a>
    )}
    {usuario.rol === 'admin' && (
      <a href="/Registro" className={estilos.contenedorAccesos.contenedor}>
        <IoHome className="w-9 h-9" style={estilos.contenedorAccesos.icono.base} />
        <style>{`.group:hover .w-9 { filter: ${estilos.contenedorAccesos.icono.hover.filter}; }`}</style>
        Inicio
      </a>
    )}

    {/* Grupos */}

    <a href="/Grupos" className={estilos.contenedorAccesos.contenedor}>
      <HiMiniUserGroup className="w-9 h-9" style={estilos.contenedorAccesos.icono.base} />
      Grupos
    </a>

    {/* Agenda */}
    {(usuario.rol === 'alumno' || usuario.rol === 'tutor') && (
      <a href="/Calendario" className={estilos.contenedorAccesos.contenedor}>
        <FaRegCalendarAlt className="w-9 h-9" style={estilos.contenedorAccesos.icono.base} />
        Agenda
      </a>
    )}

    {/* Contacto */}
    {(usuario.rol === 'alumno' || usuario.rol === 'tutor') && (
      <a href="/Contacto" className={estilos.contenedorAccesos.contenedor}>
        <BsPersonWorkspace className="w-9 h-9" style={estilos.contenedorAccesos.icono.base} />
        Contacto
      </a>
    )}

    {/* Mensajes */}
    {(usuario.rol === 'alumno' || usuario.rol === 'admin') && (
      <a href={usuario.rol === 'admin' ? "/MensajesCordi" : "/Mensajes"} className={estilos.contenedorAccesos.contenedor}>
        <AiFillMessage className="w-9 h-9" style={estilos.contenedorAccesos.icono.base} />
        Mensajes
      </a>
    )}

    {/* Logout */}
    <button
      onClick={handleLogout}
      className={`${estilos.contenedorAccesos.contenedor} mt-auto w-full text-left`}
    >
      < CiLogout className="w-9 h-9" style={estilos.contenedorAccesos.icono.base} />
      Cerrar sesión
    </button>
  </nav>
)}



        </header>
    );
};

export default Navbar;
