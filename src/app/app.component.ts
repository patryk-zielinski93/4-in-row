import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
  currentPlayer: Player;
  depthMax = 8;
  depthMin = 3;
  depthStep = 1;
  gameBoard$: Observable<GameBoard>;
  gameOver: GameOver | null;
  gameStarted = false;
  optionsForm: FormGroup;
  player = Player;

  constructor(private gameService: GameService, private snack: MatSnackBar, private fb: FormBuilder) {
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

  isWinnerField(row: number, col: number): boolean {
    if (!this.gameOver || !this.gameOver.winner) {
      return false;
    }

    return this.gameOver.winningPositions.indexOf(`${row}${col}`) !== -1;
  }

  ngOnInit(): void {
    this.gameBoard$ = this.gameService.gameBoard$.pipe(tap(gb => {
      this.currentPlayer = gb.currentPlayer;
    }));
    this.initGameOverWatcher();
    this.initOptionsForm();
  }

  onMove(row: number, col: number): void {
    this.gameService.move(this.gameService.human, row, col);

  }

  start(): void {
    const options = this.optionsForm.getRawValue();
    this.gameService.human = options.humanSymbol;
    this.gameService.computer = options.humanSymbol === Player.X ? Player.O : Player.X;
    this.gameService.whoStarts = options.firstPlayer === 'AI' ? this.gameService.computer : this.gameService.human;
    this.gameService.depthLimit = options.depthLimit;
    this.gameStarted = true;
    this.optionsForm.disable();
    setTimeout(() => {
      this.gameService.start();
    }, 200);
  }

  trackCol(rowIndex: number): (colIndex: number) => string {
    return function (colIndex: number): string {
      return `${rowIndex}${colIndex}`;
    };
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
        this.gameStarted = false;
        this.optionsForm.enable();
      });
    });
  }

  private initOptionsForm(): void {
    this.optionsForm = this.fb.group({
      firstPlayer: ['AI'],
      humanSymbol: [Player.O],
      depthLimit: 5
    });
  }
}
