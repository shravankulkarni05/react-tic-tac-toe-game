import React, { Component } from "react";
import Square from "../components/Square";
import "./Board.css";

class Board extends Component {
  constructor(props) {
    super(props);
    this.state = {
      board: [],
      boardSize: 9,
      activeTurn: "",
      totalPlayedTurns: 0,
      isGameDraw: false,
      isGameOver: false,
      isWinner: false,
      gameResult: {
        state: "",
        result: "",
      },
      xScanCounter: 0,
      oScanCounter: 0,
      maxCols: 0,
      players: {
        x: "X",
        o: "O",
      },
      resultText: {
        win: "Winner!",
        draw: "Draw!",
      },
      strikePattern: "",
    };
  }

  componentDidMount() {
    this.createBoard();
  }

  createBoard() {
    let squares = [];
    const board = [];
    const boardSize = this.state.boardSize;
    const maxCols = Math.sqrt(boardSize);
    let square = null;
    for (let i = 0, row = 0, col = 0; i < boardSize; i++) {
      const sqNo = i + 1;
      square = Object.assign({});
      square.sqNo = sqNo;
      square.row = row;
      square.col = col;
      square.state = null;
      square.chk = false;
      square.markPlaceholder = false;
      squares.push(square);
      col++;
      if (sqNo % maxCols === 0) {
        row++;
        col = 0;
        board.push(Object.assign([], squares));
        squares = [];
      }
    }
    const turns = Object.values(this.state.players);
    this.setState({
      board: board,
      maxCols: maxCols,
      activeTurn: turns[Math.floor(Math.random() * turns.length)],
    });
  }

  getTurnMessageTemplate() {
    return this.state.isGameOver ? (
      <span className="turn-txt">Game Over</span>
    ) : (
      <React.Fragment>
        <span className="active-turn">{this.state.activeTurn}&nbsp;</span>
        <span className="turn-txt">Turn</span>
      </React.Fragment>
    );
  }

  resetScanCounters() {
    this.setState({ xScanCounter: 0, oScanCounter: 0 });
  }

  resetBoard() {
    const state = { ...this.state };
    state.board = [];
    state.totalPlayedTurns = 0;
    state.isGameOver = false;
    state.isGameDraw = false;
    state.gameResult = {
      result: "",
      state: "",
    };
    state.strikePattern = null;
    this.setState(state);
    setTimeout(() => {
      this.resetScanCounters();
    }, 0);
    setTimeout(() => {
      this.createBoard();
    }, 0);
  }

  placeMark = (square) => {
    if (square.chk) {
      return;
    }
    const state = { ...this.state };
    square.state = state.activeTurn;
    square.chk = true;
    if (square.markPlaceholder) {
      square.markPlaceholder = false;
    }
    const board = state.board;
    board[square.row][square.col] = square;
    state.board = board;
    state.totalPlayedTurns = this.state.totalPlayedTurns + 1;
    this.setState(state);
    setTimeout(() => {
      this.findWinner();
    }, 0);
    setTimeout(() => {
      this.isMatchDraw();
    }, 0);
    setTimeout(() => {
      this.switchTurns();
    }, 0);
  };

  squareMouseEnter = (square) => {
    if (square.chk) {
      return;
    }
    square.state = this.state.activeTurn;
    square.markPlaceholder = true;
    const board = [...this.state.board];
    board[square.row][square.col] = square;
    this.setState({ board: board });
  };

  squareMouseLeave = (square) => {
    if (square.chk) {
      return;
    }
    square.state = null;
    square.markPlaceholder = false;
    const board = [...this.state.board];
    board[square.row][square.col] = square;
    this.setState({ board: board });
  };

  findWinner() {
    if (this.state.isGameDraw || this.state.isGameOver) {
      return;
    }
    this.scanRowsOrCols("row");
    this.scanRowsOrCols("col");
    this.scanDiagonals();
  }

  isMatchDraw() {
    if (
      !this.state.gameResult.result &&
      !this.state.isGameOver &&
      this.state.totalPlayedTurns === this.state.boardSize
    ) {
      this.setState({ isGameOver: true, isGameDraw: true });
      this.setGameResult(null, this.state.resultText.draw);
    }
  }

  switchTurns() {
    if (this.state.isGameOver || this.state.isGameDraw) {
      return;
    }
    this.setState((state) => {
      return {
        activeTurn:
          state.activeTurn === state.players.x
            ? this.state.players.o
            : this.state.players.x,
      };
    });
  }

  scanRowsOrCols(scan) {
    const maxCols = this.state.maxCols;
    const board = this.state.board;
    let isGameWon = false;
    for (let i = 0; i < maxCols; i++) {
      const row = board[i];
      for (let j = 0; j < row.length; j++) {
        const state = scan === "row" ? row[j].state : board[j][i].state;
        this.increamentScanCounters(state);
        isGameWon = this.isGameWon(state, scan + "-" + (i + 1));
        if (isGameWon) {
          break;
        }
      }
      if (isGameWon) {
        break;
      }
      this.resetScanCounters();
    }
    return isGameWon;
  }

