import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import cx from 'classnames';
import Popup from 'components/common/Popup/Popup';

import s from './ConfirmWindow.module.scss';

interface IProps {
  text?: string;
  title?: string;
  ok: any;
  cancel: any;
  okText?: string;
  cancelText?: string;
}

const root = document.getElementById('modal')!;

export default function ConfirmWindow({ text, ok, cancel, okText, cancelText, title }: IProps) {
  useEffect(
    () => {
      document.body.classList.add('disabled');
      return () => {
        document.body.classList.remove('disabled');
      }
    }
  );
  return createPortal(
    <Popup title={title}>
      <div className={s.text}>
        {text}
      </div>
      <div className={s.actions}>
        <button className={cx('button', 'button-primary')} onClick={ok}>{okText || 'Да'}</button>
        <button className={cx('button', 'button-secondary')} onClick={cancel}>{cancelText || 'Отмена'}</button> 
      </div>
    </Popup>,
    root,
  );
}