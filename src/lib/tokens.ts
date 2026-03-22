import { createClient } from '@/lib/supabase/server';
import { TOKEN_COSTS } from './utils';
import { DocumentType } from '@/types';

export async function getTokenBalance(userId: string): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('tokens')
    .select('balance')
    .eq('user_id', userId)
    .single();
  return data?.balance ?? 0;
}

export async function deductTokens(
  userId: string,
  docType: DocumentType
): Promise<{ success: boolean; balance: number }> {
  const supabase = await createClient();
  const cost = TOKEN_COSTS[docType] ?? 2;

  const { data: tokenData } = await supabase
    .from('tokens')
    .select('balance')
    .eq('user_id', userId)
    .single();

  if (!tokenData || tokenData.balance < cost) {
    return { success: false, balance: tokenData?.balance ?? 0 };
  }

  const newBalance = tokenData.balance - cost;
  await supabase
    .from('tokens')
    .update({ balance: newBalance, total_used: supabase.rpc('increment', { x: cost }) })
    .eq('user_id', userId);

  return { success: true, balance: newBalance };
}

export async function ensureTokenRecord(userId: string): Promise<void> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('tokens')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!data) {
    await supabase.from('tokens').insert({
      user_id: userId,
      balance: 10, // free tier
      total_used: 0,
    });
  }
}
