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
import SupplierForm from './SupplierForm';
import { SuppliersAnalysisPage } from './SuppliersAnalysisPage';

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
  paymentConditions: '',
});

const SuppliersPage = (_props: SuppliersPageProps) => {
  const mode = useViewportMode();
  const [activeTab, setActiveTab] = useState<SupplierTab>('proveedores');
  const [newForm, setNewForm] = useState<SupplierFormState>(emptyForm());
  const [deleteStep, setDeleteStep] = useState(1);
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
      setDeleteStep(1);
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
            onDelete={(id) => {
              selectSupplier(id);
              setShowDelete(true);
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

        <section className={`w-full ${visiblePanel('analysis')}`}>
          <SuppliersAnalysisPage />
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
            <button type="button" className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" onClick={() => setShowCreate(false)}>
              Cancelar
            </button>
            <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm" onClick={handleCreate}>
              Guardar Proveedor
            </button>
          </>
        }
      >
        <div className="w-full max-w-4xl mx-auto">
          <SupplierForm
            form={newForm}
            onChange={(next) => setNewForm((prev) => ({ ...prev, ...next }))}
            catalogs={catalogs}
            showValidation={false}
          />
        </div>
      </Modal>

      <Modal
        open={showDelete}
        title={deleteStep === 1 ? '¿Eliminar proveedor?' : '¿Estás ABSOLUTAMENTE seguro?'}
        description={deleteStep === 1 ? 'Se eliminarán los datos del proveedor.' : 'Esta acción no se puede deshacer.'}
        onClose={() => { setShowDelete(false); setDeleteStep(1); }}
        footer={
          <>
            <button type="button" className="btn-outline" onClick={() => { setShowDelete(false); setDeleteStep(1); }}>
              Cancelar
            </button>
            {deleteStep === 1 ? (
              <button type="button" className="btn-danger" onClick={() => setDeleteStep(2)}>
                Continuar
              </button>
            ) : (
              <button type="button" className="btn-danger" onClick={handleDelete}>
                Sí, eliminar definitivamente
              </button>
            )}
          </>
        }
      >
        {deleteStep === 1 ? (
          <div className="alert-warning-box">
            <p>Estás a punto de eliminar a: <strong>{selected?.name}</strong></p>
            <p>Esto podría afectar el historial de reportes si no se tiene cuidado.</p>
          </div>
        ) : (
          <div className="alert-danger-box">
            <p><strong>¡Atención!</strong></p>
            <p>Se borrará permanentemente el proveedor y todos sus contactos asociados.</p>
          </div>
        )}
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
