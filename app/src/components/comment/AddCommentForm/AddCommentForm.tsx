import React, { useState } from 'react';
import sanitizeHtml from 'sanitize-html';
import cx from 'classnames';
import useUser from 'hooks/useUser';
import { useDispatch } from 'react-redux';
import { UserActionType } from 'store';
import { IComment } from 'models/comment';
import ContentField from 'components/form/ContentField/ContentField';
import Checkbox from '@material-ui/core/Checkbox';

import s from './AddCommentForm.module.scss';
interface IProps {
  onSave(content: string, data: any, anonymous?: boolean): any;
  disabled?: boolean;
  comment?: IComment;
  onCancel?(): any;
  parent?: IComment;
}

export default function AddCommentForm({ onSave, disabled, comment, onCancel, parent }: IProps) {
  const [html, setHtml] = useState(comment?.text || '');
  const [data, setData] = useState(JSON.parse(comment?.data || '{}'));
  const [loading, setLoading] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const { user } = useUser();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const dispatch = useDispatch();
  
  if (!user) {
    return (
      <div className={s.guest}>
        <span
          onClick={() => 
            dispatch({ type: UserActionType.LOGIN_VISIBILITY_ACTION, payload: true })
          }
        >Sign in</span> to comment
      </div>
    );
  }

  return (
    <div className={s.wrapper}>
      {!comment && <div className={s.title}>{parent ? 'Ответить на комментарий' : 'Добавить комментарий'}</div>}
      {loading ? 
        (<div />)
        : (
          <>
            <ContentField
              className={s.field}
              value={data}
              onChange={(data, html) => { 
                setHtml(html); 
                setData(data);
              }}
              placeholder="Start writing here (1000 max)"
            />
            
            {Object.keys(errors).length > 0 && (
              <div className={s.errors}>
                {errors.html && (
                  <div className={s.error}>{errors.html}</div>
                )}
                {errors.image && (
                  <div className={s.error}>{errors.image}</div>
                )}
              </div>
            )}
            <div className={s.bottom}>
              <button
                className={cx('button', 'button-primary')}
                disabled={disabled}
                onClick={async () => {
                  const errors: { [key: string]: string } = {};
                  const text = sanitizeHtml(html, { allowedTags: [] }).trim();
                  if (text.length === 0) {
                    errors.html = 'Нет текста';
                  } else if (text.length > 1000) {
                    errors.html = 'Слишком длинный комментарий';
                  }
                  setErrors(errors);
                  if (Object.keys(errors).length > 0) {
                    return;
                  }
                  setLoading(true);
                  if (await onSave(html, data, anonymous)) {
                    setHtml('');
                    setAnonymous(false);
                    
                  }
                  setLoading(false);
                }}
              >{comment ? 'Обновить' : 'Добавить'}</button>
              {onCancel && (
                <button 
                  className={cx('button', 'button-secondary')}
                  disabled={disabled}
                  onClick={onCancel}
                >Cancel</button>)}
              {!comment && (
                <div className={s.anonymous}>
                  <Checkbox
                    checked={anonymous}
                    
                    id="anonymous" 
                    onChange={e => {
                      setAnonymous(e.target.checked);
                    }}
                  />
                  <span>Анонимно</span>
                </div>
              )}
            </div>
          </>
        )}
    </div>
  )
}