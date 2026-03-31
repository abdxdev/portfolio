import { getSupabase } from './init';
import { CACHE_TBL } from '@/lib/constants'

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

export async function fetchWithDbCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  shouldRefresh = false
): Promise<T> {
  const supabase = getSupabase();

  // Step 1: Check existing cache
  const { data: cacheData, error } = await supabase
    .from(CACHE_TBL)
    .select('data, updated_at')
    .eq('key', key)
    .single();

  const now = new Date();
  let isCacheValid = false;

  if (cacheData && cacheData.updated_at) {
    const updatedAt = new Date(cacheData.updated_at);
    if (now.getTime() - updatedAt.getTime() < ONE_DAY_MS) {
      isCacheValid = true;
    }
  }

  // Step 2: Return cache if valid and not forcing refresh
  if (isCacheValid && !shouldRefresh) {
    return cacheData!.data as T;
  }

  // Step 3: Try to fetch new data
  try {
    const freshData = await fetchFn();

    // Step 4: Save new data to cache
    await supabase.from(CACHE_TBL).upsert({
      key,
      data: freshData,
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });

    return freshData;
  } catch (error) {
    // Step 5: If API fails, return stale cache if we have it
    if (cacheData) {
      console.warn(`Failed to fetch fresh data for ${key}, falling back to cache.`);
      return cacheData.data as T;
    }
    // No cache to fall back on, throw the error
    throw error;
  }
}
