import { useCallback, useSyncExternalStore } from "react";
import { useAuth } from "../../context/AuthContext";
import { readStoredPlayerAvatar } from "./avatarStorage";

export function usePlayerAvatar() {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;

  const subscribe = useCallback((onStoreChange: () => void) => {
    window.addEventListener("storage", onStoreChange);
    window.addEventListener("levelcrafter:player-avatar-change", onStoreChange);

    return () => {
      window.removeEventListener("storage", onStoreChange);
      window.removeEventListener("levelcrafter:player-avatar-change", onStoreChange);
    };
  }, []);

  const getSnapshot = useCallback(() => readStoredPlayerAvatar(userId), [userId]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
