import { useState, useEffect } from 'react';
import { useConfiguration } from '../hooks/useConfiguration';
import Button from '@/ui/atoms/Button/Button';
import Card from '@/ui/atoms/Card/Card';

export const FelConfigPanel = () => {
    const { fel, updateFel, loading } = useConfiguration();
    const [formData, setFormData] = useState({
        certifierProvider: '',
        certifierNit: '',
        certifierUser: '',
        authToken: '',
        endpointUrl: '',
        environmentType: 'PRUEBAS',
        ivaAffiliation: '',
        establishmentCode: 0,
        isActive: false
    });

    useEffect(() => {
        if (fel) {
            setFormData({
                certifierProvider: fel.certifierProvider || 'INFILE',
                certifierNit: fel.certifierNit || '',
                certifierUser: fel.certifierUser || '',
                authToken: fel.authToken || '',
                endpointUrl: fel.endpointUrl || '',
                environmentType: fel.environmentType || 'PRUEBAS',
                ivaAffiliation: fel.ivaAffiliation || 'GEN',
                establishmentCode: fel.establishmentCode || 1,
                isActive: fel.isActive || false
            });
        }
    }, [fel]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateFel(formData);
        // TODO: Show success notification
    };

    if (loading && !fel) {
        return <div className="p-6 text-gray-400">Cargando configuración FEL...</div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <header className="mb-6 flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Facturación Electrónica (FEL)</h2>
                    <p className="text-gray-400">Configuración de conexión con certificador SAT.</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${formData.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                    {formData.isActive ? 'Activo' : 'Inactivo'}
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-6 space-y-6 bg-gray-900/50 border-white/10">
                    <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Proveedor y Ambiente</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Certificador</label>
                            <select
                                name="certifierProvider"
                                value={formData.certifierProvider}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            >
                                <option value="INFILE">Infile</option>
                                <option value="DIGIFACT">Digifact</option>
                                <option value="G4S">G4S</option>
                                <option value="MEGAPRINT">MegaPrint</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Ambiente</label>
                            <select
                                name="environmentType"
                                value={formData.environmentType}
                                onChange={handleChange}
                                className={`w-full border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors ${formData.environmentType === 'PRODUCCION' ? 'bg-red-900/20 border-red-500/50' : 'bg-black/20'}`}
                            >
                                <option value="PRUEBAS">Pruebas / Desarrollo</option>
                                <option value="PRODUCCION">Producción</option>
                            </select>
                            {formData.environmentType === 'PRODUCCION' && (
                                <p className="text-xs text-red-400 mt-1">⚠️ Estás configurando el ambiente de PRODUCCIÓN</p>
                            )}
                        </div>
                    </div>
                </Card>

                <Card className="p-6 space-y-6 bg-gray-900/50 border-white/10">
                    <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Credenciales de Conexión</h3>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Endpoint URL</label>
                            <input
                                type="url"
                                name="endpointUrl"
                                value={formData.endpointUrl}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm"
                                placeholder="https://api.certificador.com/..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Token de Autenticación / API Key</label>
                            <input
                                type="password"
                                name="authToken"
                                value={formData.authToken}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm"
                                placeholder="Token proporcionado por el certificador"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Usuario Certificador (Opcional)</label>
                                <input
                                    type="text"
                                    name="certifierUser"
                                    value={formData.certifierUser}
                                    onChange={handleChange}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">NIT Certificador (Opcional)</label>
                                <input
                                    type="text"
                                    name="certifierNit"
                                    value={formData.certifierNit}
                                    onChange={handleChange}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 space-y-6 bg-gray-900/50 border-white/10">
                    <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Datos del Establecimiento</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Afiliación IVA</label>
                            <input
                                type="text"
                                name="ivaAffiliation"
                                value={formData.ivaAffiliation}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="GEN"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Código de Establecimiento</label>
                            <input
                                type="number"
                                name="establishmentCode"
                                value={formData.establishmentCode}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div className="md:col-span-2 pt-4 border-t border-white/5">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                        className="sr-only"
                                    />
                                    <div className={`w-10 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isActive ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                </div>
                                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Activar Facturación Electrónica</span>
                            </label>
                            <p className="text-xs text-gray-500 mt-2 ml-14">Al activar, todas las ventas generarán automáticamente un DTE.</p>
                        </div>
                    </div>
                </Card>

                <div className="flex justify-between pt-4">
                    <Button variant="ghost" className="text-blue-400 hover:text-blue-300 border border-blue-500/30" onClick={() => alert('Probando conexión...')}>
                        ⚡ Probar Conexión
                    </Button>
                    <div className="flex gap-4">
                        <Button variant="ghost" type="button">Cancelar</Button>
                        <Button variant="primary" type="submit">Guardar Configuración</Button>
                    </div>
                </div>
            </form>
        </div>
    );
};
