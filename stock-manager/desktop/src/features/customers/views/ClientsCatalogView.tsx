import { useMemo, useState } from 'react';
import Modal from '@/ui/molecules/Modal/Modal';
import { useCustomersData } from '../hooks/useCustomersData';
import CustomersCatalogPanel from '../components/CustomersCatalogPanel';
import CustomerDetailForm from '../components/CustomerDetailForm';

const ClientsCatalogView = () => {
    const {
        filters,
        setFilters,
        setSearchInput,
        customers,
        loading,
        error,
        total,
        page,
        pageSize,
        setPage,
        selected,
        selectedId,
        setSelectedId,
        form,
        setForm,
        saveCustomer,
        createCustomer,
        deleteCustomer
    } = useCustomersData();

    const [showCreate, setShowCreate] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const maxPage = Math.max(1, Math.ceil(total / pageSize));

    const filtersSummary = useMemo(() => {
        const parts: string[] = [];
        if (filters.status !== 'all') parts.push(`Estado: ${filters.status}`);
        if (filters.city !== 'all') parts.push(`Ciudad: ${filters.city}`);
        if (filters.type !== 'all') parts.push(`Tipo: ${filters.type}`);
        if (filters.credit !== 'all') parts.push(filters.credit === 'con' ? 'Con crédito' : 'Sin crédito');
        if (filters.search.trim()) parts.push(`"${filters.search}"`);
        return parts.join(' · ');
    }, [filters]);

    const handleSave = async () => {
        await saveCustomer();
        setIsEditing(false);
    };

    const handleCreate = async () => {
        await createCustomer(form);
        setShowCreate(false);
    };

    const handleDelete = async () => {
        await deleteCustomer();
        setShowDelete(false);
    };

    return (
        <>
            <section className="customers-toolbar">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Directorio de Clientes</h2>
                    <div className="customers-actions">
                        <button
                            className="btn-primary flex items-center gap-2"
                            onClick={() => {
                                setForm({
                                    nit: '',
                                    name: '',
                                    phone: '',
                                    email: '',
                                    city: '',
                                    type: 'persona-natural',
                                    hasCredit: false,
                                    creditLimit: 0,
                                    creditUsed: 0,
                                    discount: 0,
                                    status: 'activo',
                                });
                                setShowCreate(true);
                                setIsEditing(true);
                            }}
                        >
                            <span>+</span> Nuevo Cliente
                        </button>
                        <button className="btn-ghost border border-white/10" onClick={() => alert('Importar')}>
                            📥 Importar
                        </button>
                        <button className="btn-ghost border border-white/10" onClick={() => alert('Exportar')}>
                            📤 Exportar
                        </button>
                    </div>
                </div>

                <div className="customers-search bg-white/5 p-3 rounded-lg border border-white/10">
                    <div className="input-group flex-1 min-w-[200px]">
                        <span className="prefix">🔍</span>
                        <input
                            type="search"
                            placeholder="Buscar por NIT, nombre..."
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="bg-transparent border-none p-2 w-full focus:outline-none"
                        />
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value as any }))}
                            className="bg-black/20 border border-white/10 rounded px-3 py-2"
                        >
                            <option value="all">Todos los Estados</option>
                            <option value="activo">Activos</option>
                            <option value="inactivo">Inactivos</option>
                        </select>

                        <select
                            value={filters.city}
                            onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
                            className="bg-black/20 border border-white/10 rounded px-3 py-2"
                        >
                            <option value="all">Todas las Ciudades</option>
                            {[...new Set(customers.map((c) => c.city))].map((city) => (
                                <option key={city} value={city}>
                                    {city}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filters.type}
                            onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value as any }))}
                            className="bg-black/20 border border-white/10 rounded px-3 py-2"
                        >
                            <option value="all">Todos los Tipos</option>
                            <option value="persona-natural">Individual</option>
                            <option value="persona-juridica">Empresa</option>
                        </select>

                        <button
                            className="text-sm text-blue-400 hover:text-blue-300 px-3"
                            onClick={() => setFilters({ search: '', status: 'all', city: 'all', type: 'all', credit: 'all' })}
                        >
                            Limpiar
                        </button>
                    </div>
                </div>
            </section>

            <div className="customers-grid">
                <CustomersCatalogPanel
                    customers={customers}
                    selectedId={selectedId}
                    search={filters.search}
                    filtersSummary={filtersSummary}
                    onSearchChange={setSearchInput}
                    onSelect={(id) => {
                        setSelectedId(id);
                        setIsEditing(false);
                    }}
                    onEdit={(id) => {
                        setSelectedId(id);
                        setIsEditing(true);
                    }}
                    onCreate={() => setShowCreate(true)}
                    onClearFilters={() => setFilters({ search: '', status: 'all', city: 'all', type: 'all', credit: 'all' })}
                    loading={loading}
                />

                <CustomerDetailForm
                    customer={selected}
                    value={form}
                    onChange={(next) => setForm(next)}
                    onSave={handleSave}
                    onCancel={() => setIsEditing(false)}
                    onDelete={() => setShowDelete(true)}
                    isEditing={isEditing}
                    onToggleEdit={() => setIsEditing((prev) => !prev)}
                />
            </div>

            <footer className="table-footer">
                <div>
                    Pagina {page} de {maxPage} | Total {total}
                </div>
                <div className="pagination">
                    <button disabled={page <= 1} onClick={() => setPage(Math.max(1, page - 1))}>
                        &lt;
                    </button>
                    <button aria-current="page">{page}</button>
                    <button disabled={page >= maxPage} onClick={() => setPage(Math.min(maxPage, page + 1))}>
                        {Math.min(maxPage, page + 1)}
                    </button>
                </div>
            </footer>

            <Modal
                open={showCreate}
                title="Nuevo cliente"
                description="Ingresa los datos del nuevo cliente"
                onClose={() => setShowCreate(false)}
                footer={
                    <>
                        <button className="btn-outline" onClick={() => setShowCreate(false)}>
                            Cancelar
                        </button>
                        <button className="btn-primary" onClick={handleCreate}>
                            Guardar
                        </button>
                    </>
                }
            >
                <CustomerDetailForm
                    customer={null}
                    value={form}
                    onChange={(next) => setForm(next)}
                    onSave={handleCreate}
                    onCancel={() => setShowCreate(false)}
                    onDelete={() => setShowCreate(false)}
                    isEditing
                />
            </Modal>

            <Modal
                open={showDelete}
                title="Eliminar cliente"
                description="Se marcara como eliminado pero conservara historial."
                onClose={() => setShowDelete(false)}
                footer={
                    <>
                        <button className="btn-outline" onClick={() => setShowDelete(false)}>
                            Cancelar
                        </button>
                        <button className="btn-danger" onClick={handleDelete}>
                            Confirmar
                        </button>
                    </>
                }
            >
                <p className="muted">Cliente: {selected?.name ?? 'N/D'}</p>
            </Modal>

            {error && <p className="muted">{error}</p>}
        </>
    );
};

export default ClientsCatalogView;
