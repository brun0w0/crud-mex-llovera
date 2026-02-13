import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import './App.css';

const API_URL = 'https://crud-mex-llovera-production.up.railway.app';

function App() {
  const [registros, setRegistros] = useState([]);
  const [nuevoTexto, setNuevoTexto] = useState('');
  const [editando, setEditando] = useState(null);

  useEffect(() => { obtenerRegistros(); }, []);

  const obtenerRegistros = async () => {
    try {
      const res = await axios.get(`${API_URL}/registros`);
      setRegistros(res.data);
    } catch (err) { 
      const error = err as AxiosError;
      console.error("❌ Error al obtener datos:", error.response?.data || error.message); 
    }
  };

  const agregarRegistro = async () => {
    if (!nuevoTexto.trim()) return;
    try {
      await axios.post(`${API_URL}/registros`, { contenido: nuevoTexto });
      setNuevoTexto('');
      obtenerRegistros();
    } catch (err) { 
      const error = err as AxiosError<any>;
      console.error("❌ Error al agregar:", error.response?.data || error.message);
      alert(`Error: ${error.response?.data?.details || 'No se pudo agregar'}`);
    }
  };

  const eliminarRegistro = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/registros/${id}`);
      obtenerRegistros();
    } catch (err) {
      const error = err as AxiosError;
      console.error("❌ Error al eliminar:", error.response?.data || error.message);
    }
  };

  const actualizarRegistro = async () => {
    if (!editando.contenido.trim()) return;
    try {
      await axios.put(`${API_URL}/registros/${editando.id}`, { contenido: editando.contenido });
      setEditando(null);
      obtenerRegistros();
    } catch (err) {
      const error = err as AxiosError;
      console.error("❌ Error al actualizar:", error.response?.data || error.message);
    }
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1 className="title">CRUD ML</h1>

        <div className="input-group">
          <input
            className="input"
            type="text"
            value={nuevoTexto}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNuevoTexto(e.target.value)}
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && agregarRegistro()}
            placeholder="Escribe algo"
            maxLength={100}
          />
          <button className="btn btn-primary" onClick={agregarRegistro}>
            Guardar
          </button>
        </div>

        <div className="registros-list">
          {registros.length === 0 ? (
            <p className="empty-state">No has escrito nada</p>
          ) : (
            registros.map((reg: any) => (
              <div key={reg.id} className="registro-item">
                <div className="registro-content">
                  <p className="registro-text">{reg.contenido}</p>
                </div>
                <div className="registro-actions">
                  <button
                    className="btn-icon btn-edit"
                    onClick={() => setEditando(reg)}
                    title="Editar"
                  >
                    ✎
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => eliminarRegistro(reg.id)}
                    title="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {editando && (
        <div className="modal-overlay" onClick={() => setEditando(null)}>
          <div className="modal" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <h2 className="modal-title">Edita</h2>
            <textarea
              className="textarea"
              value={editando.contenido}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditando({ ...editando, contenido: e.target.value })}
              maxLength={100}
            />
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={actualizarRegistro}>
                Guardar cambios
              </button>
              <button className="btn btn-secondary" onClick={() => setEditando(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
