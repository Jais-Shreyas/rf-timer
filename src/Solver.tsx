import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getScrambledCube } from "./Scramble.ts";
import SolverWorker from "./workers/solverWorker?worker";

type CubeFaceColors = string[][];

interface CubeSVGProps {
  allowCellChange: boolean;
  faceColors: CubeFaceColors;
  AllFaces: string[][][];
  size?: number;
  mode?: number;
  face?: string;
  updateFace: React.Dispatch<React.SetStateAction<string[][][]>>;
  selectedColor: string; // 👈 new prop
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

const CubeSVG: React.FC<CubeSVGProps> = ({
  allowCellChange,
  faceColors,
  AllFaces,
  size = 30,
  mode = 3,
  face = null,
  updateFace,
  selectedColor,
}) => {
  const faceToIndex = new Map<string, [number]>([
    ["U", [1]],
    ["L", [2]],
    ["F", [3]],
    ["R", [4]],
    ["B", [5]],
    ["D", [6]],
  ]);

  return (
    <svg width={size * mode} height={size * mode} viewBox={`0 0 ${size * mode} ${size * mode}`}>
      {faceColors.map((row, i) =>
        row.map((color, j) => (
          <rect
            key={`${i}-${j}`}
            x={j * size}
            y={i * size}
            cursor={face ? "pointer" : "default"}
            pointerEvents={!allowCellChange ? "none" : "auto"}
            onClick={() => {
              if (face && allowCellChange) {
                const newAllFaces = [...AllFaces];
                const [faceIndex] = faceToIndex.get(face)!;
                newAllFaces[faceIndex][i][j] = selectedColor;
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

type SolverProps = {
  theme: "light" | "dark";
};

const Solver = ({ theme }: SolverProps) => {
  const navigate = useNavigate();
  const [userScrambleFace, setUserScrambleFace] = useState<string[][][]>(
    getScrambledCube([], 2)
  );
  const [isFindingSolution, setIsFindingSolution] = useState<boolean>(false);
  const [solution, setSolution] = useState<string[]>([]);
  const [couldBeSolved, setCouldBeSolved] = useState<boolean>(true);
  const [selectedColor, setSelectedColor] = useState<string>("W"); // 👈 palette selection

  const faceToCoord: [number, number][] = [
    [0, 0],
    [0, 3],
    [3, 0],
    [3, 3],
    [3, 6],
    [3, 9],
    [6, 3],
  ];

  const processSolutionGeneration = () => {
    setIsFindingSolution(true);
    const colorMap: string[][] = new Array(9)
      .fill(0)
      .map(() => new Array(12).fill(" "));
    for (let i = 1; i <= 6; i++) {
      const [rowOffset, colOffset] = faceToCoord[i];
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 2; c++) {
          colorMap[rowOffset + 2 * r][colOffset + 2 * c] =
            userScrambleFace[i][r][c];
        }
      }
    }

    const worker = new SolverWorker();
    worker.postMessage({ colorMap });

    worker.onmessage = (e) => {
      setSolution(e.data);
      setIsFindingSolution(false);
      worker.terminate();
    };

    worker.onerror = (err) => {
      console.error("Worker error:", err);
      setIsFindingSolution(false);
      worker.terminate();
    };
  };

  useEffect(() => {
    const colorCount: Record<string, number> = {};
    for (let face of userScrambleFace.slice(1, 7)) {
      for (let row of face) {
        for (let color of row) {
          colorCount[color] = (colorCount[color] || 0) + 1;
        }
      }
    }
    const validColors = ["W", "Y", "R", "O", "B", "G"];
    setCouldBeSolved(validColors.every((c) => colorCount[c] === 4));
  }, [userScrambleFace]);

  const colors = ["W", "R", "O", "Y", "G", "B"];

  return (
    <div
      className={`container bg-${theme} text-${theme === "light" ? "dark" : "light"}`}
      style={{ minHeight: "100vh", minWidth: "100vw" }}
    >
      <div className="d-flex justify-content-center align-items-center gap-3 p-3">
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          Back to Timer
        </button>
        <button
          className="btn btn-success"
          disabled={isFindingSolution || !couldBeSolved || JSON.stringify(userScrambleFace) === JSON.stringify(getScrambledCube([], 2))}
          onClick={processSolutionGeneration}
          title={!couldBeSolved ? "The cube configuration is invalid and cannot be solved." : ""}
        >
          Solve
        </button>
        <button
          className="btn btn-danger"
          onClick={() => setUserScrambleFace(getScrambledCube([], 2))}
          disabled={isFindingSolution || JSON.stringify(userScrambleFace) === JSON.stringify(getScrambledCube([], 2))}
        >
          Reset scramble
        </button>
      </div>

      <div className="d-flex justify-content-center align-items-center gap-2 my-2">
        {colors.map((c) => (
          <div
            key={c}
            onClick={() => setSelectedColor(c)}
            style={{
              width: 35,
              height: 35,
              backgroundColor: colorMap.get(c),
              border: selectedColor === c ? "3px solid black" : "1px solid gray",
              borderRadius: 6,
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, auto)",
          gridTemplateRows: "repeat(3, auto)",
          gap: "2px",
          width: "fit-content",
        }}
        className="position-relative mx-auto mt-4"
      >
        <CubeSVG allowCellChange={!isFindingSolution} faceColors={userScrambleFace[0]} AllFaces={userScrambleFace} size={Math.max(40, window.innerWidth / 24)} mode={2} updateFace={setUserScrambleFace} selectedColor={selectedColor} />
        <CubeSVG allowCellChange={!isFindingSolution} faceColors={userScrambleFace[1]} AllFaces={userScrambleFace} size={Math.max(40, window.innerWidth / 24)} mode={2} face={"U"} updateFace={setUserScrambleFace} selectedColor={selectedColor} />
        <CubeSVG allowCellChange={!isFindingSolution} faceColors={userScrambleFace[0]} AllFaces={userScrambleFace} size={Math.max(40, window.innerWidth / 24)} mode={2} updateFace={setUserScrambleFace} selectedColor={selectedColor} />
        <CubeSVG allowCellChange={!isFindingSolution} faceColors={userScrambleFace[0]} AllFaces={userScrambleFace} size={Math.max(40, window.innerWidth / 24)} mode={2} updateFace={setUserScrambleFace} selectedColor={selectedColor} />
        <CubeSVG allowCellChange={!isFindingSolution} faceColors={userScrambleFace[2]} AllFaces={userScrambleFace} size={Math.max(40, window.innerWidth / 24)} mode={2} face={"L"} updateFace={setUserScrambleFace} selectedColor={selectedColor} />
        <CubeSVG allowCellChange={!isFindingSolution} faceColors={userScrambleFace[3]} AllFaces={userScrambleFace} size={Math.max(40, window.innerWidth / 24)} mode={2} face={"F"} updateFace={setUserScrambleFace} selectedColor={selectedColor} />
        <CubeSVG allowCellChange={!isFindingSolution} faceColors={userScrambleFace[4]} AllFaces={userScrambleFace} size={Math.max(40, window.innerWidth / 24)} mode={2} face={"R"} updateFace={setUserScrambleFace} selectedColor={selectedColor} />
        <CubeSVG allowCellChange={!isFindingSolution} faceColors={userScrambleFace[5]} AllFaces={userScrambleFace} size={Math.max(40, window.innerWidth / 24)} mode={2} face={"B"} updateFace={setUserScrambleFace} selectedColor={selectedColor} />
        <CubeSVG allowCellChange={!isFindingSolution} faceColors={userScrambleFace[0]} AllFaces={userScrambleFace} size={Math.max(40, window.innerWidth / 24)} mode={2} updateFace={setUserScrambleFace} selectedColor={selectedColor} />
        <CubeSVG allowCellChange={!isFindingSolution} faceColors={userScrambleFace[6]} AllFaces={userScrambleFace} size={Math.max(40, window.innerWidth / 24)} mode={2} face={"D"} updateFace={setUserScrambleFace} selectedColor={selectedColor} />
        <CubeSVG allowCellChange={!isFindingSolution} faceColors={userScrambleFace[0]} AllFaces={userScrambleFace} size={Math.max(40, window.innerWidth / 24)} mode={2} updateFace={setUserScrambleFace} selectedColor={selectedColor} />
        <CubeSVG allowCellChange={!isFindingSolution} faceColors={userScrambleFace[0]} AllFaces={userScrambleFace} size={Math.max(40, window.innerWidth / 24)} mode={2} updateFace={setUserScrambleFace} selectedColor={selectedColor} />
      </div>

      <div className="text-center mt-2 text-muted" style={{ fontSize: "0.9em" }}>
        2x2 Solver — tap a color above, then tap stickers to paint them.
      </div>

      <div className="text-center mt-3">
        {isFindingSolution ? "Finding solution..." : solution.length > 0 ? solution.join(" ") : ""}
      </div>
    </div>
  );
};

export default Solver;
