import { authStyles as styles } from '@/app/components/auth/auth.styles';
import type { ActionMessage } from '@/app/types/authTypes';
import { formatActionMessage } from '@/app/utils/messageUtils';

type Props = {
  message?: ActionMessage;
  ok?: boolean;
};

export default function FormMessage({ message, ok = false }: Props) {
  if (!message) return null;

  return (
    <div className={ok ? styles.messageSuccess : styles.messageError}>
      {formatActionMessage(message, 'РџРµСЂРµРІС–СЂС‚Рµ РїРѕР»СЏ С„РѕСЂРјРё.')}
    </div>
  );
}
