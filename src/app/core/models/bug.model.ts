export type BugStatus = 'open' | 'in-progress' | 'testing' | 'closed' | 'blocked';
export type BugPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Bug {
  id: string;
  projectId: string;
  title: string;
  description: string; // Rich text (HTML)
  status: BugStatus;
  priority: BugPriority;
  assigneeId: string | null;
  reporterId: string;
  labelIds: string[];
  attachmentIds: string[];
  createdAt: string;
  updatedAt: string;
  dueDate: string | null;
}

export interface BugLabel {
  id: string;
  name: string;
  color: string;
}
