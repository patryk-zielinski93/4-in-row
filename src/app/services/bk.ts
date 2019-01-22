import { Injectable } from '@angular/core';
import { GameBoard } from '../classes/game-board';
import { Player } from '../enum/player.enum';

@Injectable({
  providedIn: 'root'
})
export class MoveService {
  private depthReached = 0;
  private gb: GameBoard;
  private maxValuePruning = 0;
  private minValuePruning = 0;
  private nodesExplored = 0;
  private player: Player;
  private startTime: number;
  private timeCutoff = 10000;
  private timeout = false;

  findBestMove(gb: GameBoard, player: Player): number {
    this.gb = gb;
    this.player = player;
    this.startTime = (new Date()).getTime();
    this.depthReached = 0;
    this.nodesExplored = 0;

    const possibleMoves = this.gb.getPossibleGameBoards(this.player);
    let moveChoices: number[] = [];

    let bestMoveValue = Number.MIN_VALUE;

    for (let i = 0; i < possibleMoves.length; i++) {
      const moveValue = this.minValue(possibleMoves[i], -1000, 1000, 0);

      if (moveValue > bestMoveValue) {
        moveChoices = [];
        moveChoices.push(i);
        bestMoveValue = moveValue;
      } else if (moveValue === bestMoveValue) {
        moveChoices.push(i);
      }
    }

    console.log(`Depth reached: ${this.depthReached}\n` +
      `Max value pruning: ${this.maxValuePruning}\n` +
      `Min value pruning: ${this.minValuePruning}\n` +
      `Nodes explored: ${this.nodesExplored}\n` +
      `Move value: ${bestMoveValue}\n` +
      `Move choices:`, moveChoices);
    return possibleMoves[moveChoices[Math.floor(Math.random() * moveChoices.length)]].lastMove.position;
  }

  private calculateValue(gb: GameBoard, depth: number): number {
    if (gb.checkWin(this.player, true)) {
      return 1000 - depth;
    }

    if (gb.checkWin(this.getOpponent())) {
      return depth - 1000;
    }

    return 0;
  }

  // Todo
  private evaluateGameBoard(gb: GameBoard): number {
    const player = gb.checkNumPlays(this.player);
    const opponent = gb.checkNumPlays(this.getOpponent());

    return player - opponent;
  }

  private getOpponent(): Player {
    return this.player === Player.X ? Player.O : Player.X;
  }

  private isGameOver(gb: GameBoard): boolean {
    return gb.checkTie() || !!gb.checkWin(this.player, true) || !!gb.checkWin(this.getOpponent());
  }

  private maxValue(gb: GameBoard, a: number, b: number, currentDepth: number): number {
    this.nodesExplored++;

    if (currentDepth > this.depthReached) {
      this.depthReached = currentDepth;
    }

    if (this.isGameOver(gb)) {
      return this.calculateValue(gb, currentDepth);
    }

    const time = (new Date()).getTime();
    if (time - this.startTime > this.timeCutoff) {
      this.timeout = true;
      return this.evaluateGameBoard(gb);
    }

    let v = Number.MIN_VALUE;

    const possibleMoves = gb.getPossibleGameBoards(this.player);
    for (let i = 0; i < possibleMoves.length; i++) {
      v = Math.max(v, this.minValue(possibleMoves[i], a, b, currentDepth++));
      if (v >= b) {
        this.maxValuePruning++;
        return v;
      }
      a = Math.max(a, v);
    }

    return v;
  }

  private minValue(gb: GameBoard, a: number, b: number, currentDepth: number): number {
    this.nodesExplored++;

    if (currentDepth > this.depthReached) {
      this.depthReached = currentDepth;
    }

    if (this.isGameOver(gb)) {
      return this.calculateValue(gb, currentDepth);
    }

    const time = (new Date()).getTime();
    if (time - this.startTime > this.timeCutoff) {
      this.timeout = true;
      return this.evaluateGameBoard(gb);
    }

    let v = Number.MAX_VALUE;
    const possibleMoves = gb.getPossibleGameBoards(this.getOpponent());

    for (let i = 0; i < possibleMoves.length; i++) {
      v = Math.min(v, this.maxValue(possibleMoves[i], a, b, currentDepth++));
      if (v <= a) {
        this.minValuePruning++;
        return v;
      }
      b = Math.min(b, v);
    }

    return v;
  }
}
