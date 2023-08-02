import React, { useState, useEffect } from 'react';
import { useParams , useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppState, ProjectActionType } from 'store';
import { getProjects, likeProject } from 'api/project';
import { UserActionType } from 'store';
import useUser from 'hooks/useUser';
import { refreshToken, setJwtToken } from 'api/request';
import { logout } from 'api/user';
import Cookies from 'js-cookie';
import { Helmet } from 'react-helmet';
import cx from 'classnames';
import { IProject } from 'models/project';
import Comments from 'components/comment/Comments/Comments';

import { getUserInfo, getUser, getUserProjects, getUserComments } from 'api/user';
import { IUser } from 'models/user';
import { staticBase } from 'helpers/constants';
import ProjectsList from 'components/project/ProjectsList/ProjectsList';

import s from './UserPage.module.scss';


interface IProps {
  user?: IUser;
  onEdit?(): any;
}

export default function UserPage({ user: currentUser, onEdit }: IProps) {
  const [data, setData] = useState<any>(null);
  const history = useHistory();
  const params = useParams<{ id: string }>();
  const id = +(currentUser ? currentUser.id : params.id);
  const [moreLoading, setMoreLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const { user } = useUser();
  const [page, setPage] = useState(0);
  const { projects } = useSelector((s: AppState) => s.project);

  useEffect(
    () => {
      const onLoad = async () => {
        setIsLoading(true);
        setData(null);
        if (id) {
          try {
            const { data: user } = await getUser(+id);
            const { data: info } = await getUserInfo(+id);
            const { data: projects } = await getUserProjects(+id);
            const { data: comments } = await getUserComments(+id);
            dispatch({ type: ProjectActionType.LOAD_PROJECTS_ACTION, payload: [...projects] });
            setData({...user, ...info});
          } catch (err) {
            console.error(err);
            history.replace('/');
          }
        }
        setIsLoading(false);
      }
      onLoad();
      return () => {
        dispatch({ type: ProjectActionType.LOAD_PROJECTS_ACTION, payload: [] });
      }
    },
    [id] // eslint-disable-line
  );
  const onLogout = async () => {
    try {
      await logout();
    } catch (err) {}
    Cookies.remove('refreshToken');
    // document.cookie = '';
    setJwtToken('');
    dispatch({ type: UserActionType.LOGOUT_ACTION, payload: true });
    refreshToken();
  };
  
  if (!data || isLoading) {
    return <div className="spinner overlay-spinner" />;
  }

  
  return (
    <div className={cx('content', s.wrapper)}>
      <Helmet>
        <title>Projects & protocols repository: {data.name}</title>
      </Helmet>
      <div className={s.left}>
        {data.cover && (
          <div
            className={s.cover} 
            style={{ backgroundImage: `url(${data.cover.startsWith('images/') ? `${staticBase}/${data.cover}` : data.cover})` }}
            />
        )}

        <div className={s.name}>
          {data.name}
        </div>
        {(data.city || data.education) && (
          <div className={s.info}>
            {data.city && <div>{data.city}</div>}
            {data.education && <div>{data.education}</div>}
          </div>
        )}

        {user && user.id === data.id && (
          <div className={s.actions}>
            <button onClick={onEdit} className={cx('button', 'button-primary')}>Редактировать</button>
            <button onClick={onLogout} className={cx('button', 'button-primary')}>Выйти</button>
          </div>
        )}
        
        {data.tags && data.tags.length > 0 && (
          <div className={s.row}>
            <div className={s.label}>Научные интересы:</div>
            <div className={s.values}>
              {data.tags.map((t: string) => (<div className={s.value} key={t}>{t}</div>))}
            </div>
          </div>
        )}

        {data.skills && data.skills.length > 0 && (
          <div className={s.row}>
            <div className={s.label}>Навыки:</div>
            <div className={s.values}>
              {data.skills.map((t: string) => (<div className={s.value} key={t}>{t}</div>))}
            </div>
          </div>
        )}

        {data.links && data.links.length > 0 && (
          <div className={s.row}>
            <div className={s.label}>Ссылки:</div>
            <div className={s.values}>
              {data.links.map((t: string) => (
                <div  className={s.link} key={t}>
                  <a href={t} target="_blank" rel="noopener noreferrer">{t}</a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className={cx('content', s.center)}>
        {projects && projects.length > 0 && (
          <div className={s.projects}>
            <ProjectsList
              projects={projects}
              className={s.projects}
              hasMore={projects.length >= (page + 1) * 8}
              disabled={moreLoading}
              onMoreLoad={async () => {
                try {
                  setMoreLoading(true);
                  const { data } = await getUserProjects(+id, page + 1);
                  setPage(page + 1);
                  dispatch({ type: ProjectActionType.LOAD_PROJECTS_ACTION, payload: [...projects, ...data] });
                } catch(err) {
                  // dispatch({ type: ProjectActionType.LOAD_PROJECTS_ACTION, payload: [] });
                }
                setMoreLoading(false);
              }}
              onLike={async (project: IProject) => {
                if (!user) {
                  dispatch({ type: UserActionType.LOGIN_VISIBILITY_ACTION, payload: true });
                  return;
                }
                try {
                  const { data: { count, liked } } = await likeProject(project.id);
                  const index = projects.indexOf(project);
                  projects[index] = { ...project, likesCount: count, liked };
                  dispatch({ type: ProjectActionType.LOAD_PROJECTS_ACTION, payload: [...projects] });
                  
                } catch(err) {

                }
              }}
            />
          </div>
        )}
        <div className={s.comments}>
          <Comments userId={id} />
        </div>
      </div>
      <div className={s.right}></div>
    </div>
  )
}