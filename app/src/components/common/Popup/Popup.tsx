import React from 'react';
import cx from 'classnames';
import { ReactComponent as Close } from 'icons/close.svg';

import s from './Popup.module.scss';


interface IProps {
  children?: any;
  onClose?(): any;
  title?: string;
  width?: any;
  className?: string;
}

export default function Popup({ title, children, onClose, width, className }: IProps) {
  return (
    <>
      <div className={s.overlay} />
      <div className={cx(s.wrapper, { [className!]: !!className })} style={{ maxWidth: width }}>
        {title && <div className={s.title}>{title}</div>}
        <div className={s.content}>{children}</div>
        {onClose && <Close onClick={onClose} className={s.close} />}
      </div>
    </>
  )
};

