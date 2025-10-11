import OrgMembershipPending from 'modules/login/OrgMembershipPending';

const MembershipPendingPage = () => {
  return (
    <div className='fixed inset-0 h-screen w-screen bg-white'>
      <OrgMembershipPending />
    </div>
  );
};

export default MembershipPendingPage;
