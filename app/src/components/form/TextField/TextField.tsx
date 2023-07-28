import React, { ChangeEventHandler } from 'react';
import cx from 'classnames';

import s from './TextField.module.scss';

interface IProps {
  onChange?: ChangeEventHandler<HTMLInputElement>;
  label?: string;
  name?: string;
  className?: string;
  type?: string;
  value?: string;
  invalid?: boolean;
  invalidText?: string;
  fullWidth?: boolean;
  size?: 'bg' | 'sm'
}

export default function TextField({ size, fullWidth, onChange, label, name, className, type, value, invalid, invalidText }: IProps) {
  return (
    <div className={cx(s.wrapper, { [s.fullWidth]: fullWidth, [s.invalid]: invalid })}>
      {label && <div className={s.label}>{label}</div>}
      <input
        className={cx(s.input, { [s.big]: size === 'bg', [className!]: !!className })}
        type={type}
        onChange={onChange}
        value={value}
        id={name}
        name={name}
      />
      {invalid && invalidText && (
        <div className={s.invalidText}>{invalidText}</div>
      )}
    </div>
  )
}