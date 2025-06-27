import { type FC } from 'react';
import { EmailInputToChips, Input } from '@zamp-platform/ui';
import { SENDER_HEADINGS } from 'modules/process/artifacts/components/email-artifact/EmailEditorArtifact/constants';
import { HeaderProps } from 'modules/process/artifacts/components/email-artifact/EmailEditorArtifact/types';

const Header: FC<HeaderProps> = ({ onChange, value }) => {
  return (
    <>
      <div className='px-4'>
        <table className='f-13-500 border-separate border-spacing-y-3 [&_td]:odd:content-start [&_td]:odd:py-1 [&_td]:odd:pr-1 [&_td]:odd:text-gray-700'>
          <tbody>
            {SENDER_HEADINGS.map((heading) => (
              <tr key={heading.value}>
                <td>{heading.label}</td>
                <td className='w-full'>
                  <EmailInputToChips
                    value={value[heading.value as keyof typeof value] as string[]}
                    onChange={(emails) => onChange(heading.value, emails)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className='border-GRAY_500 flex items-center gap-3 border-y-[0.5px] px-4 py-3'>
        <span className='f-13-500 text-gray-700'>Subject</span>
        <Input
          value={value.heading}
          onChange={(e) => onChange('heading', e.target.value)}
          className='f-14-450 h-5 border-none p-0 focus:ring-0'
          wrapperClassName='flex-1'
        />
      </div>
    </>
  );
};

export default Header;
