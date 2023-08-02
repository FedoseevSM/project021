import React from 'react';
import cx from 'classnames';
import { Link } from 'react-router-dom';
import { IUser } from 'models/user';
import { staticBase } from 'helpers/constants';

import s from './UserWidget.module.scss';

interface IProps {
  user: IUser;
  className?: string;
}

export default function UserWidget({ user, className }: IProps) {
  return (
    <div className={cx(s.user, { [className!]: !!className })}>
      <Link className={s.cover} to={`/users/${user.id}`} style={user.cover ? { backgroundImage: `url(${user.cover.startsWith('images/') ? `${staticBase}/${user.cover}` : user.cover})` } : undefined } />
      <Link className={s.name} to={`/users/${user.id}`}>{user.name}</Link>
    </div>
  );
}