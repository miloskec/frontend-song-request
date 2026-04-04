import type { PropsWithChildren } from 'react';

interface CardProps extends PropsWithChildren {
  heading?: string;
  elevated?: boolean;
  className?: string;
}

export function Card({ heading, children, elevated = false, className }: CardProps) {
  return (
    <article className={`card ${elevated ? 'card--elevated' : ''} ${className ?? ''}`.trim()}>
      {heading ? <h2 className="card__heading">{heading}</h2> : null}
      {children}
    </article>
  );
}
