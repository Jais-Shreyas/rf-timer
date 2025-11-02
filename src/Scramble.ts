const moves = ["R ", "R'", "R2", "L ", "L'", "L2", "F ", "F'", "F2", "B ", "B'", "B2", "U ", "U'", "U2", "D ", "D'", "D2"];

const Scramble = (type: number) => {
  var n = 0;
  if (type == 3) {
    n = 20 + Math.floor(Math.random() * 3);
  }
  else if (type == 2) {
    n = 9 + Math.floor(Math.random() * 2);
  }
  const generatedScramble: number[] = [];
  generatedScramble.push(Math.floor(Math.random() * 18));
  generatedScramble.push(Math.floor(Math.random() * 18));
  if (type == 2) {
    while (Math.floor(generatedScramble[1] / 6) === Math.floor(generatedScramble[0] / 6)) {
      generatedScramble.pop();
      generatedScramble.push(Math.floor(Math.random() * 18));
    }
  } else if (type == 3) {
    while (Math.floor(generatedScramble[1] / 3) === Math.floor(generatedScramble[0] / 3)) {
      generatedScramble.pop();
      generatedScramble.push(Math.floor(Math.random() * 18));
    }
  }
  for (let i = 2; i < n; i++) {
    generatedScramble.push(Math.floor(Math.random() * 18));
    if (type == 2) {
      if (Math.floor(generatedScramble[i] / 6) === Math.floor(generatedScramble[i - 1] / 6)) {
        // avoid R2 L
        generatedScramble.pop();
        i--;
        continue;
      }
    } else if (type == 3) {
      if (Math.floor(generatedScramble[i] / 3) === Math.floor(generatedScramble[i - 1] / 3)) {
        // this stops R R2, R L is allowed
        generatedScramble.pop();
        i--;
        continue;
      } else if ((Math.floor(generatedScramble[i] / 6) === Math.floor(generatedScramble[i - 1] / 6) && Math.floor(generatedScramble[i - 1] / 6) === Math.floor(generatedScramble[i - 2] / 6))) {
        // this stops R L R2
        generatedScramble.pop();
        i--;
        continue;
      }
    }
  }
  return generatedScramble.map(index => moves[index]);
}

const rotateFace = (AllFaces: string[][], i: number, j: number): void => {
  const tempFace: string[][] = [];
  for (let x = -1; x <= 1; x++) {
    const row: string[] = [];
    for (let y = -1; y <= 1; y++) {
      row.push(AllFaces[i + x][j + y]);
    }
    tempFace.push(row);
  };
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      AllFaces[i - 1 + x][j - 1 + y] = tempFace[2 - y][x];
    }
  }
};
function swap<T>(arr: T[][], x1: number, y1: number, x2: number, y2: number): void {
  var temp = arr[x1][y1];
  arr[x1][y1] = arr[x2][y2];
  arr[x2][y2] = temp;
}

const makeUmove = (AllFaces: string[][]) => {
  rotateFace(AllFaces, 1, 4);
  for (let j = 0; j <= 6; j += 3) { // front to right to back to left
    swap(AllFaces, 3, j, 3, j + 3);
    swap(AllFaces, 3, j + 1, 3, j + 4);
    swap(AllFaces, 3, j + 2, 3, j + 5);
  };
}
const makeFmove = (AllFaces: string[][]) => {
  rotateFace(AllFaces, 4, 4);
  for (let x = -1; x <= 1; x++) {
    swap(AllFaces, 6, 4 + x, 4 - x, 6);  // bottom to right
    swap(AllFaces, 4 - x, 6, 2, 4 - x);  // right to top
    swap(AllFaces, 2, 4 - x, 4 + x, 2);  // top to left
  }
};

const makeDmove = (AllFaces: string[][]) => {
  rotateFace(AllFaces, 7, 4);
  for (let j = 6; j >= 0; j -= 3) {   // left to back to right to front
    swap(AllFaces, 5, j, 5, j + 3);
    swap(AllFaces, 5, j + 1, 5, j + 4);
    swap(AllFaces, 5, j + 2, 5, j + 5);
  }
};

