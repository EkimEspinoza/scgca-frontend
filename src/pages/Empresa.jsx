import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/AdminTable.css'

const EMPTY_FORM = { descripcion: '', nombre_comercial: '' }
const PAGE_SIZE = 10

function Empresa() {
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [deletingId, setDeletingId] = useState(null)

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  // Debounce: espera 400ms después de que el usuario deja de tipear
  // antes de disparar la búsqueda real contra Supabase.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchTerm(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(timeout)
  }, [searchInput])

  const fetchEmpresas = async () => {
    setLoading(true)
    setError('')

    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase
      .from('Dim_Empresa')
      .select('*', { count: 'exact' })
      .order('id_empresa', { ascending: true })
      .range(from, to)

    if (searchTerm.trim()) {
      query = query.or(
        `descripcion.ilike.%${searchTerm}%,nombre_comercial.ilike.%${searchTerm}%`
      )
    }

    const { data, error: fetchError, count } = await query

    if (fetchError) {
      setError('No pudimos cargar las empresas. Intentá de nuevo')
    } else {
      setEmpresas(data)
      setTotalCount(count ?? 0)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchEmpresas()
  }, [page, searchTerm])

  const openCreateModal = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setIsModalOpen(true)
  }

  const openEditModal = (empresa) => {
    setEditingId(empresa.id_empresa)
    setForm({
      descripcion: empresa.descripcion,
      nombre_comercial: empresa.nombre_comercial,
    })
    setFormError('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setForm(EMPTY_FORM)
    setEditingId(null)
    setFormError('')
  }

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = async (e) => {
    e.preventDefault()

    if (!form.descripcion.trim() || !form.nombre_comercial.trim()) {
      setFormError('Completá ambos campos')
      return
    }

    setSaving(true)
    setFormError('')

    if (editingId) {
      const { error: updateError } = await supabase
        .from('Dim_Empresa')
        .update({
          descripcion: form.descripcion,
          nombre_comercial: form.nombre_comercial,
          updated_at: new Date().toISOString(),
        })
        .eq('id_empresa', editingId)

      if (updateError) {
        setFormError('No pudimos guardar los cambios')
        setSaving(false)
        return
      }
    } else {
      const { error: insertError } = await supabase.from('Dim_Empresa').insert({
        descripcion: form.descripcion,
        nombre_comercial: form.nombre_comercial,
        estado: true,
      })

      if (insertError) {
        setFormError('No pudimos crear la empresa')
        setSaving(false)
        return
      }
    }

    setSaving(false)
    closeModal()
    fetchEmpresas()
  }

  const toggleEstado = async (empresa) => {
    const { error: toggleError } = await supabase
      .from('Dim_Empresa')
      .update({ estado: !empresa.estado, updated_at: new Date().toISOString() })
      .eq('id_empresa', empresa.id_empresa)

    if (toggleError) {
      setError('No pudimos actualizar el estado')
      return
    }

    setEmpresas((prev) =>
      prev.map((item) =>
        item.id_empresa === empresa.id_empresa
          ? { ...item, estado: !item.estado }
          : item
      )
    )
  }

  const confirmDelete = (id) => {
    setDeletingId(id)
  }

  const cancelDelete = () => {
    setDeletingId(null)
  }

  const handleDelete = async () => {
    const { error: deleteError } = await supabase
      .from('Dim_Empresa')
      .delete()
      .eq('id_empresa', deletingId)

    if (deleteError) {
      setError('No pudimos eliminar la empresa')
      setDeletingId(null)
      return
    }

    setDeletingId(null)

    // Si era el único registro de esta página (y no es la página 1),
    // retrocedemos una página para no quedar viendo una lista vacía.
    if (empresas.length === 1 && page > 1) {
      setPage(page - 1)
    } else {
      fetchEmpresas()
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Empresas</h1>
        <button className="admin-button" onClick={openCreateModal}>
          Nueva empresa
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <svg
            className="admin-search-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="admin-search"
            placeholder="Buscar por descripción o nombre comercial..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        {totalCount > 0 && (
          <span className="admin-total-count">
            {totalCount} {totalCount === 1 ? 'resultado' : 'resultados'}
          </span>
        )}
      </div>

      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="admin-loading">Cargando empresas...</p>
      ) : empresas.length === 0 ? (
        <div className="admin-empty">
          {searchTerm ? (
            <p>No encontramos empresas que coincidan con "{searchTerm}".</p>
          ) : (
            <>
              <p>No hay empresas todavía.</p>
              <button className="admin-button" onClick={openCreateModal}>
                Crear la primera
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Nombre comercial</th>
                <th>Estado</th>
                <th>Actualizado</th>
                <th className="admin-actions-col"></th>
              </tr>
            </thead>
            <tbody>
              {empresas.map((empresa) => (
                <tr key={empresa.id_empresa}>
                  <td>{empresa.descripcion}</td>
                  <td>{empresa.nombre_comercial}</td>
                  <td>
                    <button
                      className={`estado-toggle ${empresa.estado ? 'is-active' : ''}`}
                      onClick={() => toggleEstado(empresa)}
                      aria-pressed={empresa.estado}
                    >
                      {empresa.estado ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="admin-date">
                    {new Date(empresa.updated_at).toLocaleDateString('es-PE')}
                  </td>
                  <td className="admin-actions">
                    <button
                      className="admin-link-button"
                      onClick={() => openEditModal(empresa)}
                    >
                      Editar
                    </button>
                    <button
                      className="admin-link-button admin-link-danger"
                      onClick={() => confirmDelete(empresa.id_empresa)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="admin-pagination">
            <button
              className="admin-page-button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </button>
            <span className="admin-page-info">
              Página {page} de {totalPages}
            </span>
            <button
              className="admin-page-button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Siguiente
            </button>
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="admin-modal-title">
              {editingId ? 'Editar empresa' : 'Nueva empresa'}
            </h2>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label htmlFor="descripcion">Descripción</label>
                <input
                  id="descripcion"
                  name="descripcion"
                  type="text"
                  value={form.descripcion}
                  onChange={handleFormChange}
                  placeholder="Empresa."
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="nombre_comercial">Nombre comercial</label>
                <input
                  id="nombre_comercial"
                  name="nombre_comercial"
                  type="text"
                  value={form.nombre_comercial}
                  onChange={handleFormChange}
                  placeholder="NOMBRE COMERCIAL"
                  required
                />
              </div>

              {formError && <p className="field-error">{formError}</p>}

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-button-secondary"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button type="submit" className="admin-button" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingId && (
        <div className="admin-modal-overlay" onClick={cancelDelete}>
          <div className="admin-modal admin-modal-small" onClick={(e) => e.stopPropagation()}>
            <h2 className="admin-modal-title">Eliminar empresa</h2>
            <p className="admin-modal-text">
              Esta acción no se puede deshacer. ¿Confirmás que querés eliminarla?
            </p>
            <div className="admin-modal-actions">
              <button className="admin-button-secondary" onClick={cancelDelete}>
                Cancelar
              </button>
              <button className="admin-button-danger" onClick={handleDelete}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Empresa