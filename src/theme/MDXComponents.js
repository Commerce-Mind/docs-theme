import MDXComponents from '@theme-init/MDXComponents';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import { ApiEndpoint, Badge, Card, CardGrid, Hero, Steps } from '../components';

// Available in every .mdx file without imports.
export default {
  ...MDXComponents,
  ApiEndpoint,
  Badge,
  Card,
  CardGrid,
  Hero,
  Steps,
  Tabs,
  TabItem,
};
