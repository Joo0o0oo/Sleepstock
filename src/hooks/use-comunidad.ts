import { useEffect, useMemo } from "react";
import { useSyncExternalStore } from "react";
import {
  getSnapshot,
  getServerSnapshot,
  hydrate,
  subscribe,
  getFeed,
  getMentions,
  getUserPosts,
  getProfile,
  type FeedPost,
  type MockProfile,
} from "@/lib/comunidad-mock";

function useComunidadState() {
  // Hidrata desde localStorage en cliente (idempotente)
  useEffect(() => {
    hydrate();
  }, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useMe(): MockProfile | null {
  const s = useComunidadState();
  return useMemo(
    () => (s.me ? s.profiles[s.me] ?? null : null),
    [s.me, s.profiles],
  );
}

export function useFeed(): FeedPost[] {
  useComunidadState();
  return useMemo(() => getFeed(), [getSnapshotKey()]);
}

export function useMentions(): FeedPost[] {
  useComunidadState();
  return useMemo(() => getMentions(), [getSnapshotKey()]);
}

export function useUserPosts(username: string): FeedPost[] {
  useComunidadState();
  return useMemo(() => getUserPosts(username), [username, getSnapshotKey()]);
}

export function useProfile(username: string): MockProfile | null {
  useComunidadState();
  return useMemo(() => getProfile(username), [username, getSnapshotKey()]);
}

// Clave estable que cambia cuando cambia el state (posts/profiles/me).
function getSnapshotKey() {
  const s = getSnapshot();
  return `${s.me ?? "-"}:${s.posts.length}:${Object.keys(s.profiles).length}:${
    s.posts[0]?.id ?? "-"
  }:${s.posts.reduce((acc, p) => acc + p.likes.length, 0)}`;
}
