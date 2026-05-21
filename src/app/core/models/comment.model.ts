export interface BugComment {
  id: string;
  bugId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
  edited?: boolean;
}

export interface BugCommentDisplay {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  userId?: string;
  edited?: boolean;
}
