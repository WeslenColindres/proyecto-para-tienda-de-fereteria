import { useState, useEffect } from 'react';
import { useConfiguration } from '../hooks/useConfiguration';
import Button from '@/ui/atoms/Button/Button';
import Card from '@/ui/atoms/Card/Card';

export const CompanyConfigPanel = () => {
    const { company, updateCompany, loading } = useConfiguration();
    const [formData, setFormData] = useState({
        nit: '',
        businessName: '',
        tradeName: '',
        address: '',
        phone: '',
        email: '',
        legalRepresentative: '',
        taxRegime: ''
    });

    useEffect(() => {
        if (company) {
            setFormData({
                nit: company.nit || '',
                businessName: company.businessName || '',
                tradeName: company.tradeName || '',
                address: company.address || '',
                phone: company.phone || '',
                email: company.email || '',
                legalRepresentative: company.legalRepresentative || '',
                taxRegime: company.taxRegime || ''
            });
        }
    }, [company]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateCompany(formData);
        // TODO: Show success notification
    };

    if (loading && !company) {
        return <div className="p-6 text-gray-400">Cargando configuración...</div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <header className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Datos de la Empresa</h2>
                <p className="text-gray-400">Información general y fiscal de la organización.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-6 space-y-6 bg-gray-900/50 border-white/10">
                    <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Información Fiscal</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">NIT</label>
                            <input
                                type="text"
                                name="nit"
                                value={formData.nit}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="Ej: 1234567-8"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Régimen Tributario</label>
                            <select
                                name="taxRegime"
                                value={formData.taxRegime}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            >
                                <option value="GENERAL">General</option>
                                <option value="PEQUENO_CONTRIBUYENTE">Pequeño Contribuyente</option>
                                <option value="ELECTRONICO">Electrónico</option>
                            </select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300">Razón Social</label>
                            <input
                                type="text"
                                name="businessName"
                                value={formData.businessName}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="Nombre legal de la empresa"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300">Nombre Comercial</label>
                            <input
                                type="text"
                                name="tradeName"
                                value={formData.tradeName}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="Nombre público del negocio"
                            />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 space-y-6 bg-gray-900/50 border-white/10">
                    <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Contacto y Ubicación</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300">Dirección Fiscal</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="Dirección completa"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Teléfono</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="PBX o celular"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="correo@empresa.com"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300">Representante Legal</label>
                            <input
                                type="text"
                                name="legalRepresentative"
                                value={formData.legalRepresentative}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="Nombre completo del representante"
                            />
                        </div>
                    </div>
                </Card>

                <div className="flex justify-end gap-4 pt-4">
                    <Button variant="ghost" type="button">Cancelar</Button>
                    <Button variant="primary" type="submit">Guardar Cambios</Button>
                </div>
            </form>
        </div>
    );
};
