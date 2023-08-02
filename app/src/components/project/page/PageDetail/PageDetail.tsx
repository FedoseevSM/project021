import React, { useEffect, useState } from 'react';
import { useParams, useHistory, Route, useRouteMatch, Switch } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AppState, ProjectActionType } from 'store';
import { Helmet } from 'react-helmet';
import PageMain from 'components/project/page/PageMain/PageMain';
import PageEdit from 'components/project/page/PageEdit/PageEdit';
import { getPage } from 'api/project';

import s from './PageDetail.module.scss';

export default function PageDetail() {
  const { pageId } = useParams<{ pageId: string }>();
  const history = useHistory();
  const match = useRouteMatch();
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const { project, page, projectUsers } = useSelector((s: AppState) => s.project);

  useEffect(
    () => {
      const onLoad = async () => {
        setIsLoading(true);
        try {
          const { data } = await getPage(project!.id, +pageId);
          dispatch({ type: ProjectActionType.LOAD_PAGE_ACTION, payload: data });          
          setIsLoading(false);
        } catch (err) {
          console.error(err);
          history.replace(`/project/${project!.id}`);
        }
      };
      onLoad();
      return () => {
        dispatch({ type: ProjectActionType.LOAD_PAGE_ACTION, payload: null });
      }
    },
    [pageId]
  );

  if (isLoading || projectUsers === null) {
    return null;
  }
  
  return (
    <>
      {page && (
        <Helmet>
          <title>Projects & protocols repository: {project!.name} - {page.name}</title>
        </Helmet>
      )}
      <Switch>
        <Route path={match.url} exact component={PageMain} />
        <Route path={`${match.url}/edit`} exact component={PageEdit} />
      </Switch>
    </>
  );
}