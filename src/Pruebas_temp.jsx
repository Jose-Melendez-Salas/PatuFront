import React, { useState } from 'react';
import logoImg from './assets/logo.png';
// --- 1. IMPORTA EL NAVBAR ---
import Navbar from './Navbar';

const Pruebas_temp = () => {
    // Estados
    const [bitacoras, setBitacoras] = useState([])
    const [reportes, setReportes] = useState([])

    const [bitacoraForm, setBitacoraForm] = useState({
        notas: '',
        observaciones: '',
        acuerdos: '',
        compromisos: '',
        fecha_registro: '',
        registrado_por: '',
        tutorado: ''
    })

    const [reporteForm, setReporteForm] = useState({
        tipo: 'asistencia',
        tutorado: '',
        contenido: '',
        fecha_generacion: '',
        generado_por: ''
    })

    const [editingBitacoraId, setEditingBitacoraId] = useState(null)
    const [editingReporteId, setEditingReporteId] = useState(null)

    // Funciones para Bitácora
    const handleBitacoraSubmit = (e) => {
        e.preventDefault()
        if (editingBitacoraId) {
            setBitacoras(bitacoras.map(b => b.id === editingBitacoraId ? { ...b, ...bitacoraForm } : b))
            setEditingBitacoraId(null)
        } else {
            setBitacoras([...bitacoras, { id: Date.now(), ...bitacoraForm }])
        }
        setBitacoraForm({
            notas: '',
            observaciones: '',
            acuerdos: '',
            compromisos: '',
            fecha_registro: '',
            registrado_por: '',
            tutorado: ''
        })
    }

    const borrarBitacora = (id) => setBitacoras(bitacoras.filter(b => b.id !== id))
    const editarBitacora = (b) => {
        setBitacoraForm(b)
        setEditingBitacoraId(b.id)
    }

    // Funciones para Reportes
    const handleReporteSubmit = (e) => {
        e.preventDefault()
        if (editingReporteId) {
            setReportes(reportes.map(r => r.id === editingReporteId ? { ...r, ...reporteForm } : r))
            setEditingReporteId(null)
        } else {
            setReportes([...reportes, { id: Date.now(), ...reporteForm }])
        }
        setReporteForm({
            tipo: 'asistencia',
            tutorado: '',
            contenido: '',
            fecha_generacion: '',
            generado_por: ''
        })
    }

    const borrarReporte = (id) => setReportes(reportes.filter(r => r.id !== id))
    const editarReporte = (r) => {
        setReporteForm(r)
        setEditingReporteId(r.id)
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            {/* --- 2. REEMPLAZA EL HEADER ANTERIOR CON EL NAVBAR --- */}
            <Navbar />

            <main className="p-6">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Bitacora */}
                    <div className="flex-1 bg-white rounded-3xl p-6 shadow-lg border-4 border-gray-300 animate-fadeIn">
                        <h2 className="text-2xl font-bold mb-4 border-b-4 border-yellow-400 pb-2">Bitácora</h2>
                        <form className="flex flex-col gap-3" onSubmit={handleBitacoraSubmit}>
                            <input type="text" placeholder="Notas" value={bitacoraForm.notas} onChange={e => setBitacoraForm({ ...bitacoraForm, notas: e.target.value })} className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" />
                            <input type="text" placeholder="Observaciones" value={bitacoraForm.observaciones} onChange={e => setBitacoraForm({ ...bitacoraForm, observaciones: e.target.value })} className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" />
                            <input type="text" placeholder="Acuerdos" value={bitacoraForm.acuerdos} onChange={e => setBitacoraForm({ ...bitacoraForm, acuerdos: e.target.value })} className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" />
                            <input type="text" placeholder="Compromisos" value={bitacoraForm.compromisos} onChange={e => setBitacoraForm({ ...bitacoraForm, compromisos: e.target.value })} className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" />
                            <input type="date" placeholder="Fecha registro" value={bitacoraForm.fecha_registro} onChange={e => setBitacoraForm({ ...bitacoraForm, fecha_registro: e.target.value })} className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" />
                            <input type="text" placeholder="Registrado por" value={bitacoraForm.registrado_por} onChange={e => setBitacoraForm({ ...bitacoraForm, registrado_por: e.target.value })} className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" />
                            <input type="text" placeholder="Tutorado" value={bitacoraForm.tutorado} onChange={e => setBitacoraForm({ ...bitacoraForm, tutorado: e.target.value })} className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" />
                            <button type="submit" className="bg-[#3cb9a5] hover:bg-[#1f6b5e] text-white py-2 px-6 rounded-2xl font-bold text-2xl mt-2">
                                {editingBitacoraId ? 'Actualizar' : 'Agregar'}
                            </button>
                        </form>

                        {/* Fichas Bitacoras */}
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {bitacoras.map(b => (
                                <div key={b.id} className="border rounded-xl p-4 bg-gray-50 shadow flex flex-col gap-2">
                                    <p><strong>Notas:</strong> {b.notas}</p>
                                    <p><strong>Observaciones:</strong> {b.observaciones}</p>
                                    <p><strong>Acuerdos:</strong> {b.acuerdos}</p>
                                    <p><strong>Compromisos:</strong> {b.compromisos}</p>
                                    <p><strong>Fecha:</strong> {b.fecha_registro}</p>
                                    <p><strong>Registrado por:</strong> {b.registrado_por}</p>
                                    <p><strong>Tutorado:</strong> {b.tutorado}</p>
                                    <div className="flex gap-2 mt-2">
                                        <button onClick={() => editarBitacora(b)} className="bg-yellow-400 px-2 py-1 rounded text-white">Editar</button>
                                        <button onClick={() => borrarBitacora(b.id)} className="bg-red-500 px-2 py-1 rounded text-white">Borrar</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reportes */}
                    <div className="flex-1 bg-white rounded-3xl p-6 shadow-lg border-4 border-gray-300 animate-fadeIn">
                        <h2 className="text-2xl font-bold mb-4 border-b-4 border-yellow-400 pb-2">Reportes</h2>
                        <form className="flex flex-col gap-3" onSubmit={handleReporteSubmit}>
                            <select value={reporteForm.tipo} onChange={e => setReporteForm({ ...reporteForm, tipo: e.target.value })} className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400">
                                <option value="asistencia">Asistencia</option>
                                <option value="avance">Avance</option>
                                <option value="problematica">Problemática</option>
                            </select>
                            <input type="text" placeholder="Tutorado" value={reporteForm.tutorado} onChange={e => setReporteForm({ ...reporteForm, tutorado: e.target.value })} className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" />
                            <input type="text" placeholder="Contenido" value={reporteForm.contenido} onChange={e => setReporteForm({ ...reporteForm, contenido: e.target.value })} className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" />
                            <input type="date" placeholder="Fecha generación" value={reporteForm.fecha_generacion} onChange={e => setReporteForm({ ...reporteForm, fecha_generacion: e.target.value })} className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" />
                            <input type="text" placeholder="Generado por" value={reporteForm.generado_por} onChange={e => setReporteForm({ ...reporteForm, generado_por: e.target.value })} className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" />
                            <button type="submit" className="bg-[#3cb9a5] hover:bg-[#1f6b5e] text-white py-2 px-6 rounded-2xl font-bold text-2xl mt-2">
                                {editingReporteId ? 'Actualizar' : 'Agregar'}
                            </button>
                        </form>

                        {/* Fichas Reportes */}
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {reportes.map(r => (
                                <div key={r.id} className="border rounded-xl p-4 bg-gray-50 shadow flex flex-col gap-2">
                                    <p><strong>Tipo:</strong> {r.tipo}</p>
                                    <p><strong>Tutorado:</strong> {r.tutorado}</p>
                                    <p><strong>Contenido:</strong> {r.contenido}</p>
                                    <p><strong>Fecha:</strong> {r.fecha_generacion}</p>
                                    <p><strong>Generado por:</strong> {r.generado_por}</p>
                                    <div className="flex gap-2 mt-2">
                                        <button onClick={() => editarReporte(r)} className="bg-yellow-400 px-2 py-1 rounded text-white">Editar</button>
                                        <button onClick={() => borrarReporte(r.id)} className="bg-red-500 px-2 py-1 rounded text-white">Borrar</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <style>
                {`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        `}
            </style>
        </div>
    )
}

export default Pruebas_temp