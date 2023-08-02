import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState, ProjectActionType } from 'store';
import ProjectsList from 'components/project/ProjectsList/ProjectsList';
import { getProjects, likeProject } from 'api/project';
import { UserActionType } from 'store';
import { IProject } from 'models/project';
import useUser from 'hooks/useUser';
import cx from 'classnames';
import s from './Home.module.scss';

export default function Home() {
  const [projectLoaded, setProjectLoaded] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  const dispatch = useDispatch();
  const { user } = useUser();
  const [page, setPage] = useState(0);
  const [typeIndex, setTypeIndex] = useState(-1);
  const { projects } = useSelector((s: AppState) => s.project);


  useEffect(
    () => {
      let request: any = null;
      const onLoad = async () => {
        setProjectLoaded(false);
        try {
          request = getProjects(typeIndex);
          const { data } = await request;
          dispatch({ type: ProjectActionType.LOAD_PROJECTS_ACTION, payload: data });
        } catch(err) {
          console.error(err);
          dispatch({ type: ProjectActionType.LOAD_PROJECTS_ACTION, payload: [] });
        }
        request = null;
        setProjectLoaded(true);
      }
      onLoad();
      return () => {
        if (request) {
          request.cancel();
        }
        dispatch({ type: ProjectActionType.LOAD_PROJECTS_ACTION, payload: [] });
      }
    },
    [user, typeIndex], // eslint-disable-line
  );

  // TODO: listen to updates
  // useEffect(
  //   () => {
      
  //     const projectsChangedHandler = async () => {
  //       try {
  //         const { data } = await getProjects();
  //         dispatch({ type: ProjectActionType.LOAD_PROJECTS_ACTION, payload: data });
  //       } catch(err) {
          
  //       }
  //     };
  //     hub.on('ProjectDeleted', projectsChangedHandler);
  //     hub.on('ProjectCreated', projectsChangedHandler);
  //     hub.on('ProjectUpdated', projectsChangedHandler);
  //     addReconnectedHandler(projectsChangedHandler);
  //     return () => {
  //       hub.off('ProjectDeleted', projectsChangedHandler);
  //       hub.off('ProjectCreated', projectsChangedHandler);
  //       hub.off('ProjectUpdated', projectsChangedHandler);
  //       removeReconnectedHandler(projectsChangedHandler);
  //     }
      
  //   },
  //   [],
  // );
  return (
    <div>
      {!user && (
        <div className={s.guest}>
          <div className={cx('content', s.guestInner)}>
            <div className={s.guestImage}>
              <img src={`${process.env.PUBLIC_URL}/home.png`} alt="" />
            </div>
            <div className={s.guestContent}>
              <div className={s.guestName}>Универсальный инструмент для реализации научных идей</div>
              <div className={s.guestDesc}>Всё самое важное в одном месте: проработка идей, поиск единомышленников, реализация исследования, публикация результатов.</div>
            </div>
            <div className={s.guestAction}>
              <button onClick={() => dispatch({ type: UserActionType.LOGIN_VISIBILITY_ACTION, payload: true })}>Присоединиться</button>
            </div>
          </div>
        </div>
      )}
      <div className={cx('content', s.content)}>
        <div className={s.navigation}>
          <span
            className={cx({ [s.active]: typeIndex === -1 })}
            onClick={() => setTypeIndex(-1)}
          >Все</span>
          <i>/</i>
          <span
            className={cx({ [s.active]: typeIndex === 1 })}
            onClick={() => setTypeIndex(1)}
          >Протоколы</span>
          <i>/</i>
          <span
            className={cx({ [s.active]: typeIndex === 0 })}
            onClick={() => setTypeIndex(0)}
          >Проекты</span>
          <i>/</i>
          <span
            className={cx({ [s.active]: typeIndex === 2 })}
            onClick={() => setTypeIndex(2)}
          >Обсуждения</span>
        </div>
        {projectLoaded ? (
          <ProjectsList
            projects={projects}
            hasMore={projects.length >= (page + 1) * 8}
            disabled={moreLoading}
            onMoreLoad={async () => {
              try {
                setMoreLoading(true);
                const { data } = await getProjects(typeIndex, page + 1);
                setPage(page + 1);
                dispatch({ type: ProjectActionType.LOAD_PROJECTS_ACTION, payload: [...projects, ...data] });
              } catch(err) {
                console.error(err);
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
        ) : (
          <div className="spinner overlay-spinner" />
        )}
      </div>
    </div>
  )
}
