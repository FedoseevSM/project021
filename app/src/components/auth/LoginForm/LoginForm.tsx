import React, { useState } from 'react';
import validator from 'validator';
import cx from 'classnames';
import { useDispatch } from 'react-redux';
import { setJwtToken } from 'api/request';
import { authenticate, resendConfirmEmail } from 'api/user';
import { UserActionType } from 'store';
import { IUser } from 'models/user';
import Popup from 'components/common/Popup/Popup';
import FormRow from 'components/form/FormRow/FormRow';
import SocialAuth from 'components/auth/SocialAuth/SocialAuth';
import TextField from 'components/form/TextField/TextField';

import s from './LoginForm.module.scss';

interface IProps {
  onSave(user: IUser): any;
  onClose(): any;
}

export default function LoginForm({ onSave, onClose }: IProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const [resend, setResend] = useState(false);

  return (
    <Popup onClose={onClose} title="Вход">
      <div 
        className={s.form}
      >
        {resend ? (
          <div className={s.success}>
            <div className={s.message}>Email не подтвержден. Пожалуйста проверьте почтовый ящик.</div>
            <div className={s.buttons}>
              <button
                className={cx('button', 'button-secondary')}
                onClick={onClose}
              >Закрыть</button>
              <button
                className={cx('button', 'button-primary')}
                onClick={async () => {
                  if (isLoading) {
                    return;
                  }
                  setIsLoading(true);
                  await resendConfirmEmail(email, password);
                  setIsLoading(false);
                }}
              >
                Отправить еще раз
              </button>
            </div>
          </div>
        ) : (
          <div>
            <FormRow>
              <TextField
                fullWidth
                name="email"
                type="email"
                value={email}
                invalid={!!errors.email}
                invalidText={errors.email}
                label="Email"
                onChange={e => {
                  setEmail(e.target.value.trim());
                }}
              />
            </FormRow>
            <FormRow>
              <TextField
                fullWidth
                name="password"
                type="password"
                value={password}
                invalid={!!errors.password}
                invalidText={errors.password}
                label="Пароль"
                onChange={e => {
                  setPassword(e.target.value.trim());
                }}
              />
            </FormRow>
            {error && <div className={s.error}>{error}</div>}
            <div className={s.bottom}>

              <SocialAuth />
              <div className={s.links}>
                <div className={s.link}>
                  <span 
                    onClick={() => {
                      dispatch({ type: UserActionType.LOGIN_VISIBILITY_ACTION, payload: false });
                      dispatch({ type: UserActionType.REGISTER_VISIBILITY_ACTION, payload: true });
                    }}>Создать аккаунт</span>
                  
                </div>
                <div className={s.link}>
                  <span 
                    onClick={() => {
                      dispatch({ type: UserActionType.LOGIN_VISIBILITY_ACTION, payload: false });
                      dispatch({ type: UserActionType.FORGET_PASSWORD_VISIBILITY_ACTION, payload: true });
                    }}>Забыли пароль?</span>
                </div>
              </div>
            </div>
            <div className={s.buttons}>
              <button
                className={cx('button', 'button-secondary')}
                onClick={onClose}
              >Закрыть</button>
              <button
                className={cx('button', 'button-primary')}
                onClick={
                  async () => {
                    setError('');
                    const errors: { [key: string]: string } = {};
                    if (!validator.isEmail(email)) {
                      errors.email = 'Некорректный email';
                    }
                    if (password.trim().length === 0) {
                      errors.password = 'Неверный пароль';
                    }
                    setErrors(errors);
                    if (Object.keys(errors).length === 0) {
                      setIsLoading(true);
                      try {
                        const res = await authenticate(email, password);
                        setJwtToken(res.data.jwtToken);
                        onSave(res.data);
                      } catch (err) {
                        if (err.response.data.message === 'Email не подтвержден') {
                          setResend(true);
                        } else {
                          setError(err.response.data.message);
                        }  
                      }
                      setIsLoading(false);
                    }
                  }
                }
              >Отправить</button>
            </div>
          </div>
        )}
        
      </div>
    </Popup>
  );
}