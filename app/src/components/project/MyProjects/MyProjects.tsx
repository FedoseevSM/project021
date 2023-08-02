import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import cx from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { AppState, ProjectActionType } from 'store';
import ProjectsList from 'components/project/ProjectsList/ProjectsList';
import Page from 'components/common/Page/Page';
import { getMyProjects, likeProject } from 'api/project';
import useUser from 'hooks/useUser';
import { Helmet } from 'react-helmet';
import { UserActionType } from 'store';
import { IProject } from 'models/project';

import s from './MyProjects.module.scss';

export default function MyProjects() {
  const [projectLoaded, setProjectLoaded] = useState(false);
  const dispatch = useDispatch();
  const { user } = useUser();
  const { projects } = useSelector((s: AppState) => s.project);
  const history = useHistory();
  const [page, setPage] = useState(0);

  const [index, setIndex] = useState(0);
  const [typeIndex, setTypeIndex] = useState(-1);
  const [moreLoading, setMoreLoading] = useState(false);

  

  // useEffect(
  //   () => {
  //     setTypeIndex(-1);
  //   },
  //   [index],
  // );

  useEffect(
    () => {
      setPage(0);
    },
    [typeIndex],
  );

  useEffect(
    () => {
      if (!user) {
        history.replace('/');
        return;
      }
      let request: any = null;
      const onLoad = async () => {
        setProjectLoaded(false);
        try {
          request = getMyProjects(typeIndex, index, page);
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
    [user, index, typeIndex, page] // eslint-disable-line
  );


  return (
    <div className={cx(s.wrapper, 'content')}>
      <Helmet>
        <title>Projects & protocols repository: Мои проекты</title>
      </Helmet>
      <div className={s.navigation}>
        <span
          className={cx({ [s.active]: index === 0 })}
          onClick={() => setIndex(0)}
        >Мои</span>
        <i>/</i>
        <span 
          className={cx({ [s.active]: index === 1 })}
          onClick={() => setIndex(1)}
        >Участвую</span>
        <i>/</i>
        <span
          className={cx({ [s.active]: index === 2 })}
          onClick={() => setIndex(2)}
        >Слежу</span>
      </div>
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
        <div className={s.content}>
          <ProjectsList 
            projects={projects} 
            hasMore={projects.length >= (page + 1) * 8} 
            disabled={moreLoading}
            onMoreLoad={async () => {
              try {
                setMoreLoading(true);
                const { data } = await getMyProjects(typeIndex, index, page + 1);
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
        </div>
      ) : (
        <div className="spinner overlay-spinner" />
      )}
    </div>
  )
}
