import React from 'react';
import cx from 'classnames';
import { Link } from 'react-router-dom';
import { ReactComponent as Dialog } from 'icons/dialog.svg';
import { ReactComponent as Paper } from 'icons/paper.svg';
import { ReactComponent as Info } from 'icons/info.svg';
import Tooltip from '@material-ui/core/Tooltip';
import s from './Footer.module.scss';

export default function FooterCmp() {
  return (
    <div className={s.wrapper}>
      <div className={cx('content', s.inner)}>
        <div className={s.copy}>Project021.org (c) 2020</div>
        <div className={s.links}>
          <a href="https://project021.org" target="_blank">
            <Tooltip classes={{ tooltip: 'tooltip' }} title="О нас" placement="top">
              <Info />
            </Tooltip>
          </a>
          <Link to="/agreement">
            <Tooltip classes={{ tooltip: 'tooltip' }} title="Правила" placement="top">
              <Paper />
            </Tooltip>
          </Link>
          <a href="https://t.me/Community021" target="_blank">
            <Tooltip classes={{ tooltip: 'tooltip' }} title="Написать нам" placement="top">
              <Dialog />
            </Tooltip>
          </a>
        </div>
      </div>
      
    </div>
  );
}