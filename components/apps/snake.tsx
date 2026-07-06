"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Play,
  RotateCcw,
  Pause,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Apple,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SnakeProps {
  isDarkMode?: boolean;
}

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type GameStatus = "idle" | "playing" | "paused" | "gameOver";
type Position = { x: number; y: number };

const GRID_SIZE = 20;
const DEFAULT_BOARD_SIZE = 400;
const GAME_SPEED = 100;
const HIGH_SCORE_KEY = "snakeHighScore";

const INITIAL_SNAKE: Position[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];

const INITIAL_DIRECTION: Direction = "UP";

const isSamePosition = (a: Position, b: Position) => {
  return a.x === b.x && a.y === b.y;
};

const isOppositeDirection = (current: Direction, next: Direction) => {
  return (
    (current === "UP" && next === "DOWN") ||
    (current === "DOWN" && next === "UP") ||
    (current === "LEFT" && next === "RIGHT") ||
    (current === "RIGHT" && next === "LEFT")
  );
};

const getNextHead = (head: Position, direction: Direction): Position => {
  switch (direction) {
    case "UP":
      return { x: head.x, y: head.y - 1 };
    case "DOWN":
      return { x: head.x, y: head.y + 1 };
    case "LEFT":
      return { x: head.x - 1, y: head.y };
    case "RIGHT":
      return { x: head.x + 1, y: head.y };
    default:
      return head;
  }
};

const generateFood = (currentSnake: Position[]): Position => {
  const freeCells: Position[] = [];

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const position = { x, y };

      const isSnakeCell = currentSnake.some((segment) =>
        isSamePosition(segment, position),
      );

      if (!isSnakeCell) {
        freeCells.push(position);
      }
    }
  }

  if (freeCells.length === 0) {
    return { x: 0, y: 0 };
  }

  return freeCells[Math.floor(Math.random() * freeCells.length)];
};

