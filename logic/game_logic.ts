import { PlayerMode } from '../config/gameModes';

const boardSize = 8;
let currentPlayer: "b" | "w" = "w";

let scores = {
  b: 0,
  w: 0
};

  const initialMatrixBoard = [
    ["b", 0, 0, 0, 0, 0, 0, "w"],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, "w", "b", 0, 0, 0],
    [0, 0, 0, "b", "w", 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    ["w", 0, 0, 0, 0, 0, 0, "b"],
  ];

  //   const initialMatrixBoard = [
  //   ["b", "Xb", 0, 0, 0, 0, 0, "w"],
  //   ["Xb", "Xb", "Xb", 0, 0, 0, 0, 0],
  //   [0, 0, 0, 0, 0, 0, 0, 0],
  //   [0, 0, 0, 0 , 0 , 0, 0, 0],
  //   [0, 0, 0, 0 , 0 , 0, 0, 0],
  //   [0, 0, 0, 0, 0, 0, 0, 0],
  //   [0, 0, 0, 0, 0, 0, 0, 0],
  //   [0 , 0, 0, 0, 0, 0, 0, 0 ],
  // ];





function printBoard(){
  for (let i = 0; i < initialMatrixBoard.length; i++) {
    let s= "| "
    for (let j = 0; j < initialMatrixBoard[i].length; j++) {
      const element = initialMatrixBoard[i][j];
      s+=element+" | "
    }
    console.log(s)
    
  }
}

function getValidMoves(position: [number, number], board = initialMatrixBoard): [number, number][] {
  // get horizontal moves
  const validMoves: [number, number][] = [];
  const [x, y] = position;
  for (let i = x-1; i >=0 ; i--) {
    if(board[i][y] === 0){
      validMoves.push([i,y]);
    }else{
      break;
    }
  }
  for (let i = x+1; i < boardSize ; i++) {
    if(board[i][y] === 0){
      validMoves.push([i,y]);
    }else{
      break;
    }
  }

  // get vertical moves

  for (let j = y-1; j >=0 ; j--) {
    if(board[x][j] === 0){
      validMoves.push([x,j]);
    }else{
      break;
    }
  }
  for (let j = y+1; j < boardSize ; j++) {
    if(board[x][j] === 0){
      validMoves.push([x,j]);
    }else{
      break;
    }
  }

  // get diagonal moves
  // top-left
  for (let i = 1; x - i >= 0 && y - i >= 0; i++) {
    if (board[x - i][y - i] === 0) {
      validMoves.push([x - i, y - i]);
    } else {
      break;
    }
  }
  // top-right
  for (let i = 1; x - i >= 0 && y + i < boardSize; i++) {
    if (board[x - i][y + i] === 0) {
      validMoves.push([x - i, y + i]);
    } else {
      break;
    }
  }
  // bottom-left
  for (let i = 1; x + i < boardSize && y - i >= 0; i++) {
    if (board[x + i][y - i] === 0) {
      validMoves.push([x + i, y - i]);
    } else {
      break;
    }
  }
  // bottom-right
  for (let i = 1; x + i < boardSize && y + i < boardSize; i++) {
    if (board[x + i][y + i] === 0) {
      validMoves.push([x + i, y + i]);
    } else {
      break;
    }
  }
  

  return validMoves;
}

function movePiece(from: [number, number], to: [number, number], validPlayer: "b" | "w",playerModesParam: PlayerMode): boolean {
  const validMoves = getValidMoves(from);
  if(currentPlayer === validPlayer && validMoves.some(([x,y]) => x === to[0] && y === to[1])){
    // Move the piece
    initialMatrixBoard[to[0]][to[1]] = initialMatrixBoard[from[0]][from[1]];

    // Block the square left behind
    initialMatrixBoard[from[0]][from[1]] = "X"+currentPlayer;

    scores[validPlayer] += 1;

    console.log(`Player ${validPlayer} moved from [${from}] to [${to}]`);
    console.log(`Scores: Black - ${scores.b}, White - ${scores.w}`);

    // Switch player
    currentPlayer = currentPlayer === "b" ? "w" : "b";
    printBoard();
    if(isAPlayerAI(playerModesParam , currentPlayer)){
      console.log("AI is thinking...");
      const aiMove = getRandomMove(initialMatrixBoard, currentPlayer);
      if(aiMove){
        movePiece(aiMove.from, aiMove.to, currentPlayer, playerModesParam);
      }
    }
    return true;
  }else{
    console.log("Invalid move");
    return false;
  }
}

