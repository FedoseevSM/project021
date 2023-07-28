import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import useUser from 'hooks/useUser';
import AccountForm from 'components/account/AccountForm/AccountForm';


import s from './AccountEdit.module.scss';


export default function Account() {
  const { user } = useUser();
  const history = useHistory();

  useEffect(
    () => {
      if (!user) {
        history.replace('/');
        return;
      }
    },
    [user], // eslint-disable-line
  );

  if (!user) {
    return null;
  }
  return (
    <AccountForm onBack={() => history.push('/account')} />
  );
  
  
}