import { useEffect, useMemo, useState } from "react";
import {
  getDatabase,
  subscribeDatabase,
} from "../services/storage.js";

const hasSupabaseEnvironment = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function usePediData() {
  const [database, setDatabase] = useState(() => getDatabase());

  useEffect(() => {
    let active = true;
    const unsubscribe = subscribeDatabase((localDatabase) => {
      setDatabase((current) => ({
        ...localDatabase,
        stores: hasSupabaseEnvironment ? current.stores : localDatabase.stores,
      }));
    });

    if (hasSupabaseEnvironment) {
      import("../services/database.js")
        .then(({ getStores }) => getStores())
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
