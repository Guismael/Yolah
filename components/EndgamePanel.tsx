import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { computeBestMoves } from '../logic/game_logic';
import { useI18n } from '../context/useI18n';

type Player = 'b' | 'w';
type BoardCell = string | number;

interface EndgamePanelProps {
    onePlayerBlocked: boolean;
    showGameOver: boolean;
    computingBest: boolean;
    unblockedPlayer: Player | null;
    actualPlayer: Player;
    boardRef: React.MutableRefObject<BoardCell[][]>;
    validMovesRef: React.MutableRefObject<[number, number][]>;
    scoreB: number;
    scoreW: number;
    setComputingBest: (v: boolean) => void;
    setOnePlayerBlocked: (v: boolean) => void;
    setUnblockedPlayer: (v: Player | null) => void;
    setShowMoves: (v: boolean) => void;
    setGameWinner: (w: Player | 'draw' | null) => void;
    setShowGameOver: (v: boolean) => void;
    setBoardMatrix: React.Dispatch<React.SetStateAction<BoardCell[][]>>;
    setScoreB: React.Dispatch<React.SetStateAction<number>>;
    setScoreW: React.Dispatch<React.SetStateAction<number>>;
}

export default function EndgamePanel({
    onePlayerBlocked,
    showGameOver,
    computingBest,
    unblockedPlayer,
    actualPlayer,
    boardRef,
    validMovesRef,
    scoreB,
    scoreW,
    setComputingBest,
    setOnePlayerBlocked,
    setUnblockedPlayer,
    setShowMoves,
    setGameWinner,
    setShowGameOver,
    setBoardMatrix,
    setScoreB,
    setScoreW,
}: EndgamePanelProps) {
    const { t } = useI18n();

    if (!onePlayerBlocked || showGameOver) return null;

    async function handleEndGameNow() {
        if (computingBest || !unblockedPlayer) return;

        setComputingBest(true);
        await new Promise(res => setTimeout(res, 50));

        let seq: { from: [number, number]; to: [number, number] }[] = [];
        try {
            seq = computeBestMoves(boardRef.current, unblockedPlayer) || [];
        } catch (err) {
            console.error('computeBestMoves failed', err);
        }

        if (!seq || seq.length === 0) {
            setComputingBest(false);
            return;
        }

        let sb = 0;
        let sw = 0;
        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

        for (const mv of seq) {
            const ownerCell = boardRef.current[mv.from[0]]?.[mv.from[1]];
            const owner: Player = ownerCell === 'b' || ownerCell === 'w' ? ownerCell : unblockedPlayer ?? actualPlayer;

            setBoardMatrix(prev => {
                const next = prev.map(row => row.slice());
                next[mv.to[0]][mv.to[1]] = next[mv.from[0]][mv.from[1]];
                next[mv.from[0]][mv.from[1]] = `X${next[mv.from[0]][mv.from[1]]}`;
                return next;
            });

            if (owner === 'b') { setScoreB(prev => prev + 1); sb++; }
            else { setScoreW(prev => prev + 1); sw++; }

            // eslint-disable-next-line no-await-in-loop
            await delay(300);
        }

        setOnePlayerBlocked(false);
        setUnblockedPlayer(null);
        setShowMoves(false);
        validMovesRef.current = [];
        setComputingBest(false);

        // Full game totals (original scores + what was played in the endgame sequence)
        const finalScoreB = scoreB + sb;
        const finalScoreW = scoreW + sw;

        // unblockedPlayer made every move in seq, including the last one → they get the +1 bonus
        let winner: Player | 'draw' | null = null;
        if (unblockedPlayer === 'b') {
            if (finalScoreB + 1 > finalScoreW) winner = 'b';
            else if (finalScoreW > finalScoreB + 1) winner = 'w';
            else winner = 'draw';
        } else {
            if (finalScoreB > finalScoreW + 1) winner = 'b';
            else if (finalScoreW + 1 > finalScoreB) winner = 'w';
            else winner = 'draw';
        }

        setGameWinner(winner);
        setShowGameOver(true);
    }

    return (
        <View style={{ padding: 10, backgroundColor: '#fff8e1', marginBottom: 8, borderRadius: 6, alignItems: 'center', minWidth: 180 }}>
            <Text style={{ color: '#333', fontWeight: '600', marginBottom: 8 }}>{t('board.opponentBlocked')}</Text>

            {computingBest ? (
                <View style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, backgroundColor: '#ffe6b3', minWidth: 140, alignItems: 'center' }}>
                    <Text style={{ color: '#8a6d00', fontWeight: '700' }}>{t('board.computingMoves')}</Text>
                    <Text style={{ color: '#8a6d00', fontSize: 12, marginTop: 6, textAlign: 'center' }}>{t('board.computingHint')}</Text>
                </View>
            ) : (
                <TouchableOpacity
                    onPress={handleEndGameNow}
                    style={{ backgroundColor: '#007bff', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 }}
                >
                    <Text style={{ color: '#fff', fontWeight: '700' }}>{t('board.endGameNow')}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}
