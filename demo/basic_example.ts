import { createBarUI } from "./components/Bar";
import "./style.css";

interface Action<TContext> {
  name: string;
  execute(agent: Agent<TContext>): void;
  calculateUtility(context: TContext): number;

}

interface Agent<TContext> {
  name: string;
  currentAction: string | null;
  context: TContext
}

class UtilityAI<TContext> {
  #actions: Action<TContext>[];

  constructor() {
    this.#actions = [];
  }

  addAction(action: Action<TContext>): void {
    this.#actions.push(action);
  }

  removeAction(actionName: string): void { 
    this.#actions = this.#actions.filter(action => action.name !== actionName);
  }

  selectBestAction(agent: Agent<TContext>): Action<TContext> | null {
    let bestAction: Action<TContext> | null = null;
    let highestUtility = -Infinity;

    console.table(agent.context)
    for (const action of this.#actions) {
      const utility = action.calculateUtility(agent.context);
      console.log(`${action.name} has utility of ${utility}`)
      if (utility > highestUtility) {
        bestAction = action;
        highestUtility = utility;
      }
    }

    console.log(`${bestAction?.name} chosen with highest utility of ${highestUtility}`)
    return bestAction
  }

  update(agent: Agent<TContext>): void {
    const bestAction = this.selectBestAction(agent);
    if (!bestAction) return;

    bestAction.execute(agent);
  }
}

interface ExampleContext {
  hunger: number;
  thirst: number;
  energy: number;
  distanceToFood: number;
  distanceToWater: number;
  distanceToBed: number;
  threatsNearby: number;
}

class EatAction implements Action<ExampleContext> {
  name = "Eat";

  execute(agent: Agent<ExampleContext>): void {
    agent.currentAction = this.name;
    agent.context.hunger -= 10;
  }

  calculateUtility(context: ExampleContext): number {
    return (
      context.hunger * 0.4 +
      (100 - context.distanceToFood) * 0.3 -
      context.threatsNearby * 0.2 -
      context.thirst * 0.1
    );
  }
}

class DrinkAction implements Action<ExampleContext> {
  name = "Drink";

  execute(agent: Agent<ExampleContext>): void {
    agent.currentAction = this.name;
    agent.context.thirst -= 10;
  }

  calculateUtility(context: ExampleContext): number {
    return (
      context.thirst * 0.4 +
      (100 - context.distanceToWater) * 0.3 -
      context.threatsNearby * 0.2 -
      context.hunger * 0.1
    );
  }
}

class SleepAction implements Action<ExampleContext> {
  name = "Sleep";

  execute(agent: Agent<ExampleContext>): void {
    agent.currentAction = this.name;
    agent.context.energy += 25;
  }

  calculateUtility(context: ExampleContext): number {
    return (
      (100 - context.energy) * 0.4 +
      (100 - context.distanceToBed) * 0.3 -
      context.threatsNearby * 0.3
    );
  }
}

class FleeAction implements Action<ExampleContext> {
  name = "Flee";

  execute(agent: Agent<ExampleContext>): void {
    agent.currentAction = this.name;
    agent.context.threatsNearby -= 1;
  }

  calculateUtility(context: ExampleContext): number {
    return context.threatsNearby * 0.8 + (100 - context.energy) * 0.3;
  }
}

// example usage

const ai = new UtilityAI<ExampleContext>();
ai.addAction(new EatAction());
ai.addAction(new DrinkAction());
ai.addAction(new SleepAction());
ai.addAction(new FleeAction());

const agent: Agent<ExampleContext> = {
  name: "Agent",
  currentAction: null,
  context: {
    hunger: 70,
    thirst: 60,
    energy: 50,
    distanceToFood: 30,
    distanceToWater: 40,
    distanceToBed: 20,
    threatsNearby: 10,
  }
}

const updateActionUI = (agent: Agent<ExampleContext>) => {
  const action = document.querySelector("#action");
  action!.innerHTML = agent.currentAction || "none";
}

const updateContextBtn = document.querySelector("#update-context");
updateContextBtn?.addEventListener("click", () => {
  modifyContext(agent.context);
  renderContext(agent.context);
})

const evaluateActionBtn = document.querySelector("#evaluate-action");
evaluateActionBtn?.addEventListener("click", () => {
  ai.update(agent);
  updateActionUI(agent);
  renderContext(agent.context)
})

const updates: Partial<Record<string, (value: number) => void>> = {};

Object.keys(agent.context).forEach(key => {
  const bar = createBarUI("stats", key, agent.context[key], (value: number) => agent.context[key] = value);
  if (bar) updates[key] = bar.update; 
})

function modifyContext(context: ExampleContext): void {
  context.hunger += Math.random() * 5;
  context.thirst += Math.random() * 5;
  context.energy -= Math.random() * 5;
  context.distanceToFood += (Math.random() - 0.5) * 10;
  context.distanceToWater += (Math.random() - 0.5) * 10;
  context.distanceToBed += (Math.random() - 0.5) * 10;
  context.threatsNearby+= (Math.random() - 0.5) * 5;
}

function renderContext(context: ExampleContext): void {
  Object.keys(context).forEach(key => {
    context[key as keyof ExampleContext] = parseFloat(Math.max(0, Math.min(100, context[key as keyof ExampleContext])).toFixed(2));
    updates[key]?.(context[key]);
  })
}