'use client';

import React, { useState } from 'react';
import { ActionType, BlockAction, BlockMessage, BlockRenderer, BlockType } from '@zamp-platform/chat';
import { useRouter } from 'next/navigation';

export default function ChatDemoPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const exampleMessage: BlockMessage[] = [
    {
      block: [
        {
          id: 'm_txt_001',
          type: BlockType.PLAIN_TEXT,
          order: 1,
          payload: {
            text: "There is 1 feedback chat that is conflicting with yours, regarding the supplier name for The Guardian Life Insurance of America. Which one should I use? I'll update the other one to remove the conflicting logic.",
          },
        },
        {
          id: 'r_123',
          type: BlockType.QUESTION_GROUP,
          order: 2,
          payload: {
            questions: [
              {
                id: 'q_001',
                type: BlockType.QUESTION,
                order: 1,
                payload: {
                  type: 'plain_text',
                  question:
                    'How do you define a duplicate — is it based on invoice number, vendor + amount, or a combination of fields?',
                },
              },
              {
                id: 'q_002',
                type: BlockType.QUESTION,
                order: 2,
                payload: {
                  type: 'plain_text',
                  question: 'If a duplicate is detected, should I block it automatically or just flag it for review?',
                },
              },
            ],
          },
        },
      ],
    },
    {
      block: [
        {
          id: 'm_txt_001_old',
          type: BlockType.PLAIN_TEXT,
          order: 1,
          payload: {
            text: "There is 1 feedback chat that is conflicting with yours, regarding the supplier name for The Guardian Life Insurance of America. Which one should I use? I'll update the other one to remove the conflicting logic.",
          },
        },
        {
          id: 'r_123_old',
          type: BlockType.SINGLE_SELECT,
          order: 2,
          payload: {
            options: [
              {
                id: 'op_01',
                type: 'markdown',
                label: 'Satabdi\'s feedback says to search for "TGLIA Ltd" on Coupa.',
                value: 'value-0',
              },
              {
                id: 'op_02',
                type: 'markdown',
                label: 'This feedback asks me to use "TGL Ltd" as the supplier name',
                value: 'value-1',
              },
            ],
            initial_value: 'op_02',
            action: {
              type: ActionType.STATE_UPDATE,
            },
          },
        },
        {
          id: 'btn_001',
          type: BlockType.BUTTON,
          order: 3,
          payload: {
            is_disabled: false,
            label: 'Use this',
            value: 'click_me_123',
            action: {
              type: ActionType.INTERNAL_API,
              dependent_elements: ['r_123_old'],
            },
          },
        },
      ],
    },
    {
      block: [
        {
          id: 'm_txt_002',
          type: BlockType.PLAIN_TEXT,
          order: 1,
          payload: {
            text: 'Got it. We have added your feedback to the queue. You can apply it from there.',
          },
        },
        {
          id: 'btn_002',
          type: BlockType.BUTTON,
          order: 2,
          payload: {
            is_disabled: false,
            label: 'Open queue',
            value: 'open_queue',
            action: {
              type: ActionType.REDIRECT,
            },
          },
        },
      ],
    },
  ];

  const handleAction = async (action: BlockAction, payload: Record<string, string>) => {
    setIsLoading(true);

    console.log('Action triggered:', action, action.type === ActionType.REDIRECT);

    if (action.type === ActionType.REDIRECT) {
      router.push('/team');
    }

    try {
      console.log('Action triggered:', action);
      console.log('Payload:', payload);

      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error handling action:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className='flex h-[90vh] flex-col overflow-y-auto bg-gray-50'>
      <div className='border-b border-gray-200 bg-white px-6 py-4 shadow-sm'>
        <h1 className='text-2xl font-semibold text-gray-900'>Chat Renderer Demo</h1>
        <p className='mt-1 text-sm text-gray-500'>Interactive block-based chat message renderer demonstration</p>
      </div>

      <div className='mx-auto max-w-[400px] flex-1 p-6'>
        <div className='mx-auto max-w-4xl space-y-6'>
          <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
            {exampleMessage.map((message, id) => (
              <div key={id}>
                <div className='flex gap-2.5 px-3 pt-4'>
                  <div className='f-12-500 flex h-5 min-w-[20px] items-center justify-center rounded bg-blue-600 text-white'>
                    P
                  </div>
                  <div>
                    <div className='mt-0.5 mb-2 flex items-center gap-2'>
                      <div className='f-12-500 font-medium text-gray-900'>Pace Assistant</div>
                      <div className='f-11-450 text-gray-700'>2m ago</div>
                    </div>
                    <BlockRenderer
                      message={message}
                      onAction={handleAction}
                      isLoading={isLoading}
                      className='border-none shadow-none'
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
