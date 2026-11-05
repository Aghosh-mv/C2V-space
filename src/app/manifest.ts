import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'C2V space — code that becomes video',
    short_name: 'C2V space',
    description:
      'Write plain-word code; the compiler films it into a real video. SceneLang for scenes, StyleKit for looks, a Learner library and a Marketplace.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f6fa',
    theme_color: '#f7f6fa',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  };
}
