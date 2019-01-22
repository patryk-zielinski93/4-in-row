import { Player } from '../enum/player.enum';

export interface PositionWithCount {
  count: number;
  position: number;
  value: Player | '';
}
