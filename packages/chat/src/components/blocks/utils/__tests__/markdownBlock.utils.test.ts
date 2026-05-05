import { stripIntegrationConnectLinks } from '../markdownBlock.utils';

describe('stripIntegrationConnectLinks', () => {
  it('strips a pointer-prefixed connect link on its own line', () => {
    expect(stripIntegrationConnectLinks('👉 [Connect Slack](https://slack.com/oauth)')).toBe('');
  });

  it('strips a connect link without the pointer emoji', () => {
    expect(stripIntegrationConnectLinks('[Connect Gmail](https://gmail.example/oauth)')).toBe('');
  });

  it('strips the connect line and leaves surrounding paragraphs intact', () => {
    const input = [
      'No Slack connection exists yet.',
      '',
      '👉 [Connect Slack](https://slack.example/oauth)',
      '',
      "Once connected, I'll create the agent.",
    ].join('\n');
    expect(stripIntegrationConnectLinks(input)).toBe(
      ['No Slack connection exists yet.', '', "Once connected, I'll create the agent."].join('\n'),
    );
  });

  it('strips multiple connect links across the message', () => {
    const input = '👉 [Connect Slack](https://a)\nMiddle\n[Connect Gmail](https://b)';
    expect(stripIntegrationConnectLinks(input)).toBe('Middle');
  });

  it('leaves unrelated markdown links untouched', () => {
    const input = 'Read the [docs](https://example.com/docs).';
    expect(stripIntegrationConnectLinks(input)).toBe(input);
  });

  it('does not strip a parenthetical [Connect](url) without an integration label', () => {
    const input = 'Press [Connect](https://example.com) to continue.';
    expect(stripIntegrationConnectLinks(input)).toBe(input);
  });

  it('returns empty input unchanged', () => {
    expect(stripIntegrationConnectLinks('')).toBe('');
  });

  it('handles undefined-like input safely', () => {
    expect(stripIntegrationConnectLinks(undefined as unknown as string)).toBeFalsy();
  });

  it('matches case-insensitively', () => {
    expect(stripIntegrationConnectLinks('[connect notion](https://notion.example)')).toBe('');
  });

  it('collapses excess blank lines left behind', () => {
    const input = ['Hello.', '', '', '👉 [Connect Slack](https://x)', '', '', 'Goodbye.'].join('\n');
    expect(stripIntegrationConnectLinks(input)).toBe(['Hello.', '', 'Goodbye.'].join('\n'));
  });
});
