import React, { useEffect, useRef, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './components.module.css';

// Mirrors markdownPathFor() in index.js, which writes the .md files at build time.
function markdownPathFor(permalink) {
  const clean = permalink.replace(/^\//, '');
  if (clean === '' || clean.endsWith('/')) return `${clean}index.md`;
  return `${clean}.md`;
}

async function fetchMarkdown(mdUrl) {
  const res = await fetch(mdUrl);
  // Dev server answers unknown paths with the HTML app shell.
  if (!res.ok || (res.headers.get('content-type') ?? '').includes('text/html')) {
    throw new Error('Markdown not available');
  }
  return res.text();
}

/** "Copy page" button with a menu for Markdown view and AI assistants. */
export default function CopyPage({ permalink, title }) {
  const { siteConfig } = useDocusaurusContext();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);

  const siteUrl = siteConfig.url.replace(/\/$/, '');
  const mdPath = `/${markdownPathFor(permalink)}`;
  const mdUrl = `${siteUrl}${mdPath}`;

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  async function copy() {
    let text;
    try {
      text = await fetchMarkdown(mdPath);
    } catch {
      // Dev server has no .md files; fall back to the rendered text.
      text = `# ${title}\n\n${document.querySelector('.theme-doc-markdown')?.innerText ?? ''}`;
    }
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setOpen(false);
    setTimeout(() => setCopied(false), 2000);
  }

  const prompt = encodeURIComponent(
    `Read ${mdUrl} so I can ask questions about it.`,
  );

  return (
    <div className={styles.pageActions} ref={ref}>
      <button type="button" className={styles.pageActionButton} onClick={copy}>
        {copied ? 'Copied' : 'Copy page'}
      </button>
      <button
        type="button"
        className={styles.pageActionButton}
        aria-label="More page actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        ▾
      </button>
      {open && (
        <div className={styles.pageMenu} role="menu">
          <button type="button" role="menuitem" className={styles.pageMenuItem} onClick={copy}>
            Copy page as Markdown
            <span className={styles.pageMenuHint}>For use in LLMs and chats</span>
          </button>
          <a role="menuitem" className={styles.pageMenuItem} href={mdPath} target="_blank" rel="noreferrer">
            View as Markdown
            <span className={styles.pageMenuHint}>Plain text version of this page</span>
          </a>
          <a
            role="menuitem"
            className={styles.pageMenuItem}
            href={`https://claude.ai/new?q=${prompt}`}
            target="_blank"
            rel="noreferrer"
          >
            Open in Claude
            <span className={styles.pageMenuHint}>Ask questions about this page</span>
          </a>
          <a
            role="menuitem"
            className={styles.pageMenuItem}
            href={`https://chatgpt.com/?hints=search&q=${prompt}`}
            target="_blank"
            rel="noreferrer"
          >
            Open in ChatGPT
            <span className={styles.pageMenuHint}>Ask questions about this page</span>
          </a>
        </div>
      )}
    </div>
  );
}
