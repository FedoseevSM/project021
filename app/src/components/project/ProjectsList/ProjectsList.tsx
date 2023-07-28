import React from 'react';
import cx from 'classnames';
import { IProject } from 'models/project';
import ProjectWidget from 'components/project/ProjectWidget/ProjectWidget';
import s from './ProjectsList.module.scss'

interface IProps {
  projects: IProject[];
  className?: string;
  childClassName?: string;
  hasMore?: boolean;
  onMoreLoad?: any;
  disabled?: boolean;
  onLike?: any;
  moreLoading?: boolean;

}
export default function ProjectsList({ projects, className, childClassName, hasMore, onMoreLoad, disabled, onLike, moreLoading }: IProps) {
  return (
    <div className={s.wrapper}>
      {projects.length ? (
        <div className={cx(s.projects, { [className!]: !!className })}>
          {projects.map(project => (
            <ProjectWidget 
              className={cx(s.project, { [childClassName!]: !!childClassName })}
              key={project.id}
              project={project} 
              onLike={onLike}
            />
          ))}
        </div>
      ) : (
        <div className={s.empty}></div>
      )}
      {hasMore && (
        <div className={s.more}>
          <button className={cx('button', 'button-primary')} disabled={disabled} onClick={onMoreLoad}>Показать ещё</button>
        </div>
      )}
    </div>
  )
}