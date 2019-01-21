import { appConfig } from '../app.config';
import { Player } from '../enum/player.enum';
import { Move } from '../interfaces/move.interface';

export class GameBoard {
  board: string[] = [];
  lastMove: Move;

  constructor(gameBoard?: GameBoard) {
    if (!gameBoard) {
      const size = appConfig.width * appConfig.height;

      for (let i = 0; i < size; i++) {
        this.board.push('');
      }
    } else {
      this.board = gameBoard.board.slice(0);
      this.lastMove = {...gameBoard.lastMove};
    }
  }

  checkNumPlays(player: Player, plays: number): number {
    const size = appConfig.width * appConfig.height;
    let total = 0;

    for (let i = 0; i < size; i++) {
      if (this.board[i] === '') {
        total++;
      }
    }

    return total;
  }

  checkTie(): boolean {
    return this.board.every(m => m !== '');
  }

  checkWin(player: Player): boolean {
    let count: number[];

    // check horizontals
    for (let i = 0; i < appConfig.height; i++) {
      count = [];
      for (let j = 0; j < appConfig.width; j++) {
        const position = this.getPositionForMove(j, i);
        if (this.board[position] === player) {
          count.push(j);
        }
      }

      if (count.length >= appConfig.wins && this.isConsecutiveArray(count)) {
        return true;
      }
    }

    // check verticals
    for (let i = 0; i < appConfig.width; i++) {
      count = [];
      for (let j = 0; j < appConfig.height; j++) {
        if (this.board[this.getPositionForMove(i, j)] === player) {
          count.push(j);
        }
      }

      if (count.length >= appConfig.wins && this.isConsecutiveArray(count)) {
        return true;
      }
    }

    // check diagonals
    count = [];

    // major diagonal
    for (let i = 0; i < appConfig.height; i++) {
      if (this.board[this.getPositionForMove(i, i)] === player) {
        count.push(i);
      }
    }

    if (count.length >= appConfig.wins && this.isConsecutiveArray(count)) {
      return true;
    }

    // minor diagonal
    const diff = appConfig.height - appConfig.wins;

    let diag1: number[];
    let diag2: number[];

    for (let i = 1; i <= diff; i++) {
      diag1 = [];
      diag2 = [];
      for (let j = 0; j < appConfig.width - i; j++) {
        if (this.board[this.getPositionForMove(j, j + 1)] === player) {
          diag1.push(j);
        }

        if (this.board[this.getPositionForMove(j + 1, j)] === player) {
          diag2.push(j);
        }
      }
    }

    if (diag1.length >= appConfig.wins && this.isConsecutiveArray(diag1)) {
      return true;
    }

    if (diag2.length >= appConfig.wins && this.isConsecutiveArray(diag2)) {
      return true;
    }

    // minor diagonal
    for (let i = 1; i <= diff; i++) {
      diag1 = [];
      diag2 = [];
      for (let j = 0; j < appConfig.width - i; j++) {
        if (this.board[this.getPositionForMove(j, appConfig.width - j - i - 1)] === player) {
          diag1.push(j);
        }

        if (this.board[this.getPositionForMove(j + i, appConfig.width - j - 1)] === player) {
          diag2.push(j);
        }
      }
    }

    if (diag1.length >= appConfig.wins && this.isConsecutiveArray(diag1)) {
      return true;
    }

    if (diag2.length >= appConfig.wins && this.isConsecutiveArray(diag2)) {
      return true;
    }

    // major diagonal
    count = [];
    for (let i = 0; i < appConfig.height; i++) {
      if (this.board[this.getPositionForMove(i, appConfig.height - i - 1)] === player) {
        count.push(i);
      }
    }

    return count.length >= appConfig.wins && this.isConsecutiveArray(count);
  }

  getPossibleGameBoards(player: Player): GameBoard[] {
    const possibleGameBoards: GameBoard[] = [];
    const size = appConfig.height * appConfig.width;

    for (let i = 0; i < size; i++) {
      if (this.checkMove(i)) {
        possibleGameBoards.push(this.move(player, i));
      }
    }

    return possibleGameBoards;
  }

  move(player: Player, position: number): GameBoard {
    if (!this.checkMove(position)) {
      return this;
    }

    const gb = new GameBoard(this);
    gb.setMove(player, position);

    return gb;
  }

  private checkMove(position: number): boolean {
    return this.board[position] === '';
  }

  private getPositionForMove(col: number, row: number): number {
    return col + row * appConfig.width;
  }

  private isConsecutiveArray(arr: number[]): boolean {
    const l = arr.length - 1;

    for (let i = 0; i < l; i++) {
      if (arr[i] + 1 !== arr[i + 1]) {
        return false;
      }
    }

    return true;
  }

  private setMove(player: Player, position: number): void {
    this.board[position] = player;
    this.lastMove = {player, position};
  }
}
