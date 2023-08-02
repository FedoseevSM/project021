import React, { useState, useEffect } from 'react';
import cx from 'classnames';
import Radio from '@material-ui/core/Radio';
import { IProject } from 'models/project';
import { createProject, updateProject } from 'api/project';
import ContentField from 'components/form/ContentField/ContentField';
import ConfirmWindow from 'components/common/ConfirmWindow/ConfirmWindow';
import FormRow from 'components/form/FormRow/FormRow';
import { deleteProject } from 'api/project';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ProjectActionType } from 'store';
import { useDropzone } from 'react-dropzone';
import TextField from 'components/form/TextField/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import { staticBase } from 'helpers/constants';

import s from './ProjectForm.module.scss';
interface IProps {
  onSave?(project: IProject): any;
  onCancel?(): any;
  project?: IProject;
  className?: string;
}

export default function ProjectForm({ className, project, onSave, onCancel }: IProps) {
  const [name, setName] = useState<any>('');
  const [description, setDescription] = useState<any>('');
  const [content, setContent] = useState<any>(null);
  const [dt, setData] = useState<any>(null);
  const [draft, setDraft] = useState<any>(true);
  const [cover, setCover] = useState<File | null>(null);
  const [coverPath, setCoverPath] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [deletedProject, setDeletedProject] = useState<IProject | null>(null);
  const history = useHistory();
  const dispatch = useDispatch();
  const [type, setType] = useState(0);

  const { acceptedFiles, getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({ accept: 'image/png, image/jpg, image/jpeg, image/gif' })

  useEffect(
    () => {
      if (!project) {
        setName('');
        setDescription('');
        setContent('');
        setData({});
        setDraft(true);
        return;
      };
      setName(project.name);
      setDescription(project.description);
      setContent(project.content || '');
      setDraft(!!project.draft);
      setCoverPath(`${staticBase}/images/${project.cover}`);
      try {
        setData(JSON.parse(project.data || '{}'));
      } catch (err) {
        setData({});
      }
    },
    [project]
  );

  useEffect(
    () => {
      if (acceptedFiles.length > 0) {
        setCover(acceptedFiles[0]);
      }
    },
    [acceptedFiles.length]
  )
  

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

  if (content === null) {
    return null;
  }

  const save = async () => {
    const errors: { [key: string]: string } = {};
    if (name.trim().length === 0) {
      errors.name = 'Пустое значение';
    } else if (name.trim().length > 120) {
      errors.name = 'Слишком длинное название';
    }
    if (description.trim().length === 0) {
      errors.description = 'Пустое значение';
    } else if (description.trim().length > 5000) {
      errors.description = 'Слишком длинное значение';
    }
    
    if (!cover && !project) {
      errors.cover = 'Выберите изображение';
    } else if (cover && (cover.size / 1000000) > 10) {
      errors.cover = 'Изображение слишком большое (10мб макс.)';
    }

    if (content.trim().length === 0) {
      errors.content = 'Пустое значение';
    } else if (content.trim().length > 15000) {
      errors.content = 'Слишком длинное значение';
    }
    
    setErrors(errors);
    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      try {
        const { data } = await (project 
          ? updateProject(project.id, name, description, content, dt, cover, draft)
          : createProject(name, description, content, dt, cover!, draft, type)
        );
        if (onSave) {
          onSave(data);
        }
      } catch (err) {
        setErrors(JSON.parse(err.data.message));
      }
      setIsLoading(false);
    }
  }

  const onDelete = () => {
    if (project) {
      setDeletedProject(project);
    }
  };

  
  
  
  return (
      <div className={cx(s.container, { [className!]: !!className })}>
        <div className={s.top}>
          {!project && (
            <div className={s.types}>
              <div className={s.typesTitle}>Тип:</div>
              <div className={s.typesList}>
                <div>
                  <Radio
                    checked={type === 0}
                    onChange={(e: any) => setType(+e.target.value)}
                    value={0}
                  /><span>Проект</span>
                </div>
                <div>
                  <Radio
                    checked={type === 1}
                    onChange={(e: any) => setType(+e.target.value)}
                    value={1}
                  /><span>Протокол</span>
                </div>
                <div>
                  <Radio
                    checked={type === 2}
                    onChange={(e: any) => setType(+e.target.value)}
                    value={2}
                  /><span>Обсуждение</span>
                </div>
              </div>
            </div>
          )}
          <FormRow maxLength={120} length={name.trim().length} className={s.row}>
              <TextField
                fullWidth
                size="bg"
                name="name"
                value={name}
                invalid={!!errors.name}
                invalidText={errors.name}
                label="Название"
                onChange={e => {
                  setName(e.target.value);
                }}
              />
          </FormRow>
          <FormRow maxLength={5000} length={description.trim().length} className={s.row}>
            <TextField
                fullWidth
                size="bg"
                name="description"
                value={description}
                invalid={!!errors.description}
                invalidText={errors.description}
                label="Описание"
                onChange={e => {
                  setDescription(e.target.value);
                }}
              />
          </FormRow>
        </div>
        
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
        
        <FormRow maxLength={15000} length={content.trim().length} className={s.row}>
          <ContentField 
            className={s.editor} 
            value={dt} 
            onChange={(data, html) => {
              setData(data);
              setContent(html);
            }}
            error={errors.content}
          />
        </FormRow>
        <div className={s.actions}>
          <div className={s.actionsLeft}>
            <button
              disabled={isLoading}
              onClick={save}
              className={cx('button', 'button-primary')}
            >
              {project ? 'Обновить' : 'Создать'}
            </button>
            <div className={s.public}>
              <Checkbox
                checked={!draft}
                
                id="draft" 
                onChange={e => {
                  setDraft(!e.target.checked);
                }}
              />
              <span>Публичный</span>
            </div>
          </div>
          {project && (
            <div className={s.actionsRight}>
              <button
                disabled={isLoading}
                onClick={onCancel}
                className={cx('button', 'button-secondary')}
              >
                Закрыть
              </button>
                <button
                disabled={isLoading}
                onClick={onDelete}
                className={cx('button', 'button-danger')}
              >
                Удалить
              </button>
            </div>
          )}
          
        </div>
        {deletedProject && (
          <ConfirmWindow
            text="Вы уверены?"
            ok={async () => {
              await deleteProject(deletedProject.id);
              dispatch({ type: ProjectActionType.LOAD_PROJECT_ACTION, payload: null });
              history.replace('/');
            }}
            cancel={() => setDeletedProject(null)}
            okText="Удалить"
            cancelText="Отмена"
          />
        )}
      </div>
  );
}