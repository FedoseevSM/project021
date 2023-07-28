import React from 'react';
import cx from 'classnames';
import s from './AddInput.module.scss';

interface IProps {
  value: string;
  onChange?(e: any): any;
  onAdd?(): any;
  id: string;
  invalid?: boolean;
  invalidText?: string;
  className?: string;
  description?: string;
  fullWidth?: boolean;
}

export default function AddInput({ value, id, description, invalidText, onChange, onAdd, invalid, className, fullWidth }: IProps) {
  return (
    <div className={cx(s.wrapper, { [className!]: !!className, [s.hideInvalidText]: !invalidText, [s.fullWidth]: fullWidth })}>
      {/* <TextInput
        className={s.input}
        id={id}
        labelText=""
        size="sm"
        placeholder={description}
        value={value}
        invalid={invalid}
        invalidText={invalidText}
        onChange={onChange}
      />
      <Button 
        renderIcon={Add16} 
        size="small" 
        iconDescription={description}
        hasIconOnly
        onClick={onAdd}
        disabled={value.trim().length === 0 || invalid}
      /> */}
    </div>
  );
}