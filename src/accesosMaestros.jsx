import React, { useState } from 'react'
import './accesosMaestros.css'
import logoImg from './assets/logo.png'
import iconCasita from './assets/casita.png'
import iconAlumnos from './assets/alumnos.png'
import iconAgenda from './assets/agenda.png'
import iconConfig from './assets/config.png'
import iconCerrarsesion from './assets/cerrarsesion.png'

const AccesosMaestros = ({ nombreUsuario }) => {
    const [menuAbierto, setMenuAbierto] = useState(false)

    const toggleMenu = () => setMenuAbierto(!menuAbierto)

    return (
        <>
            <header className="navbar">

                {/* Contenedor izquierda: hamburguesa + mensaje */}
                <div className="nav-izquierda">
                    <div
                        className={`hamburger ${menuAbierto ? 'active' : ''}`}
                        onClick={toggleMenu}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>

                    <div className="mensaje-usuario">
                        ¡Hola, {nombreUsuario}!
                    </div>
                </div>

                {/* Menú desplegable */}
                <nav className={`menu ${menuAbierto ? 'show' : ''}`}>
                    <a href="#"><img src={iconCasita} alt="Casita" className="menu-icon" />Inicio</a>
                    <a href="#"><img src={iconAlumnos} alt="Alumnos" className="menu-icon" />Alumnos</a>
                    <a href="#"><img src={iconAgenda} alt="Agenda" className="menu-icon" />Agenda</a>
                    <a href="#"><img src={iconConfig} alt="Configuración" className="menu-icon" />Configuración</a>
                    <a href="#" className="cerrar-sesion">
                        <img src={iconCerrarsesion} alt="Cerrarsesion" className="menucerrar-icon" />
                        Cerrar sesión
                    </a>
                </nav>

                {/* Logo a la derecha */}
                <div className="logo">
                    PATU
                    <img src={logoImg} alt="Logo" className="logo-img" />
                </div>

            </header>

            <main className="contenido">
                <h1>Accesos Maestros</h1>
                <p>Aquí irá el contenido de esta sección.</p>
            </main>
        </>
    )
}

export default AccesosMaestros
