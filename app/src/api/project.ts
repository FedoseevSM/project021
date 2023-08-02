import { request, authRequest } from 'api/request';
import qs from 'query-string';
import { IPage, IProject } from 'models/project';

export function getProjects(type: number, page?: number) {
  const params: { [key: string]: any } = {};
  params.type = type;
  if (page) {
    params.page = page;
  }
  
  return request<any>(`projects?${qs.stringify(params)}`, 'get',);
}

export function searchProjects(q: string, page?: number) {
  const params: { [key: string]: any } = {};
  params.q = q;
  if (page) {
    params.page = page;
  }
  
  return request<any>(`projects?${qs.stringify(params)}`, 'get',);
}




export function getMyProjects(projectType: number, listType: number, page?: number) {
  const params: { [key: string]: any } = {};
  params.type = projectType;
  params.list = listType;
  if (page) {
    params.page = page;
  }
  return request<any>(`account/projects?${qs.stringify(params)}`, 'get');
}

export async function getProject(projectId: number) {
  return request<any>(`projects/${projectId}`, 'get');
}

export async function deleteProject(projectId: number) {
  return authRequest<any>(`projects/${projectId}`, 'delete');
}

export function createProject(name: string, description: string, content: string, data: any, cover: File, draft: boolean, type: number) {
  const formData = new FormData();
  formData.append('cover', cover!);
  formData.append('name', name);
  formData.append('description', description);
  formData.append('content', content);
  formData.append('data', JSON.stringify(data));
  formData.append('draft', draft.toString());
  formData.append('type', type.toString());
  return authRequest<IProject>('projects', 'post', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
}

export async function updateProject(id: number, name: string, description: string, content: string, data: any, cover: File | null, draft: boolean) {
  const formData = new FormData();
  if (cover) {
    formData.append('cover', cover!);
  }
  formData.append('name', name);
  formData.append('description', description);
  formData.append('content', content);
  formData.append('data', JSON.stringify(data));
  formData.append('draft', draft.toString());
  return authRequest<IProject>(`projects/${id}`, 'put', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
}

export function likeProject(projectId: number) {
  return authRequest<any>(`projects/${projectId}/like`, 'post');
}

export function getProjectPages(projectId: number) {
  return request<IPage[]>(`projects/${projectId}/pages`, 'get');
}

export function createPage(projectId: number, parentId?: number) {
  return authRequest<IPage>(`projects/${projectId}/pages${parentId ? `?parent=${parentId}` : ''}`, 'post');
}

export async function getPage(projectId: number, pageId: number) {
  return request<IPage>(`projects/${projectId}/pages/${pageId}`, 'get');
}

export async function updatePage(page: IPage, data: any, files?: File[]) {
  const formData = new FormData();
  if (files) {
    files.forEach(f => {
      formData.append('newFiles', f);    
    })
  }
  if (page.files) {
    page.files.forEach(f => {
      formData.append('files', f.id.toString());    
    })
  }
  formData.append('name', page.name);
  formData.append('data', JSON.stringify(data));
  formData.append('content', page.content);
  formData.append('important', page.important!.toString());
  formData.append('draft', page.draft!.toString());
  return authRequest<IProject>(`projects/${page.projectId}/pages/${page.id}`, 'put', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
}

export async function deleteProjectPage(projectId: number, pageId: number) {
  return authRequest<IProject>(`projects/${projectId}/pages/${pageId}`, 'delete');
}


export function toggleProjectFollowing(projectId: number, following: boolean) {
  return authRequest<IPage>(`projects/${projectId}/follow?value=${+following}`, 'post');
}

export function toggleProjectRequest(projectId: number, following: boolean) {
  const formData = new FormData();
  formData.set('following', following.toString());
  return authRequest<IPage>(`projects/${projectId}/request?value=${+following}`, 'post');
}

export function leaveProject(projectId: number) {
  return authRequest<IPage>(`projects/${projectId}/leave`, 'post');
}

export function getUsers(projectId: number) {
  return authRequest<IPage>(`projects/${projectId}/users`, 'get');
}

export function getFollowers(projectId: number) {
  return authRequest<IPage>(`projects/${projectId}/followers`, 'get');
}

export function getRequests(projectId: number) {
  return authRequest<IPage>(`projects/${projectId}/requests`, 'get');
}

export function acceptRequest(projectId: number, requestId: number) {
  return authRequest<IPage>(`projects/${projectId}/requests/${requestId}`, 'post');
}

export function declineRequest(projectId: number, requestId: number) {
  return authRequest<IPage>(`projects/${projectId}/requests/${requestId}`, 'delete');
}

export function removeUser(projectId: number, userId: number) {
  return authRequest<IPage>(`projects/${projectId}/users/${userId}`, 'delete');
}


export function unFollowUser(projectId: number, userId: number) {
  return authRequest<IPage>(`projects/${projectId}/followers/${userId}`, 'delete');
}

export function getDraft(projectId: number, pageId: number) {
  return authRequest<IPage>(`projects/${projectId}/pages/${pageId}/drafts`, 'get');
}

export async function updateDraft(projectId: number, pageId: number, content: string) {
  const formData = new FormData();
  formData.append('content', content);
  
  return authRequest<IProject>(`projects/${projectId}/pages/${pageId}/drafts`, 'post', formData);
}

export async function saveDraftToPage(projectId: number, pageId: number) {
  return authRequest<IProject>(`projects/${projectId}/pages/${pageId}/drafts/to`, 'post');
}

export async function saveDraftFromPage(projectId: number, pageId: number) {
  return authRequest<IProject>(`projects/${projectId}/pages/${pageId}/drafts/from`, 'post');
}
