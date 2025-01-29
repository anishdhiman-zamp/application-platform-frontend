import React, { FC } from 'react';
import { COLORS } from 'constants/colors';
import { DATASET_ACCESS_PRIVILEGES_LIST } from 'modules/data/data.constants';
import { PageAccessToAudiencesPropsType } from 'modules/page/pages.types';
import Avatar from 'components/common/avatar';

const PageAccessToAudiences: FC<PageAccessToAudiencesPropsType> = ({ name, resource_type, privilege }) => {
  const role = DATASET_ACCESS_PRIVILEGES_LIST.find((role) => role.value === privilege);

  return (
    <div className='f-12-400 py-3 px-2 bg-white flex justify-between items-start'>
      <div className='flex items-start justify-start gap-x-1 w-[120px]'>
        {!!name && (
          <>
            <div className='w-fit'>
              <Avatar
                name={name}
                backgroundColor={COLORS.GRAY_1000}
                className='w-4 h-4 rounded-full text-white f-8-400 flex items-center justify-center'
              />
            </div>
            <span>{name}</span>
          </>
        )}
      </div>
      <span className='container-start-90'>{resource_type}</span>
      <span className='container-start-90'>{role?.label}</span>
    </div>
  );
};

export default PageAccessToAudiences;
