'use client'

import { useState } from "react";

const createBoard = (size) => Array(size * size).fill(null);

const getNeighbors = (index, size) => {
	const row = Math.floor(index / size);
	const column = index % size;
	return [
		...(row > 0 ? [index - size] : []),
		...(row < size - 1 ? [index + size] : []),
		...(column > 0 ? [index - 1] : []),
		...(column < size - 1 ? [index + 1] : []),
	];
};

const getGroup = (board, start, size) => {
	const color = board[start];
	const stones = new Set([start]);
	const liberties = new Set();
	const pending = [start];

	while (pending.length) {
		const current = pending.pop();
		for (const neighbor of getNeighbors(current, size)) {
			if (!board[neighbor]) {
				liberties.add(neighbor);
			} else if (board[neighbor] === color && !stones.has(neighbor)) {
				stones.add(neighbor);
				pending.push(neighbor);
			}
		}
	}

	return { stones, liberties };
};

const scoreBoard = (board, size) => {
	const score = { B: 0, W: 6.5 };
	const visited = new Set();

	board.forEach((stone) => {
		if (stone) score[stone] += 1;
	});

	for (let index = 0; index < board.length; index += 1) {
		if (board[index] || visited.has(index)) continue;

		const region = new Set([index]);
		const boundary = new Set();
		const pending = [index];
		visited.add(index);

		while (pending.length) {
			const current = pending.pop();
			for (const neighbor of getNeighbors(current, size)) {
				if (board[neighbor]) {
					boundary.add(board[neighbor]);
				} else if (!visited.has(neighbor)) {
					visited.add(neighbor);
					region.add(neighbor);
					pending.push(neighbor);
				}
			}
		}

		if (boundary.size === 1) score[[...boundary][0]] += region.size;
	}

	return score;
};

const toCoordinate = (index, size) => {
	const columns = "ABCDEFGHJKLMNOPQRST";
	return `${columns[index % size]}${size - Math.floor(index / size)}`;
};

