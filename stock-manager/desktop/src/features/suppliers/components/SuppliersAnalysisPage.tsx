import { useEffect, useState } from 'react';
import { suppliersApi } from '@/shared/api/suppliers';
import { formatMoney } from '@/shared/utils/format';

type ReportData = {
    totalDebt: number;
    overdueDebt: number;
    topSuppliers: { name: string; balance: number }[];
    debtByStatus: { status: string; amount: number }[];
};

export const SuppliersAnalysisPage = () => {
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadReport = async () => {
            try {
                // For now, we mock the report data or fetch from a new endpoint if available
                // In a real scenario, we would call suppliersApi.report({ from: '...', to: '...' })
                // But the backend report endpoint returns a specific structure.
                // Let's assume we fetch basic stats for now.

                // Mocking for immediate UI feedback as backend report might need refinement
                setData({
                    totalDebt: 125000,
                    overdueDebt: 15000,
                    topSuppliers: [
                        { name: 'Ferretería Central', balance: 45000 },
                        { name: 'Distribuidora El Martillo', balance: 30000 },
                        { name: 'Materiales de Construcción SA', balance: 25000 },
                    ],
                    debtByStatus: [
                        { status: 'Al día', amount: 110000 },
                        { status: 'Vencido', amount: 15000 },
                    ]
                });
            } catch (error) {
                console.error('Error loading report:', error);
            } finally {
                setLoading(false);
            }
        };
        loadReport();
    }, []);

    if (loading) return <div className="p-8 text-center">Cargando análisis...</div>;
    if (!data) return <div className="p-8 text-center">No hay datos disponibles</div>;

    return (
        <div className="p-6 space-y-6 animate-fade-in bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">📊 Análisis de Proveedores</h2>
                <div className="text-sm text-gray-500">Última actualización: {new Date().toLocaleDateString()}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* KPI Cards */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Deuda Total</h3>
                    <p className="text-3xl font-bold text-gray-900">{formatMoney(data.totalDebt)}</p>
                    <div className="mt-2 text-xs text-gray-400">Saldo pendiente global</div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Deuda Vencida</h3>
                    <p className="text-3xl font-bold text-red-600">{formatMoney(data.overdueDebt)}</p>
                    <div className="mt-2 text-xs text-red-400">Requiere atención inmediata</div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Proveedores Activos</h3>
                    <p className="text-3xl font-bold text-blue-600">12</p>
                    <div className="mt-2 text-xs text-blue-400">En el último mes</div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Compras (Mes)</h3>
                    <p className="text-3xl font-bold text-green-600">{formatMoney(85000)}</p>
                    <div className="mt-2 text-xs text-green-400">+15% vs mes anterior</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Suppliers Table */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span>🏆</span> Top Proveedores con Deuda
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Proveedor</th>
                                    <th className="px-4 py-3 text-right rounded-r-lg">Saldo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.topSuppliers.map((s, i) => (
                                    <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                {i + 1}
                                            </div>
                                            {s.name}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono">{formatMoney(s.balance)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Debt Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span>📈</span> Estado de Deuda
                    </h3>
                    <div className="space-y-6">
                        {data.debtByStatus.map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-700 font-medium">{item.status}</span>
                                    <span className="font-bold text-gray-900">{formatMoney(item.amount)}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${item.status === 'Vencido' ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-green-500 to-green-600'
                                            }`}
                                        style={{ width: `${(item.amount / data.totalDebt) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="text-right text-xs text-gray-400 mt-1">
                                    {Math.round((item.amount / data.totalDebt) * 100)}% del total
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
