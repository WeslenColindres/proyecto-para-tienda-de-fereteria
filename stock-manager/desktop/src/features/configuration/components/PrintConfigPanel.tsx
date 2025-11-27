import { useState } from 'react';
import { useConfiguration } from '../hooks/useConfiguration';
import Button from '@/ui/atoms/Button/Button';
import Card from '@/ui/atoms/Card/Card';

export const PrintConfigPanel = () => {
    const { print } = useConfiguration();
    const [formData, setFormData] = useState(print);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            margins: {
                ...prev.margins,
                [name]: parseInt(value)
            }
        }));
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <header>
                <h2 className="text-2xl font-bold text-white mb-2">Configuración de Impresión</h2>
                <p className="text-gray-400">Personaliza el formato de facturas y tickets.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-gray-900/50 border-white/10 space-y-6">
                    <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-4">Formato de Documento</h3>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Tamaño de Papel</label>
                            <select
                                name="paperSize"
                                value={formData.paperSize}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            >
                                <option value="TICKET">Ticket (80mm)</option>
                                <option value="LETTER">Carta</option>
                                <option value="A4">A4</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Orientación</label>
                            <div className="flex gap-4">
                                <label className={`flex-1 p-3 rounded-lg border cursor-pointer transition-colors ${formData.orientation === 'PORTRAIT' ? 'bg-blue-500/20 border-blue-500/50' : 'bg-black/20 border-white/10 hover:bg-white/5'}`}>
                                    <input
                                        type="radio"
                                        name="orientation"
                                        value="PORTRAIT"
                                        checked={formData.orientation === 'PORTRAIT'}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <div className="text-center">
                                        <div className="text-2xl mb-1">📄</div>
                                        <div className="text-sm font-medium text-white">Vertical</div>
                                    </div>
                                </label>
                                <label className={`flex-1 p-3 rounded-lg border cursor-pointer transition-colors ${formData.orientation === 'LANDSCAPE' ? 'bg-blue-500/20 border-blue-500/50' : 'bg-black/20 border-white/10 hover:bg-white/5'}`}>
                                    <input
                                        type="radio"
                                        name="orientation"
                                        value="LANDSCAPE"
                                        checked={formData.orientation === 'LANDSCAPE'}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <div className="text-center">
                                        <div className="text-2xl mb-1">📄</div>
                                        <div className="text-sm font-medium text-white">Horizontal</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <label className="block text-sm font-medium text-gray-300">Márgenes (mm)</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-gray-500 mb-1 block">Superior</span>
                                    <input
                                        type="number"
                                        name="top"
                                        value={formData.margins.top}
                                        onChange={handleMarginChange}
                                        className="w-full bg-black/20 border border-white/10 rounded px-3 py-1 text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 mb-1 block">Inferior</span>
                                    <input
                                        type="number"
                                        name="bottom"
                                        value={formData.margins.bottom}
                                        onChange={handleMarginChange}
                                        className="w-full bg-black/20 border border-white/10 rounded px-3 py-1 text-white text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gray-900/50 border-white/10 space-y-6">
                    <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-4">Contenido y Diseño</h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium text-white">Mostrar Logo</div>
                                <div className="text-sm text-gray-400">Incluir logo de la empresa</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="showLogo"
                                    checked={formData.showLogo}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div>
                                <div className="font-medium text-white">Mostrar Código QR</div>
                                <div className="text-sm text-gray-400">Para validación de factura</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="showQr"
                                    checked={formData.showQr}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="space-y-2 pt-4">
                            <label className="block text-sm font-medium text-gray-300">Pie de Página</label>
                            <textarea
                                name="footerText"
                                value={formData.footerText || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, footerText: e.target.value }))}
                                rows={3}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
                                placeholder="Gracias por su compra..."
                            />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="flex justify-end pt-4">
                <Button variant="primary">Guardar Configuración</Button>
            </div>
        </div>
    );
};
