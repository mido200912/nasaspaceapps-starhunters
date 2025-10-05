import { Exoplanet } from '../types';

interface HabitabilityFactors {
  mass_earth: number | null;
  radius_earth: number | null;
  equilibrium_temp_K: number | null;
}

/**
 * Calculates a habitability score from 0 to 100 for a given planet.
 * The score is a weighted average of temperature, radius, and mass scores.
 * A score >= 60 is considered potentially habitable.
 */
export const calculateHabitability = (planet: HabitabilityFactors): { score: number, isHabitable: boolean } => {
  const { mass_earth, radius_earth, equilibrium_temp_K } = planet;

  if (mass_earth === null || radius_earth === null || equilibrium_temp_K === null) {
    return { score: 0, isHabitable: false };
  }
  
  // Temperature Score (Ideal: 273-323K, Earth is ~288K) - 40% weight
  const tempIdeal = 298; // Idealized for liquid water
  const tempRange = 50;
  let tempScore = 0;
  if (equilibrium_temp_K >= 223 && equilibrium_temp_K <= 373) { // Generous liquid water range
      const diff = Math.abs(equilibrium_temp_K - tempIdeal);
      tempScore = Math.max(0, 100 * (1 - (diff / (tempRange * 2))));
  }

  // Radius Score (Ideal: 0.8-1.5 Earth radii) - 30% weight
  let radiusScore = 0;
  if (radius_earth > 0.5 && radius_earth < 2.5) { // Range for rocky planets
      const idealRadius = 1.0;
      const diff = Math.abs(radius_earth - idealRadius);
      radiusScore = Math.max(0, 100 * (1 - diff / 1.5));
  }

  // Mass Score (Ideal: 0.5-2.0 Earth masses) - 30% weight
  let massScore = 0;
  if (mass_earth > 0.1 && mass_earth < 5.0) { // Range to hold atmosphere but not be a gas giant
      const idealMass = 1.0;
      const diff = Math.abs(mass_earth - idealMass);
      massScore = Math.max(0, 100 * (1 - diff / 4.0));
  }

  const weightedScore = (tempScore * 0.4) + (radiusScore * 0.3) + (massScore * 0.3);
  const finalScore = Math.round(weightedScore);

  return {
    score: finalScore,
    isHabitable: finalScore >= 60,
  };
};

export const isEarthLike = (planet: Exoplanet): boolean => {
    const { mass_earth, radius_earth, equilibrium_temp_K } = planet;
    if (mass_earth === null || radius_earth === null || equilibrium_temp_K === null) return false;
    
    const isTempOk = equilibrium_temp_K >= 250 && equilibrium_temp_K <= 320;
    const isMassOk = mass_earth >= 0.8 && mass_earth <= 1.5;
    const isRadiusOk = radius_earth >= 0.9 && radius_earth <= 1.2;

    return isTempOk && isMassOk && isRadiusOk;
}
