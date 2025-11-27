import { Category } from '../../domain/entities/category.entity';
import { CategoryRepository } from '../../domain/ports/category.repository';
import { query } from '../database/postgres';

export class PostgresCategoryRepository implements CategoryRepository {
    async findAll(): Promise<Category[]> {
        const result = await query('SELECT * FROM categorias ORDER BY id_categoria ASC');
        return result.rows.map(this.mapToEntity);
    }

    async findById(id: number): Promise<Category | null> {
        const result = await query('SELECT * FROM categorias WHERE id_categoria = $1', [id]);
        if (result.rows.length === 0) return null;
        return this.mapToEntity(result.rows[0]);
    }

    async create(category: Category): Promise<Category> {
        const { name, description, parentId, isActive } = category.props;
        const result = await query(
            'INSERT INTO categorias (nombre, descripcion, categoria_padre, activa) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, description, parentId, isActive]
        );
        return this.mapToEntity(result.rows[0]);
    }

    async update(category: Category): Promise<Category> {
        const { id, name, description, parentId, isActive } = category.props;
        const result = await query(
            'UPDATE categorias SET nombre = $1, descripcion = $2, categoria_padre = $3, activa = $4 WHERE id_categoria = $5 RETURNING *',
            [name, description, parentId, isActive, id]
        );
        return this.mapToEntity(result.rows[0]);
    }

    async delete(id: number): Promise<void> {
        await query('UPDATE categorias SET activa = FALSE WHERE id_categoria = $1', [id]);
    }

    private mapToEntity(row: any): Category {
        return new Category({
            id: row.id_categoria,
            name: row.nombre,
            description: row.descripcion,
            parentId: row.categoria_padre,
            isActive: row.activa,
            createdAt: row.fecha_creacion
        });
    }
}
