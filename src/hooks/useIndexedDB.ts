import React from "react";
import { dbService } from "@/services/dbService";

export function useIndexedDB() {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function initializeDB() {
      try {
        await dbService.init();
        setIsInitialized(true);
      } catch (err) {
        console.error("Failed to initialize IndexedDB:", err);
        setError(
          err instanceof Error ? err.message : "Database initialization failed"
        );
      }
    }

    initializeDB();
  }, []);

  return { isInitialized, error };
}
