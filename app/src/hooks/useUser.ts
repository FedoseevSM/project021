import { useSelector } from 'react-redux';
import { AppState } from 'store';

export default function useUser() {  
  const { user, loginShowed, registerShowed, forgetPasswordShowed, events } = useSelector((s: AppState) => s.user);
  return { user, loginShowed, registerShowed, forgetPasswordShowed, events }
}