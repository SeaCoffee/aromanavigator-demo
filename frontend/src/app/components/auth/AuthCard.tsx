import type { ReactNode } from 'react';

import { authStyles as styles } from '@/app/components/auth/auth.styles';

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function AuthCard({ title, description, children }: Props) {
  return (
    <main className={styles.page}>
      <div className={styles.cardPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>

        {description ? (
          <p className={styles.description}>
            {description}
          </p>
        ) : null}
      </div>

      {children}
      </div>
    </main>
  );
}
