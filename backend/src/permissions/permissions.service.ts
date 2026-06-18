import { Injectable } from '@nestjs/common';
import { Role } from '../common/enums/role.enum';
import { PrismaService } from '../prisma/prisma.service';

const CACHE_TTL_MS = 1 * 60 * 1000;

const PROTECTED_ROLES: Role[] = [Role.SUPER_ADMIN];

@Injectable()
export class PermissionsService {
  private cache = new Map<Role, Set<string>>();
  private cacheBuiltAt: Date | null = null;

  constructor(private readonly prisma: PrismaService) {}

  private isCacheStale(): boolean {
    if (!this.cacheBuiltAt) return true;
    return Date.now() - this.cacheBuiltAt.getTime() > CACHE_TTL_MS;
  }

  private async buildCache(): Promise<void> {
    const rows = await this.prisma.rolePermission.findMany({ where: { granted: true } });
    const map = new Map<Role, Set<string>>();
    for (const row of rows) {
      if (!map.has(row.role as Role)) map.set(row.role as Role, new Set());
      map.get(row.role as Role)!.add(row.permission);
    }
    this.cache = map;
    this.cacheBuiltAt = new Date();
  }

  private async ensureCache(): Promise<void> {
    if (this.isCacheStale()) await this.buildCache();
  }

  invalidateCache(): void {
    this.cacheBuiltAt = null;
  }

  async hasPermission(role: Role, permission: string): Promise<boolean> {
    if (role === Role.SUPER_ADMIN) return true;
    await this.ensureCache();
    return this.cache.get(role)?.has(permission) ?? false;
  }

  async getPermissionsForRole(role: Role): Promise<string[]> {
    await this.ensureCache();
    return Array.from(this.cache.get(role) ?? []);
  }

  async getAllPermissions(): Promise<Record<string, string[]>> {
    const rows = await this.prisma.rolePermission.findMany();
    const result: Record<string, string[]> = {};
    for (const row of rows) {
      if (row.granted) {
        if (!result[row.role]) result[row.role] = [];
        result[row.role].push(row.permission);
      }
    }
    return result;
  }

  async getFullMatrix(): Promise<{
    matrix: { role: string; permission: string; granted: boolean }[];
    protectedRoles: string[];
  }> {
    const rows = await this.prisma.rolePermission.findMany({
      orderBy: [{ role: 'asc' }, { permission: 'asc' }],
    });
    return {
      matrix: rows.map((r) => ({ role: r.role, permission: r.permission, granted: r.granted })),
      protectedRoles: PROTECTED_ROLES,
    };
  }

  async setPermission(role: Role, permission: string, granted: boolean): Promise<void> {
    await this.prisma.rolePermission.upsert({
      where: { role_permission: { role, permission } },
      update: { granted },
      create: { role, permission, granted },
    });
    this.invalidateCache();
  }
}
