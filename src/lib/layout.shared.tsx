import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { ArrowLeft } from 'lucide-react';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <ArrowLeft/>,
    },
  };
}