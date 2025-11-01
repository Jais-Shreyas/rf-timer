import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getScrambledCube } from "./Scramble.ts";
import SolverWorker from "./workers/solverWorker?worker";

type CubeFaceColors = string[][];

interface CubeSVGProps {
  faceColors: CubeFaceColors;
  AllFaces: string[][][];
  size?: number;
  mode?: number;
  face?: string;
  updateFace: React.Dispatch<React.SetStateAction<string[][][]>>;
}

const colorMap = new Map<string, string>([
  ["W", "white"],
  ["Y", "yellow"],
  ["R", "red"],
  ["O", "orange"],
  ["B", "blue"],
  ["G", "green"],
  [" ", "transparent"],
]);


const CubeSVG: React.FC<CubeSVGProps> = ({ faceColors, AllFaces, size = 30, mode = 3, face = null, updateFace }) => {
  const faceToIndex = new Map<string, [number]>([["U", [1]], ["L", [2]], ["F", [3]], ["R", [4]], ["B", [5]], ["D", [6]]]);

  return (
    <svg
      width={size * mode}
      height={size * mode}
      viewBox={`0 0 ${size * mode} ${size * mode}`}
    >
      {faceColors.map((row, i) =>
        row.map((color, j) => (
          <rect
            key={`${i}-${j}`}
            x={j * size}
            y={i * size}
            cursor={`${face ? "pointer" : "default"}`}
            onClick={() => {
              if (face) {
                const newAllFaces = [...AllFaces];
                const [faceIndex] = faceToIndex.get(face)!;
                const currentColor = AllFaces[faceIndex][i][j]
                const colors = ["W", "R", "O", "Y", "G", "B"];
                const currentIndex = colors.indexOf(currentColor);
                const nextColor = colors[(currentIndex + 1) % colors.length];
                newAllFaces[faceIndex][i][j] = nextColor;
                updateFace(newAllFaces);
              }
            }}
            width={size}
            height={size}
            fill={colorMap.get(color) || "gray"}
            stroke="black"
            strokeWidth={faceColors[i][j] !== " " ? 0.5 : 0}
          />
        ))
      )}
    </svg>
  );
};


const Solver = () => {
  const navigate = useNavigate();
  const [userScrambleFace, setUserScrambleFace] = useState<string[][][]>(getScrambledCube([], 2));
  const [isFindingSolution, setIsFindingSolution] = useState<boolean>(false);
  const [solution, setSolution] = useState<string[]>([]);
  const faceToCoord: [number, number][] = [
    [0, 0],   // dummy (index 0 unused)
    [0, 3],   // face 1
    [3, 0],   // face 3
    [3, 3],   // face 3
    [3, 6],   // face 4
    [3, 9],   // face 5
    [6, 3],   // face 6
  ];

  const processSolutionGeneration = () => {
    setIsFindingSolution(true);
    const colorMap: string[][] = new Array(9).fill(0).map(() => new Array(12).fill(" "));
    for (let i = 1; i <= 6; i++) {
      const [rowOffset, colOffset] = faceToCoord[i];
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 2; c++) {
          colorMap[rowOffset + 2 * r][colOffset + 2 * c] = userScrambleFace[i][r][c];
        }
      }
    }
    const worker = new SolverWorker();

    worker.postMessage({ colorMap });

    worker.onmessage = (e) => {
      const solu = e.data;
      setSolution(solu);
      setIsFindingSolution(false);
      worker.terminate();
    };

    worker.onerror = (err) => {
      console.error("Worker error:", err);
      setIsFindingSolution(false);
      worker.terminate();
    };
  };

  return (
    <div>
      <div className={`d-flex justify-content-center align-items-center gap-3 p-3`}>
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          Back to Timer
        </button>
        <button className={`btn btn-success`}
          disabled={isFindingSolution}
          onClick={processSolutionGeneration}
        >
          Solve
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, auto)",
          gridTemplateRows: "repeat(3, auto)",
          gap: "2px",
          width: "fit-content",
        }}
        className={`position-relative mx-auto mt-4`}
      >
        <CubeSVG faceColors={userScrambleFace[0]} AllFaces={userScrambleFace} size={Math.max(40, window.innerWidth / 24)}mode={2} updateFace={setUserScrambleFace} />
        <CubeSVG faceColors={userScrambleFace[1]} AllFaces={userScrambleFace} size={Math.max(40, window.innerWidth / 24)}mode={2} face={"U"} updateFace={setUserScrambleFace} />
        <CubeSVG faceColors={userScrambleFace[0]} AllFaces={userScrambleFace} size={Math.max(40, window.innerWidth / 24)}mode={2} updateFace={setUserScrambleFace} />
        <CubeSVG faceColors={userScrambleFace[0]} AllFaces={userScrambleFace} size={Math.max(40, window.innerWidth / 24)}mode={2} updateFace={setUserScrambleFace} />
        <CubeSVG faceColors={userScrambleFace[2]} AllFaces={userScrambleFace} size={Math.max(40, window.innerWidth / 24)}mode={2} face={"L"} updateFace={setUserScrambleFace} />
        <CubeSVG faceColors={userScrambleFace[3]} AllFaces={userScrambleFace} size={Math.max(40, window.innerWidth / 24)}mode={2} face={"F"} updateFace={setUserScrambleFace} />
        <CubeSVG faceColors={userScrambleFace[4]} AllFaces={userScrambleFace} size={Math.max(40, window.innerWidth / 24)}mode={2} face={"R"} updateFace={setUserScrambleFace} />
        <CubeSVG faceColors={userScrambleFace[5]} AllFaces={userScrambleFace} size={Math.max(40, window.innerWidth / 24)}mode={2} face={"B"} updateFace={setUserScrambleFace} />
        <CubeSVG faceColors={userScrambleFace[0]} AllFaces={userScrambleFace} size={Math.max(40, window.innerWidth / 24)}mode={2} updateFace={setUserScrambleFace} />
        <CubeSVG faceColors={userScrambleFace[6]} AllFaces={userScrambleFace} size={Math.max(40, window.innerWidth / 24)}mode={2} face={"D"} updateFace={setUserScrambleFace} />
        <CubeSVG faceColors={userScrambleFace[0]} AllFaces={userScrambleFace} size={Math.max(40, window.innerWidth / 24)}mode={2} updateFace={setUserScrambleFace} />
        <CubeSVG faceColors={userScrambleFace[0]} AllFaces={userScrambleFace} size={Math.max(40, window.innerWidth / 24)}mode={2} updateFace={setUserScrambleFace} />
      </div>
      <div className={`text-center mt-2 text-muted`} style={{ fontSize: "0.9em" }}>
        2 by 2 Solver - Click on the squares to set your cube's colors
      </div>
      <div className={`text-center mt-3`}>
        {isFindingSolution ? "Finding solution..." : solution.length > 0 ? `Solution: ${solution.join(" ")}` : ""}
      </div>
    </div>
  )
}

export default Solver
