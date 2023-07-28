import { request, authRequest } from 'api/request';
import qs from 'query-string';
import { IComment } from 'models/comment';

export async function getComments(projectId?: number, pageId?: number, userId?: number, before?: Date) {
  const params: { [key: string]: any } = {};
  
  if (projectId) {
    params.project = projectId;
  }

  if (userId) {
    params.user = userId;
  }
  
  if (pageId) {
    params.page = pageId;
  }
  
  if (before) {
    params.before = before;
  }
  
  return request<IComment[]>(`comments?${qs.stringify(params)}`, 'get',);
}

export function createComment(projectId: number, text: string, data: any, pageId?: number, anonymous?: boolean, parentId?: number) {
  const formData = new FormData();
  formData.append('text', text);
  formData.append('data', JSON.stringify(data));
  formData.append('projectId', projectId.toString());
  if (pageId) {
    formData.append('pageId', pageId.toString());
  }
  if (anonymous) {
    formData.append('anonymous', anonymous.toString());
  }
  if (parentId) {
    formData.append('parentId', parentId.toString());
  }
  return authRequest<IComment>('comments', 'post', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
}



export function updateComment(commentId: number, text: string, data: any) {
  const formData = new FormData();
  formData.append('text', text);
  formData.append('data', JSON.stringify(data));
  return authRequest<IComment>(`comments/${commentId}`, 'patch', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
}

export function removeComment(commentId: number) {
  return authRequest<IComment>(`comments/${commentId}`, 'delete');
}

export function likeComment(commentId: number, type: number) {
  return authRequest<IComment>(`comments/${commentId}/like?type=${type}`, 'post');
}