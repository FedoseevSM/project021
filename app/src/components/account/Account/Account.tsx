import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Page from 'components/common/Page/Page';
import useUser from 'hooks/useUser';
import UserPage from 'components/common/UserPage/UserPage';


import s from './Account.module.scss';


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
  return <UserPage user={user} onEdit={() => history.push('/account/edit')} />;
}