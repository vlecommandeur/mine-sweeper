import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { Provider } from 'react-redux';
import { worker, seedDataInfo } from './mocks';
import { store } from './store';
import router from './lib/router';
import './index.css';

// Enable MSW in development
if (import.meta.env.DEV) {
  worker.start({
    onUnhandledRequest: 'bypass',
  });

  // Log test credentials to console
  console.group('%c🎮 Mine Sweeper - Test Data', 'color: #6366f1; font-size: 14px; font-weight: bold');
  console.log('%cTest Users:', 'color: #10b981; font-weight: bold');
  seedDataInfo.testUsers.forEach((user: { username: string; password: string }) => {
    console.log(`  ${user.username} / ${user.password}`);
  });
  console.log(`%cDev Token (auto-login as testuser): ${seedDataInfo.devToken}`, 'color: #f59e0b');
  console.groupEnd();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);
