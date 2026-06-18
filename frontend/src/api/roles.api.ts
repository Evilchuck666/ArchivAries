import { apiClient, unwrap } from './client';

export interface RoleDefinition {
  id: string;
  name: string;
  label: string;
  level: number;
  isProtected: boolean;
}

export interface CreateRolePayload {
  name: string;
  label: string;
  level: number;
}

export interface UpdateRolePayload {
  label?: string;
  level?: number;
}

export const rolesApi = {
  getAll: (): Promise<RoleDefinition[]> =>
    apiClient.get<{ data: RoleDefinition[] }>('/roles').then(unwrap),
  create: (payload: CreateRolePayload): Promise<RoleDefinition> =>
    apiClient.post<{ data: RoleDefinition }>('/roles', payload).then(unwrap),
  update: (id: string, payload: UpdateRolePayload): Promise<RoleDefinition> =>
    apiClient.patch<{ data: RoleDefinition }>(`/roles/${id}`, payload).then(unwrap),
  remove: (id: string): Promise<void> =>
    apiClient.delete(`/roles/${id}`).then(() => undefined),
};
