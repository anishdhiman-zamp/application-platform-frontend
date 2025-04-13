import { FC } from 'react';
import { useGetAudiencesByPageIdQuery, usePostPagesToAudiencesByPageIdMutation } from 'apis/pages';
import { pageConfig, ResourceType, ShareResourcePopup } from 'components/common/share-resource';
import { accessPermissionForPage } from 'utils/accessPermission/accessPermission';
import { SharePagePopupPropsType } from 'modules/page/pages.types';

/**
 * SharePagePopup component
 * Wrapper around the shared ShareResourcePopup component with page-specific configuration
 */
const SharePagePopup: FC<SharePagePopupPropsType> = ({ pageId }) => {
  const apiHooks = {
    useGetAudiencesQuery: useGetAudiencesByPageIdQuery,
    usePostShareMutation: usePostPagesToAudiencesByPageIdMutation,
    accessPermissionFn: accessPermissionForPage,
  };

  return (
    <ShareResourcePopup
      resourceId={pageId}
      resourceType={ResourceType.PAGE}
      apiHooks={apiHooks}
      resourceConfig={pageConfig}
    />
  );
};

export default SharePagePopup;
