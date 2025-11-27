import { Request, Response } from 'express';
import { PostgresCategoryRepository } from '../../repositories/postgres-category.repository';
import { Category } from '../../../domain/entities/category.entity';

export class CategoryController {
    private repository: PostgresCategoryRepository;

    constructor() {
        this.repository = new PostgresCategoryRepository();
    }

    getAll = async (req: Request, res: Response) => {
        try {
            const categories = await this.repository.findAll();
            res.json(categories.map(c => ({
                id: c.props.id,
                name: c.props.name,
                description: c.props.description,
                parentId: c.props.parentId,
                active: c.props.isActive,
                createdAt: c.props.createdAt
            })));
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error fetching categories' });
        }
    };

    create = async (req: Request, res: Response) => {
        try {
            const { name, description, parentId, active } = req.body;
            const category = new Category({
                name,
                description,
                parentId,
                isActive: active !== undefined ? active : true
            });
            const created = await this.repository.create(category);
            res.status(201).json({
                id: created.props.id,
                name: created.props.name,
                description: created.props.description,
                parentId: created.props.parentId,
                active: created.props.isActive,
                createdAt: created.props.createdAt
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error creating category' });
        }
    };

    update = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const { name, description, parentId, active } = req.body;
            const category = new Category({
                id,
                name,
                description,
                parentId,
                isActive: active
            });
            const updated = await this.repository.update(category);
            res.json({
                id: updated.props.id,
                name: updated.props.name,
                description: updated.props.description,
                parentId: updated.props.parentId,
                active: updated.props.isActive,
                createdAt: updated.props.createdAt
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error updating category' });
        }
    };

    delete = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            await this.repository.delete(id);
            res.status(204).send();
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error deleting category' });
        }
    };
}
