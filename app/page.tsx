import { Landing } from "@/components/site/landing";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export default function Home() {
  return (
    <div className="grain min-h-screen">
      <SiteHeader />
      <main>
        <Landing />
      </main>
      <SiteFooter />
    </div>
  );
}
