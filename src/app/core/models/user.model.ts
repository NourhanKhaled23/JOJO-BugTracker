export interface User {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  createdAt: string;        // ISO 8601
}
