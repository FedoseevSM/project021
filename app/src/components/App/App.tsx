import React, { useEffect, useState, useCallback }  from 'react';
import { Switch, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet';
import * as SignalR from '@microsoft/signalr';

import { UserActionType } from 'store';
import { refreshToken } from 'api/request';
import { getAccount, getEvents } from 'api/user';
import { User } from 'models/user';
import useUser from 'hooks/useUser';
import { useHistory } from 'react-router-dom';
import Header from 'components/common/Header/Header';
import Footer from 'components/common/Footer/Footer';
import Home from 'components/Home/Home';
import LoginForm from 'components/auth/LoginForm/LoginForm';
import RegisterForm from 'components/auth/RegisterForm/RegisterForm';
import ForgetPasswordForm from 'components/auth/ForgetPasswordForm/ForgetPasswordForm';
import ConfirmSuccess from 'components/auth/ConfirmSuccess/ConfirmSuccess';
import Account from 'components/account/Account/Account';
import AccountEdit from 'components/account/AccountEdit/AccountEdit';

import CreateProject from 'components/project/CreateProject/CreateProject';
import MyProjects from 'components/project/MyProjects/MyProjects';
import ProjectDetail from 'components/project/ProjectDetail/ProjectDetail';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import UserPage from 'components/common/UserPage/UserPage';
import ResetPassword from 'components/auth/ResetPassword/ResetPassword';
import { connectWS, disconnectWS } from 'api/hub';
import Agreement from 'components/Agreement/Agreement';
import Search from 'components/Search/Search';
import ContentField from 'components/form/ContentField/ContentField';

import s from './App.module.scss';

function App() {
  const [userLoaded, setUserLoaded] = useState(false);
  const dispatch = useDispatch();
  const { user, loginShowed, registerShowed, forgetPasswordShowed } = useUser();
  const history = useHistory();

  useEffect(() => history.listen(() => window.scrollTo(0, 0)), []); // eslint-disable-line
  
  useEffect(
    () => {
      const onLoad = async () => {
        try {
          await refreshToken();
          const { data } = await getAccount();
          dispatch({ 
            type: UserActionType.LOAD_USER_ACTION, 
            payload: User.FromResponse(data),
          });
          dispatch({ type: UserActionType.LOGIN_VISIBILITY_ACTION, payload: false });
        } catch (err) {
          if (window.opener) {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
            const pathname = window.location.pathname;
            switch (pathname) {
              case '/fb/':
                window.opener.setFbCode(code);
                window.close();
                break;
              case '/vk/':
                window.opener.setVkCode(code);
                window.close();
                break;
              case '/google/':
                window.opener.setGoogleCode(code);
                window.close();
                break;
            }
          }
          console.error(err);
        }
        setUserLoaded(true);
      }
      onLoad();
    },
    [], // eslint-disable-line
  );

  const loadEvents = useCallback(
    async () => {
      const { data } = await getEvents();
      dispatch({
        type: UserActionType.EVENTS_LOADED_ACTION,
        payload: data.map((d: string) => JSON.parse(d)),
      });
    },
    [],
  );

  useEffect(
    () => {
      let expired = false;
      let init = false;
      let connection:  any;
      const onLoad = async () => {
        connection = await connectWS(user ? user.id : undefined);
        init = true;
        if (expired) {
          disconnectWS();
        } else if (connection) {
          connection.on('NewEvent', loadEvents);
        }
      }
      onLoad();
      return () => {
        if (init) {
          disconnectWS();
          if (connection) {
            connection.off('NewEvent', loadEvents);
          }
        }
        expired = true;
      }
    },
    [user],
  );

  

  useEffect(
    () => {
      if (user) {
        loadEvents();
      }
    },
    [user],
  );

  return (
    <ErrorBoundary>
      <Helmet>
        <title>Projects & protocols repository</title>
      </Helmet>
      <div className={s.wrapper}>
        {userLoaded ? (
          <>
            <Header />
            <div className={s.content}>
              <Switch>
                <Route path="/" exact component={Home} />
                <Route path="/create-project" exact component={CreateProject} />
                <Route path="/my-projects" exact component={MyProjects} />
                <Route path="/account" exact component={Account} />
                <Route path="/account/edit" exact component={AccountEdit} />
                <Route path="/users/:id" exact component={UserPage} />
                <Route path="/project/:id" component={ProjectDetail} />
                <Route path="/confirm-success" exact component={ConfirmSuccess} />
                <Route path="/reset-password" exact component={ResetPassword} />
                <Route path="/agreement" exact component={Agreement} />
                <Route path="/search" exact component={Search} />
              </Switch>
            </div>
            <Footer />
          </>
        ) : (
          <div className="spinner overlay-spinner" />
        )}
        {loginShowed && (
          <LoginForm 
            onSave={(data) => {
              dispatch({ 
                type: UserActionType.LOAD_USER_ACTION, 
                payload: User.FromResponse(data),
              });
              dispatch({ type: UserActionType.LOGIN_VISIBILITY_ACTION, payload: false });
            }} 
            onClose={() => dispatch({ type: UserActionType.LOGIN_VISIBILITY_ACTION, payload: false })}
          />
        )}

        {registerShowed && (
          <RegisterForm 
            onClose={() => dispatch({ type: UserActionType.REGISTER_VISIBILITY_ACTION, payload: false })}
          />
        )}

        {forgetPasswordShowed && (
          <ForgetPasswordForm
            onClose={() => dispatch({ type: UserActionType.FORGET_PASSWORD_VISIBILITY_ACTION, payload: false })}
          />
        )}
        
      </div>
      <ContentField 
          value={[]}
          className="hidden"
          onChange={(data, html) => {

          }}
        />
    </ErrorBoundary>
  );
}

export default App;
