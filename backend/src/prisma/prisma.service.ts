import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const SOFT_DELETE_MODELS = new Set([
  'User', 'Member', 'Event', 'EventParticipation',
  'Document', 'DocumentCategory', 'NewsAnnouncement',
  'LoreEntry', 'RolePermission', 'RoleDefinition',
]);

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    this.$use(async (params, next) => {
      if (!params.model || !SOFT_DELETE_MODELS.has(params.model)) {
        return next(params);
      }

      // delete → soft delete (update deletedAt)
      if (params.action === 'delete') {
        params.action = 'update';
        params.args['data'] = { deletedAt: new Date() };
        return next(params);
      }

      // deleteMany → soft delete, unless the caller already filters by deletedAt (purge job)
      if (params.action === 'deleteMany') {
        if (params.args?.where?.deletedAt) {
          return next(params);
        }
        params.action = 'updateMany';
        params.args['data'] = { deletedAt: new Date() };
        return next(params);
      }

      // findUnique / findUniqueOrThrow → findFirst / findFirstOrThrow + deletedAt: null
      if (params.action === 'findUnique' || params.action === 'findUniqueOrThrow') {
        params.action =
          params.action === 'findUnique' ? 'findFirst' : 'findFirstOrThrow';
        params.args.where = { ...params.args.where, deletedAt: null };
        return next(params);
      }

      // findFirst / findFirstOrThrow / findMany → add deletedAt: null filter
      if (
        params.action === 'findFirst' ||
        params.action === 'findFirstOrThrow' ||
        params.action === 'findMany'
      ) {
        params.args.where = { ...(params.args.where ?? {}), deletedAt: null };
        return next(params);
      }

      return next(params);
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
