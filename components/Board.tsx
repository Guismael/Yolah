import React, { useEffect, useRef, useState } from 'react';
import { View, Image, useWindowDimensions } from 'react-native';
import Square from './Square';
import Piece from './Piece';
import Score, { PlayerProfile } from './Score';
import GameOver from './GameOver';
import DisconnectNotice from './DisconnectNotice';
import EndgamePanel from './EndgamePanel';
import MultiplayerTurnBar from './MultiplayerTurnBar';
import { CONSTANTS, useTile } from '../assets/Const/const';
import { boardStyles, endgameStyles } from '../assets/Styles/styles';
import { getValidMoves, isAPlayerBlocked, initialMatrixBoard, isAPlayerAI } from '@/logic/game_logic';
import { useGameSettings } from '../context/GameSettingsContext';
import { useProfile } from '../context/ProfileContext';
import { multiplayerService } from '../services/MultiplayerService';
import { PlayerMode, AiDifficulty } from '../config/gameModes';
import { useI18n } from '../context/useI18n';
import { vibrate, playSoundEffect } from '../utils/gameEffects';
import { useAI } from '../hooks/useAI';
import { useMultiplayer } from '../hooks/useMultiplayer';
import MoveArrow from './MoveArrow';

const { BOARD_SIZE } = CONSTANTS;

type Player = 'b' | 'w';
type BoardCell = string | number;

interface BoardProps {
    onStart?: () => void;
    timeExpired?: boolean;
    onRestart?: () => void;
    onTurnSwitch?: (player: Player) => void;
    whiteTime?: number;
    blackTime?: number;
    PlayerModes: PlayerMode;
    onTimerReceived?: (timer: number) => void;
    aiDifficulty?: string;
    aiDifficultyB?: string;
    aiDifficultyW?: string;
}

