import { useEffect, useMemo, useState } from 'react';
import Modal from '@/ui/molecules/Modal/Modal';
import { formatCurrency } from '@/shared/utils/format';
import { ApiError } from '@/shared/api/types';
import type { SupplierFormState } from '../hooks/useSuppliers';
import { useSuppliers } from '../hooks/useSuppliers';
import { useViewportMode } from '../hooks/useViewportMode';
import SuppliersToolbar from './SuppliersToolbar';
import SuppliersTabs, { type SupplierTab } from './SuppliersTabs';
import SupplierListPanel from './SupplierListPanel';
import SupplierDetailPanel from './SupplierDetailPanel';
import SupplierPurchasesPanel from './SupplierPurchasesPanel';

type SuppliersPageProps = {
  activeItem?: string;
};

const emptyForm = (fallbackCity?: string, fallbackCategory?: string): SupplierFormState => ({
  nit: '',
  name: '',
  contactName: '',
  phone: '',
  email: '',
  cityId: fallbackCity ?? 'city-capital',
  categoryId: fallbackCategory ?? 'sup-cat-alimentos',
  address: '',
  creditDays: 0,
  creditLimit: 0,
  status: 'activo',
});

const SuppliersPage = (_props: SuppliersPageProps) => {
  const mode = useViewportMode();
  const [activeTab, setActiveTab] = useState<SupplierTab>('proveedores');
  const [newForm, setNewForm] = useState<SupplierFormState>(emptyForm());
  const {
    filters,
    setFilters,
    searchInput,
    setSearchInput,
    suppliers,
    loading,
    error,
    total,
    page,
    pageSize,
    counters,
    setPage,
    selected,
    selectedId,
    selectSupplier,
    form,
    setForm,
    isEditing,
    setIsEditing,
    saveSupplier,
    deleteSupplier,
    createSupplier,
    showCreate,
    setShowCreate,
    showDelete,
    setShowDelete,
    showHistory,
    setShowHistory,
    purchases,
    catalogs,
    filtersSummary,
    resetForm,
  } = useSuppliers();

  useEffect(() => {
    if (mode === 'desktop') setActiveTab('proveedores');
  }, [mode]);

  useEffect(() => {
    if (selected && mode !== 'desktop') setActiveTab('detalle');
  }, [mode, selected]);

  useEffect(() => {
    setNewForm(emptyForm(catalogs.cities[0]?.id, catalogs.categories[0]?.id));
  }, [catalogs]);

  const maxPage = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [pageSize, total]);
  const currentRange = useMemo(() => {
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(total, page * pageSize);
    return `${start}-${end} de ${total}`;
  }, [page, pageSize, total]);

  const visiblePanel = (tab: SupplierTab) => (mode === 'desktop' || activeTab === tab ? '' : 'hidden-panel');

  const handleSave = async () => {
    try {
      await saveSupplier();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo guardar';
      alert(message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSupplier();
      setShowDelete(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo eliminar';
      alert(message);
    }
  };

  const handleCreate = async () => {
    try {
      await createSupplier(newForm);
      setNewForm(emptyForm(catalogs.cities[0]?.id, catalogs.categories[0]?.id));
      setShowCreate(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo crear el proveedor';
      alert(message);
    }
  };

  const activeKpis = [
    { label: 'Saldo', value: formatCurrency(selected?.balance ?? 0) },
    { label: 'Credito', value: `${selected?.creditDays ?? 0} dias` },
    { label: 'Limite', value: formatCurrency(selected?.creditLimit ?? 0) },
  ];

  return (
    <main className="suppliers-view app-view is-visible" id="suppliers-view" data-app-view>
      <SuppliersToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        filters={filters}
        catalogs={catalogs}
        onFiltersChange={(next) => {
          setFilters((prev) => ({ ...prev, ...next, search: prev.search }));
          setPage(1);
        }}
        onNew={() => {
          setShowCreate(true);
          setIsEditing(false);
        }}
        onExport={() => alert('Exportar proveedores')}
        onImport={() => alert('Importar desde Excel')}
        onRefresh={() => window.location.reload()}
        onClearFilters={() => {
          setFilters({ search: '', status: 'all', cityId: 'all', categoryId: 'all' });
          setPage(1);
        }}
        summary={filtersSummary}
      />

      <SuppliersTabs activeTab={activeTab} onChange={setActiveTab} />

      <div className="suppliers-grid">
        <section className={`supplier-card ${visiblePanel('proveedores')}`}>
          <SupplierListPanel
            suppliers={suppliers}
            selectedId={selectedId ?? undefined}
            onSelect={(id) => {
              setIsEditing(false);
              selectSupplier(id);
            }}
            onEdit={(id) => {
              selectSupplier(id);
              setIsEditing(true);
              setActiveTab('detalle');
            }}
            onOpenDetail={(id) => {
              selectSupplier(id);
              setActiveTab('detalle');
            }}
            loading={loading}
            searchTerm={filters.search}
            onCreate={() => setShowCreate(true)}
          />
          <footer className="table-footer">
            <div>
              {currentRange} | Activos: {counters.activo} · Morosos: {counters.moroso} · Inactivos: {counters.inactivo}
            </div>
            <div className="pagination">
              <button type="button" aria-label="Anterior" disabled={page <= 1} onClick={() => setPage(Math.max(1, page - 1))}>
                &lt;
              </button>
              <button type="button" aria-current="page">
                {page}
              </button>
              <button
                type="button"
                disabled={page >= maxPage}
                onClick={() => setPage(Math.min(maxPage, page + 1))}
              >
                {Math.min(maxPage, page + 1)}
              </button>
            </div>
          </footer>
        </section>

        <section className={`supplier-detail ${visiblePanel('detalle')}`}>
          <SupplierDetailPanel
            supplier={selected}
            form={form}
            onChange={setForm}
            isEditing={isEditing}
            onToggleEditing={() => setIsEditing((prev) => !prev)}
            onSave={handleSave}
            onReset={resetForm}
            onDelete={() => setShowDelete(true)}
            onHistory={() => setShowHistory(true)}
            catalogs={catalogs}
            kpis={activeKpis}
          />
        </section>
      </div>

      <section className={`purchase-card ${visiblePanel('compras')}`}>
        <SupplierPurchasesPanel purchases={purchases} onReport={() => alert('Ir a /proveedores/ordenes')} />
      </section>

      <Modal
        open={showCreate}
        title="Nuevo proveedor"
        description="Completa los datos para crear un proveedor"
        onClose={() => {
          setShowCreate(false);
          resetForm();
        }}
        footer={
          <>
            <button type="button" className="btn-outline" onClick={() => setShowCreate(false)}>
              Cancelar
            </button>
            <button type="button" className="btn-primary" onClick={handleCreate}>
              Guardar
            </button>
          </>
        }
      >
        <div className="detail-grid">
          <label>
            NIT
            <input value={newForm.nit} onChange={(e) => setNewForm((prev) => ({ ...prev, nit: e.target.value }))} />
          </label>
          <label>
            Nombre
            <input value={newForm.name} onChange={(e) => setNewForm((prev) => ({ ...prev, name: e.target.value }))} />
          </label>
          <label>
            Contacto
            <input value={newForm.contactName} onChange={(e) => setNewForm((prev) => ({ ...prev, contactName: e.target.value }))} />
          </label>
          <label>
            Telefono
            <input value={newForm.phone} onChange={(e) => setNewForm((prev) => ({ ...prev, phone: e.target.value }))} />
          </label>
          <label>
            Email
            <input value={newForm.email} onChange={(e) => setNewForm((prev) => ({ ...prev, email: e.target.value }))} />
          </label>
          <label>
            Ciudad
            <select value={newForm.cityId} onChange={(e) => setNewForm((prev) => ({ ...prev, cityId: e.target.value }))}>
              {catalogs.cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Categoria
            <select value={newForm.categoryId} onChange={(e) => setNewForm((prev) => ({ ...prev, categoryId: e.target.value }))}>
              {catalogs.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Direccion
            <textarea value={newForm.address} onChange={(e) => setNewForm((prev) => ({ ...prev, address: e.target.value }))} />
          </label>
          <label>
            Dias credito
            <input
              type="number"
              min={0}
              max={90}
              value={newForm.creditDays}
              onChange={(e) => setNewForm((prev) => ({ ...prev, creditDays: Number(e.target.value) }))}
            />
          </label>
          <label>
            Limite credito
            <input
              type="number"
              value={newForm.creditLimit}
              onChange={(e) => setNewForm((prev) => ({ ...prev, creditLimit: Number(e.target.value) }))}
            />
          </label>
        </div>
      </Modal>

      <Modal
        open={showDelete}
        title="¿Eliminar proveedor?"
        description="Esta acción lo marcara como eliminado, no se pierde historial."
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
        <p className="muted text-sm">Proveedor seleccionado: {selected?.name ?? 'N/D'}</p>
      </Modal>

      <Modal
        open={showHistory}
        title="Historial de compras"
        description={selected?.name ?? 'Proveedor'}
        onClose={() => setShowHistory(false)}
      >
        <div className="history-list">
          {purchases.map((p) => (
            <div key={p.id} className="purchase-row">
              <div>
                <strong>{p.documentNumber}</strong>
                <div className="purchase-meta">{p.date}</div>
              </div>
              <div className="balance">{formatCurrency(p.amount)}</div>
              <span className={`purchase-status ${p.status}`}>{p.status}</span>
            </div>
          ))}
          {!purchases.length && <div className="muted">Sin historial cargado.</div>}
        </div>
      </Modal>

      {error && <p className="muted">{error}</p>}
    </main>
  );
};

export default SuppliersPage;
