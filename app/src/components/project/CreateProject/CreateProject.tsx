import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux';
import { UserActionType } from 'store';
import ProjectForm from 'components/project/ProjectForm/ProjectForm';
import cx from 'classnames';

import useUser from 'hooks/useUser';

import s from './CreateProject.module.scss';

export default function CreateProject() {
  const { user } = useUser();
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(
    () => {
      if (!user) {
        dispatch({ type: UserActionType.LOGIN_VISIBILITY_ACTION, payload: true });
        history.replace('/');
        
      }
    },
    [user], // eslint-disable-line
  );
  return (
    <div className={cx('content', s.wrapper)}>
      <div className={s.title}>Создать проект</div>
      <ProjectForm
        className={s.form} 
        onSave={project => {
          history.push(`/project/${project.id}`);
        }} 
      />
    </div>
  );
}