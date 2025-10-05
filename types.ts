export enum GameState {
  HOME,
  SELECTION,
  EXPLORING,
  OXYGEN_GAME,
  TEMP_GAME,
  RESULTS,
  CREATE_PLANET,
}

export interface PlanetData {
  name: string;
  color: string;
  detailColor: string;
  pattern: 'rings' | 'swirls' | 'spots' | 'stripes' | 'none';
  size: 'small' | 'medium' | 'large';
  hasWaterAndOxygen: boolean;
  isTempHabitable: boolean;
}

export interface CustomPlanetDetails {
  name: string;
  color: string;
  atmosphere: string;
  life: string;
}
