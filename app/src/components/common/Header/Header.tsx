import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import cx from 'classnames';
import MenuIcon from '@material-ui/icons/Menu';
import useUser from 'hooks/useUser';
import { useDispatch } from 'react-redux';
import { UserActionType } from 'store';
import Tooltip from '@material-ui/core/Tooltip';
import { staticBase } from 'helpers/constants';
import { readEvent } from 'api/user';

import { ReactComponent as Logo } from 'icons/logo.svg';
import { ReactComponent as Bell } from 'icons/bell.svg';
import { ReactComponent as Folder } from 'icons/folder.svg';
import { ReactComponent as Search } from 'icons/search.svg';

import s from './Header.module.scss';

export default function HeaderCmp() {
  const dispatch = useDispatch();
  const { user, events } = useUser();
  const [displayMenu, setDisplayMenu] = useState(false);
  const [notificationShowed, setNotificationShowed] = useState(false);
  const history = useHistory();
  const eventsListRef = useRef<any>(null);
  const [search, setSearch] = useState('');

  const location = useLocation();

  useEffect(
    () => {
      document.addEventListener('click', e => {
        if (eventsListRef.current && eventsListRef.current.contains(e.target)) {
          return;
        }
        setNotificationShowed(false);
      })
    },
    []
  );

  useEffect(() => {
    setDisplayMenu(false);
  }, [location]);

  const onLogin = useCallback(
    () => {
      dispatch({ type: UserActionType.LOGIN_VISIBILITY_ACTION, payload: true })
    },
    [], // eslint-disable-line
  );

  useEffect(
    () => {
      setNotificationShowed(false);
    },
    [user]
  );

  useEffect(
    () => {
      if (!displayMenu) {
        document.body.classList.remove(s.withMenu);
      } else {
        document.body.classList.add(s.withMenu);
      }
    },
    [displayMenu]
  )


  return (
    <div className={s.container} area-label="Project 021">
      <div className={cx('content', s.inner)}>
        <div className={s.left}>
          <MenuIcon
            className={s.menuIcon}
            onClick={() => setDisplayMenu(!displayMenu)}
          />
          <Link to="/">
            <Logo className={s.logo} />
          </Link>
          <div className={s.links}>
            <Link to="/create-project" className={cx(s.link, s.authLink)}>
              Создать
            </Link>
          </div>
          <span ></span>
        </div>
        <div className={s.right}>
          <form
            className={s.search}
            onSubmit={e => {
              e.preventDefault();
              history.push(`/search?q=${search}`);
              setSearch('');
            }}
          >
            <input value={search} onChange={e => setSearch(e.target.value.substring(0, 100))} placeholder="поиск..." />
            <button type="submit" disabled={search.trim().length === 0}>
              <Search />
            </button>
          </form>
          {user ? (
            <div className={s.auth}>
              <div className={s.authIcon} ref={eventsListRef} onClick={() => setNotificationShowed(!notificationShowed)}>
                <Tooltip classes={{ tooltip: 'tooltip' }} title="Уведомления">
                  <Bell />
                </Tooltip>
                {events && (events.filter(n => !n.read).length > 0 && <div className={s.authIconCount} />)}

                {notificationShowed && events && (
                  <div className={s.notifications} onClick={e => e.stopPropagation()}>
                  <div className={s.notificationsListTitle}>Уведомления</div>
                    {events.length === 0 && (
                      <div className={s.notificationsEmpty}>Нет уведомлений</div>
                    )}
                    {events.length > 0 && (
                      <div className={s.notificationsList}>
                        {[...events].reverse().map(n => {
                          let link = '';
                          console.log(n);
                          if (n.type === 'comment') {
                            link = `/project/${n.meta.projectId.$numberInt}${n.meta.pageId ? `/${n.meta.pageId.$numberInt}` : ``}#comment${n.meta.comment.id.$numberInt}`;
                          }

                          if (n.type === 'newRequest') {
                            link = `/project/${n.meta.projectId.$numberInt}`;
                          }

                          if (n.type === 'newFollower') {
                            link = `/project/${n.meta.projectId.$numberInt}`;
                          }
                          if (n.type === 'likeComment') {
                            link = `/project/${n.meta.projectId.$numberInt}${n.meta.pageId ? `/${n.meta.pageId.$numberInt}` : ``}#comment${n.meta.comment.id.$numberInt}`;
                          }
                          if (n.type === 'likeProject') {
                            link = `/project/${n.meta.projectId.$numberInt}`;
                          }
                          if (n.type === 'editPage') {
                            link = `/project/${n.meta.projectId.$numberInt}/${n.meta.pageId.$numberInt}/edit`;
                          }
                          return (
                            <div 
                              key={n._id.$oid}
                              className={cx(s.notification, { [s.unreadNotification]: !n.read })}
                              onClick={() => {
                                setNotificationShowed(false);
                                history.push(link);
                              }}
                              onMouseEnter={async () => {
                                if (n.read) {
                                  return;
                                }
                                try {
                                  await readEvent(n._id.$oid);
                                  dispatch({
                                    type: UserActionType.EVENT_READ_ACTION,
                                    payload: n,
                                  });
                                } catch (err) {
                                  console.error(err)
                                }
                              }}
                            >
                              {n.type === 'comment' && (
                                <><b>{n.meta.user.name}</b> оставил комментарий{n.meta.projectName ? <> в проекте <b>{n.meta.projectName}</b></> : ''}</>
                              )}
                              {n.type === 'newRequest' && (
                                <><b>{n.meta.user.name}</b> отправил заявку{n.meta.projectName ? <> в проект <b>{n.meta.projectName}</b></> : ''}</>
                              )}
                              {n.type === 'newFollower' && (
                                <><b>{n.meta.user.name}</b> подписался{n.meta.projectName ? <> на проекте <b>{n.meta.projectName}</b></> : ''}</>
                              )}
                              {n.type === 'likeComment' && (
                                <><b>{n.meta.user.name}</b> понравился ваш комментарий</>
                              )}
                              {n.type === 'likeProject' && (
                                <><b>{n.meta.user.name}</b> понравился ваш{n.meta.projectName ? <> проект <b>{n.meta.projectName}</b></> : ''}</>
                              )}
                              {n.type === 'editPage' && (
                                <><b>{n.meta.user.name}</b> отредактировал страницу {n.meta.projectName ? <> в проекте <b>{n.meta.projectName}</b></> : ''}</>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
                
              </div>
              <div className={s.authIcon}>
                <Link to="/my-projects">
                  <Tooltip classes={{ tooltip: 'tooltip' }} title="Мои документы">
                    <Folder /> 
                  </Tooltip>
                </Link>
              </div>
              <Link
                to="/account" 
                className={s.user}
                style={{ backgroundImage: user.cover && `url(${user.cover.startsWith('images/') ? `${staticBase}/${user.cover}` : user.cover})` }}
              />
            </div>
          ) : (<span className={s.link} onClick={onLogin}>Войти</span>)}
            
          
        </div>
      </div>
      {displayMenu && (
        <>
          <div className={s.overlay} onClick={() => setDisplayMenu(false)} />
          <div className={cx(s.menu, { [s.hidden]: !displayMenu })}>
            <Link to="/">
              <Logo className={s.logo} />
            </Link>
            <form
              className={s.search}
              onSubmit={e => {
                e.preventDefault();
                history.push(`/search?q=${search}`);
                setSearch('');
              }}
            >
              <input value={search} onChange={e => setSearch(e.target.value.substring(0, 100))} placeholder="поиск..." />
              <button type="submit" disabled={search.trim().length === 0}>
                <Search />
              </button>
            </form>
            <ul>
              <li className={s.menuRow}>
                <Link to="/create-project" className={cx(s.link, s.authLink)}>
                  Создать
                </Link>
              </li>
              <li className={s.menuRow}>
                <Link to="/my-projects" className={cx(s.link, s.authLink)}>
                  Mои документы
                </Link>
              </li>
              
              
            </ul>
          </div>
        </>
      )}
    </div>
  );
}