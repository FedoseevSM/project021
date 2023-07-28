import React, { useEffect, useState } from 'react';
import { ReactComponent as LogoFacebook } from 'icons/fb.svg';
import { ReactComponent as LogoGoogle } from 'icons/google.svg'
import { ReactComponent as LogoVk } from 'icons/vk.svg'
import { fbCodeListeners, vkCodeListeners, googleCodeListeners } from 'helpers/window';
import { signFb, signVk, signGoogle } from 'api/user';

import s from './SocialAuth.module.scss';

const fbLoginUri = 'https://www.facebook.com/v8.0/dialog/oauth';
const vkLoginUri = 'https://oauth.vk.com/authorize';
const googleLoginUri = 'https://accounts.google.com/o/oauth2/v2/auth';


export default function SocialAuth() {
  const [fbCode, setFbCode] = useState('');
  const [vkCode, setVkCode] = useState('');
  const [googleCode, setGoogleCode] = useState('');
  useEffect(
    () => {
      const listenerFb = (code: string) => {
        setFbCode(code);
      };
      const listenerVk = (code: string) => {
        setVkCode(code);
      };
      const listenerGoogle = (code: string) => {
        setGoogleCode(code);
      };
      fbCodeListeners.push(listenerFb);
      vkCodeListeners.push(listenerVk);
      googleCodeListeners.push(listenerGoogle);
      return () => {
        fbCodeListeners.splice(fbCodeListeners.indexOf(listenerFb), 1);
        vkCodeListeners.splice(vkCodeListeners.indexOf(listenerVk), 1);
        googleCodeListeners.splice(googleCodeListeners.indexOf(listenerGoogle), 1);
      }
    },
    [], // eslint-disable-line
  );

  useEffect(
    () => {
      const load = async () => {
        if (fbCode) {
          try {
            await signFb(fbCode, window.location.origin + '/fb/');
            window.location.reload();
          } catch(err) {
            
          }
        }
      }
      load();
    },
    [fbCode]
  );
  useEffect(
    () => {
      const load = async () => {
        if (vkCode) {
          try {
            await signVk(vkCode, window.location.origin + '/vk/');
            window.location.reload();
          } catch(err) {
            
          }
        }
      }
      load();
    },
    [vkCode]
  );
  useEffect(
    () => {
      const load = async () => {
        if (googleCode) {
          try {
            await signGoogle(googleCode, window.location.origin + '/google/');
            window.location.reload();
          } catch(err) {
            
          }
        }
      }
      load();
    },
    [googleCode]
  );

  const openFbWindow = () => {
    const left = (window.screen.width / 2) - (800 / 2);
    const top = (window.screen.height / 2) - (600 / 2);
    window.open(
      `${fbLoginUri}?client_id=${process.env.REACT_APP_FACEBOOK_APP_ID}&redirect_uri=${window.location.origin}/fb/&scope=email`,
      'Facebook',
      `width=800,height=600,top=${top},left=${left}`,
    );
  }

  const openVkWindow = () => {
    const left = (window.screen.width / 2) - (800 / 2);
    const top = (window.screen.height / 2) - (600 / 2);
    window.open(
      `${vkLoginUri}?client_id=${process.env.REACT_APP_VK_APP_ID}&display=popup&response_type=code&state=reg&redirect_uri=${window.location.origin}/vk/&scope=email`,
      'Vkontakte',
      `width=800,height=600,top=${top},left=${left}`,
    );
  }

  const openGoogleWindow = () => {
    const left = (window.screen.width / 2) - (800 / 2);
    const top = (window.screen.height / 2) - (600 / 2);
    window.open(
      `${googleLoginUri}?client_id=${process.env.REACT_APP_GOOGLE_APP_ID}&response_type=code&redirect_uri=${window.location.origin}/google/&scope=openid%20profile%20email`,
      'Google',
      `width=800,height=600,top=${top},left=${left}`,
    );
  }
  return (
    <div className={s.wrapper}>
      <span 
        onClick={openFbWindow}
        className={s.link}
      >
        <LogoFacebook  className={s.icon} />
      </span>
      <span
        className={s.link}
        onClick={openGoogleWindow}
      >
        <LogoGoogle className={s.icon} />
      </span> 
      <span
        className={s.link}
        onClick={openVkWindow}
      >
        <LogoVk className={s.icon} />
      </span> 
    </div>
  );
}
