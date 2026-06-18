import { apiClient } from './client';

export interface PermissionRow {
  role: string;
  permission: string;
  granted: boolean;
}

export interface PermissionMatrix {
  matrix: PermissionRow[];
  protectedRoles: string[];
}

export const permissionsApi = {
  getMyPermissions: async (): Promise<string[]> => {
    const res = await apiClient.get<{ data: string[] }>('/permissions/me');
    return res.data.data;
  },
  getAll: async (): Promise<PermissionMatrix> => {
    const res = await apiClient.get<{ data: PermissionMatrix }>('/permissions');
    return res.data.data;
  },
  setPermission: async (role: string, permission: string, granted: boolean): Promise<void> => {
    await apiClient.patch(`/permissions/${role}/${permission}`, { granted });
  },
};
