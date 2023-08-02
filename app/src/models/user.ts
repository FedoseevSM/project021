export interface IUser {
  id: number;
  name: string;
  login: string;
  jwtToken: string;
  role: Role;
  cover: string;
}

export interface IUserInfo {
  city: string;
  education: string;
  updated: Date;
  tags: string[];
  links: string[];
  skills: string[];
}

export enum Role {
  Admin = 'Admin',
  User = 'User',
}

export class User implements IUser {
  constructor(
    public id: number, 
    public name: string, 
    public jwtToken: string, 
    public role: Role,
    public login: string,
    public cover: string,
  ) {}

  static FromResponse(data: any) {
    return new User(data.id, data.name, data.jwtToken, data.role, data.login, data.cover);
  }
  
  public get isAdmin(): boolean {
    return this.role === Role.Admin
  }
}
