import SubscriptionToggleButton from '@/app/components/social/SubscriptionToggleButton';
import { getTargetSubscriptionServer } from '@/app/services/socialServices.server';
import type { SubscriptionTarget } from '@/app/types/socialTypes';

type Props = {
  target: SubscriptionTarget;
  disabled?: boolean;
  currentPath?: string | null;
  buttonClassName?: string;
  messageClassName?: string;
};

export default async function SubscriptionToggle({
  target,
  disabled = false,
  currentPath = null,
  buttonClassName,
  messageClassName,
}: Props) {
  const subscription = await getTargetSubscriptionServer(target);

  return (
    <SubscriptionToggleButton
      target={target}
      initialIsSubscribed={Boolean(subscription)}
      disabled={disabled}
      currentPath={currentPath}
      buttonClassName={buttonClassName}
      messageClassName={messageClassName}
    />
  );
}
