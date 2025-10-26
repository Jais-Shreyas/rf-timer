const moves = ["R ", "R\'", "R2", "L ", "L\'", "L2", "F ", "F\'", "F2", "B ", "B\'", "B2", "U ", "U\'", "U2", "D ", "D\'", "D2"];

const Scramble = (type: number) => {
  var n = 0;
  if (type == 3) {
    n = 20;
  }
  else if (type == 2) {
    n = 9;
  }
  let generatedScramble = [];
  generatedScramble[0] = Math.floor(Math.random() * 18);
  generatedScramble[1] = Math.floor(Math.random() * 18);
  if (type == 2) {
    while (Math.floor(generatedScramble[1] / 6) === Math.floor(generatedScramble[0] / 6)) {
      generatedScramble[1] = Math.floor(Math.random() * 18);
    }
  } else if (type == 3) {
    while (Math.floor(generatedScramble[1] / 3) === Math.floor(generatedScramble[0] / 3)) {
      generatedScramble[1] = Math.floor(Math.random() * 18);
    }
  }
  for (let i = 2; i < n; i++) {
    generatedScramble[i] = Math.floor(Math.random() * 18);
    if (type == 2) {
      if (Math.floor(generatedScramble[i] / 6) === Math.floor(generatedScramble[i - 1] / 6)) {
        // avoid R2 L
        i--;
        continue;
      }
    } else if (type == 3) {
      if (Math.floor(generatedScramble[i] / 3) === Math.floor(generatedScramble[i - 1] / 3)) {
        // this stops R R2, R L is allowed
        i--;
        continue;
      } else if ((Math.floor(generatedScramble[i] / 6) === Math.floor(generatedScramble[i - 1] / 6) && Math.floor(generatedScramble[i - 1] / 6) === Math.floor(generatedScramble[i - 2] / 6))) {
        // this stops R L R2
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
    const times: number = ((turn[1] == "\'") ? 3 : (turn[1] == "2" ? 2 : 1))
    const face = turn[0];
    for (let turn = 0; turn < times; turn++) {
      if (face == "U") {
        rotateFace(AllFaces, 1, 4);
        for (let j = 0; j <= 6; j += 3) { // front to right to back to left
          swap(AllFaces, 3, j, 3, j + 3);
          swap(AllFaces, 3, j + 1, 3, j + 4);
          swap(AllFaces, 3, j + 2, 3, j + 5);
        };
      } else if (face == "F") {
        rotateFace(AllFaces, 4, 4);
        for (let x = -1; x <= 1; x++) {
          swap(AllFaces, 6, 4 + x, 4 - x, 6);  // bottom to right
          swap(AllFaces, 4 - x, 6, 2, 4 - x);  // right to top
          swap(AllFaces, 2, 4 - x, 4 + x, 2);  // top to left
        }
      } else if (face == "D") {
        rotateFace(AllFaces, 7, 4);
        for (let j = 6; j >= 0; j -= 3) {   // left to back to right to front
          swap(AllFaces, 5, j, 5, j + 3);
          swap(AllFaces, 5, j + 1, 5, j + 4);
          swap(AllFaces, 5, j + 2, 5, j + 5);
        }
      } else if (face == "B") {
        rotateFace(AllFaces, 4, 10);
        for (let x = -1; x <= 1; x++) {
          swap(AllFaces, 4 + x, 0, 0, 4 - x);  // left to top
          swap(AllFaces, 0, 4 - x, 4 - x, 8);  // top to right
          swap(AllFaces, 4 - x, 8, 8, 4 + x);  // right to bottom
        }
      } else if (face == "L") {
        rotateFace(AllFaces, 4, 1);
        for (let x = -1; x <= 1; x++) {
          swap(AllFaces, 4 + x, 3, 1 + x, 3);   // front to top
          swap(AllFaces, 1 + x, 3, 4 - x, 11);  // top to back
          swap(AllFaces, 4 - x, 11, 7 + x, 3); // back to bottom
        }
      } else if (face == "R") {
        rotateFace(AllFaces, 4, 7);
        for (let x = -1; x <= 1; x++) {
          swap(AllFaces, 4 + x, 5, 7 + x, 5);   // front to bottom
          swap(AllFaces, 7 + x, 5, 4 - x, 9);   // bottom to back
          swap(AllFaces, 4 - x, 9, 1 + x, 5);   // back to top
        }
      }
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
    const differentFaces: string[][][] = [blankFace, topFace, leftFace, frontFace, rightFace, backFace, downFace];
    return differentFaces;
  } else if (mode == 3) {
    const topFace: string[][] = [AllFaces[0].slice(3, 6), AllFaces[1].slice(3, 6), AllFaces[2].slice(3, 6)];
    const leftFace: string[][] = [AllFaces[3].slice(0, 3), AllFaces[4].slice(0, 3), AllFaces[5].slice(0, 3)];
    const rightFace: string[][] = [AllFaces[3].slice(6, 9), AllFaces[4].slice(6, 9), AllFaces[5].slice(6, 9)];
    const backFace: string[][] = [AllFaces[3].slice(9, 12), AllFaces[4].slice(9, 12), AllFaces[5].slice(9, 12)];
    const frontFace: string[][] = [AllFaces[3].slice(3, 6), AllFaces[4].slice(3, 6), AllFaces[5].slice(3, 6)];
    const downFace: string[][] = [AllFaces[6].slice(3, 6), AllFaces[7].slice(3, 6), AllFaces[8].slice(3, 6)];
    const blankFace: string[][] = [[" ", " ", " "], [" ", " ", " "], [" ", " ", " "]];
    const differentFaces: string[][][] = [blankFace, topFace, leftFace, frontFace, rightFace, backFace, downFace];
    return differentFaces;
  } else {
    return [];
  }
};

export { Scramble, getScrambledCube };
