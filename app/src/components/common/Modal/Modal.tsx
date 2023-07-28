import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import cx from 'classnames';

import s from './Modal.module.scss';

interface IProps {
  children: any;
  onClose?(): any;
  width?: any;
  className?: string;
  wrapperClassName?: string;
}

const root = document.getElementById('modal')!;

export default function Modal({ children, onClose, className, wrapperClassName, width = 600 }: IProps) {
  useEffect(
    () => {
      document.body.classList.add('disabled');
      return () => {
        document.body.classList.remove('disabled');
      }
    }
  );
  return createPortal(
    <div className={cx(s.container, { [wrapperClassName!]: !!wrapperClassName })}>
      <div className={s.overlay} onClick={onClose} />
      <div className={cx(s.window, { [className!]: !!className })} style={{ maxWidth: width }}>
        {children}
      </div>
    </div>,
    root,
  );
}