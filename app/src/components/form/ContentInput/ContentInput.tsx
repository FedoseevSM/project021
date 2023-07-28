import React, { useState } from 'react';
import ContentEditable from 'react-contenteditable';
import cx from 'classnames';

import s from './ContentInput.module.scss';

interface IProps {
  html: string;
  inputRef: any;
  onChange(e: string): any;
  disabled?: boolean;
  placeholder?: string;
}

const initCmds = { i: false, b: false, h1: false, h2: false, h3: false };

export default function ContentInput({ html, onChange, inputRef, disabled, placeholder }: IProps) {
  const [value, setValue] = useState(0);
  const [cmds, setCmds] = useState({ ...initCmds });

  
  return (
    <div className={s.wrapper}>
      <ContentEditable 
        tagName="div"
        html={html}
        onChange={(e: any) => onChange(e.target.value)}
        className={cx(s.content, s.input)}
        innerRef={inputRef}
        disabled={disabled}
        placeholder={placeholder}
      />

      <div className={s.actions}>
        <div
          className={s.italicAction}
          onMouseDown={(e: any) => {
            e.preventDefault();
            document.execCommand('italic', false);
            setValue(value + 1);
          }}
        >i</div>
        <div 
          className={s.boldAction}
          onMouseDown={(e: any) => {
            e.preventDefault();
            document.execCommand('bold', false);
            setValue(value + 1);
          }}
        >b</div>
        <div
          onMouseDown={(e: any) => {
            e.preventDefault();
            if (cmds.h1) {
              document.execCommand('formatBlock', false, 'div');  
              setCmds({...initCmds, h1: false });
            } else {
              setCmds({...initCmds, h1: true });
              document.execCommand('formatBlock', false, 'h1');
            }
            
          }}
          className={s.h1Action}>h1</div>
        <div
          onMouseDown={(e: any) => {
            e.preventDefault();
            if (cmds.h2) {
              setCmds({...initCmds, h2: false });
              document.execCommand('formatBlock', false, 'div');  
            } else {
              setCmds({...initCmds, h2: true });
              document.execCommand('formatBlock', false, 'h2');
            }
          }}
          className={s.h1Action}>h2</div>
        <div
          onMouseDown={(e: any) => {
            e.preventDefault();
            if (cmds.h3) {
              document.execCommand('formatBlock', false, 'div');  
              setCmds({...initCmds, h3: false });
            } else {
              setCmds({...initCmds, h3: true });
              document.execCommand('formatBlock', false, 'h3');
            }
          }}
          className={s.h1Action}>h3</div>
      </div>
    </div>
  )
  
}

interface IRenderProps {
  html: string;
  className?: string;
}

export function ContentRenderer({ html, className }: IRenderProps) {
  return (
    <div 
      className={cx(s.content, { [className!]: !!className })}
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
}