import PaymentsHome from '@/deprecated/modules/payments/PaymentsHome';

export default function PaymentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PaymentsHome />
      {children}
    </>
  );
}
