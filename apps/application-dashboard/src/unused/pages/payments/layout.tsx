import PaymentsHome from '@/unused/modules/payments/PaymentsHome';

export default function PaymentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PaymentsHome />
      {children}
    </>
  );
}