function isAPlayerBlocked(board = initialMatrixBoard , player: "b" | "w" ) {
  
  let blockedStatus = true;

  // Find all pieces of the specified player
  const playerPieces: [number, number][] = [];
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j] === player) {
        playerPieces.push([i, j]);
      }
    }
  }
  
  // Check if any piece has valid moves
  for (const piece of playerPieces) {
    const validMoves = getValidMoves(piece, board);
    if (validMoves.length > 0) {
      blockedStatus = false;
      break;
    }
  }

  return blockedStatus;
}

function isAPlayerAI(playerMode: PlayerMode, player: "b" | "w") {
  if(playerMode === "Human vs Human"){
    return false;
  }else if(playerMode === "Human vs AI" && player === "b"){
    return true; // assuming black is AI
  }else if(playerMode === "AI vs AI"){
    return true;
  }
  return false;
}

function getRandomMove(board = initialMatrixBoard, player: "b" | "w"): { from: [number, number]; to: [number, number] } | null {
  const playerPieces: [number, number][] = [];
  // Find all pieces of the specified player
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j] === player) {
        playerPieces.push([i, j]);
      }
    }
  }

  const allPossibleMoves: { from: [number, number]; to: [number, number] }[] = [];

  // Gather all possible moves for the player's pieces
  for (const piece of playerPieces) {
    const validMoves = getValidMoves(piece, board);
    for (const move of validMoves) {
      allPossibleMoves.push({ from: piece, to: move });
    }
  }

  if (allPossibleMoves.length === 0) {
    return null; // No valid moves available
  }

  // Select a random move from the list of all possible moves
  const randomIndex = Math.floor(Math.random() * allPossibleMoves.length);
  return allPossibleMoves[randomIndex];
}

