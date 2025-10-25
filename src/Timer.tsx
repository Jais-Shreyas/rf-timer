import { useEffect, useState } from "react";
import { Scramble, getScrambledCube } from "./Scramble";
import CubeSVG from "./CubeSVG";
import './Timer.css';
type Solve = {
  attemptedAt: Date;
  solveTime: number;
  scramble: string[];
  verdict: string
};

export default function Timer() {
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [hasStopped, setHasStopped] = useState<boolean>(false);
  const [holdTimeout, setHoldTimeout] = useState<number | undefined>(undefined);
  const [holdDuration, setHoldDuration] = useState<number>(250);
  const [solveTimes, setSolveTimes] = useState<Solve[][]>(JSON.parse(localStorage.getItem("solveTimes") || "[[], []]"));
  const [mode, setMode] = useState<number>(3);
  const [scramble, setScramble] = useState<string[]>(Scramble(mode));
  const [faces, setFaces] = useState<string[][][]>(() => getScrambledCube(scramble));
  const [isSeeingSolve, setIsSeeingSolve] = useState<number>(-1);
  const blankFace = [[" ", " ", " "], [" ", " ", " "], [" ", " ", " "]];

  useEffect(() => {
    let interval: number | undefined;
    if (isRunning) {
      const start = Date.now() - time;
      interval = window.setInterval(() => {
        setTime(Date.now() - start);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    setScramble(Scramble(mode));
  }, [mode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSeeingSolve !== -1) return;
      if (e.code === "Space") {
        e.preventDefault();

        if (isRunning) {
          setIsRunning(false);
          setHasStopped(true);
          setIsHolding(true);
          setIsReady(false);

          setSolveTimes(prev => {
            const newSolve: Solve = { solveTime: time, scramble: scramble, attemptedAt: new Date(), verdict: "OK" };
            const updated = [...prev];
            updated[mode - 2] = [...updated[mode - 2], newSolve];
            localStorage.setItem("solveTimes", JSON.stringify(updated));
            return updated;
          });
          setScramble(Scramble(mode));
        } else if (!hasStopped) {
          setIsHolding(true);
          const timeoutId = window.setTimeout(() => {
            setTime(0);
            setIsReady(true);
          }, holdDuration);
          setHoldTimeout(timeoutId);
        }
      }

      else if (isRunning) {
        setIsRunning(false);
        setHasStopped(true);
        setIsHolding(true);
        setIsReady(false);

        setSolveTimes(prev => {
          const newSolve: Solve = { solveTime: time, scramble: scramble, attemptedAt: new Date(), verdict: "OK" };
          const updated = [...prev];
          updated[mode - 2] = [...updated[mode - 2], newSolve];
          localStorage.setItem("solveTimes", JSON.stringify(updated));
          return updated;
        });
        setScramble(Scramble(mode));
      }

      if (e.code === "Escape") {
        setTime(0);
        setIsRunning(false);
        setIsHolding(false);
        setIsReady(false);
        setHasStopped(false);
        if (holdTimeout) clearTimeout(holdTimeout);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isSeeingSolve !== -1) return;
      if (e.code === "Space") {
        e.preventDefault();

        if (holdTimeout) clearTimeout(holdTimeout);

        if (hasStopped) {
          setHasStopped(false);
        } else if (isReady && !isRunning) {
          setIsRunning(true);
        }

        setIsHolding(false);
        setIsReady(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isRunning, isHolding, isReady, hasStopped, holdTimeout, holdDuration, time]);

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    var final = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`;
    while (final[0] == "0" || final[0] == ':') final = final.slice(1);
    if (final[0] == '.') final = '0' + final;
    return final;
  };

  const bestTime = (): string => {
    var bestTime = Infinity;
    solveTimes[mode - 2].forEach((solve) => {
      if (solve.solveTime < bestTime && solve.verdict === "OK") {
        bestTime = solve.solveTime;
      } else if (solve.verdict === "+2" && solve.solveTime + 2000 < bestTime) {
        bestTime = solve.solveTime + 2000;
      }
    });
    return bestTime === Infinity ? "--" : formatTime(bestTime);
  };

  const ao = (n: number): string => {
    var lastNSolves = solveTimes[mode - 2].slice(-n);
    if (lastNSolves.length < n) return "--";
    var dnfs = lastNSolves.filter(solve => solve.verdict === "DNF").length;
    if (dnfs >= 2) return "DNF";
    var times = lastNSolves.map(solve => solve.verdict === "DNF" ? Infinity : solve.solveTime + 2000 * (solve.verdict === "+2" ? 1 : 0)).sort((a, b) => a - b);
    var sum = times.slice(1, n - 1).reduce((a, b) => a + b);
    var average = sum / (n - 2);
    return formatTime(average);
  }

  const mo3 = (): string => {
    var last3Solves = solveTimes[mode - 2].slice(-3);
    if (last3Solves.length < 3) return "--";
    var penalty = 0;
    for (let i = 0; i < 3; i++) {
      if (last3Solves[i].verdict === "DNF") return "DNF";
      else if (last3Solves[i].verdict === "+2") penalty += 2000;
    }
    var times = last3Solves.map(solve => solve.solveTime);
    var sum = times.reduce((a, b) => a + b, penalty);
    var average = sum / 3;
    return formatTime(average);
  }

  const getBackground = () => {
    if (isRunning) return "bg-white";
    if (isReady) return "bg-success-subtle";
    if (isHolding) return "bg-danger-subtle";
    return "bg-light";
  };

  const getTextColor = () => {
    if (isReady) return "text-success";
    if (isHolding) return "text-danger";
    if (isRunning) return "text-success";
    return theme === "dark" ? "text-light" : "text-dark";
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
  );

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      return next;
    });
  };

  const backgroundClass = theme === 'dark' ? 'bg-dark' : getBackground();
  const effectiveTextColor = theme === 'dark' ? 'text-light' : 'text-dark';

  useEffect(() => {
    setFaces(getScrambledCube(scramble));
  }, [scramble]);

  const updateStatus = (index: number, status: string) => {
    setSolveTimes(prev => {
      const updated = [...prev];
      updated[mode - 2][index].verdict = status;
      localStorage.setItem("solveTimes", JSON.stringify(updated));
      return updated;
    });
  }

  return (
    <div className={`d-flex align-items-stretch min-vh-100 transition-colors ${backgroundClass}`}>
      <aside
        className={`p-3 border-end h-80 ${theme === 'dark' ? 'bg-dark text-light border-dark' : 'bg-white text-dark'}`}
        style={{ width: 240, display: "flex", flexDirection: "column", height: "100vh" }}
      >
        <div className={effectiveTextColor}>Best Time: {bestTime()}</div>
        <div className={effectiveTextColor}>mo3: {mo3()}</div>
        <div className={effectiveTextColor}>ao5: {ao(5)}</div>
        <div className={effectiveTextColor}>ao12: {ao(12)}</div>
        <div className={effectiveTextColor}>ao50: {ao(50)}</div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className={`mb-0 ${effectiveTextColor}`}>Solves</h5>
          <small className={`text-muted ${effectiveTextColor}`}>{solveTimes[mode - 2].length}</small>
        </div>

        <div
          className="list-group flex-grow-1"
          style={{
            overflowY: "auto",
            msOverflowStyle: "none",
            scrollbarWidth: "none"
          }}
        >
          {solveTimes[mode - 2].slice().reverse().map((element, revIndex) => (
            <button
              key={revIndex}
              type="button"
              className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${theme === 'dark' ? 'bg-transparent text-light' : ''}`}
              onClick={() => setIsSeeingSolve(solveTimes[mode - 2].length - revIndex - 1)}
            >
              <small className="text-muted">#{solveTimes[mode - 2].length - revIndex}</small>
              <span className={effectiveTextColor}>{element.verdict === "DNF" ? "DNF" : formatTime(element.solveTime + 2000 * (element.verdict === "+2" ? 1 : 0))}{element.verdict === "+2" ? "+" : ""}</span>
              <small
                className="text-danger ms-3 glow-hover"
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSolveTimes(prev => {
                    const updated = [...prev];
                    const originalIndex = updated[mode - 2].length - 1 - revIndex;
                    updated[mode - 2] = updated[mode - 2].filter((_, i) => i !== originalIndex);
                    localStorage.setItem("solveTimes", JSON.stringify(updated));
                    return updated;
                  });
                }}
              >
                &times;
              </small>
            </button>
          ))}
        </div>
      </aside>


      <main className="flex-grow-1 d-flex flex-column align-items-center h-100 overflow-auto">
        <div className="mb-4 text-center d-flex gap-2">
          <select
            className="form-select"
            style={{ width: 140 }}
            value={mode}
            onChange={(e) => setMode(Number(e.target.value))}
          >
            <option value={2}>2x2x2</option>
            <option value={3}>3x3x3</option>
          </select>
          <select
            className="form-select"
            style={{ width: 180 }}
            value={holdDuration}
            onChange={(e) => setHoldDuration(Number(e.target.value))}
          >
            <option value={250}>250 ms</option>
            <option value={500}>500 ms</option>
            <option value={750}>750 ms</option>
            <option value={1000}>1000 ms</option>
            <option value={1250}>1250 ms</option>
            <option value={1500}>1500 ms</option>
          </select>
          <button type="button" className="btn btn-outline-secondary" onClick={toggleTheme}>
            {theme === 'dark' ? 'Light' : 'Dark'} Theme
          </button>
        </div>

        <div className={`fs-1 text-center mb-3 ${isRunning ? "invisible" : ""}`}>{scramble.join(" ")}</div>
        <h1 className={`display-1 fw-bold ${getTextColor()}`} style={{ fontSize: "10vw", fontWeight: "bold" }}>
          {formatTime(time)}
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, auto)",
            gridTemplateRows: "repeat(3, auto)",
            gap: "4px",
            width: "fit-content",
            border: "1px solid black",
          }}
          className={`${isRunning ? "invisible" : ""}`}
        >
          <CubeSVG faceColors={blankFace} size={40} />
          <CubeSVG faceColors={faces[0]} size={40} />
          <CubeSVG faceColors={blankFace} size={40} />
          <CubeSVG faceColors={blankFace} size={40} />
          <CubeSVG faceColors={faces[1]} size={40} />
          <CubeSVG faceColors={faces[2]} size={40} />
          <CubeSVG faceColors={faces[3]} size={40} />
          <CubeSVG faceColors={faces[4]} size={40} />
          <CubeSVG faceColors={blankFace} size={40} />
          <CubeSVG faceColors={faces[5]} size={40} />
          <CubeSVG faceColors={blankFace} size={40} />
          <CubeSVG faceColors={blankFace} size={40} />
        </div>

      </main>

      {isSeeingSolve !== -1 && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1040 }}
          onClick={() => setIsSeeingSolve(-1)}
        >
          <div
            className="bg-white p-4 border rounded shadow"
            style={{ zIndex: 1050, maxWidth: "60vw" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="fs-2 text-danger"
              onClick={() => setIsSeeingSolve(-1)}
              style={{ cursor: 'pointer' }}
            >
              &times;
            </div>
            <h2
              style={{
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word"
              }}
              className="text-monospace"
            >
              {`Solve No. ${isSeeingSolve + 1}  Verdict:`}
              <select value={solveTimes[mode - 2][isSeeingSolve].verdict} onChange={(e) => updateStatus(isSeeingSolve, e.target.value)}>
                <option value="OK">OK</option>
                <option value="DNF">DNF</option>
                <option value="+2">+2</option>
              </select>
              {`\nTime: ${formatTime(solveTimes[mode - 2][isSeeingSolve].solveTime)}\n${solveTimes[mode - 2][isSeeingSolve].scramble.join(" ")}`}
            </h2>
          </div>
        </div>
      )}
    </div>
  );
}
