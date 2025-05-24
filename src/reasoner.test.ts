import { describe, it, expect, vi } from "vitest";
import { Reasoner, IAppraisal, IConsideration, IContext } from "./main";
import * as utils from "./utils";

// Mock context
interface ExampleContext extends IContext {
  hunger: number;
  energy: number;
  distanceToFood?: number;
  distanceToBed?: number;
}

// Mock considerations
const hungerConsideration: IConsideration<ExampleContext> = {
  evaluate: (context) => context.hunger / 100, // Normalize hunger (0 to 1)
  curveFunction: (score) => score * score, // Quadratic curve
};

const energyConsideration: IConsideration<ExampleContext> = {
  evaluate: (context) => (100 - context.energy) / 100, // Normalize energy (0 to 1)
  curveFunction: (score) => score, // Linear curve
};

// Mock appraisals
const hungerAppraisal: IAppraisal<ExampleContext> = {
  id: "hunger",
  action: { type: "Eat" },
  considerations: [
    { consideration: hungerConsideration },
  ],
  weight: 1,
  scoringFunction: (scores) => scores.reduce((a, b) => a + b, 0) / scores.length, // Average scoring
};

const energyAppraisal: IAppraisal<ExampleContext> = {
  id: "energy",
  action: { type: "Rest" },
  considerations: [
    { consideration: energyConsideration },
  ],
  weight: 1,
  scoringFunction: (scores) => scores.reduce((a, b) => a + b, 0) / scores.length, // Average scoring
};

describe("Reasoner", () => {
  it("should return the best action based on appraisals", () => {
    const context: ExampleContext = { hunger: 80, energy: 50 };
    const reasoner = new Reasoner<ExampleContext>();

    reasoner.addAppraisal(hungerAppraisal);
    reasoner.addAppraisal(energyAppraisal);

    let bestAction = reasoner.getBestAction(context);

    // "hunger" is closer to 100 than energy is to 0, so the action should be "Eat"
    expect(bestAction).toEqual({ type: "Eat" });

    context.hunger -= 50;

    bestAction = reasoner.getBestAction(context);

    // "energy" is closer to 0 than hunger is to 100, so the action should be "Rest"
    expect(bestAction).toEqual({ type: "Rest" })
  });

  it("should factor in the weight of an appraisal", () => {
    const context: ExampleContext = { hunger: 50, energy: 50 };
    const reasoner = new Reasoner<ExampleContext>();

    hungerAppraisal.weight = 0.5;
    energyAppraisal.weight = 1;

    reasoner.addAppraisal(hungerAppraisal);
    reasoner.addAppraisal(energyAppraisal);

    let bestAction = reasoner.getBestAction(context);
    expect(bestAction).toEqual({ type: "Rest" })

    hungerAppraisal.weight = 1;
    energyAppraisal.weight = 0.5;

    bestAction = reasoner.getBestAction(context);
    expect(bestAction).toEqual({ type: "Eat" })

    hungerAppraisal.weight = 1;
    energyAppraisal.weight = 1;
  });

  it("should choose an action randomly if multiple appraisals return the same score", () => {
    //const randomizeActionSpy = vi.fn(getRandomAction)
    const randomizeActionSpy = vi.spyOn(utils, "getRandomAction");

    const context: ExampleContext = { hunger: 50, energy: 50 };
    const reasoner = new Reasoner<ExampleContext>();

    reasoner.addAppraisal(hungerAppraisal);
    reasoner.addAppraisal(energyAppraisal);

    reasoner.getBestAction(context);

    expect(randomizeActionSpy).toHaveBeenCalled();
    randomizeActionSpy.mockRestore();
  });


  it("should handle multiple considerations for a single appraisal", () => {
    const context: ExampleContext = { hunger: 50, energy: 50, distanceToBed: 10, distanceToFood: 20 };
    const reasoner = new Reasoner<ExampleContext>();

    const distanceToFoodConsideration: IConsideration<ExampleContext> = {
      evaluate: context => Math.max(0, 1 - context.distanceToFood! / 100)
    }

    const distanceToBedConsideration: IConsideration<ExampleContext> = {
      evaluate: context => Math.max(0, 1 - context.distanceToBed! / 100)
    }

    hungerAppraisal.considerations.push({ consideration: distanceToFoodConsideration });

    energyAppraisal.considerations.push({ consideration: distanceToBedConsideration });

    reasoner.addAppraisal(hungerAppraisal);
    reasoner.addAppraisal(energyAppraisal);

    const bestAction = reasoner.getBestAction(context);
    expect(bestAction).toEqual({ type: "Rest" });
  });
});
