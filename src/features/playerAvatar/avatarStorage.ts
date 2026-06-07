import { normalizePlayerAvatarId, type PlayerAvatarId } from "./avatarOptions";

const globalAvatarKey = "levelcrafter:player-avatar";

export function getAvatarStorageKey(userId: string | null | undefined) {
  return userId ? `${globalAvatarKey}:${userId}` : globalAvatarKey;
}

export function readStoredPlayerAvatar(userId?: string | null): PlayerAvatarId {
  const stored =
    window.localStorage.getItem(getAvatarStorageKey(userId)) ??
    window.localStorage.getItem(globalAvatarKey);

  return normalizePlayerAvatarId(stored);
}

export function writeStoredPlayerAvatar(userId: string | null | undefined, avatarId: PlayerAvatarId) {
  window.localStorage.setItem(getAvatarStorageKey(userId), avatarId);

  if (!userId) {
    window.localStorage.setItem(globalAvatarKey, avatarId);
  }

  window.dispatchEvent(
    new CustomEvent("levelcrafter:player-avatar-change", {
      detail: {
        userId,
        avatarId,
      },
    }),
  );
}
