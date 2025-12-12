import React, { useState, useEffect } from 'react';
import logoImg from './assets/logo.png';
import { 
  IoHome, IoHomeOutline, IoCalendar, IoCalendarOutline,
  IoPeople, IoPeopleOutline, IoMail, IoMailOutline,
  IoLogOut, IoMenu, IoClose, IoChevronForward,
  IoPerson, IoPersonOutline
} from "react-icons/io5";
import { 
  BsPersonWorkspace, BsPerson,
  BsFillPersonFill, BsPeople, BsPeopleFill
} from "react-icons/bs"; 
import { 
  FaRegCalendarAlt, FaUserFriends, 
  FaChartPie, FaBook, FaUsers
} from "react-icons/fa";
import { 
  AiFillMessage, AiOutlineMessage,
  AiFillContacts, AiOutlineContacts
} from "react-icons/ai";
import { 
  HiMiniUserGroup, HiOutlineUserGroup
} from "react-icons/hi2"; 
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    
    const [usuario, setUsuario] = useState(() => {
        try {
            const user = localStorage.getItem('usuario');
            return user ? JSON.parse(user) : null;
        } catch (e) {
            return null;
        }
    });

    // Efecto para detectar scroll
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Cerrar menú al cambiar de ruta
    useEffect(() => {
        setMenuAbierto(false);
    }, [location.pathname]);

    const toggleMenu = () => {
        setMenuAbierto(!menuAbierto);
        document.body.style.overflow = !menuAbierto ? 'hidden' : 'auto';
    };

    const handleLogout = () => {
        // Animación de logout
        document.body.style.transform = 'scale(0.95)';
        document.body.style.opacity = '0.8';
        
        setTimeout(() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('usuario');
            window.location.href = '/login';
        }, 300);
    };

    // Obtener ruta actual para resaltar el item activo
    const getActiveRoute = () => {
        const path = location.pathname;
        if (path.includes('HomeAlumno') || path === '/AccesosMaestros' || path === '/Registro' || path === '/Homepsicologa') return 'inicio';
        if (path.includes('Calendario')) return 'agenda';
        if (path.includes('Contacto')) return 'contacto';
        if (path.includes('Grupos')) return 'grupos';
        if (path.includes('Mensajes')) return 'mensajes';
        return null;
    };

    const activeRoute = getActiveRoute();

    const NavItem = ({ to, label, icon: Icon, iconOutline: IconOutline, onClick, isActive }) => {
        const isHovered = hoveredItem === label;
        const IconComponent = isActive || isHovered ? Icon : IconOutline || Icon;
        
        return (
            <Link 
                to={to} 
                className={`
                    group flex items-center justify-between md:justify-start gap-4 
                    text-gray-800 font-semibold p-3 md:p-4 rounded-xl 
                    transition-all duration-300 cursor-pointer relative
                    ${isActive 
                        ? 'bg-gradient-to-r from-[#E4CD87] to-[#C7952C] text-white shadow-lg' 
                        : 'hover:bg-[#FFEDE7] hover:shadow-md hover:text-[#8C1F2F]'
                    }
                    overflow-hidden
                `}
                onClick={onClick}
                onMouseEnter={() => setHoveredItem(label)}
                onMouseLeave={() => setHoveredItem(null)}
            >
                {/* Efecto de fondo animado */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#E4CD87] to-[#C7952C] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                
                <div className="flex items-center gap-4 z-10">
                    <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform duration-300`}>
                        <IconComponent 
                            className={`w-6 h-6 ${isActive ? 'text-white' : 'text-[#C7952C]'} transition-colors duration-300`}
                        />
                        {isActive && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse"></div>
                        )}
                    </div>
                    <span className={`text-base md:text-lg transition-all duration-300 ${isHovered && !isActive ? 'translate-x-1' : ''}`}>
                        {label}
                    </span>
                </div>
                
                <IoChevronForward className={`w-4 h-4 md:hidden transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
            </Link>
        );
    };

    return (
        <header className={`
            fixed top-0 left-0 right-0 w-full 
            ${scrolled ? 'bg-[#8C1F2F]/95 backdrop-blur-sm' : 'bg-[#8C1F2F]'} 
            text-white flex items-center justify-between px-4 md:px-6 lg:px-8 
            h-16 md:h-20 z-50 shadow-lg transition-all duration-300
            ${menuAbierto ? 'md:shadow-2xl' : ''}
        `}>
            
            {usuario && (
                <div className="flex items-center gap-4 md:gap-6">
                    {/* Botón Hamburguesa Mejorado */}
                    <button
                        className="flex flex-col justify-between w-7 h-5 md:w-8 md:h-6 cursor-pointer z-50 hover:opacity-90 transition-all duration-300 group"
                        onClick={toggleMenu}
                        aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
                    >
                        <span className={`
                            block h-0.5 md:h-1 w-full bg-white rounded-full 
                            transition-all duration-300 origin-left
                            ${menuAbierto ? 'translate-y-2 md:translate-y-2.5 rotate-45 scale-x-110' : 'group-hover:scale-x-110'}
                        `} />
                        <span className={`
                            block h-0.5 md:h-1 w-full bg-white rounded-full 
                            transition-all duration-300
                            ${menuAbierto ? 'opacity-0 scale-x-0' : 'opacity-100 group-hover:scale-x-110'}
                        `} />
                        <span className={`
                            block h-0.5 md:h-1 w-full bg-white rounded-full 
                            transition-all duration-300 origin-left
                            ${menuAbierto ? '-translate-y-2 md:-translate-y-2.5 -rotate-45 scale-x-110' : 'group-hover:scale-x-110'}
                        `} />
                    </button>

                    {/* Saludo animado */}
                    <div className="hidden md:flex items-center gap-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-[#E4CD87] to-[#C7952C] rounded-full animate-pulse"></div>
                        <div className="text-xl md:text-2xl font-bold truncate max-w-[200px] lg:max-w-none animate-fadeIn">
                            ¡Hola, <span className="text-[#E4CD87]">{usuario.nombre.split(' ')[0]}</span>!
                        </div>
                    </div>
                </div>
            )}

            {/* Logo y Título */}
            <div className="flex items-center gap-2 md:gap-4 ml-auto md:ml-0 animate-fadeIn">
                <div className="relative">
                    <span className="text-2xl md:text-4xl font-bold tracking-tight">PATU</span>
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#E4CD87] to-[#C7952C] blur opacity-20 rounded-full animate-pulse"></div>
                </div>
                <div className="relative">
                    <img 
                        src={logoImg} 
                        alt="Logo PATU" 
                        className="w-8 h-8 md:w-12 md:h-12 object-contain drop-shadow-lg transition-transform duration-500 hover:rotate-12"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#E4CD87] to-[#C7952C] rounded-full blur opacity-30 animate-ping"></div>
                </div>
            </div>

            {usuario && (
                <>
                    {/* Overlay oscuro con animación */}
                    {menuAbierto && (
                        <div 
                            className={`
                                fixed inset-0 bg-black/60 backdrop-blur-sm z-40 
                                animate-fadeIn md:animate-fadeIn
                            `}
                            onClick={toggleMenu}
                        />
                    )}

                    {/* Menú Lateral Mejorado */}
                    <nav className={`
                        fixed top-0 left-0 
                        w-[85%] max-w-sm md:w-72 lg:w-80
                        h-screen
                        bg-gradient-to-b from-[#FFFBF4] to-gray-50
                        p-5 md:p-6
                        flex flex-col gap-2
                        overflow-y-auto shadow-2xl z-50 
                        transition-transform duration-500 ease-in-out
                        ${menuAbierto ? 'translate-x-0 shadow-3xl' : '-translate-x-full'}
                        border-r-2 border-[#E4CD87]/20
                    `}>

                        {/* Header del menú */}
                        <div className="flex items-center justify-between mb-6 md:mb-8 pb-4 md:pb-6 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-[#E4CD87] to-[#C7952C] rounded-full">
                                    <BsFillPersonFill className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <div className="text-[#8C1F2F] font-bold text-lg md:text-xl truncate max-w-[150px]">
                                        {usuario.nombre.split(' ')[0]}
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                        <span className="px-2 py-0.5 bg-gray-100 rounded-full text-gray-600 font-medium capitalize">
                                            {usuario.rol}
                                        </span>
                                        <span className="text-gray-400">•</span>
                                        <span>{usuario.matricula || usuario.correo?.split('@')[0]}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={toggleMenu}
                                className="p-2 text-gray-400 hover:text-[#8C1F2F] hover:bg-gray-100 rounded-full transition-colors duration-300 md:hidden"
                                aria-label="Cerrar menú"
                            >
                                <IoClose className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Sección principal del menú */}
                        <div className="flex-grow space-y-1 md:space-y-2">
                            {/* Inicio */}
                            {usuario.rol === 'tutor' && (
                                <NavItem 
                                    to="/AccesosMaestros" 
                                    label="Inicio" 
                                    icon={IoHome}
                                    iconOutline={IoHomeOutline}
                                    onClick={toggleMenu}
                                    isActive={activeRoute === 'inicio'}
                                />
                            )}
                            {usuario.rol === 'alumno' && (
                                <NavItem 
                                    to={`/HomeAlumno/${usuario.matricula}`} 
                                    label="Inicio" 
                                    icon={IoHome}
                                    iconOutline={IoHomeOutline}
                                    onClick={toggleMenu}
                                    isActive={activeRoute === 'inicio'}
                                />
                            )}
                            {usuario.rol === 'admin' && (
                                <NavItem 
                                    to="/Registro" 
                                    label="Inicio" 
                                    icon={IoHome}
                                    iconOutline={IoHomeOutline}
                                    onClick={toggleMenu}
                                    isActive={activeRoute === 'inicio'}
                                />
                            )}
                            {usuario.rol === 'psicologia' && (
                                <NavItem 
                                    to="/Homepsicologa" 
                                    label="Inicio" 
                                    icon={IoHome}
                                    iconOutline={IoHomeOutline}
                                    onClick={toggleMenu}
                                    isActive={activeRoute === 'inicio'}
                                />
                            )}

                            {/* Agenda - Disponible para varios roles */}
                            {(usuario.rol === 'tutor' || usuario.rol === 'alumno' || usuario.rol === 'psicologia') && (
                                <NavItem 
                                    to="/Calendario" 
                                    label="Agenda" 
                                    icon={IoCalendar}
                                    iconOutline={IoCalendarOutline}
                                    onClick={toggleMenu}
                                    isActive={activeRoute === 'agenda'}
                                />
                            )}

                            {/* Contacto - Disponible para tutor y alumno */}
                            {(usuario.rol === 'tutor' || usuario.rol === 'alumno') && (
                                <NavItem 
                                    to="/Contacto" 
                                    label="Contacto" 
                                    icon={AiFillContacts}
                                    iconOutline={AiOutlineContacts}
                                    onClick={toggleMenu}
                                    isActive={activeRoute === 'contacto'}
                                />
                            )}

                            {/* Grupos - Disponible para varios roles */}
                            {(usuario.rol === 'tutor' || usuario.rol === 'alumno' || usuario.rol === 'admin') && (
                                <NavItem 
                                    to="/Grupos" 
                                    label="Grupos" 
                                    icon={HiMiniUserGroup}
                                    iconOutline={HiOutlineUserGroup}
                                    onClick={toggleMenu}
                                    isActive={activeRoute === 'grupos'}
                                />
                            )}

                            {/* Mensajes/Reportes */}
                            {usuario.rol === 'alumno' && (
                                <NavItem 
                                    to="/Mensajes" 
                                    label="Reportes" 
                                    icon={AiFillMessage}
                                    iconOutline={AiOutlineMessage}
                                    onClick={toggleMenu}
                                    isActive={activeRoute === 'mensajes'}
                                />
                            )}
                            {(usuario.rol === 'admin' || usuario.rol === 'cordi') && (
                                <NavItem 
                                    to="/MensajesCordi" 
                                    label="Mensajes" 
                                    icon={IoMail}
                                    iconOutline={IoMailOutline}
                                    onClick={toggleMenu}
                                    isActive={activeRoute === 'mensajes'}
                                />
                            )}
                        </div>

                        {/* Footer del menú con Logout */}
                        <div className="mt-auto pt-4 md:pt-6 border-t border-gray-200">
                            <button
                                onClick={handleLogout}
                                className={`
                                    group flex items-center justify-between md:justify-start gap-4 
                                    text-gray-800 font-semibold p-3 md:p-4 rounded-xl 
                                    transition-all duration-300 cursor-pointer relative
                                    w-full text-left hover:bg-red-50 hover:text-red-600
                                    overflow-hidden
                                `}
                                onMouseEnter={() => setHoveredItem('logout')}
                                onMouseLeave={() => setHoveredItem(null)}
                            >
                                {/* Efecto de fondo animado */}
                                <div className="absolute inset-0 bg-gradient-to-r from-red-100 to-pink-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                
                                <div className="flex items-center gap-4 z-10">
                                    <div className="relative transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                                        <IoLogOut className="w-6 h-6 text-red-500 transition-colors duration-300" />
                                        {hoveredItem === 'logout' && (
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                                        )}
                                    </div>
                                    <span className="text-base md:text-lg transition-all duration-300 group-hover:translate-x-1">
                                        Cerrar sesión
                                    </span>
                                </div>
                                
                                <IoChevronForward className="w-4 h-4 text-red-400 md:hidden transition-all duration-300 group-hover:translate-x-1" />
                            </button>
                        </div>
                    </nav>
                </>
            )}

            {/* Estilos CSS para animaciones */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { 
                        opacity: 0; 
                        transform: translateY(-10px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0); 
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
                
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
                
                .animate-slideDown {
                    animation: slideDown 0.3s ease-out;
                }
            `}</style>
        </header>
    );
};

export default Navbar;