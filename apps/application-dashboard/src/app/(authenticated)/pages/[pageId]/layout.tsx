interface PageLayoutProps {
  children: React.ReactNode;
  widget: React.ReactNode;
}

const PageLayout = ({ children, widget }: PageLayoutProps) => {
  return (
    <div>
      {widget}
      {children}
    </div>
  );
};

export default PageLayout;
