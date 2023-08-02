import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import cx from 'classnames';
import { useHistory } from 'react-router-dom';
import useUser from 'hooks/useUser';
import * as SignalR from '@microsoft/signalr';
import { AppState, ProjectActionType } from 'store';
import File from '@material-ui/icons/Description';
import { useDropzone } from 'react-dropzone';
import { updatePage, getProjectPages, deleteProjectPage, getDraft, updateDraft, getPage, saveDraftToPage, saveDraftFromPage } from 'api/project';
import ConfirmWindow from 'components/common/ConfirmWindow/ConfirmWindow';
import { IFile } from 'models/file';
import ContentField from 'components/form/ContentField/ContentField';
import FormRow from 'components/form/FormRow/FormRow';
import Modal from 'components/common/Modal/Modal';
import TextField from 'components/form/TextField/TextField';
import { getConnectionWS } from 'api/hub';
import Checkbox from '@material-ui/core/Checkbox';
import Popup from 'components/common/Popup/Popup';
import { ReactComponent as Close } from 'icons/close.svg';

import s from './PageEdit.module.scss';

export default function PageEdit() {
  const { page, project, projectUsers } = useSelector((s: AppState) => s.project);
  const [name, setName] = useState<any>('');
  const { user } = useUser();
  const [displayDeleteConfirm, setDisplayDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const [important, setImportant] = useState(false);
  const [published, setPublished] = useState(false);
  const [content, setContent] = useState<any>(null);
  const [dt, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<IFile[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const history = useHistory();
  const dispatch = useDispatch();

  const [displayDraft, setDisplayDraft] = useState(false);
  const [draftContent, setDraftContent] = useState<any>(null);
  const [popupMessage, setPopupMessage] = useState('');

  const isAdmin = user !== null && user.id === project!.user.id;
  const hasRights = user !== null && (user.id === project!.user.id || (projectUsers && projectUsers.users.findIndex((u: any) => u.id === user.id) !== -1));

  useEffect(
    () => {
      if (!page) return;
      if (!hasRights) {
        history.replace(`/project/${project!.id}/${page!.id}`);
        return;
      }
      setName(page.name || '');
      setImportant(!!page.important);
      setPublished(!page.draft);
      setFiles(page.files || []);
      try {
        setData(JSON.parse(page.data || '{}'));
      } catch(err) {
        setData({});
      }
      
      setContent(page.content || '');
    },
    [page, user, hasRights], // eslint-disable-line
  );

  useEffect(
    () => {
      if (!project || !page) {
        return;
      }
      const onLoad = async () => {
        const { data: { drafts }} = (await getDraft(project.id, page.id)) as any;
        if (drafts.length) {
          setDraftContent(drafts[0].content || '');
        } else {
          setDraftContent('');
        }
      }
      if (displayDraft) {
        onLoad();
      } else {
        setDraftContent(null);
      }
    },
    [displayDraft, project, page]
  );

  useEffect(
    () => {
      if (page && isAdmin) {
        const handler = async (content: string) => {
          setPopupMessage('Страница обновлена');
        };
        let expired = false;
        let connection: SignalR.HubConnection | undefined;
        const onLoad = async () => {
          connection = await getConnectionWS();
          if (!expired && connection) {
            connection.on(`PageEdit:${page.id}`, handler);
          }
        }
        onLoad();
        return () => {
          expired = true;
          if (connection) {
            connection.off(`PageEdit:${page.id}`, handler);
            connection = undefined;
          }
        }
      }
    },
    [page, isAdmin]
  );

  const { 
    acceptedFiles, getRootProps, getInputProps, isDragAccept, isDragReject,
  } = useDropzone();

  // useDropzone({ accept: 'image/png image/jpg image/jpeg image/gif application/pdf .csv .xlsx .xls .doc .docx .ppt .pptx .txt application/vnd.openxmlformats-officedocument.spreadsheetml.sheet application/vnd.ms-excel' });

  useEffect(
    () => {
      if (acceptedFiles.length > 0) {
        setNewFiles([...newFiles, ...acceptedFiles]);
      }
    },
    [acceptedFiles.length]
  )

  if (content === null) {
    return null;
  }

  const save = async () => {
    const errors: { [key: string]: string } = {};
    if (name.trim().length === 0) {
      errors.name = 'Can\'t be empty';
    } else if (name.trim().length > 120) {
      errors.name = 'Too long';
    }
    if (content!.trim().length > 15000) {
      errors.content = 'Too long';
    }

    if (content!.trim().length === 0) {
      errors.content = 'Can\'t be empty';
    } else if (content!.trim().length > 15000) {
      errors.content = 'Too long';
    }

    setErrors(errors);
    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      try {
        const { data } = await updatePage({ ...page!, name, content: content || '', files, important, draft: !published }, dt, newFiles);
        const { data: pages } = await getProjectPages(project!.id);
        dispatch({ type: ProjectActionType.LOAD_PROJECT_ACTION, payload: { ...project, pages }});
        history.push(`/project/${project!.id}/${page!.id}`);
        dispatch({ type: ProjectActionType.LOAD_PAGE_ACTION, payload: data });          
      } catch (err) {
        console.error(err);
      }
      setIsLoading(false);
    }
  }

 

  if (!page) {
    return null;
  }
  
  return (
    <div className={s.wrapper}>
      <div className={s.checkboxes}>
        <div className={s.checkbox}>
          <Checkbox
            checked={important}
            id="important" 
            onChange={e => {
              setImportant(e.target.checked);
            }}
          />
          <span>Важное</span>
        </div>
        <div className={s.checkbox}>
          <Checkbox
            checked={published}
            id="published" 
            onChange={e => {
              setPublished(e.target.checked);
            }}
          />
          <span>Опубликовать</span>
        </div>
        
      </div>
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

      {isAdmin && (
        <div className={s.displayDraft}>
          <span onClick={() => setDisplayDraft(true)}>Посмотреть черновик</span>
          <span 
            onClick={async () => {
              await saveDraftFromPage(project!.id, page!.id);
              setPopupMessage('Сохранено в черновик');
            }}
          >Сохранить в черновик</span>
          <span
            onClick={async () => {
              await saveDraftToPage(project!.id, page!.id);
              const { data } = await getPage(project!.id, page!.id);
              setContent(null);
              dispatch({ type: ProjectActionType.LOAD_PAGE_ACTION, payload: data });          
            }}
          >Сохранить из черновика</span>
        </div>
      )}

      <div>
        <div className={s.filesList}>
          {files.map(file => (
            <div className={s.file} key={file.name} title={file.name}>
              <File />
              <span>{file.name}</span>
              <Close className={s.removeFile} onClick={() => setFiles(files.filter(f => file !== f))} />
            </div>
          ))}
          {newFiles.map(file => (
            <div className={s.file} key={file.name} title={file.name}>
              <File />
              <span>{file.name}</span>
              <Close className={s.removeFile} onClick={() => setNewFiles(newFiles.filter(f => file !== f))} />
            </div>
          ))}
        </div>
        <div
          {...getRootProps({
            maxFiles: 0,
            className: cx('dropzone', s.imageDrop, { [s.rejectImageDrop]: isDragReject, [s.activeImageDrop]: isDragAccept }),
          })}
        >
          <input {...getInputProps()} />
          <p>Перетащите файл сюда</p>
        </div>
      </div>
      <div className={s.actions}>
        <div className={s.actionsLeft}>
          <button
            disabled={isLoading}
            onClick={save}
            className={cx('button', 'button-primary')}
          >
            Обновить
          </button>
        </div>
        {project && (
          <div className={s.actionsRight}>
            <button
              disabled={isLoading}
              onClick={() => {
                history.push(`/project/${project!.id}/${page!.id}`);
              }}
              className={cx('button', 'button-secondary')}
            >
              Закрыть
            </button>
              <button
              disabled={isLoading}
              onClick={() => setDisplayDeleteConfirm(true)}
              className={cx('button', 'button-danger')}
            >
              Удалить
            </button>
          </div>
        )}
        
      </div>
      {displayDeleteConfirm && (
        <ConfirmWindow
          title="Вы уверены?"
          ok={async () => {
            await deleteProjectPage(project!.id, page!.id);
            const { data: pages } = await getProjectPages(project!.id);
            dispatch({ type: ProjectActionType.LOAD_PROJECT_ACTION, payload: { ...project, pages }});
            history.push(`/project/${project!.id}`);
          }}
          cancel={() => setDisplayDeleteConfirm(false)}
          okText="Удалить"
          cancelText="Отмена"
        />
      )}
      {displayDraft && (
        <Popup width={800} onClose={() => setDisplayDraft(false)}>
          <div className={s.popup}>
            <div className={s.popupTitle}>Черновик</div>
            <div className={cx('trix-content', s.popupForm)} dangerouslySetInnerHTML={{ __html: draftContent }} />
          </div>
        </Popup>
      )}
      {popupMessage && (
        <Popup title={popupMessage} width={320} onClose={() => setPopupMessage('')} />
      )}
    </div>
  );
}