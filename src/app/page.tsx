import HeroSearch from '@/components/HeroSearch';
import FeaturedPronostics from '@/components/FeaturedPronostics';
import RecentScores from '@/components/RecentScores';
import LoginCTA from '@/components/LoginCTA';
import HelpSection from '@/components/HelpSection';

export default function Home() {
  return (
    <>
      <HeroSearch />
      <FeaturedPronostics />
      <RecentScores />
      <LoginCTA />
      <HelpSection />
    </>
  );
}
