import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GameBoard } from '../classes/game-board';
import { Player } from '../enum/player.enum';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  computer = Player.X;
  gameBoard$ = new BehaviorSubject<GameBoard>(new GameBoard());
  human = Player.O;
  private gameBoard: GameBoard;

  move(position: number): void {
    this.update(this.gameBoard.move(this.human, position));
  }

  start(): void {
    this.update(new GameBoard());
  }

  private update(gameBoard: GameBoard): void {
    this.gameBoard = gameBoard;
    this.gameBoard$.next(this.gameBoard);
  }
}
