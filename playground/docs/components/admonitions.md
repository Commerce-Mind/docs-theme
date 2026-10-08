---
title: Admonitions
description: Notes, tips, info, warnings and danger boxes.
sidebar_position: 2
---

Admonitions are standard Docusaurus Markdown, so they work in both `.md` and `.mdx` files.

:::note

A note. Use for related information that isn't essential.

:::

:::tip

A tip. A better or faster way to do something.

:::

:::info

Info. Background or context the reader should know.

:::

:::warning

A warning. Something that can go wrong if the reader isn't careful. This box is amber-brown on
purpose, so it never looks like a yellow product accent.

:::

:::danger

Danger. Data loss, security issues or breaking changes.

:::

:::tip[Custom title]

Any admonition can have its own title.

:::

```md
:::warning[Custom title]

Text.

:::
```

<details>
  <summary>A collapsible section</summary>

Use `<details>` for long content that most readers can skip.

</details>
