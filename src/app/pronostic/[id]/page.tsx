import { supabase } from '@/lib/supabase';
import PronosticDetail from './PronosticDetail';

export async function generateStaticParams() {
  const { data } = await supabase.from('pronostics').select('id');
  if (!data || data.length === 0) {
    return [{ id: '1' }];
  }
  return data.map((p: { id: number }) => ({ id: String(p.id) }));
}

export default async function PronosticPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PronosticDetail pronosticId={id} />;
}
