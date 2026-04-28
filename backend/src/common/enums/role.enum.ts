export enum Role {
  VISITOR = 'VISITOR',
  MEMBER = 'MEMBER',
  AREA_MANAGER = 'AREA_MANAGER',
  BOARD = 'BOARD',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export const ROLE_HIERARCHY: Role[] = [
  Role.VISITOR,
  Role.MEMBER,
  Role.AREA_MANAGER,
  Role.BOARD,
  Role.ADMIN,
  Role.SUPER_ADMIN,
];