async function getBestMoveWithMonteCarlo(
  board = initialMatrixBoard,
  player: "b" | "w",
  timeLimit: number = 1000 // milliseconds
): Promise<{ from: [number, number]; to: [number, number] } | null> {
  const debug = true; // set to true to enable debug logs
  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];

  const cloneBoardFast = (b: any[][]) => {
    const nb = new Array(b.length);
    for (let i = 0; i < b.length; i++) {
      const row = b[i];
      const nr = new Array(row.length);
      for (let j = 0; j < row.length; j++) nr[j] = row[j];
      nb[i] = nr;
    }
    return nb;
  };

  const forEachMove = (
    b: any[][],
    p: "b" | "w",
    fn: (fx: number, fy: number, tx: number, ty: number) => void
  ) => {
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        if (b[i][j] !== p) continue;
        for (let d = 0; d < dirs.length; d++) {
          const dx = dirs[d][0];
          const dy = dirs[d][1];
          let x = i + dx;
          let y = j + dy;
          while (x >= 0 && x < boardSize && y >= 0 && y < boardSize && b[x][y] === 0) {
            fn(i, j, x, y);
            x += dx;
            y += dy;
          }
        }
      }
    }
  };

  const getRandomMoveFast = (b: any[][], p: "b" | "w", out: number[]) => {
    let count = 0;
    forEachMove(b, p, (sfx, sfy, stx, sty) => {
      count++;
      if ((Math.random() * count) < 1) {
        out[0] = sfx;
        out[1] = sfy;
        out[2] = stx;
        out[3] = sty;
      }
    });
    return count > 0;
  };

  const simulation = (simBoard: any[][], p: "b" | "w"): number => {
    let simPlayer = p;
    let moveCount = 0;
    const move = [0, 0, 0, 0];

    while (true) {
      if (!getRandomMoveFast(simBoard, simPlayer, move)) break;
      const fx = move[0];
      const fy = move[1];
      const tx = move[2];
      const ty = move[3];
      const block = simPlayer === "b" ? "Xb" : "Xw";

      simBoard[tx][ty] = simBoard[fx][fy];
      simBoard[fx][fy] = block;
      simPlayer = simPlayer === "b" ? "w" : "b";
      moveCount++;
    }
    return moveCount;
  };

  const moves: number[] = [];
  forEachMove(board, player, (fx, fy, tx, ty) => {
    moves.push(fx, fy, tx, ty);
  });

  if (moves.length === 0) return null;

  const moveCount = (moves.length / 4) | 0;
  const wins = new Array<number>(moveCount).fill(0);
  const visits = new Array<number>(moveCount).fill(0);
  const startTime = Date.now();
  const opponent = player === "b" ? "w" : "b";
  const playerBlock = player === "b" ? "Xb" : "Xw";
  let iter = 0;

  while (Date.now() - startTime < timeLimit) {
    const moveIndex = (Math.random() * moveCount) | 0;
    const base = moveIndex * 4;
    const fx = moves[base];
    const fy = moves[base + 1];
    const tx = moves[base + 2];
    const ty = moves[base + 3];

    const testBoard = cloneBoardFast(board);
    testBoard[tx][ty] = testBoard[fx][fy];
    testBoard[fx][fy] = playerBlock;

    visits[moveIndex] += 1;
    wins[moveIndex] += simulation(testBoard, opponent);

    iter++;
    if ((iter & 255) === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  let bestIndex = -1;
  let bestScore = -Infinity;

  for (let i = 0; i < moveCount; i++) {
    if (visits[i] === 0) continue;
    const avgScore = wins[i] / visits[i];
    if (avgScore > bestScore) {
      bestScore = avgScore;
      bestIndex = i;
    }
  }

  if (bestIndex === -1) return null;

  const bestBase = bestIndex * 4;
  const bestMove = {
    from: [moves[bestBase], moves[bestBase + 1]] as [number, number],
    to: [moves[bestBase + 2], moves[bestBase + 3]] as [number, number],
  };

  if (debug) {
    console.log(`Monte Carlo evaluated ${iter} iterations in ${timeLimit}ms. Best move:`, bestMove, "with average score:", bestScore);
    console.log("Total possible moves evaluated:", moveCount);
  }

  return bestMove;
}

async function getBestMoveWithMCTS(
  board = initialMatrixBoard,
  player: "b" | "w",
  timeLimit: number = 1000 // milliseconds
): Promise<{ from: [number, number]; to: [number, number] } | null> {
  type BoardCell = "b" | "w" | "Xb" | "Xw" | 0;
  type NativeMctsModule = {
    getBestMoveWithMCTS?: (
      black: string,
      white: string,
      empty: string,
      blackScore: number,
      whiteScore: number,
      ply: number,
      iterations: number,
      timeLimitSeconds: number
    ) => Promise<string | null>;
    getBestMove?: (
      black: string,
      white: string,
      empty: string,
      blackScore: number,
      whiteScore: number,
      ply: number,
      iterations: number,
      timeLimitSeconds: number
    ) => Promise<string | null>;
  };

  const parseSquare = (s: string): [number, number] | null => {
    if (s.length !== 2) return null;
    const file = s[0].charCodeAt(0) - 97;
    const rank = Number(s[1]) - 1;
    if (Number.isNaN(rank) || file < 0 || file >= 8 || rank < 0 || rank >= 8) {
      return null;
    }
    return [rank, file];
  };

  try {
    const { NativeModules } = require("react-native") as {
      NativeModules?: Record<string, unknown>;
    };

    const nativeModule = (NativeModules?.YolahMcts ?? NativeModules?.YolahMCTS) as NativeMctsModule | undefined;
    const nativeCall = nativeModule?.getBestMoveWithMCTS ?? nativeModule?.getBestMove;

    if (!nativeCall) {
      // Fallback keeps the app playable until native module is integrated.
      return getBestMoveWithMonteCarlo(board, player, timeLimit);
    }

    let black = 0n;
    let white = 0n;
    let empty = 0n;
    let blackScore = scores.b;
    let whiteScore = scores.w;

    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        const cell = board[row][col] as BoardCell;
        const sq = row * 8 + col;
        const bit = 1n << BigInt(sq);

        if (cell === "b") {
          black |= bit;
        } else if (cell === "w") {
          white |= bit;
        } else if (cell === "Xb") {
          empty |= bit;
        } else if (cell === "Xw") {
          empty |= bit;
        }
      }
    }

    const ply = player === "b" ? 0 : 1;
    const iterations = 120000;
    const timeLimitSeconds = Math.max(1, timeLimit) / 1000;

    const nativeResult = await nativeCall(
      black.toString(),
      white.toString(),
      empty.toString(),
      blackScore,
      whiteScore,
      ply,
      iterations,
      timeLimitSeconds
    );

    if (!nativeResult) return null;

    let moveStr: string | null = null;
    if (nativeResult.startsWith("{")) {
      try {
        const parsed = JSON.parse(nativeResult) as {
          move?: string;
          iterations?: number;
          elapsedSeconds?: number;
          playoutsPerSecond?: number;
        };
        moveStr = parsed.move ?? null;
        if (typeof parsed.iterations === "number") {
          console.log(
            `[MCTS Native] iterations=${parsed.iterations}` +
              (typeof parsed.elapsedSeconds === "number" ? ` elapsed=${parsed.elapsedSeconds}s` : "") +
              (typeof parsed.playoutsPerSecond === "number" ? ` nps=${parsed.playoutsPerSecond}` : "")
          );
        }
      } catch {
        moveStr = nativeResult;
      }
    } else {
      moveStr = nativeResult;
    }

    if (!moveStr || !moveStr.includes(":")) return null;
    const [fromStr, toStr] = moveStr.split(":");
    const from = parseSquare(fromStr);
    const to = parseSquare(toStr);
    if (!from || !to) return null;

    return { from, to };
  } catch {
    return getBestMoveWithMonteCarlo(board, player, timeLimit);
  }
}

