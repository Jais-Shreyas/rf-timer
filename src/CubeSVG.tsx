import React from "react";

type CubeFaceColors = string[][];

interface CubeSVGProps {
  faceColors: CubeFaceColors;
  size?: number;
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

const CubeSVG: React.FC<CubeSVGProps> = ({ faceColors, size = 30 }) => {
  return (
    <svg
      width={size * 3}
      height={size * 3}
      viewBox={`0 0 ${size * 3} ${size * 3}`}
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
            strokeWidth={faceColors[i][j] !== " " ? 1 : 0}
          />
        ))
      )}
    </svg>
  );
};

export default CubeSVG;
