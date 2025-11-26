import { useEffect, useMemo, useState } from 'react';
import { categoriesApi } from '@/shared/api/categories';
import { ApiError } from '@/shared/api/types';
import { useCategories } from '@/shared/hooks/useCategories';
import type { Category } from '@/shared/types/products';
import Modal from '@/ui/molecules/Modal/Modal';

type FormState = {
  code: string;
  name: string;
  description: string;
  color: string;
  status: 'activo' | 'inactivo';
};

const buildForm = (category?: Category): FormState => ({
  code: category?.code ?? '',
  name: category?.name ?? '',
  description: category?.description ?? '',
  color: category?.color ?? '#0ea5e9',
  status: category?.status ?? 'activo',
});

const ProductCategoriesPage = () => {
  const { categories, reload } = useCategories();
  const [selectedId, setSelectedId] = useState<string | null>(categories[0]?.id ?? null);
  const selected = useMemo(() => categories.find((c) => c.id === selectedId), [categories, selectedId]);
  const [form, setForm] = useState<FormState>(() => buildForm(selected));
  const [showDelete, setShowDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!selectedId && categories.length) {
      setSelectedId(categories[0].id);
      setForm(buildForm(categories[0]));
    }
  }, [categories, selectedId]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const cat = categories.find((c) => c.id === id);
    setForm(buildForm(cat));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (selected) {
        await categoriesApi.update(selected.id, form);
      } else {
        const created = await categoriesApi.create(form);
        setSelectedId(created.id);
      }
      await reload();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo guardar la categoria';
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await categoriesApi.remove(selectedId);
      setSelectedId(null);
      setForm(buildForm());
      await reload();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo eliminar';
      alert(message);
    } finally {
      setShowDelete(false);
    }
  };

  return (
    <section className="products-view app-view is-visible" data-app-view="productos-categorias">
      <header className="products-toolbar">
        <div className="toolbar-actions">
          <button className="tool-btn new" onClick={() => { setSelectedId(null); setForm(buildForm()); }}>
            + Nueva categoria
          </button>
          <button className="tool-btn delete" disabled={!selectedId} onClick={() => setShowDelete(true)}>
            Desactivar
          </button>
        </div>
        <div className="toolbar-filters">
          <span className="muted">Gestion de categorias</span>
        </div>
      </header>

      <div className="products-grid">
        <section className="products-column">
          <article className="products-table-card">
            <header className="card-header" style={{ marginBottom: 8 }}>
              <h3 style={{ margin: 0 }}>Tabla de categorias</h3>
              <span className="muted">Codigo, nombre, estado y fecha</span>
            </header>
            <div className="products-table-wrapper">
              <table className="products-table">
                <thead>
                  <tr>
                    <th style={{ width: 80 }}>Codigo</th>
                    <th>Nombre</th>
                    <th style={{ width: 120 }}>Estado</th>
                    <th style={{ width: 120 }}>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr
                      key={category.id}
                      className={selectedId === category.id ? 'selected' : ''}
                      onClick={() => handleSelect(category.id)}
                    >
                      <td>{category.code}</td>
                      <td>{category.name}</td>
                      <td>
                        <span className={`status-chip status-${category.status}`}>{category.status}</span>
                      </td>
                      <td>{category.createdAt?.slice?.(0, 10) ?? 'N/D'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>

        <aside className="products-column editor-panel">
          <article className="editor-card">
            <p className="section-eyebrow">Formulario de categoria</p>
            <div className="field-grid">
              <div className="field">
                <label htmlFor="cat-code">Codigo</label>
                <input
                  id="cat-code"
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
                />
              </div>
              <div className="field">
                <label htmlFor="cat-name">Nombre</label>
                <input
                  id="cat-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
            </div>
            <div className="field-grid full">
              <div className="field">
                <label htmlFor="cat-description">Descripcion</label>
                <textarea
                  id="cat-description"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                ></textarea>
              </div>
            </div>
            <div className="field-grid">
              <div className="field">
                <label htmlFor="cat-color">Color</label>
                <input
                  id="cat-color"
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
                />
              </div>
              <div className="field">
                <label>Estado</label>
                <div className="row-actions">
                  {(['activo', 'inactivo'] as const).map((status) => (
                    <label key={status} className={`status-chip status-${status}`}>
                      <input
                        type="radio"
                        name="cat-status"
                        checked={form.status === status}
                        onChange={() => setForm((prev) => ({ ...prev, status }))}
                      />
                      {status}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                Guardar categoria
              </button>
              <button className="btn-outline" onClick={() => handleSelect(selectedId ?? '')}>
                Cancelar
              </button>
            </div>
          </article>
        </aside>
      </div>

      <Modal
        open={showDelete}
        title="Desactivar categoria"
        description="Se realizara borrado logico para mantener trazabilidad."
        onClose={() => setShowDelete(false)}
        footer={
          <>
            <button type="button" className="btn-outline" onClick={() => setShowDelete(false)}>
              Cancelar
            </button>
            <button type="button" className="btn-danger" onClick={handleDelete}>
              Confirmar
            </button>
          </>
        }
      >
        <p className="text-sm">No se eliminaran productos asociados.</p>
      </Modal>
    </section>
  );
};

export default ProductCategoriesPage;
