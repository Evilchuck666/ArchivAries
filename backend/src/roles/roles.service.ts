import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.roleDefinition.findMany({
      orderBy: { level: 'asc' },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.roleDefinition.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Rol no encontrado');
    return role;
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.prisma.roleDefinition.findUnique({
      where: { name: dto.name },
    });
    if (existing) throw new ConflictException(`El rol '${dto.name}' ya existe`);

    return this.prisma.roleDefinition.create({ data: dto });
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.findOne(id);
    if (role.isProtected) {
      throw new BadRequestException('Los roles protegidos no se pueden modificar');
    }
    return this.prisma.roleDefinition.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const role = await this.findOne(id);
    if (role.isProtected) {
      throw new BadRequestException('Los roles protegidos no se pueden eliminar');
    }

    const usersWithRole = await this.prisma.user.count({
      where: { role: role.name },
    });
    if (usersWithRole > 0) {
      throw new BadRequestException(
        `No se puede eliminar: ${usersWithRole} usuario(s) tienen este rol`,
      );
    }

    await this.prisma.rolePermission.deleteMany({ where: { role: role.name } });
    return this.prisma.roleDefinition.delete({ where: { id } });
  }
}
