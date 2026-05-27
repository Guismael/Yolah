import { useEffect } from 'react';
import { PlayerMode } from '../config/gameModes';
import {
    isAPlayerBlocked,
    isAPlayerAI,
    getRandomMove,
    getBestMoveWithMonteCarlo,
    getBestMoveWithMCTS,
    getBestMoveWithMonteCarloHalfRandom,
    getBestMoveWithMinimax,
} from '../logic/game_logic';
import { vibrate, playSoundEffect, GameSettings } from '../utils/gameEffects';

type Player = 'b' | 'w';
type BoardCell = string | number;

interface UseAIProps {
    multiplayerMode: boolean;
    actualPlayer: Player;
    PlayerModes: PlayerMode;
    computingBest: boolean;
    onePlayerBlocked: boolean;
    unblockedPlayer: Player | null;
    showGameOver: boolean;
    scoreB: number;
    scoreW: number;
    settings: GameSettings;
    aiDifficulty?: string;
    aiDifficultyB?: string;
    aiDifficultyW?: string;
    boardRef: React.MutableRefObject<BoardCell[][]>;
    setActualPlayer: (p: Player) => void;
    setScoreB: React.Dispatch<React.SetStateAction<number>>;
    setScoreW: React.Dispatch<React.SetStateAction<number>>;
    setBoardMatrix: React.Dispatch<React.SetStateAction<BoardCell[][]>>;
    setOnePlayerBlocked: (v: boolean) => void;
    setUnblockedPlayer: (v: Player | null) => void;
    setGameWinner: (w: Player | 'draw' | null) => void;
    setShowGameOver: (v: boolean) => void;
    onAIMove?: (from: [number, number], to: [number, number], player: Player) => void;
}

export function useAI({
    multiplayerMode,
    actualPlayer,
    PlayerModes,
    computingBest,
    onePlayerBlocked,
    unblockedPlayer,
    showGameOver,
    scoreB,
    scoreW,
    settings,
    aiDifficulty,
    aiDifficultyB,
    aiDifficultyW,
    boardRef,
    setActualPlayer,
    setScoreB,
    setScoreW,
    setBoardMatrix,
    setOnePlayerBlocked,
    setUnblockedPlayer,
    setGameWinner,
    setShowGameOver,
    onAIMove,
}: UseAIProps) {
    useEffect(() => {
        if (multiplayerMode) return;

        let cancelled = false;

        (async () => {
            if (computingBest || showGameOver) return;
            const shouldPauseForManualEndgame =
                onePlayerBlocked && (!unblockedPlayer || !isAPlayerAI(PlayerModes, unblockedPlayer));
            if (shouldPauseForManualEndgame) return;
            if (!isAPlayerAI(PlayerModes, actualPlayer)) return;

            await new Promise(res => setTimeout(res, 700));
            if (cancelled) return;

            const boardSnapshot = boardRef.current;

            const isForcedEndgameRunner = onePlayerBlocked && unblockedPlayer === actualPlayer;

            const getAIMove = async () => {
                if (isForcedEndgameRunner) return getRandomMove(boardSnapshot, actualPlayer);

                const diff = (aiDifficultyB !== undefined || aiDifficultyW !== undefined)
                    ? (actualPlayer === 'b' ? aiDifficultyB : aiDifficultyW)
                    : aiDifficulty;

                console.log(`Computing AI move for difficulty: ${diff}`);

                if (diff === 'easy') return getBestMoveWithMonteCarloHalfRandom(boardSnapshot, actualPlayer, 2000);
                if (diff === 'medium') return getBestMoveWithMonteCarlo(boardSnapshot, actualPlayer, 2000);
                if (diff === 'hard') return getBestMoveWithMinimax(boardSnapshot, actualPlayer, 4);
                if (diff === 'expert') return getBestMoveWithMCTS(boardSnapshot, actualPlayer, 2000);
                return getBestMoveWithMCTS(boardSnapshot, actualPlayer, 2000);
            };

            getAIMove()
                .then((aiMove: { from: [number, number]; to: [number, number] } | null) => {
                    if (cancelled) return;

                    if (!aiMove) {
                        const opponent: Player = actualPlayer === 'b' ? 'w' : 'b';
                        const currentBlocked = isAPlayerBlocked(boardSnapshot, actualPlayer);
                        const opponentBlocked = isAPlayerBlocked(boardSnapshot, opponent);

                        if (currentBlocked && opponentBlocked) {
                            // In the forced-endgame-runner path actualPlayer made the last move;
                            // in a normal AI turn the opponent moved last.  Either way apply the
                            // last-move +1 bonus to whichever player moved most recently.
                            const lastMover: Player = isForcedEndgameRunner ? actualPlayer : opponent;
                            let winner: Player | 'draw' | null = null;
                            if (lastMover === 'w') {
                                if (scoreB > scoreW + 1) winner = 'b';
                                else if (scoreW + 1 > scoreB) winner = 'w';
                                else winner = 'draw';
                            } else {
                                if (scoreB + 1 > scoreW) winner = 'b';
                                else if (scoreW > scoreB + 1) winner = 'w';
                                else winner = 'draw';
                            }
                            setGameWinner(winner);
                            setShowGameOver(true);
                            return;
                        }

                        if (currentBlocked) {
                            setOnePlayerBlocked(true);
                            setUnblockedPlayer(opponent);
                            if (isAPlayerAI(PlayerModes, opponent)) setActualPlayer(opponent);
                        }
                        return;
                    }

                    const newBoard = boardSnapshot.map(row => row.slice());
                    newBoard[aiMove.to[0]][aiMove.to[1]] = newBoard[aiMove.from[0]][aiMove.from[1]];
                    newBoard[aiMove.from[0]][aiMove.from[1]] = `X${actualPlayer}`;

                    vibrate(settings);
                    playSoundEffect(settings);
                    onAIMove?.(aiMove.from, aiMove.to, actualPlayer);

                    const newScoreB = scoreB + (actualPlayer === 'b' ? 1 : 0);
                    const newScoreW = scoreW + (actualPlayer === 'w' ? 1 : 0);

                    setScoreB(newScoreB);
                    setScoreW(newScoreW);
                    setBoardMatrix(newBoard);

                    const opponent: Player = actualPlayer === 'b' ? 'w' : 'b';
                    if (!isAPlayerBlocked(newBoard, opponent)) {
                        setActualPlayer(opponent);
                    } else if (!onePlayerBlocked && (actualPlayer === 'b' ? newScoreB > newScoreW : newScoreW > newScoreB)) {
                        setOnePlayerBlocked(true);
                        setUnblockedPlayer(actualPlayer);
                    }

                    if (isAPlayerBlocked(newBoard, actualPlayer) && isAPlayerBlocked(newBoard, opponent)) {
                        let winner: Player | 'draw' | null = null;
                        if (actualPlayer === 'w') {
                            if (newScoreB > newScoreW + 1) winner = 'b';
                            else if (newScoreW + 1 > newScoreB) winner = 'w';
                            else winner = 'draw';
                        } else {
                            if (newScoreB + 1 > newScoreW) winner = 'b';
                            else if (newScoreW > newScoreB + 1) winner = 'w';
                            else winner = 'draw';
                        }
                        setGameWinner(winner);
                        setShowGameOver(true);
                    }
                })
                .catch((err: Error) => {
                    console.error('AI move computation failed:', err);
                });
        })();

        return () => { cancelled = true; };
    }, [actualPlayer, PlayerModes, computingBest, onePlayerBlocked, unblockedPlayer, showGameOver, scoreB, scoreW, settings, aiDifficulty, aiDifficultyB, aiDifficultyW]);
}
