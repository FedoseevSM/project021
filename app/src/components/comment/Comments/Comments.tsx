import React, { useEffect, useState, useMemo, useLayoutEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as SignalR from '@microsoft/signalr';
import cx from 'classnames';
import { useLocation } from 'react-router-dom';
import sortBy from 'lodash/sortBy';
import Checkbox from '@material-ui/core/Checkbox';

import { AppState, ProjectActionType } from 'store';
import CommentWidget from 'components/comment/CommentWidget/CommentWidget';
import AddCommentForm from 'components/comment/AddCommentForm/AddCommentForm';
import { getComments, createComment } from 'api/comment';
import { IComment } from 'models/comment';
import { UserActionType } from 'store';
import useUser from 'hooks/useUser';
import { getConnectionWS } from 'api/hub';

import s from './Comments.module.scss';
interface IProps {
  projectId?: number;
  pageId?: number;
  count?: number;
  userId?: number;
}

export default function Comments({ projectId, pageId, userId }: IProps) {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const { comments } = useSelector((s: AppState) => s.project);
  const { openCommentForm } = useSelector((s: AppState) => s.user);
  const { user } = useUser();
  const [hideNegative, setHideNegative] = useState(true);
  const [init, setInit] = useState(false);
  const location = useLocation();


  useLayoutEffect(
    () => {
      if (comments && !init) {
        const hash = location.hash;
        if (hash.indexOf('#comment') !== -1) {
          const id = +hash.replace('#comment', '');
          if (id) {
            const index = comments.findIndex(c => c.id === id);
            if (index !== -1 && !comments[index].highlight) {
              comments[index] = { ...comments[index], highlight: true };
              dispatch({ type: ProjectActionType.LOAD_COMMENTS_ACTION, payload: [...comments] });
            }
          }
        }
        setInit(true);
      }
    },
    [comments], // eslint-disable-line
  );

  useEffect(
    () => {
      dispatch({ type: ProjectActionType.LOAD_COMMENTS_ACTION, payload: null });
      const loadComments = async (projectId?: number, pageId?: number, userId?: number) => {
        try {
          setIsLoading(true);
          const res = await getComments(projectId, pageId, userId);
          dispatch({ type: ProjectActionType.LOAD_COMMENTS_ACTION, payload: res.data });
        } catch (err) {
          dispatch({ type: ProjectActionType.LOAD_COMMENTS_ACTION, payload: [] });
        }
        setIsLoading(false);
      }
      
      loadComments(projectId, pageId, userId);
      return () => {
        dispatch({ type: ProjectActionType.LOAD_COMMENTS_ACTION, payload: [] });
        dispatch({ type: UserActionType.COMMENT_FORM_OPEN_ACTION, payload: undefined });
      }
    },
    [projectId, userId], // eslint-disable-line
  );
  const sorted = useMemo(
    () => {
      if (!comments) {
        return [];
      }
      const ordered = sortBy(comments, ['depth']).reverse();
      let result: any = [];
      
      ordered.forEach(c => {
        const children = ordered.filter(ch => ch.threadId === c.id || ch.parentId === c.id);
        if (!c.deleted || children.filter(c => !c.deleted).length > 0) {
          if (!hideNegative || (c.positiveScore - c.negativeScore) >= 0 || children.filter(ch => (ch.positiveScore - ch.negativeScore) >= 0).length > 0) {
            result.push(c);
          }
        }
      });
      const filtered = sortBy(result, ['id']).map(c => ({ ...c }));
      const parents = filtered.filter(c => !c.parentId);
      filtered.forEach(c => {
        c.children = filtered.filter(a => a.parentId === c.id)
      });      
      return parents;
    },
    [comments, hideNegative],
  );


  useEffect(
    () => {
      if (userId) {
        return;
      }
      const handler = async () => {
        try {  
          const res = await getComments(projectId, pageId, undefined);
          dispatch({ type: ProjectActionType.LOAD_COMMENTS_ACTION, payload: res.data });
        } catch (err) {

        }
      };
      let expired = false;
      let connection: SignalR.HubConnection | undefined;
      const eventName = `CommentsChanged:${projectId}${pageId ? `:${pageId}` : ''}`;
      const onLoad = async () => {
        connection = await getConnectionWS();
        if (!expired && connection)
          connection.on(eventName, handler);
      }

      onLoad();
      return () => {
        expired = true;
        if (connection) {
          connection.off(eventName, handler);
          connection = undefined;
        }
      }
    },
    [projectId, pageId, userId, user] // eslint-disable-line
  );

  if (!comments) {
    return <div className="spinner" />;
  }

  const onAddComment = async (comment: string, data: any, anonymous?: boolean) => {
    if (!projectId) {
      return;
    }
    setIsLoading(true);
    try {
      const res = await createComment(projectId, comment, data, pageId, anonymous);
      dispatch({ type: ProjectActionType.LOAD_COMMENTS_ACTION, payload: [...comments!, { ...res.data, children: [] }] });
      dispatch({ type: UserActionType.COMMENT_FORM_OPEN_ACTION, payload: undefined });
      setIsLoading(false);
      return true;
    } catch(err) {
      setIsLoading(false);
      console.error(err);
      return false;
    }
  }

  return (
    <div className={s.wrapper}>
        <div className={s.top}>
          <div className={s.title}>
            Комментарии ({sorted.length}):
          </div>
          <div className={s.hideNegative}>
            <Checkbox 
              checked={!hideNegative}
              onChange={e => {
                setHideNegative(!e.target.checked);
              }}
            />
            <span>Показать негативные</span>
          </div>
        </div>
        <div className={s.list}>
          {sorted.length === 0 && (
            <div className={s.empty}>Нет комментариев</div>
          )}
          {sorted.map(comment => (
            <CommentWidget 
              level={1}
              onAnswerAdd={(data: IComment) => {
                dispatch({ type: ProjectActionType.LOAD_COMMENTS_ACTION, payload: [...comments, data] });
              }}
              className={s.comment}
              comment={comment}
              deleted={comment.deleted}
              disabled={!projectId}
              key={comment.id}
              hasLink={!userId}
              onUpdate={(data: IComment) => {
                const commentIndex = comments.findIndex(c => c.id === data.id);
                comments[commentIndex] = { ...data };
                dispatch({ type: ProjectActionType.LOAD_COMMENTS_ACTION, payload: [...comments] });
              }}
            />
          ))}
      </div>

      {projectId && (
        openCommentForm === null ? (
          <AddCommentForm
            disabled={isLoading}
            onSave={onAddComment}
          />
        ) : (
          <div
            onClick={() => {
              if (!user) {
                dispatch({ type: UserActionType.LOGIN_VISIBILITY_ACTION, payload: true });
                return;
              }
              dispatch({ type: UserActionType.COMMENT_FORM_OPEN_ACTION, payload: null });
            }} 
            className={cx(s.reply, s.addComment)} 
          >Добавить комментарий</div>
        ))
      }
    </div>
  );
}