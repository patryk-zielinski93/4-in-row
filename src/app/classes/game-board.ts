import { appConfig } from '../app.config';
import { Player } from '../enum/player.enum';
import { Move } from '../interfaces/move.interface';

export class GameBoard {
  lastMove: Move;
  moves: number[] = [];

  constructor(gameBoard?: GameBoard) {
    if (!gameBoard) {
      const size = appConfig.width * appConfig.height;

      for (let i = 0; i < size; i++) {
        this.moves.push(0);
      }
    } else {
      this.moves = gameBoard.moves.slice(0);
      this.lastMove = {...gameBoard.lastMove};
    }
  }

  checkNumPlays(player: Player, plays: number): number {
    const size = appConfig.width * appConfig.height;
    let total = 0;

    for (let i = 0; i < size; i++) {
      if (this.moves[i] === 0) {
        total++;
      }
    }

    return total;
  }

  checkTie(): boolean {
    return this.moves.every(m => m !== 0);
  }

  checkWin(player: Player): boolean {
    let count: number;

    // check horizontals
    for (let i = 0; i < appConfig.height; i++) {
      count = 0;
      for (let j = 0; j < appConfig.width; j++) {
        if (this.moves[this.getPositionForMove(j, i)] === player) {
          count++;
        }
      }

      if (count >= appConfig.wins) {
        return true;
      }
    }

    // check verticals
    for (let i = 0; i < appConfig.width; i++) {
      count = 0;
      for (let j = 0; j < appConfig.height; j++) {
        if (this.moves[this.getPositionForMove(i, j)] === player) {
          count++;
        }
      }

      if (count >= appConfig.wins) {
        return true;
      }
    }

    // check horizontals
    count = 0;
    for (let i = 0; i < appConfig.height; i++) {
      if (this.moves[this.getPositionForMove(i, i)] === player) {
        count++;
      }
    }
    if (count >= appConfig.wins) {
      return true;
    }

    count = 0;
    for (let i = 0; i < appConfig.height; i++) {
      if (this.moves[this.getPositionForMove(i, appConfig.height - i - 1)] === player) {
        count++;
      }
    }

    return count >= appConfig.wins;
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
    return this.moves[position] === 0;
  }

  private getPositionForMove(c: number, r: number): number {
    return c + r * appConfig.width;
  }

  private setMove(player: Player, position: number): void {
    this.moves[position] = player;
    this.lastMove = {player, position};
  }
}
