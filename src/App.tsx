import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './routes';

const queryClient = new QueryClient();

// Dummy ToastProvider
const ToastProvider: React.FC<{children: React.ReactNode}> = ({ children }) => <>{children}</>;

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;
