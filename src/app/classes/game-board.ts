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

    // minor diagonal
    const diff = appConfig.height - appConfig.wins;

    let diag1: PositionWithCount[];
    let moves1: PositionWithCount[];
    let diag2: PositionWithCount[];
    let moves2: PositionWithCount[];

    for (let i = 1; i <= diff; i++) {
      diag1 = [];
      diag2 = [];
      moves1 = [];
      moves2 = [];
      for (let j = 0; j < appConfig.width - i; j++) {
        const position1 = this.getPositionForMove(j, j + 1);
        if (this.board[position1] === player || this.board[position1] === '') {
          diag1.push({position: position1, count: j, value: this.board[position1]});
          if (this.board[position1] === player) {
            moves1.push({position: position1, count: j, value: this.board[position1]});
          }
        }

        const position2 = this.getPositionForMove(j + 1, j);
        if (this.board[position2] === player || this.board[position2] === '') {
          diag2.push({position: position2, count: j, value: this.board[position2]});

          if (this.board[position2] === player) {
            moves2.push({position: position2, count: j, value: this.board[position2]});
          }
        }
      }
    }

    if (diag1.length >= appConfig.wins && this.isConsecutive(diag1)) {
      total += this.countMoveValue(diag1, moves1, appConfig.width);
    }

    if (diag2.length >= appConfig.wins && this.isConsecutive(diag2)) {
      total += this.countMoveValue(diag2, moves2, appConfig.width);
    }

    // minor diagonal
    for (let i = 1; i <= diff; i++) {
      diag1 = [];
      diag2 = [];
      moves1 = [];
      moves2 = [];
      for (let j = 0; j < appConfig.width - i; j++) {
        const pos1 = this.getPositionForMove(j, appConfig.height - j - i - 1);
        if (this.board[pos1] === player || this.board[pos1] === '') {
          diag1.push({position: pos1, count: j, value: this.board[pos1]});
          if (this.board[pos1] === player) {
            moves1.push({position: pos1, count: j, value: this.board[pos1]});
          }
        }

        const pos2 = this.getPositionForMove(j + i, appConfig.height - j - 1);
        if (this.board[pos2] === player || this.board[pos2] === '') {
          diag2.push({position: pos2, count: j, value: this.board[pos2]});
          if (this.board[pos2] === player) {
            moves2.push({position: pos2, count: j, value: this.board[pos2]});
          }
        }
      }
    }

    if (diag1.length >= appConfig.wins && this.isConsecutive(diag1)) {
      total += this.countMoveValue(diag1, moves1, appConfig.height);
    }

    if (diag2.length >= appConfig.wins && this.isConsecutive(diag2)) {
      total += this.countMoveValue(diag2, moves2, appConfig.height);
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

  checkWin(player: Player, checkWinSituation = false): number[] | null {
    let count: PositionWithCount[];
    let moves: PositionWithCount[];

    // check horizontals
    for (let i = 0; i < appConfig.height; i++) {
      count = [];
      moves = [];
      for (let j = 0; j < appConfig.width; j++) {
        const position = this.getPositionForMove(j, i);

        if (this.board[position] === player) {
          count.push({position, count: j, value: this.board[position]});
        }

        if (this.board[position] === '' || this.board[position] === player) {
          moves.push({position, count: j, value: this.board[position]});
        }
      }

      if ((count.length >= appConfig.wins && this.isConsecutive(count))) {
        return this.positionWithCountToPosition(count);
      }

      if (checkWinSituation && this.checkWinSituation(count, moves, appConfig.width)) {
        return this.positionWithCountToPosition(count);
      }
    }

    // check verticals
    for (let i = 0; i < appConfig.width; i++) {
      count = [];
      moves = [];
      for (let j = 0; j < appConfig.height; j++) {
        const position = this.getPositionForMove(i, j);
        if (this.board[position] === player) {
          count.push({position, count: j, value: this.board[position]});
        }
        if (this.board[position] === '' || this.board[position] === player) {
          moves.push({position, count: j, value: this.board[position]});
        }
      }

      if (count.length >= appConfig.wins && this.isConsecutive(count)) {
        return this.positionWithCountToPosition(count);
      }

      if (checkWinSituation && this.checkWinSituation(count, moves, appConfig.height)) {
        return this.positionWithCountToPosition(count);
      }
    }

    // check diagonals
    count = [];
    moves = [];

    // major diagonal
    for (let i = 0; i < appConfig.height; i++) {
      const position = this.getPositionForMove(i, i);
      if (this.board[position] === player) {
        count.push({position, count: i, value: this.board[position]});
      }
      if (this.board[position] === player || this.board[position] === '') {
        moves.push({position, count: i, value: this.board[position]});
      }
    }

    if (count.length >= appConfig.wins && this.isConsecutive(count)) {
      return this.positionWithCountToPosition(count);
    }

    if (checkWinSituation && this.checkWinSituation(count, moves, appConfig.height)) {
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
          diag1.push({position: position1, count: j, value: this.board[position1]});
        }

        const position2 = this.getPositionForMove(j + 1, j);
        if (this.board[position2] === player) {
          diag2.push({position: position2, count: j, value: this.board[position2]});
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
          diag1.push({position: pos1, count: j, value: this.board[pos1]});
        }

        const pos2 = this.getPositionForMove(j + i, appConfig.width - j - 1);
        if (this.board[pos2] === player) {
          diag2.push({position: pos2, count: j, value: this.board[pos2]});
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
    moves = [];
    for (let i = 0; i < appConfig.height; i++) {
      const position = this.getPositionForMove(i, appConfig.height - i - 1);
      if (this.board[position] === player) {
        count.push({position, count: i, value: this.board[position]});
      }

      if (this.board[position] === player || this.board[position] === '') {
        moves.push({position, count: i, value: this.board[position]});
      }
    }

    if (count.length >= appConfig.wins && this.isConsecutive(count)) {
      return this.positionWithCountToPosition(count);
    }

    if (checkWinSituation && this.checkWinSituation(count, moves, appConfig.height)) {
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
      multiplier = 5;

      if (count[0].value === '' && count[count.length - 1].value === '') {
        multiplier = 10;
      }
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
