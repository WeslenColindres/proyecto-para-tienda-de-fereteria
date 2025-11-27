import { Client } from '../entities/client.entity';

export interface ClientRepository {
    findById(id: number): Promise<Client | null>;
    findByNit(nit: string): Promise<Client | null>;
    findAll(limit?: number, offset?: number): Promise<Client[]>;
    searchByName(searchTerm: string, limit?: number): Promise<Client[]>;
    save(client: Client): Promise<Client>;
    update(client: Client): Promise<Client>;
    delete(id: number): Promise<void>;
}
