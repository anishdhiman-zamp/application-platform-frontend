import Providers from 'app/_providers/providers';
import { SetupWorkspaceRoot } from '@/modules/setup-workspace/SetupWorkspaceRoot';

const SetupWorkspacePage = () => {
  return (
    <Providers>
      <SetupWorkspaceRoot />
    </Providers>
  );
};

export default SetupWorkspacePage;
