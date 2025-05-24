import { Action } from "./main";

export const getRandomAction = (actions: Action[]) => {
  console.log(actions);
  const randomIndex = Math.floor(Math.random() * actions.length);
  return actions[randomIndex];
}
