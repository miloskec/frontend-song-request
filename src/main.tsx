import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { appRouter } from '@/app/routes';
import '@/styles/tokens.css';
import '@/styles/global.css';
import '@/styles/ui.css';
import '@/styles/app-shell.css';
import '@/styles/dj-modern.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={appRouter} />
  </React.StrictMode>,
);
