import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import cx from 'classnames';
import useUser from 'hooks/useUser';
import { ProjectActionType, AppState } from 'store';
import { createPage } from 'api/project';
import Comments from 'components/comment/Comments/Comments';
import { staticBase } from 'helpers/constants';
import { ReactComponent as Star } from 'icons/star.svg';
import { ReactComponent as Edit } from 'icons/edit.svg';
import StructureTree from 'components/project/StructureTree/StructureTree';
import File from '@material-ui/icons/Description';


import s from './PageMain.module.scss';

export default function PageMain() {
  const { page, project, projectUsers } = useSelector((s: AppState) => s.project);
  const { user } = useUser();
  const dispatch = useDispatch();
  const history = useHistory();
  const content = page!.content;

  const pages = useMemo(
    () => {
      const list = project?.pages?.map(p => ({ 
        id: p.id,
        name: p.name,
        parentId: p.parentId,
        important: p.important,
        draft: !!p.draft,
        children: [] as any[],
        content: p.content,
      }));
      if (list) {
        list.forEach(page => {
          if (page.parentId) {
            const parent = list.find(p => p.id === page.parentId);
            parent?.children.push(page);
          }
        });
        return list.filter(p => !p.parentId);
      }
    },
    [project?.pages]
  );

  const isAdmin = user !== null && (user.id === project!.user.id || (projectUsers && projectUsers.users.findIndex((u: any) => u.id === user.id) !== -1));
  
  return (
    <div className={cx(s.wrapper, { [s.draft]: page!.draft })}>
      {isAdmin && (
        <>
          <Link className={s.edit} to={`/project/${project!.id}/${page!.id}/edit`}>
            <Edit />
          </Link>
        </>
      )}
      <div className={s.name}>
        {page!.important && (<Star />)} {page!.name}
      </div>
      <div className={s.menu}>
        <StructureTree
          project={project!}
          pages={pages}
          relative
          canEdit={user !== null && (user.id === project!.user.id || (projectUsers && projectUsers.users.findIndex((u: any) => u.id === user.id) !== -1))}
          onAdd={async (id?: number) => {
            const { data: page } = await createPage(project!.id, id);
            await dispatch({ 
              type: ProjectActionType.LOAD_PROJECT_ACTION, 
              payload: { ...project, pages: [...(project!.pages || []), page] } 
            });
            history.push(`/project/${project!.id}/${page.id}/edit`);
          }}
        />
      </div>
      <div className={cx('text-content', s.content)} dangerouslySetInnerHTML={{ __html: content }} />
      {page!.files && page!.files.length > 0 && (
        <div className={s.files}>
          <div className={s.filesTitle}>Файлы:</div>
          <div className={s.filesList}>
            {page!.files.map(f => (
              <a target="_blank" rel="noopener noreferrer" href={`${staticBase}/${f.path}`} className={s.file} key={f.name} title={f.name}>
                <File />
                <span>{f.name}</span>
              </a>
            ))}
          </div>
        </div>
      )}
      <Comments count={page!.commentsCount} projectId={project!.id} pageId={page!.id} />
      
    </div>
  );
}