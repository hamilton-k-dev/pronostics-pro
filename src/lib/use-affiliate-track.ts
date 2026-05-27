import { supabase } from './supabase';

export async function trackAffiliateClick(
  bookmakerName: string,
  options?: { sourcePage?: string; userId?: string; pronosticId?: number }
) {
  try {
    await supabase.from('affiliate_clicks').insert({
      bookmaker_name: bookmakerName,
      source_page: options?.sourcePage || window.location.pathname,
      user_id: options?.userId || null,
      pronostic_id: options?.pronosticId || null,
    });
  } catch {
    // Silently fail - tracking shouldn't block user
  }
}
