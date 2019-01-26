import { appConfig } from '../app.config';
import { Player } from '../enum/player.enum';
import { Move } from '../interfaces/move.interface';

export class GameBoard {
  board2: Array<Array<Player | ''>>;
  currentPlayer: Player;
  firstPlayer: Player;
  lastMove: Move;

  constructor(gameBoard?: GameBoard) {
    if (!gameBoard) {
      this.board2 = [];
      for (let row = 0; row < appConfig.width; row++) {
        this.board2.push([]);
        for (let col = 0; col < appConfig.height; col++) {
          this.board2[row].push('');
        }
      }
    } else {
      this.firstPlayer = gameBoard.firstPlayer;
      this.board2 = gameBoard.board2.map(row =>
        row.map(col => col.slice(0))) as Array<Array<Player | ''>>;
      this.currentPlayer = gameBoard.currentPlayer;
      this.lastMove = {...gameBoard.lastMove};
    }
  }

  checkTie(): boolean {
    return this.board2.every(row => row.every(col => col !== ''));
  }

  checkWin(player: Player): boolean {
    for (let row = 0; row < appConfig.height; row++) {
      for (let col = 0; col < appConfig.width; col++) {
        const element = this.board2[row][col];

        if (element !== player) {
          continue;
        }

        /*
         * If there are 3 elements remaining to the right of the current
         * element's position and the current element equals each of
         * them, then return true
         */
        if (col <= this.board2[row].length - appConfig.wins
          && element === this.board2[row][col + 1]
          && element === this.board2[row][col + 2]
          && element === this.board2[row][col + 3]) {
          return true;
        }

        /*
         * If there are 3 elements remaining below the current element's
         * position and the current element equals each of them, then
         * return true
         */
        if (row <= this.board2.length - 4
          && element === this.board2[row + 1][col]
          && element === this.board2[row + 2][col]
          && element === this.board2[row + 3][col]) {
          return true;
        }

        /*
         * If we are in a position in the matrix such that there are
         * diagonals remaining to the bottom right of the current
         * element, then we check
         */
        if (row <= this.board2.length - 4 && col <= this.board2[row].length - 4) {
          // If the current element equals each element diagonally to
          // the bottom right
          if (element === this.board2[row + 1][col + 1]
            && element === this.board2[row + 2][col + 2]
            && element === this.board2[row + 3][col + 3]) {
            return true;
          }
        }

        /*
         * If we are in a position in the matrix such that there are
         * diagonals remaining to the bottom left of the current
         * element, then we check
         */
        if (row <= this.board2.length - 4 && col >= 3) {
          // If the current element equals each element diagonally to
          // the bottom left
          if (element === this.board2[row + 1][col - 1]
            && element === this.board2[row + 2][col - 2]
            && element === this.board2[row + 3][col - 3]) {
            return true;
          }
        }
      }
    }

    return false;
  }

  consoleFormat(): string {
    let board = `N - next move for ${this.currentPlayer === Player.O ? Player.X : Player.O}\n\n`;

    this.board2.forEach((row, rowIndex) => {
        row.forEach((col, colIndex) => {
          board += rowIndex === this.lastMove.row && colIndex === this.lastMove.col ?
            '%cN %c' : (this.board2[rowIndex][colIndex] || '-') + ' ';
        });

        board += '\n';
      }
    );

    return board;
  }

  getPossibleGameBoards(): GameBoard[] {
    const possibleGameBoards: GameBoard[] = [];

    this.board2.forEach((row, rowIndex) =>
      row.forEach((col, colIndex) => {
        if (this.checkMove(rowIndex, colIndex)) {
          possibleGameBoards.push(this.move(this.currentPlayer, rowIndex, colIndex));
        }
      })
    );

    return possibleGameBoards;
  }

  move(player: Player, row: number, col: number): GameBoard {
    if (!this.checkMove(row, col)) {
      return this;
    }

    const gb = new GameBoard(this);
    gb.setMove(player, row, col);
    gb.currentPlayer = this.currentPlayer === Player.X ? Player.O : Player.X;

    return gb;
  }

  toString(): string {
    let s = `${this.firstPlayer}${this.currentPlayer}`;

    this.board2.forEach(row => row.forEach(col => {
      s += col || '-';
    }));

    return s;
  }

  private checkMove(row: number, col: number): boolean {
    return this.board2[row][col] === '';
  }

  private setMove(player: Player, row: number, col: number): void {
    this.board2[row][col] = player;
    this.lastMove = {player, row, col};
  }
}
