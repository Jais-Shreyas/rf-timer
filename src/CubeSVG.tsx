import React from "react";

type CubeFaceColors = string[][];

interface CubeSVGProps {
  faceColors: CubeFaceColors;
  size?: number;
  mode?: number;
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

const CubeSVG: React.FC<CubeSVGProps> = ({ faceColors, size = 30, mode = 3 }) => {
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

export default CubeSVG;
