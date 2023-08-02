import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import cx from 'classnames';
import sortBy from 'lodash/sortBy';
import moment from 'moment-timezone';

import { staticBase } from 'helpers/constants';
import { retrieveProp } from 'helpers/string';
import useUser from 'hooks/useUser';
import { ProjectActionType, UserActionType, AppState } from 'store';
import { ReactComponent as Like } from 'icons/like.svg';
import { 
  likeProject, createPage, toggleProjectFollowing, toggleProjectRequest, leaveProject,
  acceptRequest, declineRequest, removeUser, unFollowUser,
 } from 'api/project';
 import UserWidget from 'components/common/UserWidget/UserWidget';
 import StructureTree from 'components/project/StructureTree/StructureTree';
import Comments from 'components/comment/Comments/Comments';
import Popup from 'components/common/Popup/Popup';
import { ReactComponent as Edit } from 'icons/edit.svg';
import { ReactComponent as Accept } from 'icons/accept.svg';
import { ReactComponent as Decline } from 'icons/decline.svg';

import s from './ProjectMain.module.scss';


export default function ProjectMain() {
  const store = useSelector((s: AppState) => s.project);
  const project = store.project!;
  const projectUsers = store.projectUsers;
  const { user } = useUser();
  const dispatch = useDispatch();
  const history = useHistory();
  const isAdmin = !!(user && (user.id === project!.user.id  || user.isAdmin));
  const [usersShowed, setUsersShowed] = useState(false);

  const [usersIndex, setUsersIndex] = useState(0);
  const [popupUsersIndex, setPopUsersIndex] = useState(0);

  const importantPages = useMemo(
    () => project.pages ? project.pages.filter(p => !p.draft && p.important).map(p => ({ ...p, image: retrieveProp(p.content, 'img', 'src') })) : [],
    [project.pages]
  );

  useEffect(
    () => {
      setPopUsersIndex(0);
    },
    [usersShowed]
  );

  const content = project!.content;

  const projectId = project.id;

  const users = projectUsers;

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
  );

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
      <div className={s.title}>
        <Link to={`/project/${project.id}`}>
          {project.name}{project.draft ? ' (непубличный)' : ''}
        </Link>
      </div>
      <div className={s.type}>
        
      </div>
      {isAdmin && (
        <>
          <Link className={s.edit} to={`/project/${project.id}/edit`}>
            <Edit />
          </Link>
        </>
      )}
      <div className={s.info}>          
        <div className={s.text}>
          <img 
            className={s.cover} 
            alt={project.name} 
            src={`${staticBase}/${project.cover.startsWith('images/') ? project.cover : `images/${project.cover}`}`} 
          />
          <div className={s.menu}>
            <StructureTree
              project={project}
              pages={pages}
              relative
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
            <div className={s.likes}> 
              <div
                className={cx(s.likes, { [s.liked]: project.liked })}
                onClick={async () => {
                  if (!user) {
                    dispatch({ type: UserActionType.LOGIN_VISIBILITY_ACTION, payload: true });
                    return;
                  }
                  try {
                    const { data: { count: likesCount, liked } } = await likeProject(project.id);
                    dispatch({ 
                      type: ProjectActionType.LOAD_PROJECT_ACTION, 
                      payload: { ...project, likesCount, liked } 
                    });
                  } catch(err) {
    
                  }
                }}
              >
                <Like />
                <span>
                  {project.likesCount}
                </span>
              </div>
            </div>
            <div className={s.centerRight}>
              <div className={s.created}>{moment.utc(project.created).local().format('DD.MM.YYYY')}</div>
              {project.user && <div className={s.user}>
                <Link to={`/users/${project.user.id}`} >{project.user.name}</Link>
              </div>}
            </div>
          </div>
          <div className={s.users}>
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
          <div className={cx('text-content', s.text)} dangerouslySetInnerHTML={{ __html: content }} />
          {importantPages.length > 0 && (
            <div className={s.important}>
              <div className={s.importantTitle}>Важные страницы:</div>
              <div className={s.importantList}>
                {sortBy(importantPages, ['id']).map(p => (
                  <div className={s.importantPage} key={p.id}>
                    <Link to={`/project/${project.id}/${p.id}`}>
                      <div className={s.importantPageImage} style={{ backgroundImage: p.image ? `url(${p.image.startsWith('images/') ? `${staticBase}/${p.image}` : p.image})` : undefined }} />
                      {p.name}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Comments count={project.commentsCount} projectId={projectId} />
      {/* {followersShowed && (
        <Modal onClose={() => setFollowersShowed(false)}>
          <div className={s.popup}>
            <div className={s.popupTitle}>Followers:</div>
            <div className={s.popupList}>
              {users!.followers.map((user: any) => (
                <div className={s.popupListRow} key={user.id}>
                  <UserWidget user={user} />
                  {isAdmin && (
                    <div className={s.popupActions}>
                      <span 
                        onClick={async () => {
                          try {
                            await unFollowUser(project.id, user.id);
                          } catch(e) {
                          }
                          setUsers({ ...users, followers: users.followers.filter((u: any) => user != u)})
                          
                        }}
                      >Remove</span>
                    </div>
                  )}
                </div>
              ))}
              {users!.followers.length === 0 && (
                <div className={s.popupListEmpty}>No followers</div>
              )}
            </div>
          </div>
        </Modal>
      )} */}
      
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
                                setUsers({ ...users, followers: users.followers.filter((u: any) => user != u)})
                                
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
                                setUsers({ ...users, users: [user, ...users.users], requests: users.requests.filter((u: any) => user !== u)})
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