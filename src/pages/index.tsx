import { useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useSeriesWithLatestChapters, useFeaturedSeries } from "@/hooks/useSeriesWithLatestChapters";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { LatestUpdateCard } from "@/components/home/LatestUpdateCard";
import { PopularSidebar } from "@/components/home/PopularSidebar";
import { JoinUsCard } from "@/components/home/JoinUsCard";
import { SEO } from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";
import { AdBanner } from "@/components/ads/AdBanner";
import { SidebarAd } from "@/components/ads/SidebarAd";

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: featuredData, isLoading: isFeaturedLoading } = useFeaturedSeries();
  const { data: latestSeriesData, isLoading: isLatestLoading } = useSeriesWithLatestChapters(12);

  useEffect(() => {
    if (searchParams.get("access") === "bntoonadmin") {
      navigate("/admin");
    }
  }, [searchParams, navigate]);

  return (
    <Layout>
      <SEO />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              {isFeaturedLoading ? (
                <Skeleton className="h-40 w-full mb-6" />
              ) : (
                <FeaturedSection series={featuredData || []} />
              )}

              {/* Banner Ad */}
              <AdBanner className="my-6" />

              <section>
                <div className="flex justify-between mb-5">
                  <h2 className="text-xl font-bold">Latest Updates</h2>
                  <Link to="/browse" className="text-sm text-muted-foreground">
                    VIEW ALL <ChevronRight className="inline h-4 w-4" />
                  </Link>
                </div>

                {isLatestLoading ? (
                  <Skeleton className="h-40 w-full" />
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {(latestSeriesData || []).map((s) => (
                      <LatestUpdateCard key={s.id} {...s} />
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="space-y-6">
              <PopularSidebar />

              {/* Sidebar Native Ad */}
              <SidebarAd
                containerId="sidebar-ad-home"
                scriptUrl="https://openairtowhardworking.com/c35c6f6f42ee902bbfca715ccd1d497f/invoke.js"
              />

              <JoinUsCard />
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Index;
