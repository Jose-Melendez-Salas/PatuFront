import React from "react";
import Tec from "./assets/Tec.jpg";
import ITSM from "./assets/ITSM.png";
import TecNM from "./assets/TecNM.png";
import Logo from "./assets/PATU-Logo.png";

// Se mantiene el placeholder para la imagen de ejemplo
const placeholderImage =
  "https://community.softr.io/uploads/db9110/original/2X/7/74e6e7e382d0ff5d7773ca9a87e6f6f8817a68a6.jpeg";

export default function PatuLanding() {
  return (
    <>
      <header className="w-screen bg-[#8C1F2F] text-white p-4 flex items-center justify-between fixed top-0 z-10 shadow-lg">
        {/* Contenedor del logo ITSM y títulos */}
        <div className="flex items-center gap-3">
          {/* Tamaño corregido y uso de w-auto para mantener proporción */}
          <img src={ITSM} alt="Logo del ITSM" className="h-12 w-auto" />
          <div className="hidden sm:block">
            <h1 className="font-bold text-lg leading-tight">
              Instituto Tecnológico Superior de El Mante
            </h1>
            <p className="text-sm leading-snug">
              Programa Académico de Tutorías (PATU)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <img src={Logo} alt="Logo PATU" className="h-10 w-auto" />
          <img
            src={TecNM}
            alt="Logo del TecNM"
            className="h-12 w-auto hidden md:block"
          />{" "}
        </div>
      </header>

      <div className="w-full font-sans text-gray-800 pt-20">
        <section
          className="w-full h-[calc(100vh-5rem)] bg-cover bg-center text-white py-24 px-6 flex flex-col items-center justify-center text-center"
          style={{
            backgroundImage: `linear-gradient(rgba(140, 31, 47, 0.75), rgba(140, 31, 47, 0.75)), url(${Tec})`, // Opacidad un poco más alta
          }}
        >
          <h2 className="text-6xl font-extrabold mb-4 drop-shadow-xl animate-fade-in">
            PATU
          </h2>
          <p className="text-3xl font-semibold mb-8 drop-shadow-xl">
            Programa Académico de Tutorías
          </p>
          <p className="max-w-3xl text-xl drop-shadow-lg">
            Una plataforma diseñada para **fortalecer la relación
            tutor-alumno**, facilitar la agenda de tutorías, documentar acuerdos
            y generar reportes para mejorar el seguimiento académico.
          </p>

          <div className="mt-10">
            <a href="/Login" className="inline-block">
              <button className="bg-[#C7952C] text-white hover:bg-[#A97C23] transition duration-300 transform hover:scale-105 px-8 py-4 rounded-full shadow-xl font-bold text-lg uppercase tracking-wider">
                Iniciar Sesión
              </button>
            </a>
          </div>
        </section>
        <div className="border-b-4 border-[#C7952C] mx-auto max-w-7xl my-0">
          <br />
        </div>
        <section className="py-20 px-6 max-w-7xl mx-auto">
          <h3 className="text-4xl font-extrabold text-[#8C1F2F] text-center mb-12">
            Diseñado para la Comunidad del ITSM
          </h3>

          <p className="text-justify max-w-4xl mx-auto mb-16 text-xl leading-relaxed">
            PATU centraliza la gestión de tutorías en un solo lugar: los tutores
            crean grupos, agendan sesiones y registran acuerdos; los alumnos se
            inscriben con un código institucional y consultan su agenda
            personal. Todo pensado para que el proceso sea ágil, seguro y
            trazable.
          </p>

          <div className="flex flex-col md:flex-row gap-12 items-center">
            <ul className="flex-1 text-xl space-y-6 list-disc pl-5">
              <li>
                <strong className="text-[#8C1F2F]">
                  Registro Institucional:
                </strong>{" "}
                acceso con correo institucional y validación de perfil.
              </li>
              <li>
                <strong className="text-[#8C1F2F]">Agenda Centralizada:</strong>{" "}
                vista diaria/semanal/mensual, notificaciones y recordatorios
                automáticos.
              </li>
              <li>
                <strong className="text-[#8C1F2F]">Bitácora Académica:</strong>{" "}
                notas, acuerdos y seguimiento histórico individualizado.
              </li>
            </ul>

            {/* Imagen del Campus/Plataforma */}
            <img
              src={placeholderImage} // Uso de la variable declarada fuera del componente
              alt="Interfaz de la plataforma PATU"
              className="flex-1 rounded-2xl shadow-2xl object-cover h-72 w-full md:w-auto" // Mejor manejo de dimensiones y sombra
            />
          </div>
        </section>
        <div className="border-t-4 border-[#C7952C] mx-auto max-w-7xl my-0">
          <br />
        </div>
        <section className="bg-[#F8F5F2] py-20 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Card 1 */}
            <div className="bg-white shadow-xl p-8 rounded-2xl text-center border-t-4 border-[#C7952C] transition duration-300 hover:shadow-2xl">
              <h4 className="font-bold text-2xl mb-4 text-[#8C1F2F]">
                Agenda Rápida
              </h4>
              <p className="text-lg text-gray-700">
                Agendar una tutoría en menos de 3 pasos, con confirmaciones y
                recordatorios integrados, maximizando el tiempo de tutores y
                alumnos.
              </p>
            </div>

            <div className="bg-white shadow-xl p-8 rounded-2xl text-center border-t-4 border-[#C7952C] transition duration-300 hover:shadow-2xl">
              <h4 className="font-bold text-2xl mb-4 text-[#8C1F2F]">
                Seguimiento Individual
              </h4>
              <p className="text-lg text-gray-700">
                Ficha de alumno con historial completo, observaciones y
                visualización de desempeño y asistencia.
              </p>
            </div>

            <div className="bg-white shadow-xl p-8 rounded-2xl text-center border-t-4 border-[#C7952C] transition duration-300 hover:shadow-2xl">
              <h4 className="font-bold text-2xl mb-4 text-[#8C1F2F]">
                Reportes Inteligentes
              </h4>
              <p className="text-lg text-gray-700">
                Exporta reportes en PDF/Excel y visualiza indicadores clave para
                una toma de decisiones basada en datos.
              </p>
            </div>
          </div>
        </section>
        <section className="py-20 sm:py-24 text-center px-4 sm:px-6 bg-white">
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 sm:mb-8 text-[#8C1F2F] tracking-tight max-w-5xl mx-auto">
            ¿Listo para mejorar el acompañamiento académico?
          </h3>
          <p className="mb-10 text-lg sm:text-xl max-w-3xl mx-auto text-gray-700 leading-relaxed">
            Inicia sesión con tu cuenta institucional y comienza a gestionar tus
            tutorías de forma organizada y eficiente.
          </p>
          <a href="/Login" className="inline-block mt-4">
            <button
              className="bg-[#C7952C] text-white hover:bg-[#A97C23] transition duration-300 transform hover:scale-105 
                     px-10 py-4 sm:px-12 sm:py-5 rounded-full shadow-2xl font-extrabold text-lg sm:text-xl uppercase 
                     tracking-widest focus:outline-none focus:ring-4 focus:ring-[#C7952C] focus:ring-opacity-50"
            >
              Acceder a PATU
            </button>
          </a>
        </section>

        {/* Footer */}
        <footer className="bg-[#8D1B3D] text-white text-center p-6 text-sm border-t-4 border-[#C7952C]">
          <p>
            © {new Date().getFullYear()} Instituto Tecnológico Superior de El
            Mante · PATU — Programa Académico de Tutorías
          </p>
          <p className="mt-2">
            Contacto:{" "}
            <a
              href="mailto:soportePATU@itsmante.edu.mx"
              className="underline hover:text-[#E4CD87]"
            >
              soportePATU@itsmante.edu.mx
            </a>
          </p>
        </footer>
      </div>
    </>
  );
}
