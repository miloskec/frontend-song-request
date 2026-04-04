import type { PropsWithChildren } from 'react';

interface ScreenProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
  className?: string;
}

export function Screen({ title, subtitle, children, className }: ScreenProps) {
  return (
    <section className={`screen ${className ?? ''}`.trim()}>
      <div className="screen__heading">
        <h1 className="screen__title">{title}</h1>
        {subtitle ? <p className="screen__subtitle">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}
