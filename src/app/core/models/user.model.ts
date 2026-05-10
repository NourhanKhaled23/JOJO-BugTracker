import { Role } from '../enums/role';

export interface User {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: Role;
  createdAt: string;        // ISO 8601
}
