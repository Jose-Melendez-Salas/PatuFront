import React, { useState, useEffect } from 'react';
import { Home, Search, Calendar, ClipboardList, Trash2, ArrowRight } from "lucide-react";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { useNavigate } from "react-router-dom";

import Navbar from './Navbar'; 


const COLORS = {
    header: 'bg-[#8C1F2F]', // Rojo Oscuro
    acentoPrincipal: 'bg-[#3A8A4F]', // Verde 
    acentoSecundario: 'bg-[#D9792B]', // Naranja/Dorado 
    bordeClaro: 'border-[#E9DBCD]',
    textoPrincipal: 'text-[#222222]',
};


const SessionCard = ({ evento, onActionClick, onRegisterNotes }) => {

    const isPending = evento.tipo !== 'psicologia' && evento.estado === 'pendiente';
    const isPsychology = evento.tipo === 'psicologia';
    const accentColor = isPending ? COLORS.acentoSecundario : COLORS.acentoPrincipal;
    const buttonText = isPsychology && evento.estado === 'pendiente' ? 'Programar Cita' : 'Iniciar Sesión';

    return (
        <div className={`bg-white rounded-xl p-5 mb-4 shadow-lg flex justify-between items-center border-l-8 ${isPending ? 'border-[#D9792B]' : 'border-[#3A8A4F]'}`}>
            <div className='flex-1 pr-4'>
                <h3 className={`text-lg font-bold ${COLORS.textoPrincipal}`}>{evento.alumno?.nombre || 'Alumno Desconocido'}</h3>
                <p className='text-sm text-gray-600 mt-1'>
                    {isPsychology ? 
                        `Motivo: ${evento.comentarios}` :
                        `Tipo: ${evento.tipo || 'Sesión General'}`
                    }
                </p>
                <p className='text-xs text-gray-500 mt-2'>
                    {evento.fecha} | {evento.hora_inicio} - {evento.hora_fin}
                </p>
            </div>
            <div className="flex flex-col space-y-2">
                
                <button
                    onClick={() => onActionClick(evento)}
                    className={`px-4 py-2 rounded-lg text-white font-semibold transition-all hover:opacity-90 ${accentColor}`}>
                    {buttonText}
                </button>
                
                {evento.estado === 'completada' && (
                    <button
                        onClick={() => onRegisterNotes(evento.id_sesion)}
                        className={`px-4 py-2 rounded-lg text-sm bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-all`}>
                        <ClipboardList className='inline w-4 h-4 mr-1' /> {evento.notas ? 'Ver Notas' : 'Registrar Notas'}
                    </button>
                )}
            </div>
        </div>
    );
};


