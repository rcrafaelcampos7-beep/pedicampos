import { useEffect, useMemo, useState } from "react";
import { getDatabase, subscribeDatabase } from "../services/storage.js";

export function usePediData() {
  const [database, setDatabase] = useState(() => getDatabase());

  useEffect(() => subscribeDatabase(setDatabase), []);

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
