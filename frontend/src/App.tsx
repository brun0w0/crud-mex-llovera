import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:3001/registros';

function App() {
  const [registros, setRegistros] = useState([]);
  const [nuevoTexto, setNuevoTexto] = useState('');
  const [editando, setEditando] = useState(null);

  useEffect(() => { obtenerRegistros(); }, []);

  const obtenerRegistros = async () => {
    try {
      const res = await axios.get(API_URL);
      setRegistros(res.data);
    } catch (err) { console.error("Error al obtener datos", err); }
  };

  const agregarRegistro = async () => {
    if (!nuevoTexto.trim()) return;
    try {
      await axios.post(API_URL, { contenido: nuevoTexto });
      setNuevoTexto('');
      obtenerRegistros();
    } catch (err) { console.error("Error:", err); }
  };

  const eliminarRegistro = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    obtenerRegistros();
  };

  const actualizarRegistro = async () => {
    if (!editando.contenido.trim()) return;
    await axios.put(`${API_URL}/${editando.id}`, { contenido: editando.contenido });
    setEditando(null);
    obtenerRegistros();
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
            onChange={(e) => setNuevoTexto(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && agregarRegistro()}
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
            registros.map((reg) => (
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
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Edita</h2>
            <textarea
              className="textarea"
              value={editando.contenido}
              onChange={(e) => setEditando({ ...editando, contenido: e.target.value })}
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