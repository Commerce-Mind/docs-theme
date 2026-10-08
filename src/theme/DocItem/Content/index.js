import React from 'react';
import Content from '@theme-init/DocItem/Content';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import CopyPage from '../../../components/CopyPage';

export default function ContentWrapper(props) {
  const { metadata, frontMatter } = useDoc();
  return (
    <>
      {!frontMatter.hide_page_actions && (
        <CopyPage permalink={metadata.permalink} title={metadata.title} />
      )}
      <Content {...props} />
    </>
  );
}
