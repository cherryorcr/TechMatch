import { RouterProvider } from 'react-router-dom';
import { ChatSessionsProvider } from './context/ChatSessionsContext';
import { router } from './router';

export default function App() {
  return (
    <ChatSessionsProvider>
      <RouterProvider router={router} />
    </ChatSessionsProvider>
  );
}
