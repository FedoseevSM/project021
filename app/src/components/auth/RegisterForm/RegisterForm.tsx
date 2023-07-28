import React, { useState } from 'react';
import validator from 'validator';
import { register, resendConfirmEmail } from 'api/user';
import { useDispatch } from 'react-redux';
import { setJwtToken } from 'api/request';
import cx from 'classnames';
import { UserActionType } from 'store';
import FormRow from 'components/form/FormRow/FormRow'
import SocialAuth from 'components/auth/SocialAuth/SocialAuth';
import Popup from 'components/common/Popup/Popup';
import TextField from 'components/form/TextField/TextField';

import s from './RegisterForm.module.scss';

interface IProps {
  onClose(): any;
}

export default function RegisterForm({ onClose }: IProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successEmail, setSuccessEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string>('');
  const dispatch = useDispatch();


  return (
    <Popup onClose={onClose} title="Создать аккаунт">
      <div
        className={s.form}
      >
        {successEmail ? (
          <div className={s.success}>
            <div className={s.message}>Письмо с подтверждение отправлено на указанный почтовый ящик.</div>
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
            <FormRow maxLength={20} length={firstName.trim().length}>
              <TextField
                fullWidth
                name="first_name"
                value={firstName}
                invalid={!!errors.first_name}
                invalidText={errors.first_name}
                label="Имя"
                onChange={e => {
                  setFirstName(e.target.value.trim());
                }}
              />
            </FormRow>
            <FormRow maxLength={20} length={lastName.trim().length}>
              <TextField
                fullWidth
                name="last_name"
                value={lastName}
                invalid={!!errors.last_name}
                invalidText={errors.last_name}
                label="Фамилия"
                onChange={e => {
                  setLastName(e.target.value.trim());
                }}
              />
            </FormRow>
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
            <FormRow maxLength={20} length={password.trim().length}>
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
              <div className={s.passwordHelp}>
                Без пробелов, 8-20 символов
              </div>
            </FormRow>
            {error && <div className={s.error}>{error}</div>}
            <div className={s.bottom}>

              <SocialAuth />
              <div className={s.links}>
                <div className={s.link}>
                  <span
                    onClick={() => {
                      dispatch({ type: UserActionType.LOGIN_VISIBILITY_ACTION, payload: true });
                      dispatch({ type: UserActionType.REGISTER_VISIBILITY_ACTION, payload: false });
                    }}>Уже есть аккаунт?</span>

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
                      errors.email = 'Некорректный Email';
                    }
                    if (firstName.trim().length < 3) {
                      errors.first_name = 'Слишком короткое значение';
                    }
                    if (lastName.trim().length < 3) {
                      errors.last_name = 'Слишком короткое значение';
                    }
                    // const passReg = new RegExp("^((?!.*[\s]).{8,20})$");
                    if (password.trim().length < 8 || password.trim().length > 20) {
                      errors.password = 'Некорректный пароль';
                    }

                    setErrors(errors);
                    if (Object.keys(errors).length === 0) {
                      setIsLoading(true);
                      try {
                        const res = await register(firstName, lastName, email, password);
                        console.log(res.status);
                        if (res.status === 202) {
                          setJwtToken(res.headers["x-auth-token"]);
                          console.log("response: ", res);
                          console.log("token: ", res.headers["x-auth-token"]);
                          setSuccessEmail(email);
                        }
                      } catch (err) {
                        console.log(err)
                      //   if (err.response.status === 409) {
                      //     setErrors(err.response.data as any);
                      //   } else {
                          
                      //     setError('Ошибка на сервере. Пожалуйста повторите позже')
                      //   }

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