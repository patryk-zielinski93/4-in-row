import { Player } from '../enum/player.enum';

export interface GameOver {
  winner: Player | null;
  winningPositions: string[] | null;
}