async function getBestMoveWithMonteCarloHalfRandom(
  board = initialMatrixBoard,
  player: "b" | "w",
  timeLimit: number = 1000 // milliseconds
): Promise<{ from: [number, number]; to: [number, number] } | null> {
  if (Math.random() < 0.5) {
    console.log("Monte Carlo Half-Random: Choosing random move");
    return getRandomMove(board, player);
  }
  console.log("Monte Carlo Half-Random: Choosing Monte Carlo move");
  return await getBestMoveWithMonteCarlo(board, player, timeLimit);
}

async function getBestMoveWithMinimax(
  board = initialMatrixBoard,
  player: "b" | "w",
  depth: number = 4
): Promise<{ from: [number, number]; to: [number, number] } | null> {
  type BoardCell = "b" | "w" | "Xb" | "Xw" | 0;
  type NativeMinimaxModule = {
    getBestMoveWithMinimax?: (
      black: string,
      white: string,
      empty: string,
      blackScore: number,
      whiteScore: number,
      ply: number,
      depth: number
    ) => Promise<string | null>;
  };

  console.log(`Minimax: Computing best move with depth ${depth}...`);

  const parseSquare = (s: string): [number, number] | null => {
    if (s.length !== 2) return null;
    const file = s[0].charCodeAt(0) - 97;
    const rank = Number(s[1]) - 1;
    if (Number.isNaN(rank) || file < 0 || file >= 8 || rank < 0 || rank >= 8) {
      return null;
    }
    return [rank, file];
  };

  try {
    const { NativeModules } = require("react-native") as {
      NativeModules?: Record<string, unknown>;
    };

    const nativeModule = NativeModules?.YolahMinimax as NativeMinimaxModule | undefined;
    const nativeCall = nativeModule?.getBestMoveWithMinimax;

    if (!nativeCall) {
      // Fallback to Monte Carlo if native minimax is not available
      return getBestMoveWithMonteCarlo(board, player, 1000);
    }

    let black = 0n;
    let white = 0n;
    let empty = 0n;
    let blackScore = scores.b;
    let whiteScore = scores.w;

    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        const cell = board[row][col] as BoardCell;
        const sq = row * 8 + col;
        const bit = 1n << BigInt(sq);

        if (cell === "b") {
          black |= bit;
        } else if (cell === "w") {
          white |= bit;
        } else if (cell === "Xb") {
          empty |= bit;
        } else if (cell === "Xw") {
          empty |= bit;
        }
      }
    }

    const ply = player === "b" ? 0 : 1;

    const nativeResult = await nativeCall(
      black.toString(),
      white.toString(),
      empty.toString(),
      blackScore,
      whiteScore,
      ply,
      depth
    );

    if (!nativeResult) return null;

    let moveStr: string | null = null;
    if (nativeResult.startsWith("{")) {
      try {
        const parsed = JSON.parse(nativeResult) as {
          move?: string;
          depth?: number;
        };
        moveStr = parsed.move ?? null;
        if (typeof parsed.depth === "number") {
          console.log(`[Minimax Native] depth=${parsed.depth}`);
        }
      } catch {
        moveStr = nativeResult;
      }
    } else {
      moveStr = nativeResult;
    }

    if (!moveStr || !moveStr.includes(":")) return null;
    const [fromStr, toStr] = moveStr.split(":");
    const from = parseSquare(fromStr);
    const to = parseSquare(toStr);
    if (!from || !to) return null;

    return { from, to };
  } catch {
    return getBestMoveWithMonteCarlo(board, player, 1000);
  }
}

