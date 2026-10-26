import { AppRoutes } from './routes/AppRoutes';
import { WorkspaceProvider } from './contexts/WorkspaceContext';

export default function App() {
  return <WorkspaceProvider><AppRoutes /></WorkspaceProvider>;
}
