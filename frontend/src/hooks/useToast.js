import { useContext } from 'react';
import { ToastContext } from '../context/toastContextDef';

export function useToast() {
  return useContext(ToastContext);
}
