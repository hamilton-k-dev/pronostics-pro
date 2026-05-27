import MatchDetail from './MatchDetail';

export async function generateStaticParams() {
  return [{ id: '99' }];
}

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MatchDetail matchId={id} />;
}
