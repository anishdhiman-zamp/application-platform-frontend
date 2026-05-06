import {
  buildAgentPanelClosePath,
  buildFilePanelClosePath,
  buildTaskPanelClosePath,
} from '@/modules/pace/components/page-side-panel/page-side-panel.utils';

describe('page-side-panel utils', () => {
  it('removes only agent drawer params', () => {
    expect(
      buildAgentPanelClosePath('/chat/agents', 'a=agent-1&title=Agent&description=Test&avatarKey=agent_1&keep=1'),
    ).toBe('/chat/agents?keep=1');
  });

  it('removes task detail params while preserving conversation scope', () => {
    expect(
      buildTaskPanelClosePath(
        '/chat/task',
        't=task-1&s=conversation-1&title=Task&status=completed&currentIndex=1&totalRows=2&referrer=tasks',
      ),
    ).toBe('/chat/task?s=conversation-1');
  });

  it('removes only the file preview param', () => {
    expect(buildFilePanelClosePath('/chat/files', 'f=docs%2Freadme.md&sort=name')).toBe('/chat/files?sort=name');
  });
});
