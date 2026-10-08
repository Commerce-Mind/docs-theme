import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import styles from './components.module.css';

/** Grid of <Card>s. */
export function CardGrid({ children }) {
  return <div className={styles.cardGrid}>{children}</div>;
}

/** A card. With `href` the whole card is a link. */
export function Card({ title, href, children }) {
  const content = (
    <>
      <span className={styles.cardIcon} aria-hidden="true" />
      <span className={styles.cardTitle}>
        {title}
        {href && (
          <span className={styles.cardArrow} aria-hidden="true">
            →
          </span>
        )}
      </span>
      {children && <div className={styles.cardBody}>{children}</div>}
    </>
  );
  return href ? (
    <Link to={href} className={clsx(styles.card, 'card-link')}>
      {content}
    </Link>
  ) : (
    <div className={styles.card}>{content}</div>
  );
}

/** Wrap a Markdown ordered list to render it as numbered steps. */
export function Steps({ children }) {
  return <div className={styles.steps}>{children}</div>;
}

/** Small label: <Badge>New</Badge>, <Badge type="beta">Beta</Badge>. */
export function Badge({ type = 'default', children }) {
  return <span className={clsx(styles.badge, styles[`badge_${type}`])}>{children}</span>;
}

/** HTTP endpoint header: <ApiEndpoint method="GET" path="/api/products/{id}" />. */
export function ApiEndpoint({ method = 'GET', path, children }) {
  const m = method.toUpperCase();
  return (
    <div className={styles.endpoint}>
      <span className={clsx(styles.method, styles[`method_${m.toLowerCase()}`])}>{m}</span>
      <span className={styles.endpointPath}>{path}</span>
      {children && <span className={styles.endpointDescription}>{children}</span>}
    </div>
  );
}

/** Landing page header. */
export function Hero({ eyebrow, title, children, actions = [] }) {
  return (
    <header className={styles.hero}>
      {eyebrow && <div className={styles.heroEyebrow}>{eyebrow}</div>}
      <h1 className={styles.heroTitle}>{title}</h1>
      {children && <div className={styles.heroLead}>{children}</div>}
      {actions.length > 0 && (
        <div className={styles.heroActions}>
          {actions.map((a, i) => (
            <Link
              key={a.href}
              to={a.href}
              className={clsx('button', i === 0 ? 'button--primary' : 'button--secondary', 'button--lg')}
            >
              {a.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
