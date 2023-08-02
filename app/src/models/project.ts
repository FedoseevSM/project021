import { IUser } from 'models/user';
import { IFile } from 'models/file';
export interface IProject {
  id: number;
  name: string;
  description: string;
  content: string;
  data: string;
  liked: boolean;
  likesCount: number;
  created: Date;
  updated: Date;
  cover: string;
  user: IUser;
  following: boolean;
  requested: boolean;
  participate: boolean;
  commentsCount: number;
  pages?: IPage[];
  draft?: boolean;
}

export interface IPage {
  id: number;
  name: string;
  content: string;
  data: string;
  projectId: number;
  commentsCount: number;
  parentId?: number;
  draft?: boolean;
  deleted?: boolean;
  important?: boolean;
  files?: IFile[];
  user?: IUser;
}