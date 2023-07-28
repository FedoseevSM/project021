import { IUser } from 'models/user';

interface IUserState {
  user?: IUser;
}

interface IUserAction {
  type: string;
  payload: IUser;
}

const userReducer = (state: IUserState, action: IUserAction) => {
  switch (action.type) {
    case 'LOAD_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
}