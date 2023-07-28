import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux';
import { UserActionType } from 'store';
import ProjectForm from 'components/project/ProjectForm/ProjectForm';
import useUser from 'hooks/useUser';
import { useSelector } from 'react-redux';
import { AppState, ProjectActionType } from 'store';

import s from './EditProject.module.scss';

export default function EditProject() {
  const { user } = useUser();
  const { project } = useSelector((s: AppState) => s.project);
  const dispatch = useDispatch();
  const history = useHistory();
  
  useEffect(
    () => {
      // if (!user) {
      //   dispatch({ type: UserActionType.LOGIN_VISIBILITY_ACTION, payload: true });
      //   history.replace('/');
      // } else if (project?.user.user_id !== user.user_id) {
      //   history.replace(`/project/${project!.project_id}`);
      // }
    },
    [user], // eslint-disable-line
  );
  return (
    <ProjectForm
      className={s.form} 
      project={project!} 
      onSave={data => {
        // dispatch({ type: ProjectActionType.LOAD_PROJECT_ACTION, payload: { ...data, pages: project?.pages } });
        dispatch({ type: ProjectActionType.LOAD_PROJECT_ACTION, payload: { ...data } });
        history.push(`/project/${project!.project_id}`);
      }}
      onCancel={() => {
        history.push(`/project/${project!.project_id}`);
      }}
    />
    
  );
}