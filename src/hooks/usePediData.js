import { useEffect, useMemo, useState } from "react";
import { getDatabase, getStores, subscribeDatabase } from "../services/database.js";
import { isSupabaseConfigured } from "../services/supabaseClient.js";

export function usePediData() {
  const [database, setDatabase] = useState(() => getDatabase());

  useEffect(() => {
    let active = true;
    const unsubscribe = subscribeDatabase((localDatabase) => {
      setDatabase((current) => ({
        ...localDatabase,
        stores: isSupabaseConfigured ? current.stores : localDatabase.stores,
      }));
    });

    if (isSupabaseConfigured) {
      getStores()
        .then((stores) => {
          if (active) setDatabase((current) => ({ ...current, stores }));
        })
        .catch(() => {
          // Remote store errors remain visible in the dedicated async screens.
        });
    }

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return useMemo(
    () => ({
      database,
      stores: database.stores,
      orders: database.orders,
      platform: database.platform,
    }),
    [database]
  );
}
