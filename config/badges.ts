import { UserProfile } from '../context/ProfileContext';

export interface Badge {
  id: string;
  emoji: string;
  nameKey: string;
  descKey: string;
  unlocked: (profile: UserProfile) => boolean;
}

function totalGames(p: UserProfile): number {
  return (
    (p.multiplayerStats?.gamesPlayed ?? 0) +
    (p.aiStats?.easy?.gamesPlayed ?? 0) +
    (p.aiStats?.medium?.gamesPlayed ?? 0) +
    (p.aiStats?.hard?.gamesPlayed ?? 0) +
    (p.aiStats?.expert?.gamesPlayed ?? 0)
  );
}

export const BADGES: Badge[] = [
  // ── Multiplayer wins ────────────────────────────────────────────────────────
  {
    id: 'mp_first',
    emoji: '🏆',
    nameKey: 'badges.mp_first.name',
    descKey: 'badges.mp_first.desc',
    unlocked: p => (p.multiplayerStats?.wins ?? 0) >= 1,
  },
  {
    id: 'mp_5',
    emoji: '🔥',
    nameKey: 'badges.mp_5.name',
    descKey: 'badges.mp_5.desc',
    unlocked: p => (p.multiplayerStats?.wins ?? 0) >= 5,
  },
  {
    id: 'mp_10',
    emoji: '⭐',
    nameKey: 'badges.mp_10.name',
    descKey: 'badges.mp_10.desc',
    unlocked: p => (p.multiplayerStats?.wins ?? 0) >= 10,
  },
  {
    id: 'mp_25',
    emoji: '👑',
    nameKey: 'badges.mp_25.name',
    descKey: 'badges.mp_25.desc',
    unlocked: p => (p.multiplayerStats?.wins ?? 0) >= 25,
  },
  // ── AI difficulty ───────────────────────────────────────────────────────────
  {
    id: 'ai_easy',
    emoji: '🤖',
    nameKey: 'badges.ai_easy.name',
    descKey: 'badges.ai_easy.desc',
    unlocked: p => (p.aiStats?.easy?.wins ?? 0) >= 1,
  },
  {
    id: 'ai_medium',
    emoji: '⚙️',
    nameKey: 'badges.ai_medium.name',
    descKey: 'badges.ai_medium.desc',
    unlocked: p => (p.aiStats?.medium?.wins ?? 0) >= 1,
  },
  {
    id: 'ai_hard',
    emoji: '💻',
    nameKey: 'badges.ai_hard.name',
    descKey: 'badges.ai_hard.desc',
    unlocked: p => (p.aiStats?.hard?.wins ?? 0) >= 1,
  },
  {
    id: 'ai_expert',
    emoji: '🧠',
    nameKey: 'badges.ai_expert.name',
    descKey: 'badges.ai_expert.desc',
    unlocked: p => (p.aiStats?.expert?.wins ?? 0) >= 1,
  },
  // ── Score dominance ─────────────────────────────────────────────────────────
  {
    id: 'margin_5',
    emoji: '⚡',
    nameKey: 'badges.margin_5.name',
    descKey: 'badges.margin_5.desc',
    unlocked: p => (p.bestWinMargin ?? 0) >= 5,
  },
  {
    id: 'margin_10',
    emoji: '💥',
    nameKey: 'badges.margin_10.name',
    descKey: 'badges.margin_10.desc',
    unlocked: p => (p.bestWinMargin ?? 0) >= 10,
  },
  // ── Total games played ──────────────────────────────────────────────────────
  {
    id: 'games_10',
    emoji: '🎯',
    nameKey: 'badges.games_10.name',
    descKey: 'badges.games_10.desc',
    unlocked: p => totalGames(p) >= 10,
  },
  {
    id: 'games_50',
    emoji: '🎮',
    nameKey: 'badges.games_50.name',
    descKey: 'badges.games_50.desc',
    unlocked: p => totalGames(p) >= 50,
  },
];
