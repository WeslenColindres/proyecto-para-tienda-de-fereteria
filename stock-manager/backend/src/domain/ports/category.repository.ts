import { Category } from '../entities/category.entity';

export interface CategoryRepository {
    findAll(): Promise<Category[]>;
    findById(id: number): Promise<Category | null>;
    create(category: Category): Promise<Category>;
    update(category: Category): Promise<Category>;
    delete(id: number): Promise<void>;
}
