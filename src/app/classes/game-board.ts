import { appConfig } from '../app.config';
import { Player } from '../enum/player.enum';
import { Move } from '../interfaces/move.interface';
import { PositionWithCount } from '../interfaces/position-with-count.interface';

export class GameBoard {
  board: string[] = [];
  currentPlayer: Player;
  lastMove: Move;

  constructor(gameBoard?: GameBoard) {
    if (!gameBoard) {
      const size = appConfig.width * appConfig.height;

      for (let i = 0; i < size; i++) {
        this.board.push('');
      }
    } else {
      this.board = gameBoard.board.slice(0);
      this.currentPlayer = gameBoard.currentPlayer;
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

  checkWin(player: Player): number[] | null {
    let count: PositionWithCount[];

    // check horizontals
    for (let i = 0; i < appConfig.height; i++) {
      count = [];
      for (let j = 0; j < appConfig.width; j++) {
        const position = this.getPositionForMove(j, i);
        if (this.board[position] === player) {
          count.push({position, count: j});
        }
      }

      if (count.length >= appConfig.wins && this.isConsecutive(count)) {
        return this.positionWithCountToPosition(count);
      }
    }

    // check verticals
    for (let i = 0; i < appConfig.width; i++) {
      count = [];
      for (let j = 0; j < appConfig.height; j++) {
        const position = this.getPositionForMove(i, j);
        if (this.board[position] === player) {
          count.push({position, count: j});
        }
      }

      if (count.length >= appConfig.wins && this.isConsecutive(count)) {
        return this.positionWithCountToPosition(count);
      }
    }

    // check diagonals
    count = [];

    // major diagonal
    for (let i = 0; i < appConfig.height; i++) {
      const position = this.getPositionForMove(i, i);
      if (this.board[position] === player) {
        count.push({position, count: i});
      }
    }

    if (count.length >= appConfig.wins && this.isConsecutive(count)) {
      return this.positionWithCountToPosition(count);
    }

    // minor diagonal
    const diff = appConfig.height - appConfig.wins;

    let diag1: PositionWithCount[];
    let diag2: PositionWithCount[];

    for (let i = 1; i <= diff; i++) {
      diag1 = [];
      diag2 = [];
      for (let j = 0; j < appConfig.width - i; j++) {
        const position1 = this.getPositionForMove(j, j + 1);
        if (this.board[position1] === player) {
          diag1.push({position: position1, count: j});
        }

        const position2 = this.getPositionForMove(j + 1, j);
        if (this.board[position2] === player) {
          diag2.push({position: position2, count: j});
        }
      }
    }

    if (diag1.length >= appConfig.wins && this.isConsecutive(diag1)) {
      return this.positionWithCountToPosition(diag1);
    }

    if (diag2.length >= appConfig.wins && this.isConsecutive(diag2)) {
      return this.positionWithCountToPosition(diag2);
    }

    // minor diagonal
    for (let i = 1; i <= diff; i++) {
      diag1 = [];
      diag2 = [];
      for (let j = 0; j < appConfig.width - i; j++) {
        const pos1 = this.getPositionForMove(j, appConfig.width - j - i - 1);
        if (this.board[pos1] === player) {
          diag1.push({position: pos1, count: j});
        }

        const pos2 = this.getPositionForMove(j + i, appConfig.width - j - 1);
        if (this.board[pos2] === player) {
          diag2.push({position: pos2, count: j});
        }
      }
    }

    if (diag1.length >= appConfig.wins && this.isConsecutive(diag1)) {
      return this.positionWithCountToPosition(diag1);
    }

    if (diag2.length >= appConfig.wins && this.isConsecutive(diag2)) {
      return this.positionWithCountToPosition(diag2);
    }

    // major diagonal
    count = [];
    for (let i = 0; i < appConfig.height; i++) {
      const position = this.getPositionForMove(i, appConfig.height - i - 1);
      if (this.board[position] === player) {
        count.push({position, count: i});
      }
    }

    if (count.length >= appConfig.wins && this.isConsecutive(count)) {
      return this.positionWithCountToPosition(count);
    }

    return null;
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
    gb.currentPlayer = this.currentPlayer === Player.X ? Player.O : Player.X;

    return gb;
  }

  private checkMove(position: number): boolean {
    return this.board[position] === '';
  }

  private getPositionForMove(col: number, row: number): number {
    return col + row * appConfig.width;
  }

  private isConsecutive(arr: PositionWithCount[]): boolean {
    const l = arr.length - 1;

    for (let i = 0; i < l; i++) {
      if (arr[i].count + 1 !== arr[i + 1].count) {
        return false;
      }
    }

    return true;
  }

  private positionWithCountToPosition(positionWithCount: PositionWithCount[]): number[] {
    return positionWithCount.map(pwc => pwc.position);
  }

  private setMove(player: Player, position: number): void {
    this.board[position] = player;
    this.lastMove = {player, position};
  }
}
