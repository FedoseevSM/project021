import React from 'react';
import cx from 'classnames';
import moment from 'moment-timezone';
import { Link } from 'react-router-dom';
import { IProject } from 'models/project';
import { staticBase } from 'helpers/constants';
import { ReactComponent as Like } from 'icons/like.svg';
import { ReactComponent as CommentIcon } from 'icons/comment.svg';
import s from './ProjectWidget.module.scss';


interface IProps {
  project: IProject;
  className?: string;
  onLike?: any;
}

export default function ProjectWidget({ project, className, onLike }: IProps) {
  return (
    <div className={cx(s.wrapper, { [className!]: !!className })}>
      <Link className={s.link} to={`/project/${project.id}`}>
        <div className={s.cover} style={{ backgroundImage: `url(${staticBase}/${project.cover.startsWith('images/') ? project.cover : `images/${project.cover}`})` }} />
        <div title={s.name} className={s.name}>{project.name}{project.draft ? ' (unpublished)' : ''}</div>
        <div className={s.text}>{project.description.substring(0, 300)}{project.description.length > 300 && '...'}</div>
        <div className={s.info}>
          <div className={s.values}>
            <div
              className={cx(s.value, s.likes, { [s.liked]: project.liked })}
              onClick={(e: any) => {
                e.preventDefault();
                e.stopPropagation();
                onLike(project);
              }}
            >
              <Like />
              <span>
                {project.likesCount}
              </span>
            </div>
            <div className={s.value}>
              <CommentIcon />
              <span>
                {project.commentsCount}
              </span>
            </div>
          </div>
          <div className={s.created}>
            {moment.utc(project.created).local().format('DD.MM.YYYY')}
          </div>
        </div>
      </Link>
    </div>
  )
}