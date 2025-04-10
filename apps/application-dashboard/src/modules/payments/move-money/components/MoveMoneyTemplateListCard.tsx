import { FC } from 'react';
import { COLORS } from 'constants/colors';
import { MASK_DOTS } from 'modules/payments/payments.constant';
import { TemplateDetailsType } from 'modules/payments/payments.types';
import { Tooltip, TooltipPositions } from 'components/common/tooltip';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

interface MoveMoneyTemplateListCardProps {
  template: TemplateDetailsType;
  onSelect: (template: TemplateDetailsType) => void;
}

const MoveMoneyTemplateListCard: FC<MoveMoneyTemplateListCardProps> = ({ template, onSelect }) => {
  return (
    <Tooltip
      position={TooltipPositions.RIGHT}
      wrapperStyle='!bg-white ml-2 border border-GRAY_400 !p-0 rounded-md'
      tooltipBodyClassName='!px-2.5 !py-2'
      className='!-ml-1'
      color={COLORS.WHITE}
      tooltipBody={
        <div className='flex flex-col gap-3 min-w-[185px]'>
          <div>
            <div className='f-11-400 text-GRAY_700 mb-0.5'>Source Account</div>
            <div className='f-12-500 text-GRAY_950'>{`${template?.details?.[0]?.source_account?.account_name}  ${MASK_DOTS} ${template?.details?.[0]?.source_account?.account_number.slice(-4)}`}</div>
          </div>
          <div>
            <div className='f-11-400 text-GRAY_700 mb-0.5'>Recipient</div>
            <div className='f-12-500 text-GRAY_950'>{template?.created_by}</div>
          </div>
          <div>
            <div className='f-11-400 text-GRAY_700 mb-0.5'>Recipient Account</div>
            <div className='f-12-500 text-GRAY_950'>{`${template?.details?.[0]?.beneficiary_account?.account_name}  ${MASK_DOTS} ${template?.details?.[0]?.beneficiary_account?.account_number.slice(-4)}`}</div>
          </div>
          <div className='f-11-400 text-GRAY_800 pt-1.5 border-t border-GRAY_400'>
            Created by {template?.created_by}
          </div>
        </div>
      }
    >
      <div
        onClick={() => onSelect(template)}
        className='flex items-center gap-1.5 text-GRAY_900 px-2.5 py-2 rounded-md hover:bg-GRAY_100 cursor-pointer'
      >
        <SvgSpriteLoader id='file-06' size={14} />
        <div className='f-12-500 text-GRAY_950 grow'>{template?.name}</div>
        <SvgSpriteLoader id='send-03' size={14} />
      </div>
    </Tooltip>
  );
};

export default MoveMoneyTemplateListCard;
