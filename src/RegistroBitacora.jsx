import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './Navbar';

const RegistroBitacora = () => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const { idSesion } = useParams(); // 👈 aquí obtienes el ID desde la URL

  const [asistencia, setAsistencia] = useState('');
  const [notas, setNotas] = useState('');
  const [acuerdos, setAcuerdos] = useState('');
  const [compromisos, setCompromisos] = useState('');
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [loading, setLoading] = useState(false);

  const handleGuardar = async () => {
    if (!idSesion || !asistencia || !notas) {
      setMensaje({ tipo: 'error', texto: 'Completa los campos obligatorios.' });
      return;
    }

    const bitacora = {
      id_sesion: parseInt(idSesion),
      asistencia,
      notas,
      acuerdos,
      compromisos,
      registrado_por: usuario.id,
    };

    try {
      setLoading(true);
      const res = await fetch('https://apis-patu.onrender.com/api/bitacora', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${usuario.accessToken}`,
        },
        body: JSON.stringify(bitacora),
      });

      const data = await res.json();

      if (!res.ok) {
        setMensaje({ tipo: 'error', texto: data.message || 'Error al guardar la bitácora.' });
        return;
      }

      setMensaje({ tipo: 'success', texto: 'Bitácora registrada con éxito.' });
      setAsistencia('');
      setNotas('');
      setAcuerdos('');
      setCompromisos('');
    } catch (error) {
      console.error(error);
      setMensaje({ tipo: 'error', texto: 'Error de conexión con el servidor.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="p-6 flex flex-col items-center pt-40">
        <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-3xl border-7 border-[#E9DBCD] pt-20">
          <h2 className="text-2xl font-bold mb-6 border-b-4 border-[#C7952C] pb-3 text-center">
            Registro de Bitácora
          </h2>

          {mensaje.texto && (
            <div
              className={`mb-6 p-4 rounded-xl text-center font-semibold ${
                mensaje.tipo === 'error'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {mensaje.texto}
            </div>
          )}

          {/* 👇 Aquí ya no se muestra el campo ID */}
          <p className="text-gray-600 text-center mb-6">
            <strong>Sesión:</strong> {idSesion}
          </p>

          <div className="mb-4">
            <label className="font-bold block mb-2">Asistencia</label>
            <select
              value={asistencia}
              onChange={(e) => setAsistencia(e.target.value)}
              className="w-full p-3 border rounded-xl border-gray-300"
            >
              <option value="">Seleccionar...</option>
              <option value="asistio">Asistió</option>
              <option value="falto">Faltó</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="font-bold block mb-2">Notas</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full p-3 border rounded-xl border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E9DBCD]"
              rows="3"
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="font-bold block mb-2">Acuerdos</label>
            <textarea
              value={acuerdos}
              onChange={(e) => setAcuerdos(e.target.value)}
              className="w-full p-3 border rounded-xl border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E9DBCD]"
              rows="2"
            ></textarea>
          </div>

          <div className="mb-6">
            <label className="font-bold block mb-2">Compromisos</label>
            <textarea
              value={compromisos}
              onChange={(e) => setCompromisos(e.target.value)}
              className="w-full p-3 border rounded-xl border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E9DBCD]"
              rows="2"
            ></textarea>
          </div>

          <button
            onClick={handleGuardar}
            disabled={loading}
            className={`w-full py-3 rounded-2xl font-bold text-lg transition ${
              loading
                ? 'bg-gray-300 text-gray-500'
                : 'bg-[#E4CD87] hover:bg-[#E9DBCD] text-black'
            }`}
          >
            {loading ? 'Guardando...' : 'Guardar bitácora'}
          </button>

          <button
            onClick={() => (window.location.href = '/calendario')}
            className="w-full mt-4 py-3 rounded-2xl font-bold text-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            Volver al calendario
          </button>
        </div>
      </main>
    </>
  );
};

export default RegistroBitacora;