function computeBestMoves(
  board = initialMatrixBoard,
  player: "b" | "w",
): { from: [number, number]; to: [number, number] }[] {
  // deep copy helper
  const cloneBoard = (b: any[][]) => b.map(row => row.slice());

  const boardHash = (b: any[][]) => b.flat().join("|");

  const countEmpty = (b: any[][]) => {
    let c = 0;
    for (let i = 0; i < b.length; i++) {
      for (let j = 0; j < b[i].length; j++) {
        if (b[i][j] === 0) c++;
      }
    }
    return c;
  };

  const memo = new Map<string, number>(); // state hash -> best remaining moves
  const memoPath = new Map<string, { from: [number, number]; to: [number, number] }[]>(); // optional store path

  let bestPath: { from: [number, number]; to: [number, number] }[] = [];
  let bestDepth = 0;

  function dfs(b: any[][], depth: number, path: { from: [number, number]; to: [number, number] }[]) {
    const h = boardHash(b);
    const empties = countEmpty(b);

    // upper bound pruning: cannot extend more than empties moves
    if (depth + empties <= bestDepth) return;

    if (memo.has(h)) {
      const bestFromMemo = memo.get(h)!;
      if (depth + bestFromMemo <= bestDepth) return;
    }

    // find all pieces of current player
    let movesFound = 0;
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        if (b[i][j] === player) {
          const from: [number, number] = [i, j];
          const valids = getValidMoves(from, b);
          for (const to of valids) {
            movesFound++;
            // apply move on a cloned board
            const nb = cloneBoard(b);
            nb[to[0]][to[1]] = nb[from[0]][from[1]]; // move piece
            nb[from[0]][from[1]] = "X" + player; // block origin

            const newPath = path.concat([{ from, to }]);
            dfs(nb, depth + 1, newPath);
          }
        }
      }
    }

    if (movesFound === 0) {
      // leaf: no further moves; update best if deeper
      if (depth > bestDepth) {
        bestDepth = depth;
        bestPath = path.slice();
      }
      memo.set(h, 0);
      memoPath.set(h, []);
      return;
    }

    // After exploring children, compute best remaining moves from this state
    // (we can compute from memoized children if present; for simplicity store upper bound)
    // store how many moves beyond this state we found via bestDepth
    memo.set(h, Math.max(0, bestDepth - depth));
  }

  // start DFS from the given board
  dfs(cloneBoard(board), 0, []);

  return bestPath;
}



export {
  printBoard,
  getValidMoves,
  movePiece,
  isAPlayerBlocked,
  isAPlayerAI,
  getRandomMove,
  computeBestMoves,
  initialMatrixBoard,
  getBestMoveWithMonteCarlo,
  getBestMoveWithMCTS,
  getBestMoveWithMonteCarloHalfRandom,
  getBestMoveWithMinimax
};