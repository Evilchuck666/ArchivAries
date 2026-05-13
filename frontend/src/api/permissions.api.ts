import { apiClient } from './client';

export interface PermissionRow {
  role: string;
  permission: string;
  granted: boolean;
}

export const permissionsApi = {
  getMyPermissions: async (): Promise<string[]> => {
    const res = await apiClient.get<{ data: string[] }>('/permissions/me');
    return res.data.data;
  },
  getAll: async (): Promise<PermissionRow[]> => {
    const res = await apiClient.get<{ data: PermissionRow[] }>('/permissions');
    return res.data.data;
  },
  setPermission: async (role: string, permission: string, granted: boolean): Promise<void> => {
    await apiClient.patch(`/permissions/${role}/${permission}`, { granted });
  },
};
