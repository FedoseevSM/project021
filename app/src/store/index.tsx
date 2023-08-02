import { createStore, applyMiddleware, combineReducers, Middleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
// import reduxLogger from 'redux-logger';
import { composeWithDevTools } from 'redux-devtools-extension';

import { IUserInfo, User } from 'models/user';
import { IProject, IPage } from 'models/project';
import { IComment } from 'models/comment';

export interface IUserState {
  user: User | null;
  userInfo: IUserInfo | null;
  loginShowed: boolean;
  registerShowed: boolean;
  forgetPasswordShowed: boolean;
  openCommentForm: IComment | null | undefined;
  events: any[] | null;
}
const initialState: IUserState = {
  user: null,
  userInfo: null,
  loginShowed: false,
  registerShowed: false,
  forgetPasswordShowed: false,
  openCommentForm: undefined,
  events: null,
};

export enum UserActionType {
  LOAD_USER_ACTION = 'LOAD_USER',
  LOAD_USER_INFO_ACTION = 'LOAD_USER_INFO',
  LOGIN_VISIBILITY_ACTION = 'LOGIN_VISIBILITY_CHANGED',
  REGISTER_VISIBILITY_ACTION = 'REGISTER_VISIBILITY_CHANGED',
  FORGET_PASSWORD_VISIBILITY_ACTION = 'FORGET_PASSWORD_VISIBILITY',
  LOGOUT_ACTION = 'LOGOUT',
  COMMENT_FORM_OPEN_ACTION = 'COMMENT_FORM_OPEN_ACTION',
  EVENTS_LOADED_ACTION = 'EVENTS_LOADED_ACTION',
  EVENT_READ_ACTION = 'EVENT_READ_ACTION',
}

export function userReducer(state = initialState, action: { type: UserActionType, payload: any }): IUserState {
  switch (action.type) {
    case UserActionType.LOAD_USER_ACTION:
      return { ...state, user: action.payload };
    case UserActionType.LOGIN_VISIBILITY_ACTION:
      return { ...state, loginShowed: action.payload };
    case UserActionType.REGISTER_VISIBILITY_ACTION:
      return { ...state, registerShowed: action.payload };
    case UserActionType.FORGET_PASSWORD_VISIBILITY_ACTION:
      return { ...state, forgetPasswordShowed: action.payload };
    case UserActionType.LOAD_USER_INFO_ACTION:
      return { ...state, userInfo: action.payload };
    case UserActionType.COMMENT_FORM_OPEN_ACTION:
      return { ...state, openCommentForm: action.payload };
    case UserActionType.EVENTS_LOADED_ACTION:
      return { ...state, events: action.payload };
    case UserActionType.EVENT_READ_ACTION:
      const events = state.events || [];
      const index = events.findIndex(e => e._id.$oid === action.payload._id.$oid);
      if (index === -1) {
        return state;
      }
      events[index] = { ...action.payload, read: true };
      return { ...state, events: [...events]};
    case UserActionType.LOGOUT_ACTION:
      return { ...initialState, events: null };
    default:
      return state;
  }
}

export interface IProjectState {
  projects: IProject[];
  project: IProject | null;
  projectUsers: any;
  page: IPage | null;
  comments: IComment[] | null;
  myProjects: any,
}
const initialProjectState: IProjectState = {
  projects: [],
  project: null,
  projectUsers: null,
  page: null,
  comments: null,
  myProjects: undefined
};

export enum ProjectActionType {
  LOAD_PROJECTS_ACTION = 'LOAD_PROJECTS',
  LOAD_PROJECT_ACTION = 'LOAD_PROJECT',
  LOAD_PROJECT_USERS_ACTION = 'LOAD_PROJECT_USERS',
  LOAD_PAGE_ACTION = 'LOAD_PAGE',
  LOAD_COMMENTS_ACTION = 'LOAD_COMMENTS',
  LOAD_MY_PROJECTS_ACTION = 'LOAD_MY_PROJECTS',
}

export function projectReducer(state = initialProjectState, action: { type: ProjectActionType | UserActionType, payload: any }): IProjectState {
  switch (action.type) {
    case ProjectActionType.LOAD_PROJECTS_ACTION:
      return { ...state, projects: action.payload };
    case ProjectActionType.LOAD_PROJECT_ACTION:
      return { ...state, project: action.payload };
    case ProjectActionType.LOAD_COMMENTS_ACTION:
      return { ...state, comments: action.payload };
      case ProjectActionType.LOAD_PAGE_ACTION:
        return { ...state, page: action.payload };
    case ProjectActionType.LOAD_MY_PROJECTS_ACTION:
        return { ...state, myProjects: action.payload }
    case ProjectActionType.LOAD_PROJECT_USERS_ACTION:
      return { ...state, projectUsers: action.payload }
    case UserActionType.LOGOUT_ACTION:
        return { ...initialProjectState };
    
    default:
      return state;
  }
}


const rootReducer = combineReducers({
  user: userReducer,
  project: projectReducer,
});


export type AppState = ReturnType<typeof rootReducer>;

const middlewares: Middleware[] = [
  thunkMiddleware,
];

if (process.env.REACT_APP_ENVIRONMENT === 'development') {
  // middlewares.push(reduxLogger);
}

const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(...middlewares)));

export default store;

