import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dinax',
    short_name: 'Dinax',
    description: 'Personalized fitness coaching powered by AI.',
    start_url: '/login',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      // === Logo de Dinax PWA ===
      // DEBES agregar estas dos imágenes en la carpeta /public/icons/
      // para que el logo aparezca perfectamente al instalar en celular:
      // 1. Un logo de 192x192 pixeles PNG
      // 2. Un logo de 512x512 pixeles PNG
      {
        src: '/icons/dinax-logo-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/dinax-logo-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
