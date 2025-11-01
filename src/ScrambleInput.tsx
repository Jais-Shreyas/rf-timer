import { useRef } from "react";

type ScrambleInputProps = {
  scramble: string[];
  setScramble: (s: string[]) => void;
};

const ScrambleInput = ({ scramble, setScramble }: ScrambleInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null); // define ref

  return (
    <div className="d-flex justify-content-center">
      <textarea
        ref={textareaRef}
        placeholder="Enter your custom scramble"
        value={scramble.join(" ")}
        autoFocus={true}
        onChange={(e) => {
          const value = e.target.value.trim();
          const parsedScramble: string[] = [];
          for (let ele of value.split("")) {
            if (["F", "R", "U", "B", "L", "D"].includes(ele)) {
              parsedScramble.push(ele);
            } else if (ele === "'" || ele === "2") {
              if (parsedScramble.length === 0) continue;
              if (parsedScramble[parsedScramble.length - 1].length === 1) {
                parsedScramble[parsedScramble.length - 1] += ele;
              }
            }
          }
          setScramble(parsedScramble);
          const textarea = e.target;
          textarea.style.height = "auto";
          textarea.style.height = textarea.scrollHeight + "px";
        }}
        className="text-center shadow-sm"
        style={{
          width: "60%",
          maxWidth: "800px",
          minWidth: "300px",
          minHeight: "100px",
          fontFamily: "monospace",
          fontSize: "1.25rem",
          padding: "10px 14px",
          borderRadius: "12px",
          border: "2px solid #ccc",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          overflow: "hidden",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#0d6efd")}
        onBlur={(e) => (e.target.style.borderColor = "#ccc")}
      />
    </div>
  );
};

export default ScrambleInput;