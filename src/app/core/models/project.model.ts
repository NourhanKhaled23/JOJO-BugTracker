export type ProjectType = 'web' | 'mobile' | 'grad' | 'team' | 'other';

export interface Project {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  color: string;
  icon: string;
  ownerId: string;
  memberIds: string[];
  bugCount: number;
  lastActivity: string;
  createdAt: string;
  isArchived: boolean;
}

export interface CreateProjectDto {
  name: string;
  description: string;
  type: ProjectType;
  color: string;
  icon: string;
}
