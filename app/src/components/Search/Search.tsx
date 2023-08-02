import React, { useEffect, useState } from 'react';
import throttle from 'lodash/throttle';
import qs from 'query-string';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { AppState, ProjectActionType } from 'store';
import TextField from 'components/form/TextField/TextField';
import ProjectsList from 'components/project/ProjectsList/ProjectsList';
import { searchProjects, likeProject } from 'api/project';
import useUser from 'hooks/useUser';
import { UserActionType } from 'store';
import { IProject } from 'models/project';

import cx from 'classnames';

import s from './Search.module.scss';
import { onLoad } from '@sentry/react';

export default function Search() {
  const location = useLocation();
  const history = useHistory();
  const [search, setSearch] = useState('');
  const [projectLoaded, setProjectLoaded] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const { projects } = useSelector((s: AppState) => s.project);
  const { user } = useUser();
  useEffect(
    () => {
      const params = qs.parse(location.search) as any;
      if (params.q !== search) {
        setSearch((params.q || '').trim());
      }
    },
    [location.search]
  );

  useEffect(
    () => {
      
      if (search) {
        let request: any = null;
        const onLoad = async () => {
          setProjectLoaded(false);
          try {
            request = searchProjects(search);
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
      }
    },
    [search]
  );

  return (<div className={s.wrapper}>
    <div className={s.title}>Поиск</div>
    <form
        className={s.form}
      >
        <TextField
          fullWidth
          className={s.field}
          size="bg"
          name="seacrh"
          value={search}
          label=""
          onChange={e => {
            setSearch(e.target.value.substring(0, 100));
          }}
        /> 
        
    </form>

    {projectLoaded ? (
      <ProjectsList
        className={s.projects}
        projects={projects}
        hasMore={projects.length >= (page + 1) * 8}
        disabled={moreLoading}
        onMoreLoad={async () => {
          try {
            setMoreLoading(true);
            const { data } = await searchProjects(search, page + 1);
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
  </div>)
}