  scanDiagonals() {
    if (this.state.isGameOver) {
      return;
    }
    // Scan for backward diagonal
    const maxCols = this.state.maxCols;
    const board = this.state.board;
    let isGameWon = false;
    for (let i = 0; i < maxCols; i++) {
      const state = board[i][i].state;
      this.increamentScanCounters(state);
      isGameWon = this.isGameWon(state, "diag-2");
    }
    this.resetScanCounters();
    if (!isGameWon) {
      // Scan for forward diagonal
      for (let i = 0, j = maxCols - 1; j >= 0; i++, j--) {
        const state = board[i][j].state;
        this.increamentScanCounters(state);
        this.isGameWon(state, "diag-1");
      }
      this.resetScanCounters();
    }
  }

  increamentScanCounters(state) {
    if (!state) {
      return;
    }
    if (state === this.state.players.x) {
      this.setState((state) => {
        return {
          xScanCounter: state.xScanCounter + 1,
        };
      });
    } else if (state === this.state.players.o) {
      this.setState((state) => {
        return {
          oScanCounter: state.oScanCounter + 1,
        };
      });
    }
  }

  isGameWon(state, strikePattern) {
    if (!state) {
      return;
    }
    const players = this.state.players;
    let won = false;
    if (state === players.x && this.state.maxCols === this.state.xScanCounter) {
      won = true;
    } else if (
      state === players.o &&
      this.state.maxCols === this.state.oScanCounter
    ) {
      won = true;
    }
    if (won) {
      this.setState({ strikePattern: strikePattern });
      this.setGameResult(state, this.state.resultText.win);
      setTimeout(() => {
        this.setState({ strikePattern: null, isGameOver: true });
        this.showConfetti();
      }, 600);
      return true;
    }
    return false;
  }

  showConfetti() {
    const confettiContainer = document.getElementById("confetti");
    const animItem = window.bodymovin.loadAnimation({
      wrapper: confettiContainer,
      animType: "svg",
      loop: false,
      autoplay: false,
      path: "https://assets2.lottiefiles.com/packages/lf20_u4yrau.json",
    });
    confettiContainer.classList.remove("hide");
    animItem.goToAndPlay(0, true);
    animItem.addEventListener("complete", () => {
      confettiContainer.removeChild(confettiContainer.childNodes[0]);
      confettiContainer.classList.add("hide");
    });
  }

  setGameResult(state, gameResult) {
    const result = {};
    result.state = state;
    result.result = gameResult;
    this.setState({ gameResult: result });
  }

  getRowsTemplate() {
    const template = this.state.board.map((row, rIndex) => (
      <div className="row" key={rIndex}>
        {row.map((square) => {
          return (
            <Square
              key={square.sqNo}
              square={square}
              players={this.state.players}
              placeMark={() => this.placeMark(square)}
              squareMouseEnter={() => this.squareMouseEnter(square)}
              squareMouseLeave={() => this.squareMouseLeave(square)}
            ></Square>
          );
        })}
      </div>
    ));
    return template;
  }

  getGameOverTemplate() {
    const players = this.state.players;
    const win =
      this.state.gameResult.state === players.x ? (
        <span className="x-marker">{players.x}</span>
      ) : this.state.gameResult.state === players.o ? (
        <span className="o-marker">{players.o}</span>
      ) : null;
    return (
      <div className={"game-result" + (this.state.isGameDraw ? " draw" : "")}>
        {!this.state.isGameDraw ? (
          <div className="result-mark">{win}</div>
        ) : (
          <React.Fragment>
            <span className="x-marker">{players.x}</span>
            <span className="o-marker">{players.o}</span>
          </React.Fragment>
        )}
        <div className="result">{this.state.gameResult.result}</div>
      </div>
    );
  }

  render() {
    return (
      <div className="game-container">
        <div className="game-header">
          <h1>Tic Tac Toe</h1>
        </div>
        <div className="container">
          <div className="turn">{this.getTurnMessageTemplate()}</div>
          <div className="box">
            {!this.state.isGameOver
              ? this.getRowsTemplate()
              : this.getGameOverTemplate()}
            {this.state.isGameOver && (
              <div className="confetti hide" id="confetti"></div>
            )}
            {this.state.strikePattern && (
              <div
                className={"strike-through " + this.state.strikePattern}
              ></div>
            )}
          </div>
        </div>
        <div className="game-footer">
          <button className="reset-game-btn" onClick={() => this.resetBoard()}>
            RESTART GAME
          </button>
        </div>
      </div>
    );
  }
}

export default Board;
