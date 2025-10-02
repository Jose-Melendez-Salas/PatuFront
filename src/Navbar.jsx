import React, { useState, useEffect } from 'react';
import logoImg from './assets/logo.png';
import iconCasita from './assets/casita.png';
import iconAlumnos from './assets/alumnos.png';
import iconAgenda from './assets/agenda.png';
import iconConfig from './assets/config.png';
import iconCerrarsesion from './assets/cerrarsesion.png';

const Navbar = () => {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        const user = localStorage.getItem('usuario');
        if (user) setUsuario(JSON.parse(user));
    }, []);

    const toggleMenu = () => setMenuAbierto(!menuAbierto);

    return (
        <header className="relative bg-[#4F3E9B] text-white flex items-center justify-between px-5 h-20">
            <div className="flex items-center gap-8">
                {/* Hamburguesa siempre visible */}
                <div
                    className="flex flex-col justify-between w-8 h-6 cursor-pointer"
                    onClick={toggleMenu}
                >
                    <span className={`block h-1 w-full bg-white rounded transition-transform duration-300 ${menuAbierto ? 'translate-y-2 rotate-45' : ''}`} />
                    <span className={`block h-1 w-full bg-white rounded transition-opacity duration-300 ${menuAbierto ? 'opacity-0' : 'opacity-100'}`} />
                    <span className={`block h-1 w-full bg-white rounded transition-transform duration-300 ${menuAbierto ? '-translate-y-2 -rotate-45' : ''}`} />
                </div>

                {/* Saludo dinámico */}
                <div className="text-3xl font-bold">
                    ¡Hola, {usuario ? usuario.nombre : 'Invitado'}!
                </div>
            </div>

            {/* Logo */}
            <div className="flex items-center gap-4 text-4xl font-bold">
                PATU
                <img src={logoImg} alt="Logo" className="w-12 h-12" />
            </div>

            {/* Menú desplegable siempre visible */}
            <nav className={`absolute top-20 left-0 w-72 h-[calc(100vh-80px)] bg-[#F7F4FF] p-5 flex-col gap-3 overflow-y-auto shadow-lg z-50 ${menuAbierto ? 'flex' : 'hidden'}`}>
                <a href="/AccesosMaestros" className="flex items-center gap-2 text-black text-xl font-bold p-3 hover:bg-purple-100">
                    <img src={iconCasita} alt="Casita" className="w-9 h-9" />
                    Inicio
                </a>
                <a href="/ListaAlumnos" className="flex items-center gap-2 text-black text-xl font-bold p-3 hover:bg-purple-100">
                    <img src={iconAlumnos} alt="Alumnos" className="w-9 h-9" />
                    Alumnos
                </a>
                <a href="/Calendario" className="flex items-center gap-2 text-black text-xl font-bold p-3 hover:bg-purple-100">
                    <img src={iconAgenda} alt="Agenda" className="w-9 h-9" />
                    Agenda
                </a>
                <a href="/configuracion" className="flex items-center gap-2 text-black text-xl font-bold p-3 hover:bg-purple-100">
                    <img src={iconConfig} alt="Configuración" className="w-9 h-9" />
                    Configuración
                </a>
                <a href="/login" className="flex items-center gap-2 mt-auto text-black text-xl font-bold p-3 hover:bg-purple-100 w-full text-left">
                    <img src={iconCerrarsesion} alt="Cerrar sesión" className="w-9 h-9 rotate-180" />
                    Cerrar sesión
                </a>
            </nav>
        </header>
    );
};

export default Navbar;
