import { useState } from 'react';
import { useConfiguration } from '../hooks/useConfiguration';
import Button from '@/ui/atoms/Button/Button';
import Card from '@/ui/atoms/Card/Card';

export const NotificationsPanel = () => {
    const { notifications } = useConfiguration();
    const [formData, setFormData] = useState(notifications);

    const handleSwitchChange = (key: keyof typeof formData) => {
        setFormData(prev => ({ ...prev, [key]: !prev[key as keyof typeof formData] }));
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            email: {
                ...prev.email,
                [name]: type === 'checkbox' ? checked : value
            }
        }));
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <header>
                <h2 className="text-2xl font-bold text-white mb-2">Notificaciones y Alertas</h2>
                <p className="text-gray-400">Configura qué eventos generan alertas y los canales de envío.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-gray-900/50 border-white/10 space-y-6">
                    <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-4">Alertas del Sistema</h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium text-white">Stock Bajo</div>
                                <div className="text-sm text-gray-400">Notificar cuando el inventario sea crítico</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.stockAlerts}
                                    onChange={() => handleSwitchChange('stockAlerts')}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        {formData.stockAlerts && (
                            <div className="pl-4 border-l-2 border-blue-500/30">
                                <label className="block text-sm text-gray-400 mb-1">Umbral de stock mínimo</label>
                                <input
                                    type="number"
                                    value={formData.stockThreshold}
                                    onChange={(e) => setFormData(prev => ({ ...prev, stockThreshold: parseInt(e.target.value) }))}
                                    className="w-24 bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-sm"
                                />
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div>
                                <div className="font-medium text-white">Vencimiento de Productos</div>
                                <div className="text-sm text-gray-400">Alertar sobre lotes próximos a vencer</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.expirationAlerts}
                                    onChange={() => handleSwitchChange('expirationAlerts')}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div>
                                <div className="font-medium text-white">Pagos Pendientes</div>
                                <div className="text-sm text-gray-400">Recordatorios de cuentas por pagar/cobrar</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.paymentAlerts}
                                    onChange={() => handleSwitchChange('paymentAlerts')}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gray-900/50 border-white/10 space-y-6">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <h3 className="text-lg font-semibold text-white">Configuración de Correo</h3>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="enabled"
                                checked={formData.email.enabled}
                                onChange={handleEmailChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                    </div>

                    <div className={`space-y-4 ${!formData.email.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Servidor SMTP</label>
                            <input
                                type="text"
                                name="host"
                                value={formData.email.host}
                                onChange={handleEmailChange}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="smtp.gmail.com"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Puerto</label>
                                <input
                                    type="number"
                                    name="port"
                                    value={formData.email.port}
                                    onChange={handleEmailChange}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Seguridad</label>
                                <div className="flex items-center h-full pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="secure"
                                            checked={formData.email.secure}
                                            onChange={handleEmailChange}
                                            className="rounded bg-black/20 border-white/10 text-blue-500 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-300">Usar SSL/TLS</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Usuario / Email</label>
                            <input
                                type="email"
                                name="user"
                                value={formData.email.user}
                                onChange={handleEmailChange}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Contraseña</label>
                            <input
                                type="password"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="••••••••••••"
                            />
                        </div>

                        <div className="pt-2">
                            <Button variant="ghost" className="w-full text-sm border border-white/10">Probar Configuración de Correo</Button>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="flex justify-end pt-4">
                <Button variant="primary">Guardar Preferencias</Button>
            </div>
        </div>
    );
};
