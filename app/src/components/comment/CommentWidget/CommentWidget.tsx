import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import cx from 'classnames';
import { IComment } from 'models/comment';
import moment from 'moment-timezone';
import useUser from 'hooks/useUser';
import { staticBase } from 'helpers/constants';
import { UserActionType, AppState } from 'store';
import s from './CommentWidget.module.scss';
import AddCommentForm from 'components/comment/AddCommentForm/AddCommentForm';
import { ContentRenderer } from 'components/form/ContentInput/ContentInput';
import ConfirmWindow from 'components/common/ConfirmWindow/ConfirmWindow';
import { createComment, likeComment, removeComment, updateComment } from 'api/comment';
import { ReactComponent as Like } from 'icons/like.svg';
import { ReactComponent as Dislike } from 'icons/dislike.svg';

interface IProps {
  comment: IComment;
  className?: string;
  onAnswerRemove?: any;
  onAnswerAdd?: any;
  onUpdate?: any;
  deleted?: boolean;
  level: number;
  disabled?: boolean;
  hasLink?: boolean;
}

export default function CommentWidget({ disabled, hasLink, deleted, comment, className, level, onAnswerAdd, onUpdate }: IProps) {
  const { user } = useUser();
  const [editMode, setEditMode] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const dispatch = useDispatch();
  const { openCommentForm } = useSelector((s: AppState) => s.user);
  const anonymous = comment.anonymous;
  const commentUser = comment.user;
  const [displayConfirmDelete, setDisplayConfirmDelete] = useState(false);
  const canDelete = user && ((commentUser && user.id === commentUser.id) || user.isAdmin);
  const canEdit = user && commentUser && user.id === commentUser.id;
  const html = useMemo(
    () => {
      return comment.text;
    }, 
    [comment.text]
  );
  
  return (
    <div>
      <div className={cx(s.wrapper, { [s.highlight]: !!comment.highlight, [className!]: !!className })}>
        {deleted ? (
          <>
            <span className={s.userImage} />
            <div className={s.content}>
              <div className={s.deletedText}>Коммент удален</div>
            </div>
          </>
        ) : (
          editMode ? (
            <AddCommentForm 
              comment={comment} 
              disabled={commentLoading}
              onSave={async (text: string, dt: any) => {
                setCommentLoading(true);
                try {
                  const { data } = await updateComment(comment.id, text, dt);
                  onUpdate(data);
                  setEditMode(false);
                } catch(err) {
                  console.error(err);
                }
                setCommentLoading(false);
              }}
              onCancel={() => setEditMode(false)}
            />
          ) : (
            <>
              {anonymous ? (
                <span className={s.userImage} />
              ) : (
                hasLink ? (
                  <Link 
                    to={`/users/${commentUser!.id}`}
                    className={s.userImage}
                    style={{ backgroundImage: (commentUser!.cover ? `url(${commentUser!.cover.startsWith('images/') ? `${staticBase}/${commentUser!.cover}` : commentUser!.cover})` : '') }}
                  />
                ) : (
                  <div 
                    className={s.userImage}
                    style={{ backgroundImage: (commentUser!.cover ? `url(${commentUser!.cover.startsWith('images/') ? `${staticBase}/${commentUser!.cover}` : commentUser!.cover})` : '') }}
                  />
                )
                
              )}
              
              <div className={s.content}>
                {anonymous ? (  
                  <span className={s.anonymous}>Анонимный пользователь</span>
                ) : (
                  hasLink ? (
                    <Link
                      to={`/users/${commentUser!.id}`} 
                      className={s.name}
                    >
                      {commentUser!.name}
                    </Link>
                  ) : (
                    <div
                      className={s.name}
                    >
                      {commentUser!.name}
                    </div>
                  )
                  
                )}
                <div className={s.date}>
                  {moment.utc(comment.created).local().format('kk:mm D MMM YYYY')}
                </div>
                <div className={cx('trix-content', s.text)} dangerouslySetInnerHTML={{ __html: html }}  />
                <div className={s.bottom}>
                  <div className={s.likes}>
                    
                      <Like
                        onClick={async () => {
                          if (!user) {
                            dispatch({ type: UserActionType.LOGIN_VISIBILITY_ACTION, payload: true });
                            return;
                          }
                          const { data: { positiveScore, negativeScore } } = await likeComment(comment.id, 1);
                          onUpdate!({ ...comment, positiveScore, negativeScore });
                        }}
                      />
                      
                    
                    <div className={s.likeCount}>{comment.positiveScore - comment.negativeScore}</div>
                    
                      <Dislike 
                        onClick={async () => {
                          if (!user) {
                            dispatch({ type: UserActionType.LOGIN_VISIBILITY_ACTION, payload: true });
                            return;
                          }
                          const { data: { positiveScore, negativeScore } } = await likeComment(comment.id, 2);
                          onUpdate!({ ...comment, positiveScore, negativeScore });
                        }}
                      />
                      
                    
                  </div>
                  {!disabled && (
                    <div
                      onClick={() => {
                        if (!user) {
                          dispatch({ type: UserActionType.LOGIN_VISIBILITY_ACTION, payload: true });
                          return;
                        }
                        dispatch({ type: UserActionType.COMMENT_FORM_OPEN_ACTION, payload: comment });
                      }} 
                      className={s.reply} 
                    >Ответить</div>
                  )}
                  
                </div>
                <div className={s.actions}>
                  {canEdit && <span onClick={() => setEditMode(true)} className={s.action}>Редактировать</span>}
                  {canDelete && <span onClick={() => setDisplayConfirmDelete(true)} className={s.action}>Удалить</span>}
                </div>
              </div>
            </>
          )
        )}
        
        
      </div>
      {/* {!comment.threadId && comment.answersCount > 0 && (
        <div className={s.loadAnswer}>
          <span>Show answers ({comment.answersCount - ((comment.children && comment.children.length) || 0)})</span>
        </div>
      )} */}
      {comment.children && comment.children.length ? (
        <div className={s.answers}>
          {comment.children.map(c => (
            <CommentWidget 
              onUpdate={onUpdate}
              deleted={c.deleted}
              level={level + 1}
              className={s.answer} 
              onAnswerAdd={onAnswerAdd}
              comment={c} 
              key={c.id}
              hasLink={hasLink}
            />
          ))}
        </div>
      ) : null}
      {openCommentForm && openCommentForm.id === comment.id && user && (
        <div className={s.addAnswer}>
          <AddCommentForm
            disabled={commentLoading}
            parent={openCommentForm}
            onSave={async (text: string, dt: any, anonymous?: boolean) => {
              setCommentLoading(true);
              try {
                const { data } = await createComment(comment.projectId, text, dt, comment.pageId, anonymous, comment.id);
                onAnswerAdd && onAnswerAdd(data);
                dispatch({ type: UserActionType.COMMENT_FORM_OPEN_ACTION, payload: undefined });
                setCommentLoading(false);
                return true;
              } catch(err) {
                console.error(err);
                setCommentLoading(false);
                return false;
              }
            }}
          />
        </div>
      )}

      {displayConfirmDelete && (
        <ConfirmWindow
          title="Вы уверены?"
          ok={async () => {
            await removeComment(comment.id);
            onUpdate({ ...comment, deleted: true });
            setDisplayConfirmDelete(false);
          }}
          cancel={() => setDisplayConfirmDelete(false)}
          okText="Удалить"
        />
      )}
    </div>
  )
}