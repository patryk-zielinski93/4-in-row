import { Injectable } from '@angular/core';
import { GameBoard } from '../classes/game-board';
import { Player } from '../enum/player.enum';

export enum Flag {
  EXACT,
  LOWERBOUND,
  UPPERBOUND
}

export interface TTEntry {
  depth: number;
  flag: Flag;
  value: number;
}

@Injectable({
  providedIn: 'root'
})
export class MoveService {
  private depthReached = 0;
  private gb: GameBoard;
  private nodesExplored = 0;
  private player: Player;
  private startTime: number;
  private timeCutoff = 1000;
  private timeout = false;
  private transpositionTable = new Map<string, TTEntry>();

  findBestMove(gb: GameBoard, player: Player): number {
    this.gb = gb;
    this.player = player;
    this.startTime = (new Date()).getTime();
    this.depthReached = 0;
    this.nodesExplored = 0;

    const possibleMoves = this.gb.getPossibleGameBoards(this.player);
    let moveChoices: number[] = [];

    let bestMoveValue = -1000;
    console.log('-----------------------------\n');
    for (let i = 0; i < possibleMoves.length; i++) {
      const moveValue = this.negamax(possibleMoves[i], 5, -1000, 1000, 1);
      // moveValue = moveValue < 0 ? moveValue * -1 : moveValue;
      // const moveValue = this.minValue(possibleMoves[i], -1000, 1000, 0);
      console.log(possibleMoves[i].consoleFormat(), 'color: red', 'color: black', '\nMove value: ' + moveValue);
      if (moveValue > bestMoveValue) {
        moveChoices = [];
        moveChoices.push(i);
        bestMoveValue = moveValue;
      } else if (moveValue === bestMoveValue) {
        moveChoices.push(i);
      }
    }

    if (moveChoices.length === 0) {
      moveChoices = possibleMoves.map((v, i) => i);
    }
    const time = (new Date()).getTime();
    console.log(
      `Player: ${this.player}\n` +
      `Nodes explored: ${this.nodesExplored}\n` +
      `Time consumed: ${time - this.startTime}ms\n` +
      `Move value: ${bestMoveValue}\n` +
      `Move possibilities:`, moveChoices
    );
    const n = Math.floor(Math.random() * moveChoices.length);
    return possibleMoves[moveChoices[n]].lastMove.position;
  }

  negamax(node: GameBoard, depth: number, a: number, b: number, color: number): number {
    const player = color === 1 ? this.player : this.getOpponent();
    const alphaOrig = a;
    const nodeKey = node.toString();
    const ttEntry = this.transpositionTable.get(nodeKey);

    if (ttEntry && ttEntry.depth >= depth) {
      if (ttEntry.flag === Flag.EXACT) {
        return ttEntry.value;
      } else if (ttEntry.flag === Flag.LOWERBOUND) {
        a = Math.max(a, ttEntry.value);
      } else if (ttEntry.flag === Flag.UPPERBOUND) {
        b = Math.min(b, ttEntry.value);
      }

      if (a >= b) {
        return ttEntry.value;
      }
    }

    if (this.isGameOver(node)) {
      return color * this.scoreGameBoard(node, depth);
    }

    if (depth === 0) {
      return this.evaluateGameBoard(node);
    }

    const childNodes = node.getPossibleGameBoards(player);
    let value = -1000;

    for (let i = 0; i < childNodes.length; i++) {
      value = Math.max(value, -this.negamax(childNodes[i], depth - 1, -b, -a, -color));
      a = Math.max(a, value);
      if (a >= b) {
        break;
      }
    }

    const entry: Partial<TTEntry> = {
      value,
      depth
    };

    if (value <= alphaOrig) {
      entry.flag = Flag.UPPERBOUND;
    } else if (value >= b) {
      entry.flag = Flag.LOWERBOUND;
    } else {
      entry.flag = Flag.EXACT;
    }

    this.transpositionTable.set(nodeKey, entry as TTEntry);

    return value;
  }

  private calculateValue(gb: GameBoard, depth: number): number {
    if (gb.checkWin(this.player)) {
      return 1000 - depth;
    }

    if (gb.checkWin(this.getOpponent())) {
      return depth - 1000;
    }

    return 0;
  }

  private evaluateGameBoard(gb: GameBoard): number {
    const p = gb.checkNumPlays(this.player);
    const o = gb.checkNumPlays(this.getOpponent());

    return p - o;
  }

  private getOpponent(player?: Player): Player {
    return (player || this.player) === Player.X ? Player.O : Player.X;
  }

  private isGameOver(gb: GameBoard): boolean {
    return gb.checkTie() || !!gb.checkWin(this.player) || !!gb.checkWin(this.getOpponent());
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

    let v = -1000;

    const possibleMoves = gb.getPossibleGameBoards(this.player);
    for (let i = 0; i < possibleMoves.length; i++) {
      v = Math.max(v, this.minValue(possibleMoves[i], a, b, currentDepth++));
      if (v >= b) {
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

    let v = 1000;
    const possibleMoves = gb.getPossibleGameBoards(this.getOpponent());

    for (let i = 0; i < possibleMoves.length; i++) {
      v = Math.min(v, this.maxValue(possibleMoves[i], a, b, currentDepth++));
      if (v <= a) {
        return v;
      }
      b = Math.min(b, v);
    }

    return v;
  }

  private scoreGameBoard(gb: GameBoard, depth): number {
    if (!!gb.checkWin(this.player)) {
      return 1000 - depth;
    }

    if (!!gb.checkWin(this.getOpponent())) {
      return -1000 + depth;
    }

    return 0;
  }
}