export default function Board({
    onStart,
    timeExpired,
    onRestart,
    onTurnSwitch,
    whiteTime,
    blackTime,
    PlayerModes,
    onTimerReceived,
    aiDifficulty,
    aiDifficultyB,
    aiDifficultyW,
}: BoardProps) {
    const TILE = useTile();
    const settings = useGameSettings();
    const { t } = useI18n();
    const { profile, recordMultiplayerResult, recordAIResult } = useProfile();
    const {
        theme,
        multiplayerMode,
        playerRole,
        playerColor,
        setPlayerColor,
        setMultiplayerMode,
        setPlayerRole,
    } = settings;

    // ── Core game state ──────────────────────────────────────────────────────
    const [boardMatrix, setBoardMatrix] = useState<BoardCell[][]>(() => initialMatrixBoard);
    const [showMoves, setShowMoves] = useState(false);
    const [computingBest, setComputingBest] = useState(false);
    const [scoreW, setScoreW] = useState(0);
    const [scoreB, setScoreB] = useState(0);
    const [actualPlayer, setActualPlayer] = useState<Player>('w');
    const [showGameOver, setShowGameOver] = useState(false);
    const [gameWinner, setGameWinner] = useState<Player | 'draw' | null>(null);
    const [onePlayerBlocked, setOnePlayerBlocked] = useState(false);
    const [unblockedPlayer, setUnblockedPlayer] = useState<Player | null>(null);
    const [hasGameStarted, setHasGameStarted] = useState(false);
    const [whiteProfile, setWhiteProfile] = useState<PlayerProfile | null>(null);
    const [blackProfile, setBlackProfile] = useState<PlayerProfile | null>(null);
    const [lastMove, setLastMove] = useState<{ from: [number, number]; to: [number, number]; player: Player } | null>(null);

    // ── Refs ─────────────────────────────────────────────────────────────────
    const validMovesRef = useRef<[number, number][]>([]);
    const boardRef = useRef<BoardCell[][]>(boardMatrix);
    const onRestartRef = useRef(onRestart);
    const onTimerReceivedRef = useRef(onTimerReceived);
    const ignoreNextRemoteRestartRef = useRef(false);
    const ignoreRestartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasRecordedMatchResultRef = useRef(false);
    const hasRecordedAIResultRef = useRef(false);

    const applyMoveRef = useRef<(from: [number, number], to: [number, number], player: Player, sendToNetwork?: boolean) => void>(() => {});
    const gameOverRef = useRef<(sendNetworkMessage?: boolean) => void>(() => {});

    useEffect(() => {
        onRestartRef.current = onRestart;
        onTimerReceivedRef.current = onTimerReceived;
    }, [onRestart, onTimerReceived]);

    useEffect(() => { boardRef.current = boardMatrix; }, [boardMatrix]);

    // ── AI vs AI: show algorithm name as player label ─────────────────────────
    useEffect(() => {
        if (PlayerModes !== 'AI vs AI') return;
        const algoName: Record<string, string> = {
            easy: 'Random/Monte',
            medium: 'Monte Carlo',
            hard: 'MiniMax',
            expert: 'MCTS',
        };
        setWhiteProfile({ username: algoName[aiDifficultyW ?? 'expert'] ?? 'AI' });
        setBlackProfile({ username: algoName[aiDifficultyB ?? 'expert'] ?? 'AI' });
    }, [PlayerModes, aiDifficultyW, aiDifficultyB]);

    // ── Timer expiry ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (timeExpired) {
            setShowGameOver(true);
            setGameWinner(actualPlayer === 'b' ? 'w' : 'b');
        }
    }, [timeExpired]);

    // ── Record multiplayer result ─────────────────────────────────────────────
    useEffect(() => {
        if (!showGameOver || !gameWinner || !multiplayerMode || !playerColor) return;
        if (hasRecordedMatchResultRef.current) return;
        hasRecordedMatchResultRef.current = true;
        recordMultiplayerResult(gameWinner, playerColor, scoreB, scoreW).catch(() => {
            hasRecordedMatchResultRef.current = false;
        });
    }, [showGameOver, gameWinner, multiplayerMode, playerColor, scoreB, scoreW, recordMultiplayerResult]);

    // ── Record AI result ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!showGameOver || !gameWinner || PlayerModes !== 'Human vs AI' || !aiDifficulty) return;
        if (hasRecordedAIResultRef.current) return;
        hasRecordedAIResultRef.current = true;
        recordAIResult(gameWinner, aiDifficulty as AiDifficulty, scoreB, scoreW).catch(() => {
            hasRecordedAIResultRef.current = false;
        });
    }, [showGameOver, gameWinner, PlayerModes, aiDifficulty, scoreB, scoreW, recordAIResult]);

    // ── Cleanup on unmount ────────────────────────────────────────────────────
    useEffect(() => {
        return () => {
            if (ignoreRestartTimeoutRef.current) clearTimeout(ignoreRestartTimeoutRef.current);
        };
    }, []);

    // ── Multiplayer hook ──────────────────────────────────────────────────────
    const { showDisconnectNotice, handleReturnHomeAfterDisconnect } = useMultiplayer({
        multiplayerMode,
        playerColor,
        playerRole,
        profile,
        applyMoveRef,
        gameOverRef,
        onRestartRef,
        ignoreNextRemoteRestartRef,
        ignoreRestartTimeoutRef,
        setWhiteProfile,
        setBlackProfile,
        setPlayerColor,
        setMultiplayerMode,
        setPlayerRole,
        setShowGameOver,
        setGameWinner,
    });

    // ── AI hook ───────────────────────────────────────────────────────────────
    useAI({
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
        onAIMove: (from, to, player) => setLastMove({ from, to, player }),
    });

    // ── Core move logic ───────────────────────────────────────────────────────
    function applyMove(
        from: [number, number],
        to: [number, number],
        player: Player,
        sendToNetwork: boolean = true
    ) {
        const [fromRow, fromCol] = from;
        const [toRow, toCol] = to;

        const newBoard = boardMatrix.map(row => row.map(cell => (cell === 'VALID' ? 0 : cell)));
        newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
        newBoard[fromRow][fromCol] = `X${player}`;

        vibrate(settings);
        playSoundEffect(settings);
        setLastMove({ from, to, player });

        const newScoreB = scoreB + (player === 'b' ? 1 : 0);
        const newScoreW = scoreW + (player === 'w' ? 1 : 0);
        setScoreB(newScoreB);
        setScoreW(newScoreW);
        setBoardMatrix(newBoard);

        if (multiplayerMode && sendToNetwork) {
            multiplayerService.sendMessage({ type: 'move', from, to, player });
        }

        if (!hasGameStarted && onStart) {
            onStart();
            setHasGameStarted(true);
        }

        const opponent: Player = player === 'b' ? 'w' : 'b';

        if (!isAPlayerBlocked(newBoard, opponent)) {
            setActualPlayer(opponent);
            onTurnSwitch?.(opponent);
        } else if (!onePlayerBlocked && (player === 'b' ? newScoreB > newScoreW : newScoreW > newScoreB)) {
            setOnePlayerBlocked(true);
            setUnblockedPlayer(player);
        }

        if (isAPlayerBlocked(newBoard, player) && isAPlayerBlocked(newBoard, opponent)) {
            let winner: Player | 'draw' | null = null;
            if (player === 'w') {
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
    }

    applyMoveRef.current = applyMove;

    function gameOver(sendNetworkMessage: boolean = true) {
        setBoardMatrix(initialMatrixBoard);
        setShowMoves(false);
        setActualPlayer('w');
        setScoreB(0);
        setScoreW(0);
        setOnePlayerBlocked(false);
        setUnblockedPlayer(null);
        setHasGameStarted(false);
        setLastMove(null);
        hasRecordedMatchResultRef.current = false;
        hasRecordedAIResultRef.current = false;

        if (multiplayerMode && sendNetworkMessage && playerRole === 'host') {
            ignoreNextRemoteRestartRef.current = true;
            if (ignoreRestartTimeoutRef.current) clearTimeout(ignoreRestartTimeoutRef.current);
            ignoreRestartTimeoutRef.current = setTimeout(() => {
                ignoreNextRemoteRestartRef.current = false;
                ignoreRestartTimeoutRef.current = null;
            }, 3000);
            multiplayerService.sendMessage({ type: 'restart' });
        }
    }

    gameOverRef.current = gameOver;

    // ── Input handlers ────────────────────────────────────────────────────────
    const isHumanTurn = multiplayerMode
        ? (!playerColor || actualPlayer === playerColor)
        : !isAPlayerAI(PlayerModes, actualPlayer);

    function removeValidMovesMarkers() {
        setShowMoves(false);
        setBoardMatrix(prev => prev.map(row => row.map(cell => (cell === 'VALID' ? 0 : cell))));
    }

    function handlePiecePress(i: number, j: number) {
        if (computingBest || !isHumanTurn) return;

        const cleanBoard = boardMatrix.map(row => row.map(cell => (cell === 'VALID' ? 0 : cell)));
        const nextValidMoves = getValidMoves([i, j], cleanBoard);
        validMovesRef.current = nextValidMoves;

        if (nextValidMoves.length === 0) {
            setBoardMatrix(cleanBoard);
            setShowMoves(false);
            return;
        }

        const newBoard = cleanBoard.map(row => [...row]);
        for (const [row, col] of nextValidMoves) newBoard[row][col] = 'VALID';
        setBoardMatrix(newBoard);
        setShowMoves(true);
    }

    function handlePieceLetGo(toRow: number, toCol: number, fromRow: number, fromCol: number) {
        if (!isHumanTurn) return;

        const current = boardMatrix;
        const fromCell = current[fromRow]?.[fromCol];
        const inBounds = toRow >= 0 && toRow < BOARD_SIZE && toCol >= 0 && toCol < BOARD_SIZE;
        const moved = fromRow !== toRow || fromCol !== toCol;
        const isOwnPiece = fromCell === actualPlayer;
        const isValidTarget = validMovesRef.current.some(([r, c]) => r === toRow && c === toCol);

        if (inBounds && moved && isOwnPiece && isValidTarget) {
            applyMove([fromRow, fromCol], [toRow, toCol], actualPlayer, true);
        } else {
            setBoardMatrix(current.map(row => row.map(cell => (cell === 'VALID' ? 0 : cell))));
        }

        setShowMoves(false);
        validMovesRef.current = [];
    }

    // ── Layout ────────────────────────────────────────────────────────────────
    const { width: windowWidth } = useWindowDimensions();
    const boardSize = TILE * BOARD_SIZE;
    const canShowRight = windowWidth >= boardSize + 260;

    const isMyTurnInMultiplayer = multiplayerMode && !!playerColor && actualPlayer === playerColor;
    const playerColorLabel = playerColor === 'w' ? t('board.white') : playerColor === 'b' ? t('board.black') : null;
    const opponentColor: Player | null = playerColor === 'w' ? 'b' : playerColor === 'b' ? 'w' : null;
    const opponentName = opponentColor === 'w' ? whiteProfile?.username : opponentColor === 'b' ? blackProfile?.username : null;
    const turnStatusText = isMyTurnInMultiplayer
        ? t('board.yourTurn', { color: playerColorLabel ?? '' })
        : t('board.waitingTurn', { name: opponentName ?? t('board.otherPlayer') });

    const endgamePanelProps = {
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
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <View>
            <GameOver
                visible={showGameOver}
                winner={gameWinner}
                canRestart={!multiplayerMode || playerRole === 'host'}
                restartLabel={
                    multiplayerMode && playerRole !== 'host'
                        ? t('board.waitingForHost')
                        : t('board.playAgain')
                }
                onRestart={() => {
                    if (multiplayerMode && playerRole !== 'host') return;
                    gameOver();
                    setShowGameOver(false);
                    setGameWinner(null);
                    onRestart?.();
                }}
            />

            <DisconnectNotice
                visible={showDisconnectNotice}
                onReturnHome={handleReturnHomeAfterDisconnect}
            />

            {canShowRight && (
                <View style={[endgameStyles.panelRightWrapper, { left: boardSize + 20, top: boardSize / 2 }]}>
                    <EndgamePanel {...endgamePanelProps} />
                </View>
            )}

            {!showGameOver && (
                <View>
                    <View style={boardStyles.outer}>
                        <Score
                            scoreW={scoreW}
                            scoreB={scoreB}
                            currentPlayer={actualPlayer}
                            whiteTime={whiteTime}
                            blackTime={blackTime}
                            onReset={() => { gameOver(); onRestart?.(); }}
                            whiteProfile={whiteProfile}
                            blackProfile={blackProfile}
                        />

                        <View style={[boardStyles.boardContainer, { width: boardSize, height: boardSize }]}>
                            {boardMatrix.map((rowArr, i) =>
                                rowArr.map((_, j) => (
                                    <Square
                                        key={`sq-${i}-${j}`}
                                        row={i}
                                        col={j}
                                        ghostPawn={validMovesRef.current.some(([r, c]) => r === i && c === j)}
                                        captured={boardMatrix[i][j]}
                                    />
                                ))
                            )}

                            {theme.backgroundImage && (
                                <View
                                    pointerEvents="none"
                                    style={{
                                        position: 'absolute',
                                        top: 0, left: 0,
                                        width: boardSize, height: boardSize,
                                        opacity: 0.2,
                                        zIndex: 1,
                                    }}
                                >
                                    <Image
                                        source={theme.backgroundImage}
                                        style={{ width: boardSize, height: boardSize }}
                                        resizeMode="cover"
                                    />
                                </View>
                            )}

                            {boardMatrix
                                .flatMap((rowArr, i) =>
                                    rowArr.map((cell, j) => (cell ? [[i, j]] : [])).flat()
                                )
                                .map(([i, j]) =>
                                    (boardMatrix[i][j] === 'b' || boardMatrix[i][j] === 'w') && (
                                        <Piece
                                            key={`p-${i}-${j}`}
                                            row={i}
                                            col={j}
                                            team={boardMatrix[i][j] as Player}
                                            onPress={() => handlePiecePress(i, j)}
                                            onLetGo={handlePieceLetGo}
                                            refresh={removeValidMovesMarkers}
                                            draggable={boardMatrix[i][j] === actualPlayer && isHumanTurn}
                                        />
                                    )
                                )}

                            {lastMove && (
                                <MoveArrow
                                    from={lastMove.from}
                                    to={lastMove.to}
                                    tileSize={TILE}
                                    player={lastMove.player}
                                />
                            )}
                        </View>

                        <MultiplayerTurnBar
                            multiplayerMode={multiplayerMode}
                            playerColor={playerColor}
                            showGameOver={showGameOver}
                            turnStatusText={turnStatusText}
                        />
                    </View>

                    {!canShowRight && <EndgamePanel {...endgamePanelProps} />}
                </View>
            )}
        </View>
    );
}
