import Navigation from "ecfr-analyzer/components/Navigation";
import { ReactNode } from "react";
import Footer from "ecfr-analyzer/components/Footer";

export default function PageContainer({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <Navigation title={title} />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
