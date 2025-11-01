import { solve2by2 } from "../Scramble.ts";

self.onmessage = (e) => {
  const { colorMap } = e.data;
  const solution = solve2by2(colorMap);
  self.postMessage(solution);
};
