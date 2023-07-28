import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux';

import useUser from 'hooks/useUser';
import { UserActionType } from 'store';
import s from './ConfirmSuccess.module.scss';


export default function ConfirmSuccess() {
  const { user } = useUser();
  const dispatch = useDispatch();
  const history = useHistory();
  useEffect(
    () => {
      if (user) {
        history.replace('/');
      }
    },
    [user], // eslint-disable-line
  );
  if (user) {
    return null;
  }
  return (
    <div 
      className={s.wrapper}
    >
      Verification successful, you can now <span onClick={() => dispatch({ type: UserActionType.LOGIN_VISIBILITY_ACTION, payload: true })}>sign in</span>
    </div>
  )
}