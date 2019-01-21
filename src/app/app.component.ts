import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GameBoard } from './classes/game-board';
import { Player } from './enum/player.enum';
import { GameOver } from './interfaces/game-over.interface';
import { GameService } from './services/game.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  gameBoard$: Observable<GameBoard>;
  gameOver: GameOver | null;
  player = Player.X;

  constructor(private gameService: GameService, private snack: MatSnackBar) {
  }

  isLooser(): boolean {
    return this.gameOver && this.gameOver.winner === this.gameService.computer;
  }

  isTie(): boolean {
    return this.gameOver && !this.gameOver.winner;
  }

  isWinner(): boolean {
    return this.gameOver && this.gameOver.winner === this.gameService.human;
  }

  isWinnerField(index: number): boolean {
    if (!this.gameOver || !this.gameOver.winner) {
      return false;
    }

    return this.gameOver.winningPositions.indexOf(index) !== -1;
  }

  ngOnInit(): void {
    this.gameBoard$ = this.gameService.gameBoard$.pipe(tap(gb => {
      this.player = gb.currentPlayer;
    }));
    this.initGameOverWatcher();
    this.gameService.start();
  }

  onMove(move: number): void {
    this.gameService.move(this.player, move);
  }

  trackByIndex(index: number): number {
    return index;
  }

  private initGameOverWatcher(): void {
    this.gameService.gameOver$.subscribe(go => {
      this.gameOver = go;
      const message = go.winner ?
        (this.isWinner() ? 'Gra zakończyła się zwycięstwem!' : 'Gra zakończyła się przegraną!')
        : 'Gra zakończyła się remisem!';

      this.snack.open(message, 'Reset', {
        duration: -1
      }).onAction().subscribe(() => {
        this.gameOver = null;
        this.gameService.start();
      });
    });
  }
}
