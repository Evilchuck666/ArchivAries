import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const CACHE_TTL_MS = 1 * 60 * 1000;

@Injectable()
export class PermissionsService {
  private cache = new Map<string, Set<string>>();
  private cacheBuiltAt: Date | null = null;

  constructor(private readonly prisma: PrismaService) {}

  private isCacheStale(): boolean {
    if (!this.cacheBuiltAt) return true;
    return Date.now() - this.cacheBuiltAt.getTime() > CACHE_TTL_MS;
  }

  private async buildCache(): Promise<void> {
    const rows = await this.prisma.rolePermission.findMany({ where: { granted: true } });
    const map = new Map<string, Set<string>>();
    for (const row of rows) {
      if (!map.has(row.role)) map.set(row.role, new Set());
      map.get(row.role)!.add(row.permission);
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

  async hasPermission(role: string, permission: string): Promise<boolean> {
    await this.ensureCache();
    return this.cache.get(role)?.has(permission) ?? false;
  }

  async getPermissionsForRole(role: string): Promise<string[]> {
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
    const [rows, protectedDefs] = await Promise.all([
      this.prisma.rolePermission.findMany({
        orderBy: [{ role: 'asc' }, { permission: 'asc' }],
      }),
      this.prisma.roleDefinition.findMany({
        where: { isProtected: true },
        select: { name: true },
      }),
    ]);
    return {
      matrix: rows.map((r) => ({ role: r.role, permission: r.permission, granted: r.granted })),
      protectedRoles: protectedDefs.map((d) => d.name),
    };
  }

  async canDelete(
    currentUserId: string,
    currentUserLevel: number,
    creatorId: string,
    creatorRole: string,
  ): Promise<boolean> {
    if (currentUserId === creatorId) return true;
    const creatorRoleDef = await this.prisma.roleDefinition.findUnique({
      where: { name: creatorRole },
      select: { level: true },
    });
    return currentUserLevel > (creatorRoleDef?.level ?? 0);
  }

  async setPermission(role: string, permission: string, granted: boolean): Promise<void> {
    await this.prisma.rolePermission.upsert({
      where: { role_permission: { role, permission } },
      update: { granted },
      create: { role, permission, granted },
    });
    this.invalidateCache();
  }
}
