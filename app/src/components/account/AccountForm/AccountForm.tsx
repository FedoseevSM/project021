import React, { useEffect, useState, useCallback } from 'react';
import cx from 'classnames';
import { useHistory } from 'react-router-dom';
import validator from 'validator';
import { useDispatch, useSelector } from 'react-redux';
import { AppState, UserActionType } from 'store';
import FormRow from 'components/form/FormRow/FormRow';
import { getUserInfo, updateUserInfo } from 'api/user';
import useUser from 'hooks/useUser';
import { User } from 'models/user';
import { staticBase } from 'helpers/constants';
import { isOnlyDigitLetters } from 'helpers/string';
import TextField from 'components/form/TextField/TextField';
import { ReactComponent as Close } from 'icons/close.svg';
import { useDropzone } from 'react-dropzone';

import s from './AccountForm.module.scss';

interface IProps {
  onBack(): any;
}

export default function AccountForm({ onBack }: IProps) {
  const { user } = useUser();
  const { userInfo } = useSelector((s: AppState) => s.user);
  const history = useHistory();
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [login, setLogin] = useState('');
  const [city, setCity] = useState('');
  const [education, setEducation] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [cover, setCover] = useState<any>(null);
  const [newTag, setNewTag] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newLink, setNewLink] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [updated, setUpdated] = useState(false);
  const [coverPath, setCoverPath] = useState('');

  const { acceptedFiles, getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({ accept: 'image/png, image/jpg, image/gif, image/jpeg' })
  
  const reset = useCallback(
    () => {
      
      if (userInfo && user) {
        setLinks(userInfo.links || []);
        setSkills(userInfo.skills || []);
        setTags(userInfo.tags || []);
        setEducation(userInfo.education  || '');
        setCity(userInfo.city || '');
        setName(user.name || '');
        setCoverPath(user.cover ? (user.cover.startsWith('images/') ? `${staticBase}/${user.cover}` : user.cover) : '');
        setLogin(user.login || '');
        setNewTag('');
        setNewSkill('');
        setNewLink('');
      }
    },
    [userInfo, user]
  );
  useEffect(
    () => {
      if (!user) {
        history.replace('/');
        return;
      }
      setIsLoading(true);
      const onLoad = async () => {
        try {
          const { data: payload } = await getUserInfo();
          dispatch({ type: UserActionType.LOAD_USER_INFO_ACTION, payload });
        } catch(err) {
          history.replace('/');
        }
        setIsLoading(false);
      };
      onLoad();
    },
    [user], // eslint-disable-line
  );

  useEffect(
    () => {
      reset();
    },
    [reset]
  );
  useEffect(
    () => {
      if (acceptedFiles.length > 0) {
        setCover(acceptedFiles[0]);
      }
    },
    [acceptedFiles.length]
  );

  useEffect(
    () => {
      if (!cover) {
        return;
      }
      const reader  = new FileReader();
      reader.onload = (e:any) =>  {
        setCoverPath(e.target.result);
      }
      reader.readAsDataURL(cover);
    },
    [cover]
  );
  

  if (!user) {
    return null;
  }

  const save = async () => {
    const errors: { [key: string]: string } = {};
    if (name.trim().length === 0) {
      errors.name = 'Пустое значение';
    } else if (name.trim().length > 120) {
      errors.name = 'Слишком длинное значение';
    } else if (!(/\p{L}/u.test(name.replace(/\s/g,'')))) {
      errors.name = 'Невалидное значение';
    }
    
    if (login.trim().length > 0 && !isOnlyDigitLetters(login.trim(), false)) {
      errors.login = 'Невалидное значение';
    } else if (login.trim().length > 120) {
      errors.login = 'Слишком длинное значение';
    }
    
    if (cover && cover.size / 1000000 > 10) {
      errors.cover = 'Изображение слишком большое (10мб макс.)';
    }
    
    setErrors(errors);
    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      setUpdated(false);
      try {
        
        const { data: { account, info } } = await updateUserInfo({ name, login, city, education, tags, skills, links, cover: coverPath, coverFile: cover });
        dispatch({ 
          type: UserActionType.LOAD_USER_ACTION, 
          payload: User.FromResponse(account),
        });
        dispatch({ 
          type: UserActionType.LOAD_USER_INFO_ACTION, 
          payload: info, 
      });
      onBack();
      setUpdated(true);
      } catch (err) {
        console.error(err);
        setErrors(JSON.parse(err.data.message));
      }
      setIsLoading(false);
    }
  }
  

  return (
    <div className={s.wrapper}>
      <div className={s.title}>Настройки профиля</div>
      <div className={s.form}>
        <FormRow maxLength={120} length={name.trim().length}>
          <TextField
            fullWidth
            size="bg"
            name="name"
            value={name}
            label="Имя"
            invalid={!!errors.name}
            invalidText={errors.name}
            onChange={e => {
              setName(e.target.value);
            }}
          />  
        </FormRow>
        <FormRow maxLength={120} length={login.trim().length}>
          <TextField
            fullWidth
            label="Логин"
            name="login"
            size="bg"
            value={login}
            invalid={!!errors.login}
            invalidText={errors.login}
            onChange={e => {
              setLogin(e.target.value);
            }}
          />  
        </FormRow>
        <FormRow maxLength={120} length={city.trim().length}>
          <TextField
            fullWidth
            label="Город"
            size="bg"
            name="city"
            value={city}
            invalid={!!errors.city}
            invalidText={errors.city}
            onChange={e => {
              setCity(e.target.value);
            }}
          />  
        </FormRow>
        <FormRow maxLength={120} length={city.trim().length}>
          <TextField
            fullWidth
            label="Образование"
            size="bg"
            name="education"
            value={education}
            invalid={!!errors.education}
            invalidText={errors.education}
            onChange={e => {
              setEducation(e.target.value);
            }}
          /> 
        </FormRow>
        <FormRow maxLength={20} length={tags.length}>
          <div className={s.listTitle}>
            Интересы:
          </div>
          <div className={s.list}>
            {tags.map((tag, i) => (
              <div 
                key={i}
                className={s.listItem}
              >
                <span>{tag}</span>
                <Close onClick={() => setTags(tags.filter(t => t !== tag))} />
              </div>
            ))}
          </div>
          {tags.length < 20 && (
            <div className={s.listForm}>
              <TextField
                size="bg"
                value={newTag}
                name="newTag"
                invalid={newTag.trim().length > 0 && !isOnlyDigitLetters(newTag.trim())}
                onChange={e => {
                  setNewTag(e.target.value)
                }}
              />
              <button
                disabled={newTag.trim().length === 0 || !isOnlyDigitLetters(newTag.trim())}
                onClick={() => {
                  setTags([...tags, newTag.trim()]);
                  setNewTag('');
                }} 
                className={cx('button', 'button-primary')}>
                Добавить
              </button>
            </div>
          )}
        </FormRow>

        <FormRow maxLength={20} length={skills.length}>
          <div className={s.listTitle}>
            Навыки:
          </div>
          <div className={s.list}>
            {skills.map((skill, i) => (
              <div 
                key={i}
                className={s.listItem}
              >
                <span>{skill}</span>
                <Close onClick={() => setSkills(skills.filter(t => t !== skill))} />
              </div>
            ))}
          </div>
          {skills.length < 20 && (
            <div className={s.listForm}>
              <TextField
                size="bg"
                value={newSkill}
                name="newSkill"
                invalid={newSkill.trim().length > 0 && !isOnlyDigitLetters(newSkill.trim())}
                onChange={e => {
                  setNewSkill(e.target.value)
                }}
              />
              <button
                disabled={newSkill.trim().length === 0 || !isOnlyDigitLetters(newSkill.trim())}
                onClick={() => {
                  setSkills([...skills, newSkill.trim()]);
                  setNewSkill('');
                }} 
                className={cx('button', 'button-primary')}>
                Добавить
              </button>
            </div>
          )}
        </FormRow>

        <FormRow maxLength={20} length={links.length}>
          <div className={s.listTitle}>
          Ссылки:
          </div>
          <div className={s.list}>
            {links.map((link, i) => (
              <div 
                key={i}
                className={s.listItem}
              >
                <span>{link}</span>
                <Close onClick={() => setLinks(links.filter(t => t !== link))} />
              </div>
            ))}
          </div>
          {links.length < 20 && (
            <div className={s.listForm}>
              <TextField
                size="bg"
                value={newLink}
                name="newLink"
                invalid={newLink.trim().length > 0 && !validator.isURL(newLink.trim())}
                onChange={e => {
                  setNewLink(e.target.value)
                }}
              />
              <button
                disabled={newLink.trim().length === 0 || !validator.isURL(newLink.trim())}
                onClick={() => {
                  setLinks([...links, newLink.trim().toLowerCase()]);
                  setNewLink('');
                }} 
                className={cx('button', 'button-primary')}>
                Добавить
              </button>
            </div>
          )}
        </FormRow>
        
        {coverPath ? (
          <div className={s.image}>
            <img src={coverPath} alt="" />
            <button
              className={cx('button', 'button-danger')}
              disabled={isLoading}
              onClick={() => {
                setCover(null);
                setCoverPath('');
              }}
            >Удалить</button>
          </div>
        ) : (
          <div 
          {...getRootProps({
            maxFiles: 1,
            className: cx('dropzone', s.imageDrop, { [s.rejectImageDrop]: isDragReject, [s.activeImageDrop]: isDragAccept }),
          })}
        >
          <input {...getInputProps()} />
          <p>Перетащите изображение сюда</p>
        </div>
        )}
        {errors.cover && <div className={s.imageError}>{errors.cover}</div>}

        <div className={s.actions}>
          <button disabled={isLoading} className={cx('button', 'button-primary')} onClick={save}>Сохранить</button>
          <button disabled={isLoading} className={cx('button', 'button-secondary')} onClick={onBack}>Назад</button>
        </div>
      </div>
    </div>
  );

}