import React, { useState } from 'react';
import validator from 'validator';
import cx from 'classnames';
import { forgotPassword } from 'api/user';
import FormRow from 'components/form/FormRow/FormRow';
import Popup from 'components/common/Popup/Popup';
import TextField from 'components/form/TextField/TextField';

import s from './ForgetPasswordForm.module.scss';

interface IProps {
  onClose(): any;
}

export default function ForgetPasswordForm({onClose }: IProps) {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <Popup onClose={onClose} title="Забыли пароль?">
      <div 
        className={s.form}
      >
        {sent ? (
          <div className={s.success}>
            <div className={s.message}>Инструкции по восстановлению пароля отправлены на указанный почтовый ящик.</div>
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
            {error && <div className={s.error}>{error}</div>}
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
                    setErrors(errors);
                    if (Object.keys(errors).length === 0) {
                      setIsLoading(true);
                      try {
                        await forgotPassword(email);
                        setSent(true);
                      } catch (err) {
                        setError(err.response.data.message);
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