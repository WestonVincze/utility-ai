const MAX_HUNGER = 100;
const MAX_THIRST = 100;
const MAX_ENERGY = 100;
const MAX_HEALTH = 10;

type ResourceData = {
  distance: number,
  value: number,
  threatsNearby: number,
}

type Context = {
  hunger: number,
  health: number,
  thirst: number,
  energy: number,
  foodSources: ResourceData[],
  waterSources: ResourceData[],
  restSources: ResourceData[],
  currentFood: number[];
  currentWater: number[];
}

const autoUpdateContext = (context: Context) => {
  context.hunger += 1;
  context.thirst += 1;
  context.energy -= 1;
}

const EatAppraisal = {
  weight: 1,
  // https://www.desmos.com/calculator/sdo7m9kpqp
  getScore: (context: Context) => {
    if (context.currentFood.length === 0) return 0;
    const w = context.hunger / MAX_HUNGER;
    const exponent = -(w * 12) + 6;
    const denominator = 1 + (Math.E * 2) ** exponent;
    return 1 - (1 / denominator);
  }
}

const FoodSourceAppraisal = {
  weight: 1,
  getScore: (context: Context) => {
    if (context.currentFood.length === 0) return 0;

    const totalFood = context.currentFood.reduce((acc, curr) => acc + curr);
    if (context.hunger + totalFood >= MAX_HUNGER) return 1;
  }
}

const GatherFoodAppraisal = {
  weight: 1,
  getScore: (context: Context) => {
    // if we have enough food to fill our hunger, value should be 0
    const totalFood = context.currentFood.reduce((acc, curr) => acc + curr);
    if (context.hunger + totalFood >= MAX_HUNGER) return 0;
    // if not, 
  }
}

const hunger = (w: number) => {
  const exponent = -(w*12) + 6;
  const denominator = 1 + Math.pow(Math.E * 2, exponent);
  // const denominator = 1 + (Math.E * 2) ** exponent;
  return 1 - (1 / denominator);
} 