import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom'
import { validateResetToken, resetPassword } from 'api/user';
import { UserActionType } from 'store';
import cx from 'classnames';
import { IUser } from 'models/user';
import useUser from 'hooks/useUser';
import FormRow from 'components/form/FormRow/FormRow';
import TextField from 'components/form/TextField/TextField';

import s from './ResetPassword.module.scss';

interface IProps {
  onSave(user: IUser): any;
  onClose(): any;
}

export default function ResetPassword({ onSave, onClose }: IProps) {
  const [repeatPassword, setRepeatPassword] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const [sent, setSent] = useState(false);
  const { user } = useUser();
  const history = useHistory();
  const location = useLocation();
  useEffect(
    () => {
      const onLoad = async () => {
        if (user) {
          history.replace('/');
          return;
        }
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        if (!token) {
          history.replace('/');
          return;
        }
        try {
          await validateResetToken(token);
        } catch(err) {
          history.replace('/');
          return;
        }
        setToken(token);
      }

      onLoad();
      
    },
    [user], // eslint-disable-line
  );
  return (
    <div 
      className={s.wrapper}
    >
      {sent ? (
        <div className={s.success}>
          <div>Пароль успешно изменен.</div>
        </div>
      ) : (
        <div className={s.content}>
          <div className={s.title}>Изменение пароля</div>
          <div className={s.form}>
            <FormRow maxLength={20} length={password.trim().length}>
              <TextField
                type="password"
                name="password"
                label="Пароль"
                size="bg"
                fullWidth
                value={password}
                invalid={!!errors.password}
                invalidText={errors.password}
                onChange={e => {
                  setPassword(e.target.value.trim());
                }}
              />
              <div className={s.passwordHelp}>
                Без пробелов, 8-20 символов
              </div>
            </FormRow>
            <FormRow maxLength={20} length={repeatPassword.trim().length}>
              <TextField
                fullWidth
                size="bg"
                type="password"
                label="Повторите пароль"
                name="repeat-password"
                value={repeatPassword}
                invalid={!!errors.repeatPassword}
                invalidText={errors.repeatPassword}
                onChange={e => {
                  setRepeatPassword(e.target.value.trim());
                }}
              />
            </FormRow>
            {error && <div className={s.error}>{error}</div>}

            <div className={s.actions}>
              <button 
                className={cx('button', 'button-primary')} 
                onClick={
                  async () => {
                    setError('');
                    const errors: { [key: string]: string } = {};
                    if (password.trim().length < 8 || password.trim().length > 20) {
                      errors.password = 'Некорректный пароль';
                    }
                    if (password.trim() !== repeatPassword.trim()) {
                      errors.repeatPassword = 'Пароли не совпадают';
                    }
                    setErrors(errors);
                    if (Object.keys(errors).length === 0) {
                      setIsLoading(true);
                      try {
                        const { status } = await resetPassword(password, token);
                        if (status === 200) {
                          setSent(true)
                        } 
                      } catch (err) {
                        setError('Ошибка на сервере, пожалуйста повторите позже')  
                      }
                      setIsLoading(false);
                    }
                  }
                }
              >Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}