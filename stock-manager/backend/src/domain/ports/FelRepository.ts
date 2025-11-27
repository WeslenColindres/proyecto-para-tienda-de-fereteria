import { FelConfig } from '../entities/FelConfig';

export interface FelRepository {
    findConfigByBranchId(branchId: number): Promise<FelConfig | null>;
    saveConfig(config: FelConfig): Promise<FelConfig>;
}
