import { useState } from 'react';
import { useConfiguration } from '../hooks/useConfiguration';
import Button from '@/ui/atoms/Button/Button';
import Card from '@/ui/atoms/Card/Card';

export const SecurityPanel = () => {
    const { security } = useConfiguration();
    const [formData, setFormData] = useState(security);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : parseInt(value)
        }));
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <header>
                <h2 className="text-2xl font-bold text-white mb-2">Seguridad y Acceso</h2>
                <p className="text-gray-400">Políticas de contraseñas, sesiones y retención de datos.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-gray-900/50 border-white/10 space-y-6">
                    <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-4">Políticas de Contraseña</h3>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Longitud Mínima</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    name="minPasswordLength"
                                    min="6"
                                    max="16"
                                    value={formData.minPasswordLength}
                                    onChange={handleChange}
                                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="text-white font-mono w-8 text-center">{formData.minPasswordLength}</span>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="requireUppercase"
                                    checked={formData.requireUppercase}
                                    onChange={handleChange}
                                    className="rounded bg-black/20 border-white/10 text-blue-500 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-300">Requerir mayúsculas (A-Z)</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="requireNumbers"
                                    checked={formData.requireNumbers}
                                    onChange={handleChange}
                                    className="rounded bg-black/20 border-white/10 text-blue-500 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-300">Requerir números (0-9)</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="requireSpecialChars"
                                    checked={formData.requireSpecialChars}
                                    onChange={handleChange}
                                    className="rounded bg-black/20 border-white/10 text-blue-500 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-300">Requerir caracteres especiales (!@#)</span>
                            </label>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gray-900/50 border-white/10 space-y-6">
                    <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-4">Sesiones y Auditoría</h3>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Tiempo de inactividad (minutos)</label>
                            <input
                                type="number"
                                name="sessionTimeoutMinutes"
                                value={formData.sessionTimeoutMinutes}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                            <p className="text-xs text-gray-500">Cierra la sesión automáticamente tras inactividad.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Sesiones simultáneas máximas</label>
                            <input
                                type="number"
                                name="maxConcurrentSessions"
                                value={formData.maxConcurrentSessions}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div className="space-y-2 pt-4 border-t border-white/5">
                            <label className="block text-sm font-medium text-gray-300">Retención de Logs (días)</label>
                            <select
                                name="logRetentionDays"
                                value={formData.logRetentionDays}
                                onChange={(e) => setFormData(prev => ({ ...prev, logRetentionDays: parseInt(e.target.value) }))}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            >
                                <option value="30">30 días</option>
                                <option value="60">60 días</option>
                                <option value="90">90 días</option>
                                <option value="180">6 meses</option>
                                <option value="365">1 año</option>
                            </select>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="flex justify-end pt-4">
                <Button variant="primary">Guardar Políticas</Button>
            </div>
        </div>
    );
};
