export enum Role {
  VISITOR = 'VISITOR',
  MEMBER = 'MEMBER',
  AREA_MANAGER = 'AREA_MANAGER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export const ROLE_HIERARCHY: Role[] = [
  Role.VISITOR,
  Role.MEMBER,
  Role.AREA_MANAGER,
  Role.ADMIN,
  Role.SUPER_ADMIN,
];
