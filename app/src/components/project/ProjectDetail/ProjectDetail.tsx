import React, { useEffect, useMemo, useCallback, useState } from 'react';
import cx from 'classnames';
import { useParams , useHistory, Route, useRouteMatch, Switch } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import { AppState, ProjectActionType } from 'store';
import ProjectMain from 'components/project/ProjectMain/ProjectMain';
import EditProject from 'components/project/EditProject/EditProject';
import PageDetail from 'components/project/page/PageDetail/PageDetail';
import StructureTree from 'components/project/StructureTree/StructureTree';
import { getUsers, getFollowers, getRequests, getProject, createPage, getProjectPages } from 'api/project';
import { toggleProjectFollowing, toggleProjectRequest, leaveProject, acceptRequest, declineRequest, removeUser, unFollowUser, } from 'api/project';
import useUser from 'hooks/useUser';
import UserWidget from 'components/common/UserWidget/UserWidget';
import Popup from 'components/common/Popup/Popup';
import { ReactComponent as Accept } from 'icons/accept.svg';
import { ReactComponent as Decline } from 'icons/decline.svg';

import s from './ProjectDetail.module.scss';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const dispatch = useDispatch();
  const match = useRouteMatch();
  const { user } = useUser();
  const { project, projectUsers } = useSelector((s: AppState) => s.project);
  const isAdmin = !!(user && project && (user.id === project.user.id  || user.isAdmin));
  const users = projectUsers;

  const [usersShowed, setUsersShowed] = useState(false);
  const [popupUsersIndex, setPopUsersIndex] = useState(0);

  const [usersIndex, setUsersIndex] = useState(0);
  const [displayArrow, setDisplayArrow] = useState(false);

  useEffect(
    () => {
      setUsersShowed(false);
    },
    [project?.id]
  );

  useEffect(
    () => {
      setPopUsersIndex(0);
    },
    [usersShowed]
  );

  useEffect(
    () => {
      const onScroll = () => {
        const top = window.scrollY;
        setDisplayArrow(top > 300);
      }
      onScroll();
      document.addEventListener('scroll', onScroll);
      return () => {
        document.removeEventListener('scroll', onScroll);
      }
    },
    []
  );
  
  
  useEffect(
    () => {
      const loadProject = async () => {
        try {
          const res = await getProject(+id);
          const { data: pages } = await getProjectPages(+id);
          dispatch({ type: ProjectActionType.LOAD_PROJECT_ACTION, payload: { ...res.data, pages }});          
        } catch (err) {
          console.error(err);
          history.replace('/');
        }
      }
      loadProject();
      return () => {
        dispatch({ type: ProjectActionType.LOAD_PROJECT_ACTION, payload: null });
      }
    },
    [id, user] // eslint-disable-line
  );

  useEffect(
    () => {
      if (project) {
        const load = async () => {
          const { data: users } = await getUsers(project.id);
          const { data: followers } = await getFollowers(project.id);
          const data: any = { users, followers, requests: [] };
          if (isAdmin) {
            const { data: requests } =  await getRequests(project.id);
            data.requests = requests;
          }
          dispatch({ type: ProjectActionType.LOAD_PROJECT_USERS_ACTION, payload: data });
        }
        load();
        return () => {
          dispatch({ type: ProjectActionType.LOAD_PROJECT_USERS_ACTION, payload: null });
        }
      }
    },
    [project]
  )

  const pages = useMemo(
    () => {
      const list = project?.pages?.map(p => ({ 
        id: p.id,
        name: p.name,
        parentId: p.parentId,
        important: p.important,
        draft: !!p.draft,
        children: [] as any[],
        content: p.content,
      }));
      if (list) {
        list.forEach(page => {
          if (page.parentId) {
            const parent = list.find(p => p.id === page.parentId);
            parent?.children.push(page);
          }
        });
        return list.filter(p => !p.parentId);
      }
    },
    [project?.pages]
  )

  const setUsers = useCallback(
    (data: any) => {
      dispatch({ type: ProjectActionType.LOAD_PROJECT_USERS_ACTION, payload: data });
    },
    []
  );

  const follow = useCallback(
    async () => {
      await toggleProjectFollowing(project!.id, true);
      dispatch({ 
        type: ProjectActionType.LOAD_PROJECT_ACTION, 
        payload: { ...project, following: true }
      });
      setUsers({ ...users, followers: [user!, ...users.followers]})
    },
    [project, users, user]
  );

  const unFollow = useCallback(
    async () => {
      await toggleProjectFollowing(project!.id, false);
      dispatch({ 
        type: ProjectActionType.LOAD_PROJECT_ACTION, 
        payload: { ...project, following: false }
      });
      setUsers({ ...users, followers: users.followers.filter((u: any) => user!.id !== u.id)})
    },
    [project, users, user]
  );

  const request = useCallback(
    async () => {
      await toggleProjectRequest(project!.id, true);
      dispatch({ 
        type: ProjectActionType.LOAD_PROJECT_ACTION, 
        payload: { ...project, requested: true }
      });
    },
    [project]
  );

  const cancelRequest = useCallback(
    async () => {
      await toggleProjectRequest(project!.id, false);
      dispatch({ 
        type: ProjectActionType.LOAD_PROJECT_ACTION, 
        payload: { ...project, requested: false }
      });
    },
    [project]
  );

  const leave = useCallback(
    async () => {
      await leaveProject(project!.id);
      dispatch({ 
        type: ProjectActionType.LOAD_PROJECT_ACTION, 
        payload: { ...project, participate: false }
      });
      setUsers({ ...users, users: users.users.filter((u: any) => user!.id !== u.id)})
    },
    [project, users, user],
  );
    

  return (
    <div className={s.wrapper}>
      {project ? (
        <div className={cx('content', s.inner)}>
          <Helmet>
            <title>Projects & protocols repository: {project.name}</title>
          </Helmet>
          <div className={s.left}>
            <StructureTree
              project={project}
              pages={pages}
              canEdit={user !== null && (user.id === project.user.id || (projectUsers && projectUsers.users.findIndex((u: any) => u.id === user.id) !== -1))}
              onAdd={async (id?: number) => {
                const { data: page } = await createPage(project.id, id);
                await dispatch({ 
                  type: ProjectActionType.LOAD_PROJECT_ACTION, 
                  payload: { ...project, pages: [...(project.pages || []), page] } 
                });
                history.push(`/project/${project.id}/${page.id}/edit`);
              }}
            />
          </div>
          <div className={s.center}>
            <Switch>
              <Route path={match.url} exact component={ProjectMain} />
              <Route path={`${match.url}/edit`} exact component={EditProject} />
              <Route path={`${match.url}/:pageId`}  component={PageDetail} />
            </Switch>
          </div>
          <div className={s.right}>
            {user && !isAdmin && (
              <div className={s.actions}>
                {project.following ? (
                  <button
                    className={cx('button', 'button-primary')}
                    onClick={unFollow}
                  >
                    Отписаться
                  </button>
                ) : (
                  <button
                    className={cx('button', 'button-primary')}
                    onClick={follow}
                  >
                    Подписаться
                  </button>
                )}
                {project.participate ? (
                  <button
                    className={cx('button', 'button-primary')}
                    onClick={leave}
                  >
                    Покинуть
                  </button>
                ) : (project.requested ? (
                    <button
                      className={cx('button', 'button-primary')}
                      onClick={cancelRequest}
                    >
                      Отменить
                    </button>
                ) : (
                  <button
                    className={cx('button', 'button-primary')}
                    onClick={request}
                  >
                    Участвовать
                  </button>
                ))}
              </div>
            )}
            {users && (
              <div className={s.users}>
                <div className={s.usersTitle}>
                  <span
                    className={cx({ [s.selectedUsers]: usersIndex === 0 })}
                    onClick={() => setUsersIndex(0)}
                  >Подписчики</span>
                  <i>/</i>
                  <span
                    className={cx({ [s.selectedUsers]: usersIndex === 1 })}
                    onClick={() => setUsersIndex(1)}
                  >Пользователи</span>
                </div>
                {usersIndex === 0 && (
                  <div>
                    {users.followers.length > 0 ? (
                        <div>
                          {users.followers.slice(0, 8).map((u: any) => (
                            <UserWidget key={u.id} user={u} />
                          ))}
                        </div>
                      ) : (
                        <div>Нет подписчиков</div>
                      )}
                  </div>
                )}
                {usersIndex === 1 && (
                  <div>
                    {users.users.length > 0 ? (
                        <div>
                          {users.users.slice(0, 8).map((u: any) => (
                            <UserWidget key={u.id} user={u} />
                          ))}
                        </div>
                      ) : (
                        <div>Нет пользователей</div>
                      )}
                  </div>
                )}
              </div>
            )}
            <div className={s.adminActions}>
              <button
                className={cx('button', 'button-primary')}
                onClick={() => setUsersShowed(true)}
              >
                {isAdmin ? 'Управлять' : 'Посмотреть'}
              </button>
            </div>
          </div>
          <div 
            onClick={() => window.scrollTo(0, 0)} 
            className={cx(s.arrow, { [s.arrowVisible]: displayArrow })}
          >
            <ArrowUpwardIcon />
            <div>Наверх</div>
          </div>
        </div>
      ) : <div className="spinner overlay-spinner" />}


      {usersShowed && (
        <Popup width={500} onClose={() => setUsersShowed(false)}>
          <div className={s.popUpUserList}>
            <div className={s.usersTitle}>
              <span
                className={cx({ [s.selectedUsers]: popupUsersIndex === 0 })}
                onClick={() => setPopUsersIndex(0)}
              >Подписчики</span>
              <i>/</i>
              <span
                className={cx({ [s.selectedUsers]: popupUsersIndex === 1 })}
                onClick={() => setPopUsersIndex(1)}
              >Пользователи</span>
              {isAdmin && (
                <>
                  <i>/</i>
                  <span
                    className={cx({ [s.selectedUsers]: popupUsersIndex === 2 })}
                    onClick={() => setPopUsersIndex(2)}
                  >Заявки</span>
                </>
              )}
            </div>
            {popupUsersIndex === 0 && (
              <div>
                {users.followers.length > 0 ? (
                    <div>
                      {users.followers.map((u: any) => (
                        <div key={u.id} className={s.popupUser}>
                          {isAdmin && (
                            <div className={s.popupAdminActions}>
                              <Decline
                                onClick={async () => {
                                  try {
                                    await unFollowUser(project!.id, u.id);
                                  } catch(e) {
                                  }
                                  setUsers({ ...users, followers: users.followers.filter((u: any) => user !== u)})
                                  
                                }}
                              />
                            </div>
                          )}
                          <UserWidget user={u} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>Нет подписчиков</div>
                  )}
              </div>
            )}
            {popupUsersIndex === 1 && (
              <div>
                {users.users.length > 0 ? (
                    <div>
                      {users.users.map((u: any) => (
                        <div key={u.id} className={s.popupUser}>
                          {isAdmin && (
                            <div className={s.popupAdminActions}>
                              <Decline
                                onClick={async () => {
                                  try {
                                    await removeUser(project!.id, u.id);
                                  } catch(e) {
                                  }
                                  setUsers({ ...users, followers: users.followers.filter((u: any) => user !== u)})
                                  
                                }}
                              />
                            </div>
                          )}
                          <UserWidget user={u} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>Нет пользователей</div>
                  )}
              </div>
            )}
            {popupUsersIndex === 2 && (
              <div>
                {users.requests.length > 0 ? (
                    <div>
                      {users.requests.map((u: any) => (
                        <div key={u.id} className={s.popupUser}>
                          <div className={s.popupAdminActions}>
                            <Accept
                              onClick={async () => {
                                try {
                                  await acceptRequest(project!.id, u.id);
                                  setUsers({ ...users, users: [user, ...users.users], requests: users.requests.filter((u: any) => user != u)})
                                } catch(e) {
                                }
                              }}
                            />
                            <Decline
                              onClick={async () => {
                                try {
                                  await declineRequest(project!.id, u.id);
                                  setUsers({ ...users, requests: users.requests.filter((u: any) => user !== u)})
                                } catch(e) {
                                }
                              }}
                            />
                          </div>
                          <UserWidget user={u} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>Нет пользователей</div>
                  )}
              </div>
            )}
          </div>
          
        </Popup>
      )}
    </div>
  );
}