import React from 'react';
import cx from 'classnames';

import s from './FormRow.module.scss';

interface IProps {
  children: any;
  className?: string;
  maxLength?: number;
  length?: number;
}

export default function FormRow({ children, maxLength, length, className }: IProps) {
  return (
    <div className={cx(s.wrapper, { [className!]: !!className }) }>
      {children}
      {maxLength && (
        <div className={cx(s.length, { [s.error]: length! > maxLength! } )}>
          {length || 0} / {maxLength}
        </div>
      )}
    </div>
  )
}