export function Homepsicologa() {
    const navigate = useNavigate();
    const [sesiones, setSesiones] = useState([]);
    const [solicitudesAlumno, setSolicitudesAlumno] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const psicologoId = usuario?.id;

    
    useEffect(() => {
        

        
        const fetchSesiones = async () => {
            try {
                const urlSesiones = `https://apis-patu.onrender.com/api/sesiones/tutor/${psicologoId}`;
                const res = await fetch(urlSesiones, {
                    headers: { "Authorization": `Bearer ${usuario.accessToken}` }
                });
                const data = await res.json();
                
                if (!res.ok) {
                    setError(data.message || "Error al cargar sesiones.");
                    return;
                }

                const sesionesProgramadas = data.data.filter(s => s.tipo === 'psicologia' && s.estado !== 'pendiente');
                
                
                const solicitudes = data.data.filter(s => s.tipo === 'psicologia' && s.estado === 'pendiente');

                setSesiones(sesionesProgramadas);
                setSolicitudesAlumno(solicitudes);
                setError(null);

            } catch (err) {
                console.error(err);
                setError("Error de conexión al cargar datos.");
            } finally {
                setLoading(false);
            }
        };

        fetchSesiones();
    }, [psicologoId]);


    
    const handleAction = (evento) => {
        if (evento.estado === 'pendiente') {
            
            Swal.fire('Programar Cita', 'Se abrirá el formulario para asignar fecha y hora a esta solicitud.', 'info');
            
        } else {
            
            navigate(`/bitacora/${evento.id_sesion}`);
        }
    };

    const handleRegisterNotes = (id_sesion) => {
        navigate(`/bitacora/${id_sesion}`);
    };

    if (!usuario) {
        return <div className="p-8 text-center pt-28">Por favor, inicie sesión.</div>;
    }

    return (
        <>
            <Navbar />
            
            {error && (
                <div className="bg-red-100 text-red-700 p-4 text-center font-bold pt-20">
                    {error}
                </div>
            )}

            

         
            <main className="p-8 flex flex-col lg:flex-row gap-6">
                
                
                <div className="flex-3 w-full lg:w-3/4">
                    <h2 className={`text-xl font-bold mb-4 border-b-2 border-gray-300 pb-2 ${COLORS.textoPrincipal}`}>Sesiones Programadas y Próximas</h2>
                  
                    <div className="flex gap-4 mb-6">
                        <input type="text" placeholder="Buscar Alumno..." className="flex-1 p-3 border rounded-lg shadow-sm" />
                        <select className="p-3 border rounded-lg shadow-sm">
                            <option>Estado: Todos</option>
                            <option>Próxima</option>
                            <option>Pendiente de Notas</option>
                        </select>
                        <select className="p-3 border rounded-lg shadow-sm">
                            <option>Tipo: Psicología</option>
                            <option>Referido Maestro</option>
                        </select>
                    </div>

                    
                    {loading ? (
                        <div className="text-center py-12">Cargando sesiones...</div>
                    ) : sesiones.length === 0 ? (
                        <div className="bg-gray-100 p-8 rounded-xl text-center text-gray-600">
                            <Calendar className="w-8 h-8 mx-auto mb-3" />
                            <p>No hay sesiones de psicología programadas por el momento.</p>
                        </div>
                    ) : (
                        <div>
                            {sesiones.map(evento => (
                                <SessionCard 
                                    key={evento.id_sesion} 
                                    evento={evento} 
                                    onActionClick={handleAction}
                                    onRegisterNotes={handleRegisterNotes}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className={`w-full lg:w-1/4 bg-white rounded-xl p-6 shadow-xl space-y-8 h-fit sticky top-28 ${COLORS.bordeClaro} border-2`}>
                    
                
                    <div>
                        <h3 className={`text-lg font-bold mb-4 border-b pb-2 text-[#8C1F2F] flex items-center gap-2`}>
                            <ClipboardList className='w-5 h-5' /> Solicitudes Pendientes ({solicitudesAlumno.length})
                        </h3>
                        
                        {solicitudesAlumno.length === 0 ? (
                            <p className="text-sm text-gray-500">No hay nuevas solicitudes.</p>
                        ) : (
                            <div className='space-y-3'>
                                {solicitudesAlumno.map((solicitud) => (
                                    <div key={solicitud.id_sesion} className='flex justify-between items-center text-sm p-2 border-l-4 border-yellow-500 bg-yellow-50 rounded-sm'>
                                        <p className='font-medium'>{solicitud.alumno?.nombre || 'Alumno'}</p>
                                        <button 
                                            onClick={() => handleAction(solicitud)}
                                            className='text-xs text-[#8C1F2F] font-semibold hover:underline flex items-center'>
                                            Programar <ArrowRight className='w-3 h-3 ml-1'/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button
                            onClick={() => navigate("/bitacora/recientes")} // Asumiendo que tienes una ruta de creación
                            className="mt-4 w-full flex items-center justify-center gap-2 bg-[#E4CD87] text-black font-bold py-2 rounded-lg shadow-md hover:bg-[#E9DBCD] transition-all"
                        >
                            <Calendar className='w-5 h-5'/> Agendar Sesión Manual
                        </button>
                    </div>

                    
                    <div>
                        <h3 className={`text-lg font-bold mb-4 border-b pb-2 text-[#8C1F2F] flex items-center gap-2`}>
                            <ClipboardList className='w-5 h-5' /> Bitácora
                        </h3>
                         <button
                            onClick={() => navigate("/CalendarioPsico")} 
                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-semibold transition-all hover:opacity-90 ${COLORS.acentoPrincipal}`}
                        >
                            Ver Notas Recientes
                        </button>
                    </div>

                </div>
            </main>
        </>
    );
}