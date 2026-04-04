interface StateBlockProps {
  kind: 'loading' | 'empty' | 'error' | 'success';
  title: string;
  description?: string;
}

export function StateBlock({ kind, title, description }: StateBlockProps) {
  return (
    <div className={`state-block state-block--${kind}`}>
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
