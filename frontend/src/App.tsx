import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import './App.css';

const API_URL = 'https://crud-mex-llovera-production.up.railway.app';

function App() {
  const [registros, setRegistros] = useState([]);
  const [nuevoTexto, setNuevoTexto] = useState('');
  const [nuevoError, setNuevoError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    obtenerRegistros();
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const obtenerRegistros = async () => {
    try {
      const res = await axios.get(`${API_URL}/registros`);
      setRegistros(res.data);
    } catch (err) { 
      const error = err as AxiosError;
      console.error("❌ Error al obtener datos:", error.response?.data || error.message); 
    }
  };

  const formatDateTime = (iso?: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return iso;
    }
  };

  const agregarRegistro = async () => {
    const texto = nuevoTexto.trim();
    if (!texto) {
      setNuevoError('Escribe algo, no manches. LEE! LEE!!');
      return;
    }
    if (nuevoTexto.length > 100) {
      setNuevoError('Máximo 100 caracteres');
      return;
    }
    setNuevoError('');
    try {
      await axios.post(`${API_URL}/registros`, { contenido: nuevoTexto });
      setNuevoTexto('');
      setSuccessMessage('Registro guardado');
      setTimeout(() => setSuccessMessage(''), 3000);
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
      setDeleteMessage('Registro eliminado');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setDeleteMessage(''), 3000);
    } catch (err) {
      const error = err as AxiosError;
      console.error("❌ Error al eliminar:", error.response?.data || error.message);
    }
  };

  const actualizarRegistro = async () => {
    const texto = (editando?.contenido || '').trim();
    if (!texto) {
      setEditError('Escribe algo, no manches');
      return;
    }
    if (editando.contenido.length > 100) {
      setEditError('Máximo 100 caracteres');
      return;
    }
    setEditError('');
    try {
      await axios.put(`${API_URL}/registros/${editando.id}`, { contenido: editando.contenido });
      setEditando(null);
      setSuccessMessage('Registro guardado');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSuccessMessage(''), 3000);
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
        <p className="app-desc">Crea un registro, editalo o eliminalo como quieras no me importa. Se tiene como máximo 100 carácteres.</p>

        {deleteMessage && <div className="delete-message">{deleteMessage}</div>}
        {nuevoError && <div className="input-error">{nuevoError}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        <div className="input-group">
          <div className="input-column">
            <input
              className="input"
              type="text"
              value={nuevoTexto}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setNuevoTexto(e.target.value); if (nuevoError) setNuevoError(''); }}
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && agregarRegistro()}
              placeholder="Escribe algo"
              maxLength={100}
            />
            <div className="char-row">
              <div className="char-count">{nuevoTexto.length}/100</div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={agregarRegistro}>
            Guardar
          </button>
        </div>

        {loading ? (
          <div className="registros-loader">
            <div className="loader">
              <div className="spinner" aria-hidden="true"></div>
              <div className="loading-text">Cargando registros...</div>
            </div>
          </div>
        ) : (
          <div className="registros-list">
            {registros.length === 0 ? (
              <p className="empty-state">No has escrito nada</p>
            ) : (
              registros.map((reg: any) => (
                <div key={reg.id} className="registro-item">
                  <div className="registro-content">
                    <p className="registro-text">{reg.contenido}</p>
                    <div className="registro-meta">Creado el {formatDateTime(reg.createdAt)}</div>
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
        )}
      </div>

      {editando && (
        <div className="modal-overlay">
          <div className="modal" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <h2 className="modal-title">Edita</h2>
            <textarea
              className="textarea"
              value={editando.contenido}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => { setEditando({ ...editando, contenido: e.target.value }); if (editError) setEditError(''); }}
              maxLength={100}
            />
            {editError && <div className="input-error">{editError}</div>}
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={actualizarRegistro}>
                Actualizar
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