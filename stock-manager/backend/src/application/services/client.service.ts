import { ClientRepository } from '../../domain/ports/client.repository';
import { Client } from '../../domain/entities/client.entity';

export class ClientService {
    constructor(private readonly clientRepository: ClientRepository) { }

    /**
     * Validates Guatemalan NIT format
     * Accepts: CF, 12345678, 1234567-8, 12345678-9
     */
    validateNit(nit: string): { valid: boolean; message?: string } {
        // CF is always valid (Consumidor Final)
        if (nit.toUpperCase() === 'CF') {
            return { valid: true };
        }

        // Remove hyphens for validation
        const cleanNit = nit.replace(/-/g, '');

        // Must be numeric
        if (!/^\d+$/.test(cleanNit)) {
            return { valid: false, message: 'NIT debe contener solo números' };
        }

        // Must be 8 or 9 digits
        if (cleanNit.length < 8 || cleanNit.length > 9) {
            return { valid: false, message: 'NIT debe tener 8 o 9 dígitos' };
        }

        return { valid: true };
    }

    /**
     * Normalizes client data before saving
     */
    private normalizeClientData(data: any): any {
        return {
            ...data,
            nit: data.nit.toUpperCase().trim(),
            name: data.name.toUpperCase().trim(),
            tradeName: data.tradeName?.toUpperCase().trim() || null,
            email: data.email?.toLowerCase().trim() || null,
            phone: data.phone?.trim() || null,
        };
    }

    /**
     * Search clients by name or NIT
     */
    async searchClients(searchTerm: string, limit: number = 10): Promise<Client[]> {
        if (!searchTerm || searchTerm.trim().length === 0) {
            return [];
        }
        return this.clientRepository.searchByName(searchTerm.trim(), limit);
    }

    /**
     * Get client by ID
     */
    async getClientById(id: number): Promise<Client | null> {
        return this.clientRepository.findById(id);
    }

    /**
     * Get client by NIT
     */
    async getClientByNit(nit: string): Promise<Client | null> {
        const validation = this.validateNit(nit);
        if (!validation.valid) {
            throw new Error(validation.message);
        }
        return this.clientRepository.findByNit(nit.toUpperCase().trim());
    }

    /**
     * Create new client with validation
     */
    async createClient(clientData: {
        nit: string;
        name: string;
        tradeName?: string;
        email?: string;
        phone?: string;
        clientTypeId?: number;
    }): Promise<Client> {
        // Validate NIT
        const validation = this.validateNit(clientData.nit);
        if (!validation.valid) {
            throw new Error(validation.message);
        }

        // Check if client already exists
        const existing = await this.clientRepository.findByNit(clientData.nit.toUpperCase().trim());
        if (existing) {
            throw new Error('Ya existe un cliente con este NIT');
        }

        // Normalize data
        const normalized = this.normalizeClientData(clientData);

        // Create client entity
        const client = new Client({
            nit: normalized.nit,
            name: normalized.name,
            tradeName: normalized.tradeName,
            email: normalized.email,
            phone: normalized.phone,
            clientTypeId: normalized.clientTypeId || 1, // Default client type
            creditLimit: 0,
            creditDays: 0,
            isActive: true,
        });

        // Save to database
        return this.clientRepository.save(client);
    }

    /**
     * Get or create client for POS
     * If NIT is CF, returns null (Consumidor Final)
     * If NIT exists, returns existing client
     * If NIT doesn't exist, creates new client with provided data
     */
    async getOrCreateClient(data: {
        nit: string;
        name: string;
        phone?: string;
    }): Promise<Client | null> {
        // Consumidor Final - no client record needed
        if (data.nit.toUpperCase() === 'CF') {
            return null;
        }

        // Try to find existing client
        const existing = await this.getClientByNit(data.nit);
        if (existing) {
            return existing;
        }

        // Create new client
        return this.createClient({
            nit: data.nit,
            name: data.name,
            phone: data.phone,
        });
    }
}
