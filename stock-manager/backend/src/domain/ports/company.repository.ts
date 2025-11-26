import { Company } from '../entities/company.entity';
import { Branch } from '../entities/branch.entity';

export interface CompanyRepository {
    getCompany(): Promise<Company | null>;
    save(company: Company): Promise<Company>;
    update(company: Company): Promise<Company>;

    // Branch methods
    findBranchById(id: number): Promise<Branch | null>;
    findAllBranches(): Promise<Branch[]>;
    saveBranch(branch: Branch): Promise<Branch>;
    updateBranch(branch: Branch): Promise<Branch>;
}