const makeBmove = (AllFaces: string[][]) => {
  rotateFace(AllFaces, 4, 10);
  for (let x = -1; x <= 1; x++) {
    swap(AllFaces, 4 + x, 0, 0, 4 - x);  // left to top
    swap(AllFaces, 0, 4 - x, 4 - x, 8);  // top to right
    swap(AllFaces, 4 - x, 8, 8, 4 + x);  // right to bottom
  }
};

const makeLmove = (AllFaces: string[][]) => {
  rotateFace(AllFaces, 4, 1);
  for (let x = -1; x <= 1; x++) {
    swap(AllFaces, 4 + x, 3, 1 + x, 3);   // front to top
    swap(AllFaces, 1 + x, 3, 4 - x, 11);  // top to back
    swap(AllFaces, 4 - x, 11, 7 + x, 3);  // back to bottom
  }
};

const makeRmove = (AllFaces: string[][]) => {
  rotateFace(AllFaces, 4, 7);
  for (let x = -1; x <= 1; x++) {
    swap(AllFaces, 4 + x, 5, 7 + x, 5);   // front to bottom
    swap(AllFaces, 7 + x, 5, 4 - x, 9);   // bottom to back
    swap(AllFaces, 4 - x, 9, 1 + x, 5);   // back to top
  }
};

const checkSolved = (AllFaces: string[][], type: number): boolean => {
  const faceCenters = [[1, 4], [4, 1], [4, 7], [4, 4], [4, 10], [7, 4]];
  const nonCenters = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ];
  let isSolved = true;
  for (let center of faceCenters) {
    if (type == 2) {
      if (AllFaces[center[0] - 1][center[1] - 1] !== AllFaces[center[0] - 1][center[1] + 1] ||
        AllFaces[center[0] + 1][center[1] - 1] !== AllFaces[center[0] + 1][center[1] + 1] ||
        AllFaces[center[0] - 1][center[1] - 1] !== AllFaces[center[0] + 1][center[1] - 1]
      ) isSolved = false;
    }
    else if (type == 3) {
      for (let offset of nonCenters) {
        if (AllFaces[center[0] + offset[0]][center[1] + offset[1]] !== AllFaces[center[0]][center[1]]) {
          isSolved = false;
        }
      }
    }
  };
  return isSolved;
};

// Map face letter to its corresponding move function
const faceMoveMap: Record<string, (AllFaces: string[][]) => void> = {
  U: makeUmove,
  F: makeFmove,
  D: makeDmove,
  B: makeBmove,
  L: makeLmove,
  R: makeRmove,
};

