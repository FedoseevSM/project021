import { request, authRequest } from 'api/request';
import qs from 'query-string';
import { IComment } from 'models/comment';
import { AxiosRequestConfig } from 'axios';

export async function uploadFile(file: File, onUploadProgress?: any) {
  const formData = new FormData();
  formData.append('file', file!);
  const config: AxiosRequestConfig = { 
    headers: { 'Content-Type': 'multipart/form-data' },
  };
  if (onUploadProgress) {
    config.onUploadProgress = onUploadProgress;
  }
  return await authRequest<any>('files', 'post', formData, config);
}

