import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { GameBoard } from '../classes/game-board';
import { Player } from '../enum/player.enum';
import { GameOver } from '../interfaces/game-over.interface';
import { MoveService } from './move.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  computer = Player.X;
  currentPlayer = Player.O;
  depthLimit = 5;
  gameBoard$ = new BehaviorSubject<GameBoard>(new GameBoard());
  gameOver = false;
  gameOver$ = new Subject<GameOver>();
  human = Player.O;
  whoStarts = Player.O;
  private gameBoard: GameBoard;

  constructor(private moveService: MoveService) {
  }

  move(player: Player, row: number, col: number): void {
    if (this.gameOver) {
      return;
    }

    const gb = this.gameBoard.move(player, row, col);
    this.update(gb);

    const isWinner = gb.checkWin(player);
    if (!!isWinner) {
      this.gameOver$.next({winner: player, winningPositions: []});
      return;
    }

    if (gb.checkTie()) {
      this.gameOver$.next({winningPositions: null, winner: null});
      return;
    }

    if (gb.currentPlayer === this.computer) {
      const position = this.moveService.findBestMove(gb, this.computer, this.depthLimit);
      this.move(this.computer, position.row, position.col);
    }
  }

  start(): void {
    this.gameOver = false;
    const gb = new GameBoard();
    gb.currentPlayer = this.whoStarts;
    gb.firstPlayer = this.whoStarts;
    this.update(gb);

    if (gb.currentPlayer === this.computer) {
      const position = this.moveService.findBestMove(gb, this.computer, this.depthLimit);
      this.move(this.computer, position.row, position.col);
    }
  }

  private update(gameBoard: GameBoard): void {
    this.gameBoard = gameBoard;
    this.gameBoard$.next(this.gameBoard);
  }
}