const getScrambledCube = (scramble: string[], mode: number = 3): string[][][] => {
  var AllFaces: string[][] = [
    [" ", " ", " ", "W", "W", "W", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", "W", "W", "W", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", "W", "W", "W", " ", " ", " ", " ", " ", " "],
    ["O", "O", "O", "G", "G", "G", "R", "R", "R", "B", "B", "B"],
    ["O", "O", "O", "G", "G", "G", "R", "R", "R", "B", "B", "B"],
    ["O", "O", "O", "G", "G", "G", "R", "R", "R", "B", "B", "B"],
    [" ", " ", " ", "Y", "Y", "Y", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", "Y", "Y", "Y", " ", " ", " ", " ", " ", " "],
    [" ", " ", " ", "Y", "Y", "Y", " ", " ", " ", " ", " ", " "],
  ]

  scramble.forEach(turn => {
    const times: number = (turn[1] === "'" ? 3 : (turn[1] === "2" ? 2 : 1));
    const face = turn[0];
    const moveFn = faceMoveMap[face];
    for (let t = 0; t < times; t++) {
      if (moveFn) moveFn(AllFaces);
    }
  });
  if (mode == 2) {
    const topFace: string[][] = [
      [AllFaces[0][3], AllFaces[0][5]],
      [AllFaces[2][3], AllFaces[2][5]]
    ];
    const leftFace: string[][] = [
      [AllFaces[3][0], AllFaces[3][2]],
      [AllFaces[5][0], AllFaces[5][2]]
    ];
    const frontFace: string[][] = [
      [AllFaces[3][3], AllFaces[3][5]],
      [AllFaces[5][3], AllFaces[5][5]]
    ];
    const rightFace: string[][] = [
      [AllFaces[3][6], AllFaces[3][8]],
      [AllFaces[5][6], AllFaces[5][8]]
    ];
    const backFace: string[][] = [
      [AllFaces[3][9], AllFaces[3][11]],
      [AllFaces[5][9], AllFaces[5][11]]
    ];
    const downFace: string[][] = [
      [AllFaces[6][3], AllFaces[6][5]],
      [AllFaces[8][3], AllFaces[8][5]]
    ];
    const blankFace: string[][] = [
      [" ", " "],
      [" ", " "]
    ];
    const differentFaces: string[][][] = [blankFace, topFace, leftFace, frontFace, rightFace, backFace, downFace, AllFaces];
    return differentFaces;
  } else if (mode == 3) {
    const topFace: string[][] = [AllFaces[0].slice(3, 6), AllFaces[1].slice(3, 6), AllFaces[2].slice(3, 6)];
    const leftFace: string[][] = [AllFaces[3].slice(0, 3), AllFaces[4].slice(0, 3), AllFaces[5].slice(0, 3)];
    const rightFace: string[][] = [AllFaces[3].slice(6, 9), AllFaces[4].slice(6, 9), AllFaces[5].slice(6, 9)];
    const backFace: string[][] = [AllFaces[3].slice(9, 12), AllFaces[4].slice(9, 12), AllFaces[5].slice(9, 12)];
    const frontFace: string[][] = [AllFaces[3].slice(3, 6), AllFaces[4].slice(3, 6), AllFaces[5].slice(3, 6)];
    const downFace: string[][] = [AllFaces[6].slice(3, 6), AllFaces[7].slice(3, 6), AllFaces[8].slice(3, 6)];
    const blankFace: string[][] = [[" ", " ", " "], [" ", " ", " "], [" ", " ", " "]];
    const differentFaces: string[][][] = [blankFace, topFace, leftFace, frontFace, rightFace, backFace, downFace, AllFaces];
    return differentFaces;
  } else {
    return [];
  }
};

const TwobyTwoMovesList: string[] = ["F ", "F'", "F2", "R ", "R'", "R2", "U ", "U'", "U2"];

let solveMoves: string[] = [];
let isSolved: boolean = false;
const helper2 = (cube: string[][], lastMove: string, depth: number): void => {
  if (depth == 0) return;
  if (isSolved) return;
  if (checkSolved(cube, 2)) {
    isSolved = true;
    return;
  }
  for (let nextMove of TwobyTwoMovesList) {
    if (nextMove[0] === lastMove[0]) continue; // prevent same face moves in succession
    const movefn = faceMoveMap[nextMove[0]];
    const times: number = (nextMove[1] === "'" ? 3 : (nextMove[1] === "2" ? 2 : 1));
    // make the move
    for (let t = 0; t < times; t++) {
      if (movefn) movefn(cube);
    }
    solveMoves.push(nextMove);
    helper2(cube, nextMove, depth - 1);
    if (isSolved) {
      return;
    }
    // undo the move
    solveMoves.pop();
    for (let t = 0; t < (4 - times) % 4; t++) {
      if (movefn) movefn(cube);
    }
  }
};

const solve2by2 = (cube: string[][]): string[] => {
  solveMoves = [];
  isSolved = false;
  for (let depth = 1; depth <= 11; depth++) {
    helper2(cube, "X", depth); // "X" is a dummy last move
    if (isSolved) {
      return solveMoves;
    }
  }
  return ["No solution found..."];
}

export { Scramble, getScrambledCube, solve2by2 };
