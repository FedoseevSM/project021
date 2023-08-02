import { request, authRequest } from 'api/request';
import { IProject } from 'models/project';
import { IComment } from 'models/comment';
import { IUser, IUserInfo } from 'models/user';
import qs from 'query-string';


export async function getAccount() {
  return authRequest<IUser>('account', 'get');
}

export async function authenticate(email: string, password: string) {
  return request<IUser>('account/authenticate', 'post', { email: email.toLowerCase(), password });
}

export async function register(name: string, email: string, password: string) {
  return request<any>('account/register', 'post', { name, email: email.toLowerCase(), password });
}

export async function resendConfirmEmail(email: string, password: string) {
  return request<IUser>('account/resend-confirm-email', 'post', { email: email.toLowerCase(), password });
}

export async function logout() {
  return authRequest<IUser>('account/revoke-token', 'post', {});
}

export async function forgotPassword(email: string) {
  return request<IUser>('account/forgot-password', 'post', { email: email.toLowerCase() });
}

export async function validateResetToken(token: string) {
  return request<IUser>('account/validate-reset-token', 'post', { token });
}

export async function resetPassword(password: string, token: string) {
  return request<any>('account/reset-password', 'post', { token, password });
}

export async function signFb(code: string, redirectUri: string) {
  return request<any>(`account/fb?code=${code}&redirect_uri=${redirectUri}`, 'get',);
}

export async function signVk(code: string, redirectUri: string) {
  return request<any>(`account/vk?code=${code}&redirect_uri=${redirectUri}`, 'get',);
}

export async function signGoogle(code: string, redirectUri: string) {
  return request<any>(`account/google?code=${code}&redirect_uri=${redirectUri}`, 'get',);
}

export async function getUser(userId: number) {
  return authRequest<IUser>(`users/${userId}`, 'get');
}

export async function getUserInfo(userId?: number) {
  const url = userId ? `users/${userId}/info` : 'account/info';
  return authRequest<IUserInfo>(url, 'get');
}

interface IAccountPayload {
  name: string; 
  login: string; 
  city: string;
  education: string;
  tags: string[];
  skills: string[];
  links: string[];
  cover: string | null;
  coverFile: File | null;
  userId?: number;
}

export function updateUserInfo(payload: IAccountPayload) {
  const { userId, name, login, city, education, tags, skills, links, cover, coverFile } = payload;
  const url = userId ? `user/{userId}/info` : 'account/info';
  const formData = new FormData();
  if (coverFile) {
    formData.append('coverFile', coverFile);
  }
  if (!coverFile && cover) {
    formData.append('cover', cover);
  }
  formData.append('name', name);
  formData.append('login', login);
  formData.append('city', city);
  formData.append('education', education);
  
  for (let tag of tags) {
    formData.append('tags[]', tag);
  }

  for (let link of links) {
    formData.append('links[]', link);
  }

  for (let skill of skills) {
    formData.append('skills[]', skill);
  }
  
  return authRequest<any>(url, 'put', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
}

export async function getEvents() {
  return authRequest<string[]>('events', 'get');
}

export async function readEvent(eventId: number) {
  return authRequest<IUser>(`events/${eventId}`, 'put');
}

export async function getUserProjects(userId: number, page?: number) {
  const params: { [key: string]: any } = {};
  params.user = userId.toString();
  if (page) {
    params.page = page;
  }
  return request<any>(`projects?${qs.stringify(params)}`, 'get',);
}

export async function getUserComments(userId: number) {
  const url = `comments/?user=${userId}`;
  return authRequest<IComment[]>(url, 'get');
}