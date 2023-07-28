import { IUser } from 'models/user'

export interface IComment {
  id: number;
  text: string;
  created: string;
  user?: IUser;
  anonymous: boolean;
  image?: string;
  parentId?: number;
  threadId?: number;
  children?: IComment[];
  positiveScore: number;
  negativeScore: number;
  answersCount: number;
  deleted?: boolean;
  highlight?: boolean;
  projectId: number;
  pageId?: number;
  data: string;
  depth: number;
}
