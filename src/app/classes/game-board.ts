import { appConfig } from '../app.config';
import { Player } from '../enum/player.enum';
import { Move } from '../interfaces/move.interface';
import { PositionWithCount } from '../interfaces/position-with-count.interface';

export class GameBoard {
  board: Array<Player | ''> = [];
  currentPlayer: Player;
  firstPlayer: Player;
  lastMove: Move;

  constructor(gameBoard?: GameBoard) {
    if (!gameBoard) {
      const size = appConfig.width * appConfig.height;

      for (let i = 0; i < size; i++) {
        this.board.push('');
      }
    } else {
      this.firstPlayer = gameBoard.firstPlayer;
      this.board = gameBoard.board.slice(0);
      this.currentPlayer = gameBoard.currentPlayer;
      this.lastMove = {...gameBoard.lastMove};
    }
  }

  checkNumPlays(player: Player): number {
    let count: PositionWithCount[];
    let moves: PositionWithCount[];
    let total = 0;

    // check horizontals
    for (let i = 0; i < appConfig.height; i++) {
      count = [];
      moves = [];
      for (let j = 0; j < appConfig.width; j++) {
        const position = this.getPositionForMove(j, i);
        if (this.board[position] === player || this.board[position] === '') {
          count.push({position, count: j, value: this.board[position]});
        }
        if (this.board[position] === player) {
          moves.push({position, count: j, value: this.board[position]});
        }
      }

      if (count.length >= appConfig.wins && this.isConsecutive(count)) {
        total += this.countMoveValue(count, moves, appConfig.width);
      }
    }

    // check verticals
    for (let i = 0; i < appConfig.width; i++) {
      count = [];
      moves = [];
      for (let j = 0; j < appConfig.height; j++) {
        const position = this.getPositionForMove(i, j);
        if (this.board[position] === player || this.board[position] === '') {
          count.push({position, count: j, value: this.board[position]});
        }

        if (this.board[position] === player) {
          moves.push({position, count: j, value: this.board[position]});
        }
      }

      if (count.length >= appConfig.wins && this.isConsecutive(count)) {
        total += this.countMoveValue(count, moves, appConfig.height);
      }
    }

    // check diagonals
    count = [];
    moves = [];

    // major diagonal
    for (let i = 0; i < appConfig.height; i++) {
      const position = this.getPositionForMove(i, i);
      if (this.board[position] === player || this.board[position] === '') {
        count.push({position, count: i, value: this.board[position]});
      }

      if (this.board[position] === player) {
        moves.push({position, count: i, value: this.board[position]});
      }
    }

    if (count.length >= appConfig.wins && this.isConsecutive(count)) {
      total += this.countMoveValue(count, moves, appConfig.height);
    }

    // major diagonal
    count = [];
    moves = [];
    for (let i = 0; i < appConfig.height; i++) {
      const position = this.getPositionForMove(i, appConfig.width - i - 1);
      if (this.board[position] === player || this.board[position] === '') {
        count.push({position, count: i, value: this.board[position]});
        if (this.board[position] === player) {
          moves.push({position, count: i, value: this.board[position]});
        }
      }
    }

    if (count.length >= appConfig.wins && this.isConsecutive(count)) {
      total += this.countMoveValue(count, moves, appConfig.width);
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
          count.push({position, count: j, value: this.board[position]});
        }
      }

      if ((count.length >= appConfig.wins && this.isConsecutive(count))) {
        return this.positionWithCountToPosition(count);
      }
    }

    // check verticals
    for (let i = 0; i < appConfig.width; i++) {
      count = [];
      for (let j = 0; j < appConfig.height; j++) {
        const position = this.getPositionForMove(i, j);
        if (this.board[position] === player) {
          count.push({position, count: j, value: this.board[position]});
        }
      }

      if (count.length >= appConfig.wins && this.isConsecutive(count)) {
        return this.positionWithCountToPosition(count);
      }
    }

    // check diagonals
    count = [];
    // diagonal
    for (let i = 0; i < appConfig.height; i++) {
      const position = this.getPositionForMove(i, i);
      if (this.board[position] === player) {
        count.push({position, count: i, value: this.board[position]});
      }
    }

    if (count.length >= appConfig.wins && this.isConsecutive(count)) {
      return this.positionWithCountToPosition(count);
    }
    // diagonal
    count = [];
    for (let i = 0; i < appConfig.height; i++) {
      const position = this.getPositionForMove(i, appConfig.height - i - 1);

      if (this.board[position] === player) {
        count.push({position, count: i, value: this.board[position]});
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

  private checkWinSituation(count: PositionWithCount[], moves: PositionWithCount[], length: number): boolean {
    if (moves.length !== length || count.length !== 3) {
      return false;
    }

    return moves[0].value === '' && moves[length - 1].value === '';
  }

  private countMoveValue(count: PositionWithCount[], moves: PositionWithCount[], length: number): number {
    const value = count.length * moves.length;
    let multiplier = 1;

    if (moves.length === 2 && count.length === length) {
      multiplier = 2;
    }

    if (moves.length === 3 && count.length === length) {
      multiplier = 3;
    }

    if (moves.length === 4 && count.length === length) {
      multiplier = 6;
    }

    return value * multiplier;
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
