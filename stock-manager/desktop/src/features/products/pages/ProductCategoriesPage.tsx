import { useEffect, useState } from 'react';
import { categoriesApi } from '@/shared/api/categories';
import { ApiError } from '@/shared/api/types';
import { useCategories } from '@/shared/hooks/useCategories';
import type { Category } from '@/shared/types/products';

type FormState = {
  name: string;
  description: string;
  parentId: string;
  hasParent: boolean;
  active: boolean;
};

const buildForm = (category?: Category): FormState => ({
  name: category?.name ?? '',
  description: category?.description ?? '',
  parentId: category?.parentId ? String(category.parentId) : '',
  hasParent: !!category?.parentId,
  active: category?.active ?? true,
});

const Drawer = ({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) => (
  <>
    <div
      className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
    />
    <div
      className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="h-full flex flex-col">
        <header className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors text-xl">✕</button>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  </>
);

const ProductCategoriesPage = () => {
  const { categories, reload, loading } = useCategories();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form, setForm] = useState<FormState>(buildForm());
  const [saving, setSaving] = useState(false);

  const handleEdit = (category: Category) => {
    setSelectedId(category.id);
    setForm(buildForm(category));
    setIsDrawerOpen(true);
  };

  const handleCreate = () => {
    setSelectedId(null);
    setForm(buildForm());
    setIsDrawerOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('El nombre es requerido');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        parentId: form.hasParent && form.parentId ? Number(form.parentId) : null,
        active: form.active,
      };

      if (selectedId) {
        await categoriesApi.update(selectedId, payload);
      } else {
        await categoriesApi.create(payload);
      }
      await reload();
      setIsDrawerOpen(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Error al guardar la categoría';
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId || !confirm('¿Estás seguro de desactivar esta categoría?')) return;
    try {
      await categoriesApi.remove(selectedId);
      await reload();
      setIsDrawerOpen(false);
    } catch (err) {
      alert('Error al desactivar');
    }
  };

  // Filter out the current category from parent options to avoid cycles (simple check)
  const parentOptions = categories.filter(c => c.id !== selectedId);

  return (
    <section className="products-view app-view is-visible h-full flex flex-col" data-app-view="productos-categorias">
      <header className="products-toolbar flex justify-between items-center p-4 border-b bg-white">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Categorías</h2>
          <p className="text-sm text-gray-500">Gestión del catálogo de categorías</p>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
          onClick={handleCreate}
        >
          <span>+</span> Nueva Categoría
        </button>
      </header>

      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría Padre</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="p-6 text-center text-gray-500">Cargando...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center text-gray-500">No hay categorías registradas</td></tr>
              ) : (
                categories.map((category) => {
                  const parent = categories.find(c => String(c.id) === String(category.parentId));
                  return (
                    <tr
                      key={category.id}
                      className="hover:bg-gray-50 transition-colors group cursor-pointer"
                      onClick={() => handleEdit(category)}
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{category.description || '-'}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {parent ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {parent.name}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${category.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                          {category.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => { e.stopPropagation(); handleEdit(category); }}
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedId ? 'Editar Categoría' : 'Nueva Categoría'}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                id="name"
                type="text"
                className="w-full rounded-lg border-gray-300 border p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Ej. Herramientas Manuales"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                id="description"
                rows={3}
                className="w-full rounded-lg border-gray-300 border p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Breve descripción de la categoría..."
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  checked={form.hasParent}
                  onChange={e => setForm(prev => ({ ...prev, hasParent: e.target.checked }))}
                />
                <span className="text-sm font-medium text-gray-700">¿Es una subcategoría?</span>
              </label>

              {form.hasParent && (
                <div className="animate-fade-in pl-7">
                  <label htmlFor="parentId" className="block text-xs font-medium text-gray-500 mb-1">Categoría Padre</label>
                  <select
                    id="parentId"
                    className="w-full rounded-lg border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.parentId}
                    onChange={e => setForm(prev => ({ ...prev, parentId: e.target.value }))}
                  >
                    <option value="">Seleccionar padre...</option>
                    {parentOptions.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-700">Estado</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={form.active}
                  onChange={e => setForm(prev => ({ ...prev, active: e.target.checked }))}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900">{form.active ? 'Activo' : 'Inactivo'}</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando...' : (selectedId ? 'Guardar Cambios' : 'Crear Categoría')}
            </button>
            {selectedId && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors"
              >
                Eliminar
              </button>
            )}
          </div>
        </form>
      </Drawer>
    </section>
  );
};

export default ProductCategoriesPage;
