export type UserStatus = 'activo' | 'inactivo' | 'bloqueado';

export type UserItem = {
  id: string;
  username: string;
  fullName: string;
  roleId: string;
  status: UserStatus;
  email: string;
  phone: string;
  branch: string;
  lastAccess: string;
};

export type RoleItem = {
  id: string;
  name: string;
  users: number;
  description: string;
  createdAt: string;
};

export type PermissionState = 'checked' | 'partial' | 'locked' | 'unchecked';

export type PermissionNode = {
  id: string;
  label: string;
  state: PermissionState;
  children?: PermissionNode[];
  note?: string;
};

export type RolePermissions = Record<string, PermissionNode[]>;
