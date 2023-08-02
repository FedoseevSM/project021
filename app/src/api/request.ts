import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import store, { UserActionType } from 'store';
import { apiEndpoint } from 'helpers/constants';

type IRequestMethod = 'get' | 'post' | 'patch' | 'delete' | 'put' | 'head';

interface ICancelableRequest<T> extends Promise<AxiosResponse<T>> {
  cancel?: any;
}

export function request<T>(
  url: string, 
  method: IRequestMethod, 
  data?: any, 
  config?: AxiosRequestConfig
): ICancelableRequest<T> {
  const source = axios.CancelToken.source();
  let request: ICancelableRequest<T>;
  
  const newConfig = config ? { ...config } : {};
  newConfig.headers =  { ...newConfig.headers, Authorization: `Bearer ${JWT_TOKEN}` };

  if (method === 'post' || method === 'put' || method === 'patch') {
    request = axios[method]<T>(`${apiEndpoint}/${url}`, data, { ...newConfig, withCredentials: true, cancelToken: source.token });
  } else {
    request = axios[method]<T>(`${apiEndpoint}/${url}`, { ...newConfig, withCredentials: true, cancelToken: source.token });
  }
  request.cancel = (reason?: string) => source.cancel(reason || 'Cancel by user');
  return request;
}

let JWT_TOKEN = '';
let jwtRequest: any = null
let refreshTokenTimerId: any = null;

export function setJwtToken(token: string) {
  JWT_TOKEN = token;
}

export function getJwtToken() {
  return JWT_TOKEN;
}

export async function refreshToken() {
  clearTimeout(refreshTokenTimerId);
  refreshTokenTimerId = null;
  jwtRequest = new Promise(() => {});
  try {
    const { data } = await request<any>('account/refresh-token', 'post', { withCredentials: true });
    JWT_TOKEN = data.jwtToken;
    startRefreshTokenTimer();
    Promise.resolve(jwtRequest);
    jwtRequest = null;
  } catch (err) {
    jwtRequest = null;
    JWT_TOKEN = '';
    console.error('Fail refresh token');
    Promise.resolve(jwtRequest);    
  } 
}

window.onfocus = refreshToken;

function startRefreshTokenTimer() {
  const jwtToken = JSON.parse(atob(JWT_TOKEN.split('.')[1]));
  const expires = new Date(jwtToken.exp * 1000);
  const timeout = expires.getTime() - Date.now() - (60 * 1000);
  refreshTokenTimerId = setTimeout(refreshToken, timeout);
}

export async function authRequest<T>(
  url: string, 
  method: IRequestMethod, 
  data?: any, 
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  if (jwtRequest) {
    await jwtRequest;
  }
  const newConfig = config ? { ...config } : {};
  newConfig.headers =  { ...newConfig.headers, Authorization: `Bearer ${JWT_TOKEN}` };
  try {
    const res = await request<T>(url, method, data, newConfig);
    if ([401, 403].includes(res.status)) {
      store.dispatch({ type: UserActionType.LOGOUT_ACTION, payload: null });
      return Promise.reject(res);
    }
    return Promise.resolve(res);
  } catch (err) {
    return Promise.reject(err.response);
  }
  
}