export default function Snake({ isDarkMode = true }: SnakeProps) {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>(() => generateFood(INITIAL_SNAKE));
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [nextDirection, setNextDirection] =
    useState<Direction>(INITIAL_DIRECTION);
  const [gameStatus, setGameStatus] = useState<GameStatus>("idle");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [boardSize, setBoardSize] = useState(DEFAULT_BOARD_SIZE);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardAreaRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<number | null>(null);

  const directionRef = useRef<Direction>(INITIAL_DIRECTION);
  const nextDirectionRef = useRef<Direction>(INITIAL_DIRECTION);
  const snakeRef = useRef<Position[]>(INITIAL_SNAKE);
  const foodRef = useRef<Position>(food);
  const scoreRef = useRef(0);
  const gameStatusRef = useRef<GameStatus>("idle");

  const isPlaying = gameStatus === "playing";
  const isGameOver = gameStatus === "gameOver";

  const appBg = isDarkMode
    ? "bg-zinc-950 text-zinc-100"
    : "bg-zinc-100 text-zinc-900";

  const panelBg = isDarkMode ? "bg-zinc-900/80" : "bg-white";
  const borderColor = isDarkMode ? "border-zinc-800" : "border-zinc-200";
  const mutedText = isDarkMode ? "text-zinc-400" : "text-zinc-500";
  const statBg = isDarkMode ? "bg-zinc-800/70" : "bg-zinc-100";
  const controlButtonClass = isDarkMode
    ? "border-zinc-700 bg-zinc-900 hover:bg-zinc-800"
    : "";

  const colors = {
    boardBg: isDarkMode ? "#111113" : "#f8fafc",
    gridA: isDarkMode ? "#18181b" : "#f1f5f9",
    gridB: isDarkMode ? "#101012" : "#ffffff",
    snakeHead: isDarkMode ? "#86efac" : "#16a34a",
    snakeBody: isDarkMode ? "#22c55e" : "#22c55e",
    snakeStroke: isDarkMode ? "#14532d" : "#15803d",
    food: isDarkMode ? "#fb7185" : "#ef4444",
    foodGlow: isDarkMode
      ? "rgba(251, 113, 133, 0.35)"
      : "rgba(239, 68, 68, 0.25)",
    overlay: "rgba(0, 0, 0, 0.68)",
    text: "#ffffff",
    mutedText: "#a1a1aa",
  };

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    nextDirectionRef.current = nextDirection;
  }, [nextDirection]);

  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);

  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    gameStatusRef.current = gameStatus;
  }, [gameStatus]);

  useEffect(() => {
    const savedHighScore = window.localStorage.getItem(HIGH_SCORE_KEY);
    const parsedHighScore = savedHighScore
      ? Number.parseInt(savedHighScore, 10)
      : 0;

    if (Number.isFinite(parsedHighScore)) {
      setHighScore(parsedHighScore);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
  }, [highScore]);

  useEffect(() => {
    const boardArea = boardAreaRef.current;

    if (!boardArea) return;

    const updateBoardSize = () => {
      const rect = boardArea.getBoundingClientRect();

      const availableSize = Math.min(rect.width - 24, rect.height - 24);
      const nextSize = Math.max(
        220,
        Math.min(DEFAULT_BOARD_SIZE, availableSize),
      );

      setBoardSize(Math.floor(nextSize));
    };

    updateBoardSize();

    const resizeObserver = new ResizeObserver(updateBoardSize);
    resizeObserver.observe(boardArea);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const drawRoundedRect = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number,
    ) => {
      const safeRadius = Math.min(radius, width / 2, height / 2);

      ctx.beginPath();
      ctx.moveTo(x + safeRadius, y);
      ctx.lineTo(x + width - safeRadius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
      ctx.lineTo(x + width, y + height - safeRadius);
      ctx.quadraticCurveTo(
        x + width,
        y + height,
        x + width - safeRadius,
        y + height,
      );
      ctx.lineTo(x + safeRadius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
      ctx.lineTo(x, y + safeRadius);
      ctx.quadraticCurveTo(x, y, x + safeRadius, y);
      ctx.closePath();
      ctx.fill();
    },
    [],
  );

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const ratio = window.devicePixelRatio || 1;
    const cellSize = boardSize / GRID_SIZE;

    canvas.width = boardSize * ratio;
    canvas.height = boardSize * ratio;
    canvas.style.width = `${boardSize}px`;
    canvas.style.height = `${boardSize}px`;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    ctx.fillStyle = colors.boardBg;
    ctx.fillRect(0, 0, boardSize, boardSize);

    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        ctx.fillStyle = (x + y) % 2 === 0 ? colors.gridA : colors.gridB;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }

    snake.forEach((segment, index) => {
      const padding = index === 0 ? cellSize * 0.1 : cellSize * 0.14;
      const x = segment.x * cellSize + padding;
      const y = segment.y * cellSize + padding;
      const size = cellSize - padding * 2;

      ctx.fillStyle = index === 0 ? colors.snakeHead : colors.snakeBody;
      drawRoundedRect(ctx, x, y, size, size, Math.max(3, cellSize * 0.25));

      ctx.strokeStyle = colors.snakeStroke;
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
    });

    const foodCenterX = food.x * cellSize + cellSize / 2;
    const foodCenterY = food.y * cellSize + cellSize / 2;

    ctx.shadowColor = colors.foodGlow;
    ctx.shadowBlur = 12;
    ctx.fillStyle = colors.food;
    ctx.beginPath();
    ctx.arc(foodCenterX, foodCenterY, cellSize / 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    if (
      gameStatus === "idle" ||
      gameStatus === "paused" ||
      gameStatus === "gameOver"
    ) {
      ctx.fillStyle = colors.overlay;
      ctx.fillRect(0, 0, boardSize, boardSize);

      ctx.fillStyle = colors.text;
      ctx.textAlign = "center";
      ctx.font = `700 ${Math.max(20, boardSize * 0.065)}px Arial`;

      if (gameStatus === "gameOver") {
        ctx.fillText("Game Over", boardSize / 2, boardSize / 2 - 32);

        ctx.font = `${Math.max(13, boardSize * 0.038)}px Arial`;
        ctx.fillStyle = colors.mutedText;
        ctx.fillText(`Final Score: ${score}`, boardSize / 2, boardSize / 2);
        ctx.fillText(
          "Press Restart or Enter",
          boardSize / 2,
          boardSize / 2 + 28,
        );
      } else {
        ctx.fillText(
          gameStatus === "idle" ? "Snake" : "Paused",
          boardSize / 2,
          boardSize / 2 - 24,
        );

        ctx.font = `${Math.max(13, boardSize * 0.038)}px Arial`;
        ctx.fillStyle = colors.mutedText;
        ctx.fillText(
          "Use arrows / WASD to move",
          boardSize / 2,
          boardSize / 2 + 8,
        );
        ctx.fillText(
          "Press Space to play / pause",
          boardSize / 2,
          boardSize / 2 + 34,
        );
      }
    }
  }, [boardSize, colors, drawRoundedRect, food, gameStatus, score, snake]);

  useEffect(() => {
    drawGame();
  }, [drawGame]);

  const endGame = useCallback(() => {
    setGameStatus("gameOver");
  }, []);

  const moveSnake = useCallback(() => {
    const currentSnake = snakeRef.current;
    const currentFood = foodRef.current;
    const currentDirection = directionRef.current;
    const queuedDirection = nextDirectionRef.current;

    const finalDirection = isOppositeDirection(
      currentDirection,
      queuedDirection,
    )
      ? currentDirection
      : queuedDirection;

    directionRef.current = finalDirection;
    setDirection(finalDirection);

    const head = getNextHead(currentSnake[0], finalDirection);

    const hitWall =
      head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE;

    if (hitWall) {
      endGame();
      return;
    }

    const willEatFood = isSamePosition(head, currentFood);
    const bodyToCheck = willEatFood ? currentSnake : currentSnake.slice(0, -1);

    const hitSelf = bodyToCheck.some((segment) =>
      isSamePosition(segment, head),
    );

    if (hitSelf) {
      endGame();
      return;
    }

    const nextSnake = willEatFood
      ? [head, ...currentSnake]
      : [head, ...currentSnake.slice(0, -1)];

    setSnake(nextSnake);
    snakeRef.current = nextSnake;

    if (willEatFood) {
      const nextScore = scoreRef.current + 10;

      setScore(nextScore);
      scoreRef.current = nextScore;

      setHighScore((prev) => Math.max(prev, nextScore));

      const nextFood = generateFood(nextSnake);

      setFood(nextFood);
      foodRef.current = nextFood;
    }
  }, [endGame]);

  useEffect(() => {
    if (gameStatus !== "playing") {
      if (gameLoopRef.current) {
        window.clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }

      return;
    }

    gameLoopRef.current = window.setInterval(moveSnake, GAME_SPEED);

    return () => {
      if (gameLoopRef.current) {
        window.clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [gameStatus, moveSnake]);

  const startGame = useCallback(() => {
    if (gameStatusRef.current === "gameOver") return;

    setGameStatus("playing");
  }, []);

  const togglePause = useCallback(() => {
    setGameStatus((prev) => {
      if (prev === "gameOver") return prev;
      if (prev === "playing") return "paused";
      return "playing";
    });
  }, []);

  const resetGame = useCallback(() => {
    const freshSnake = INITIAL_SNAKE.map((segment) => ({ ...segment }));
    const freshFood = generateFood(freshSnake);

    setSnake(freshSnake);
    setFood(freshFood);
    setDirection(INITIAL_DIRECTION);
    setNextDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameStatus("idle");

    snakeRef.current = freshSnake;
    foodRef.current = freshFood;
    directionRef.current = INITIAL_DIRECTION;
    nextDirectionRef.current = INITIAL_DIRECTION;
    scoreRef.current = 0;
    gameStatusRef.current = "idle";
  }, []);

  const changeDirection = useCallback((newDirection: Direction) => {
    if (gameStatusRef.current === "gameOver") return;

    const currentQueuedDirection = nextDirectionRef.current;

    if (isOppositeDirection(currentQueuedDirection, newDirection)) {
      return;
    }

    setNextDirection(newDirection);
    nextDirectionRef.current = newDirection;

    if (gameStatusRef.current === "idle") {
      setGameStatus("playing");
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;

      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === " "
      ) {
        e.preventDefault();
      }

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          changeDirection("UP");
          break;

        case "ArrowDown":
        case "s":
        case "S":
          changeDirection("DOWN");
          break;

        case "ArrowLeft":
        case "a":
        case "A":
          changeDirection("LEFT");
          break;

        case "ArrowRight":
        case "d":
        case "D":
          changeDirection("RIGHT");
          break;

        case " ":
          togglePause();
          break;

        case "Enter":
          if (gameStatusRef.current === "gameOver") {
            resetGame();
          } else {
            startGame();
          }
          break;

        case "r":
        case "R":
          resetGame();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [changeDirection, resetGame, startGame, togglePause]);

  return (
    <div className={`h-full ${appBg} p-4 overflow-hidden`}>
      <div
        className={`
          h-full rounded-3xl border ${borderColor} ${panelBg}
          flex flex-col overflow-hidden shadow-xl
        `}
      >
        <div
          className={`
            shrink-0 px-4 py-3 border-b ${borderColor}
            flex items-center justify-between gap-3
          `}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Apple className="w-5 h-5 text-emerald-500 shrink-0" />
              <h2 className="text-lg font-semibold tracking-tight truncate">
                Snake
              </h2>
            </div>

            <p className={`text-xs mt-0.5 truncate ${mutedText}`}>
              Arrow keys / WASD to move, Space to pause
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={togglePause}
              disabled={isGameOver}
              className={controlButtonClass}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 mr-1" />
              ) : (
                <Play className="w-4 h-4 mr-1" />
              )}
              {isPlaying ? "Pause" : "Play"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={resetGame}
              className={controlButtonClass}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Restart
            </Button>
          </div>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_170px] gap-4 p-4">
          <div
            ref={boardAreaRef}
            className={`
              min-h-0 flex items-center justify-center rounded-3xl border ${borderColor}
              ${isDarkMode ? "bg-black/30" : "bg-zinc-50"}
              p-3 overflow-hidden
            `}
          >
            <canvas
              ref={canvasRef}
              width={boardSize}
              height={boardSize}
              className="block rounded-2xl border border-zinc-700/60 shadow-lg"
              aria-label="Snake game board"
            />
          </div>

          <aside className="min-h-0 flex md:flex-col gap-3">
            <div
              className={`
                flex-1 md:flex-none rounded-2xl ${statBg}
                border ${borderColor} p-3
              `}
            >
              <p className={`text-xs ${mutedText}`}>Score</p>
              <p className="text-2xl font-bold tabular-nums">{score}</p>
            </div>

            <div
              className={`
                flex-1 md:flex-none rounded-2xl ${statBg}
                border ${borderColor} p-3
              `}
            >
              <div className="flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                <p className={`text-xs ${mutedText}`}>High Score</p>
              </div>
              <p className="text-2xl font-bold tabular-nums">{highScore}</p>
            </div>

            <div
              className={`
                rounded-2xl border ${borderColor}
                ${isDarkMode ? "bg-zinc-950/40" : "bg-zinc-50"}
                p-3 hidden md:block
              `}
            >
              <div className="grid grid-cols-3 gap-2">
                <div className="col-start-2">
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label="Move up"
                    className={`w-full aspect-square ${controlButtonClass}`}
                    onClick={() => changeDirection("UP")}
                    disabled={isGameOver}
                  >
                    <ChevronUp className="w-5 h-5" />
                  </Button>
                </div>

                <div className="col-start-1 row-start-2">
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label="Move left"
                    className={`w-full aspect-square ${controlButtonClass}`}
                    onClick={() => changeDirection("LEFT")}
                    disabled={isGameOver}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                </div>

                <div className="col-start-2 row-start-2">
                  <div
                    className={`
                      w-full aspect-square rounded-md
                      ${isDarkMode ? "bg-zinc-800/60" : "bg-zinc-100"}
                    `}
                  />
                </div>

                <div className="col-start-3 row-start-2">
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label="Move right"
                    className={`w-full aspect-square ${controlButtonClass}`}
                    onClick={() => changeDirection("RIGHT")}
                    disabled={isGameOver}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                <div className="col-start-2 row-start-3">
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label="Move down"
                    className={`w-full aspect-square ${controlButtonClass}`}
                    onClick={() => changeDirection("DOWN")}
                    disabled={isGameOver}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            <p
              className={`hidden md:block text-xs leading-relaxed ${mutedText}`}
            >
              Press{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-700/40">Space</kbd>{" "}
              to pause and{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-700/40">R</kbd> to
              restart.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