export default function Go() {
	const [boardSize, setBoardSize] = useState(9);
	const [board, setBoard] = useState(() => createBoard(9));
	const [previousBoard, setPreviousBoard] = useState(null);
	const [turn, setTurn] = useState("B");
	const [consecutivePasses, setConsecutivePasses] = useState(0);
	const [gameStatus, setGameStatus] = useState("playing");
	const [moveHistory, setMoveHistory] = useState([]);
	const [lastMove, setLastMove] = useState(null);
	const [captured, setCaptured] = useState({ B: 0, W: 0 });
	const [score, setScore] = useState(null);
	const [feedback, setFeedback] = useState("Black plays first");

	const resetGame = (size = boardSize) => {
		setBoardSize(size);
		setBoard(createBoard(size));
		setPreviousBoard(null);
		setTurn("B");
		setConsecutivePasses(0);
		setGameStatus("playing");
		setMoveHistory([]);
		setLastMove(null);
		setCaptured({ B: 0, W: 0 });
		setScore(null);
		setFeedback("Black plays first");
	};

	const playAt = (index) => {
		if (gameStatus !== "playing") return;
		if (board[index]) {
			setFeedback("That intersection is already occupied");
			return;
		}

		const nextBoard = [...board];
		nextBoard[index] = turn;
		const opponent = turn === "B" ? "W" : "B";
		const removed = new Set();

		for (const neighbor of getNeighbors(index, boardSize)) {
			if (nextBoard[neighbor] !== opponent || removed.has(neighbor)) continue;
			const group = getGroup(nextBoard, neighbor, boardSize);
			if (group.liberties.size === 0) {
				for (const stone of group.stones) removed.add(stone);
			}
		}

		for (const stone of removed) nextBoard[stone] = null;

		if (getGroup(nextBoard, index, boardSize).liberties.size === 0) {
			setFeedback("That move would leave your group without liberties");
			return;
		}

		if (previousBoard && nextBoard.every((stone, square) => stone === previousBoard[square])) {
			setFeedback("That move repeats the previous board position (ko)");
			return;
		}

		setPreviousBoard(board);
		setBoard(nextBoard);
		setLastMove(index);
		setConsecutivePasses(0);
		setCaptured((current) => ({ ...current, [turn]: current[turn] + removed.size }));
		setMoveHistory((history) => [...history, { color: turn, coordinate: toCoordinate(index, boardSize) }]);
		setTurn(opponent);
		setFeedback(removed.size ? `${removed.size} stone${removed.size === 1 ? "" : "s"} captured` : "Stone played");
	};

	const passTurn = () => {
		if (gameStatus !== "playing") return;

		const nextPasses = consecutivePasses + 1;
		const opponent = turn === "B" ? "W" : "B";
		setConsecutivePasses(nextPasses);
		setPreviousBoard(null);
		setMoveHistory((history) => [...history, { color: turn, coordinate: "Pass" }]);
		setLastMove(null);
		setTurn(opponent);

		if (nextPasses === 2) {
			setScore(scoreBoard(board, boardSize));
			setGameStatus("finished");
			setFeedback("Both players passed; the game is scored");
		} else {
			setFeedback(`${turn === "B" ? "Black" : "White"} passed`);
		}
	};

	const resign = () => {
		if (gameStatus !== "playing") return;
		setGameStatus("resigned");
		setFeedback(`${turn === "B" ? "Black" : "White"} resigned`);
	};

	const scoreMessage = score
		? `Black ${score.B} - White ${score.W} (includes 6.5 komi)`
		: gameStatus === "resigned"
			? `${turn === "B" ? "White" : "Black"} wins by resignation`
			: "Place stones to surround territory and capture groups.";
	const statusLabel = gameStatus === "playing" ? "In play" : gameStatus === "finished" ? "Scored" : "Resigned";

	return (
		<main className="xiangqi-shell go-shell">
			<header className="game-header">
				<div>
					<p className="eyebrow">Two-player board game</p>
					<h1>Go</h1>
					<p className="subtitle">Build territory, capture stones, and read the board.</p>
				</div>
				<button className="majorButton" onClick={() => resetGame()} type="button">New game</button>
			</header>

			<div className="game-layout">
				<section className="board-panel" aria-label="Go board">
					<div className={`turn-bar go-turn-bar${gameStatus !== "playing" ? " go-turn-bar-finished" : ""}`}>
						<span className={`turn-marker ${turn === "B" ? "black" : "red"}`} />
						<div>
							<strong>{gameStatus === "playing" ? `${turn === "B" ? "Black" : "White"} to play` : "Game over"}</strong>
							<span className="feedback">{feedback}</span>
						</div>
						<span className="status">{statusLabel}</span>
					</div>

					<div className="board-frame go-board-frame">
						<div className="go-grid" style={{ "--board-size": boardSize }} role="group" aria-label={`${boardSize} by ${boardSize} Go board`}>
							{board.map((stone, index) => {
								const row = Math.floor(index / boardSize);
								const column = index % boardSize;
								const star = boardSize === 9
									? [2, 4, 6].includes(row) && [2, 4, 6].includes(column)
									: boardSize > 9 && [3, Math.floor(boardSize / 2), boardSize - 4].includes(row) && [3, Math.floor(boardSize / 2), boardSize - 4].includes(column);

								return (
									<button
										key={index}
										className="go-intersection"
										onClick={() => playAt(index)}
										type="button"
										aria-label={`${toCoordinate(index, boardSize)}${stone ? `, ${stone === "B" ? "black" : "white"} stone` : ", empty"}`}
										aria-disabled={gameStatus !== "playing" || Boolean(stone)}
									>
										{star && <span className="go-star-point" aria-hidden="true" />}
										{stone && <span className={`go-stone go-stone-${stone === "B" ? "black" : "white"}`} aria-hidden="true" />}
										{lastMove === index && stone && <span className={`go-last-stone-marker${stone === "B" ? " go-last-stone-marker-light" : ""}`} aria-hidden="true" />}
									</button>
								);
							})}
						</div>
					</div>

					<div className="go-controls">
						<label className="go-board-size">
							<span>Board</span>
							<select value={boardSize} onChange={(event) => resetGame(Number(event.target.value))}>
								<option value={9}>9 x 9</option>
								<option value={13}>13 x 13</option>
								<option value={19}>19 x 19</option>
							</select>
						</label>
						<div className="go-control-actions">
							<button className="go-action" onClick={passTurn} type="button" disabled={gameStatus !== "playing"}>Pass</button>
							<button className="go-action go-action-secondary" onClick={resign} type="button" disabled={gameStatus !== "playing"}>Resign</button>
						</div>
					</div>
				</section>

				<aside className="game-sidebar">
					<div className={`rules-panel status-panel go-status-panel${gameStatus !== "playing" ? " go-status-panel-finished" : ""}`} role="status" aria-live="polite">
						<p className="eyebrow">Match status</p>
						<h2 className="status-title">{statusLabel}</h2>
						<p className="status-message">{scoreMessage}</p>
						<div className="go-capture-counts">
							<span><i className="go-capture-stone black" /> Black captures <strong>{captured.B}</strong></span>
							<span><i className="go-capture-stone white" /> White captures <strong>{captured.W}</strong></span>
						</div>
					</div>

					<div className="history-panel">
						<div className="history-heading"><h2>Move history</h2><span>{moveHistory.length}</span></div>
						{moveHistory.length === 0 ? (
							<p className="empty-history">Moves will appear here.</p>
						) : (
							<ol className="move-list go-move-list">
								{moveHistory.slice(-10).map((move, index) => (
									<li key={`${move.color}-${move.coordinate}-${index}`}>
										<span>{index + Math.max(0, moveHistory.length - 10) + 1}</span>
										<span><i className={`go-history-stone ${move.color === "B" ? "black" : "white"}`} />{move.coordinate}</span>
									</li>
								))}
							</ol>
						)}
					</div>
				</aside>
			</div>
		</main>
	);
}
