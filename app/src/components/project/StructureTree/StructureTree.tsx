import React, { useMemo, } from 'react';
import cx from 'classnames';
import { NavLink } from 'react-router-dom';
import { ReactComponent as Folder }  from 'icons/folder_dark.svg'
import { ReactComponent as Doc }  from 'icons/doc_dark.svg'
import { ReactComponent as Star }  from 'icons/star.svg'
import sortBy from 'lodash/sortBy';
import { IProject } from 'models/project';

import s from './StructureTree.module.scss';

enum RowType {
  Directory = 1,
  Published = 2,
  Unpublished = 3,
  Deleted = 4,
  Page = 5,
}

interface IRowDataProps {
  name: string,
  type: RowType,
  to: string,
  important: boolean,
  id?: number;
  draft?: boolean;
  children?: Array<IRowDataProps>;
  content?: string;
}

interface IRowProps extends IRowDataProps {
  onAdd?(parentId?: number): any;
  canEdit: boolean;
  className?: string;
  level: number;
}

interface IProps {
  project: IProject;
  onAdd?(parentId?: number): any;
  canEdit: boolean;
  pages?: Array<{
    id?: number;
    name: string;
    content?: string;
    important?: boolean;
    deleted?: boolean;
    draft?: boolean;
    children?: any;
  }>;
  relative?: boolean;
}
function mapData(data: any, project: IProject, onAdd: any): any[] {
  return (sortBy((data || []), ['id']) as any[]).map(
    (p: any) => ({
      id: p.id,
      name: p.name,
      draft: p.draft,
      type: RowType.Page,
      to: `/project/${project.id}/${p.id}`,
      important: p.important,
      onAdd: () => onAdd(p.id),
      children: mapData(p.children, project, onAdd),
      content: p.content,
    })
  );
}
export default function StructureTree({ project, pages, canEdit, onAdd, relative }: IProps) {
  const data: IRowDataProps[] | undefined = useMemo(
    () => mapData(pages, project, onAdd),
    [project, pages],
  );
    
  return (
    <div className={s.wrapper}>
      <Row
        name={project.name}
        className={s.rootRow}
        type={RowType.Directory}
        to={`/project/${project.id}`}
        important={false}
        children={data}
        onAdd={onAdd}
        canEdit={canEdit}
        draft={project.draft}
        level={1}
      />
      {!pages || (pages.length === 0 && canEdit) ? (
        <div>
          <span className={s.emptyAdd} onClick={() => onAdd && onAdd()}>Add page</span>
        </div>
      ) : null}
    </div>
  );
}

function Row({ content = '', id, className, important, type, name, to, children, canEdit, onAdd, level, draft }: IRowProps) {
  const deleted = type === RowType.Deleted;
  return (
    <div key={id} className={cx(s.row, { [className!]: !!className })}>
      <div className={s.rowName}>
        <NavLink
          activeClassName={s.activeLink}
          className={cx(s.rowLink, { 
            [s.rowUnpublished]: !!draft,
            [s.rowDeleted]: deleted,
          })}
          to={to}
        >
          {type === RowType.Directory ? <Folder /> : <Doc />}
          <span>{important && <Star className={s.importantIcon} />}{name}{!!draft ? ` (${level === 1 ? 'Непубличный' : 'Черновик'})` : null}</span>
        </NavLink>
        {!deleted && level < 5 && canEdit && <span onClick={() => onAdd && onAdd()} className={s.addIcon}>+</span>}
      </div>
      {children && children.length > 0 && (
        <div className={s.rowContent}>
          {children.map((r, i) => <Row {...r} level={level + 1} canEdit={canEdit} />)}
        </div>
      )}
    </div>
  );
}
