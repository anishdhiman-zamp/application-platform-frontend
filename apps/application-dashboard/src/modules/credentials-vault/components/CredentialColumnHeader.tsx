import { CREDENTIAL_COLUMN_LABELS } from '@/modules/credentials-vault/constants/credentials-vault.constants';

const CredentialColumnHeader = () => (
  <div className='border-GRAY_400 flex items-center border-b py-3.5'>
    <span className='f-11-450 text-GRAY_700 min-w-0 flex-1 pr-4'>{CREDENTIAL_COLUMN_LABELS.KEY_NAME}</span>
    <span className='f-11-450 text-GRAY_700 min-w-0 flex-1'>{CREDENTIAL_COLUMN_LABELS.KEY_VALUE}</span>
  </div>
);

export default CredentialColumnHeader;
