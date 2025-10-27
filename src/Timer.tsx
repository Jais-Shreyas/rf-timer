import { useEffect, useState, useRef } from "react";
import { Scramble, getScrambledCube } from "./Scramble";
import CubeSVG from "./CubeSVG";
import './Timer.css';
type Solve = {
  attemptedAt: Date;
  solveTime: number;
  scramble: string[];
  verdict: string
};

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


export default function Timer() {
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [hasStopped, setHasStopped] = useState<boolean>(false);
  const [holdTimeout, setHoldTimeout] = useState<number | undefined>(undefined);
  const [holdDuration, setHoldDuration] = useState<number>(localStorage.getItem("holdDuration") ? Number(localStorage.getItem("holdDuration")) : 250);
  const [solveTimes, setSolveTimes] = useState<Solve[][]>(() => {
    const saved = JSON.parse(localStorage.getItem("solveTimes") || "[[], []]");
    return saved.map((solves: Solve[]) =>
      solves.map(solve => ({ ...solve, attemptedAt: new Date(solve.attemptedAt) }))
    );
  });
  const [mode, setMode] = useState<number>(localStorage.getItem("mode") ? Number(localStorage.getItem("mode")) : 3);
  const [scramble, setScramble] = useState<string[]>(Scramble(mode));
  const [faces, setFaces] = useState<string[][][]>(() => getScrambledCube(scramble, mode));
  const [isSeeingSolve, setIsSeeingSolve] = useState<number>(-1);
  const [isUsingCustomScramble, setIsUsingCustomScramble] = useState<boolean>(false);

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
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

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
  });

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
    return bestTime === Infinity ? "---" : formatTime(bestTime);
  };

  const ao = (n: number, timeList: Solve[]): string => {
    var lastNSolves = timeList.slice(-n);
    if (lastNSolves.length < n) return "---";
    var dnfs = lastNSolves.filter(solve => solve.verdict === "DNF").length;
    if (dnfs >= 2) return "DNF";
    var times = lastNSolves.map(solve => solve.verdict === "DNF" ? Infinity : solve.solveTime + 2000 * (solve.verdict === "+2" ? 1 : 0)).sort((a, b) => a - b);
    var sum = times.slice(1, n - 1).reduce((a, b) => a + b);
    var average = sum / (n - 2);
    return formatTime(average);
  }

  const mo3 = (): string => {
    var last3Solves = solveTimes[mode - 2].slice(-3);
    if (last3Solves.length < 3) return "---";
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
  const bestmo3 = (): string => {
    let best: number = Infinity;
    let sum: number = 0;
    let dnfs = 0;
    for (let i = 0; i < solveTimes[mode - 2].length; i++) {
      dnfs += (solveTimes[mode - 2][i].verdict === "DNF" ? 1 : 0);
      sum += solveTimes[mode - 2][i].solveTime + (solveTimes[mode - 2][i].verdict === "+2" ? 2000 : 0);
      if (i - 3 >= 0) {
        sum -= solveTimes[mode - 2][i - 3].solveTime - (solveTimes[mode - 2][i - 3].verdict === "+2" ? 2000 : 0);
        dnfs -= (solveTimes[mode - 2][i - 3].verdict === "DNF" ? 1 : 0);
      }
      if (i >= 2 && dnfs == 0) {
        best = Math.min(best, sum / 3);
      }
    }
    if (best === Infinity) return "---";
    return formatTime(best);
  }

  const aoList = (n: number, timeList: Solve[]): { best: string, retArr: string[] } => {
    let best: number = Infinity;
    let dnfs = 0;
    let plus2 = 0;
    let timeArr = new Array<number>(n);
    let retArr: string[] = [];
    for (let i = 0; i < timeList.length; i++) {
      dnfs += (timeList[i].verdict == "DNF" ? 1 : 0);
      plus2 += (timeList[i].verdict == "+2" ? 1 : 0);
      if (timeList[i].verdict == "DNF") {
        timeArr[i % n] = Infinity;
      } else {
        timeArr[i % n] = timeList[i].solveTime + (timeList[i].verdict == "DNF" ? 2 : 0);
      }
      if (i - n >= 0) {
        dnfs -= (timeList[i - n].verdict == "DNF" ? 1 : 0);
        plus2 -= (timeList[i - n].verdict == "+2" ? 1 : 0);
      }
      if (i >= n - 1) {
        if (dnfs >= 2) {
          retArr.push("DNF");
        } else if (dnfs == 1) {
          let mini = Math.min(...timeArr);
          let sum = 0;
          for (let t of timeArr) {
            if (t !== Infinity) sum += t;
          }
          retArr.push(formatTime((sum - mini) / (n - 2)));
          best = Math.min(best, (sum - mini) / (n - 2));
        } else {
          let mini = Math.min(...timeArr);
          let maxi = Math.max(...timeArr);
          let sum = timeArr.reduce((a, b) => a + b, 0);
          retArr.push(formatTime((sum - mini - maxi) / (n - 2)));
          best = Math.min(best, (sum - mini - maxi) / (n - 2));
        }
      } else {
        retArr.push("---");
      }
    }
    if (best === Infinity) return { best: "---", retArr };
    return { best: formatTime(best), retArr };
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
    setFaces(getScrambledCube(scramble, mode));
  }, [scramble]);

  useEffect(() => {
    const setVh = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };
    setVh();
    window.addEventListener('resize', setVh);
    return () => window.removeEventListener('resize', setVh);
  }, []);

  const updateStatus = (index: number, status: string) => {
    setSolveTimes(prev => {
      const updated = [...prev];
      updated[mode - 2][index].verdict = status;
      localStorage.setItem("solveTimes", JSON.stringify(updated));
      return updated;
    });
  }

  const downloadCSV = () => {
    const headers = ["Attempted At", "Solve Time", "Scramble", "Verdict"];
    const rows = solveTimes[mode - 2].slice().reverse().map(solve => [
      new Date(solve.attemptedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }).split(',').join(''),
      formatTime(solve.solveTime),
      solve.scramble.join(" "),
      solve.verdict
    ]);
    console.log(rows);
    const csvContent = [headers, ...rows]
      .map(e => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `solves_${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }).split(', ').join('_').split(' ').join('')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`d-flex flex-column-reverse flex-md-row align-items-stretch min-vh-100 transition-colors ${backgroundClass}`}
      style={{
        height: "calc(var(--vh, 1vh) * 100)"
      }}
    >
      <aside
        className={`${isRunning || isReady ? "d-none" : ""} px-3 pt-3 d-flex flex-row flex-md-column border-top border-md-top-0 border-md-end 
    ${theme === 'dark' ? 'bg-dark text-light border-dark' : 'bg-white text-dark'}`}
      >
        <table className={`table table-hover align-middle text-center mb-0 timer-stats-table ${theme === 'dark' ? 'table-dark' : ''}`}>
          <thead>
            <tr>
              <th scope="col" style={{ width: "16%" }}></th>
              <th scope="col" style={{ width: "16%" }}>time</th>
              <th scope="col" style={{ width: "17%" }}>mo3</th>
              <th scope="col" style={{ width: "17%" }}>ao5</th>
              <th scope="col" style={{ width: "17%" }}>ao12</th>
              <th scope="col" style={{ width: "17%" }}>ao50</th>
            </tr>
          </thead>
          <tbody className="responsive-tbody flex-row">
            <tr className="table-row-hover d-md-none">
              <td data-label="&nbsp;" className={effectiveTextColor}></td>
              <td data-label="time" className={effectiveTextColor}></td>
              <td data-label="mo3" className={effectiveTextColor}></td>
              <td data-label="ao5" className={effectiveTextColor}></td>
              <td data-label="ao12" className={effectiveTextColor}></td>
              <td data-label="ao50" className={effectiveTextColor}></td>
            </tr>
            <tr className="">
              <th data-label="" className={effectiveTextColor}>current</th>
              <td data-label="" className={effectiveTextColor}>{formatTime(solveTimes[mode - 2][solveTimes[mode - 2].length - 1].solveTime)}</td>
              <td data-label="" className={effectiveTextColor}>{mo3()}</td>
              <td data-label="" className={effectiveTextColor}>{ao(5, solveTimes[mode - 2])}</td>
              <td data-label="" className={effectiveTextColor}>{ao(12, solveTimes[mode - 2])}</td>
              <td data-label="" className={effectiveTextColor}>{ao(50, solveTimes[mode - 2])}</td>
            </tr>
            <tr className="">
              <th data-label="" className={effectiveTextColor}>best</th>
              <td data-label="" className={effectiveTextColor}>{bestTime()}</td>
              <td data-label="" className={effectiveTextColor}>{bestmo3()}</td>
              <td data-label="" className={effectiveTextColor}>{aoList(5, solveTimes[mode - 2]).best}</td>
              <td data-label="" className={effectiveTextColor}>{aoList(12, solveTimes[mode - 2]).best}</td>
              <td data-label="" className={effectiveTextColor}>{aoList(50, solveTimes[mode - 2]).best}</td>
            </tr>
          </tbody>
        </table>

        <div className="w-100" style={{ display: "block" }}>
          <div className="d-flex justify-content-between align-items-center mb-3 mt-md-3">
            <h5 className={`mb-0 ${effectiveTextColor}`}>Solves:</h5>
            <small className={`fw-bold fs-6`}>
              {solveTimes[mode - 2].filter(attempt => attempt.verdict !== "DNF").length} / {solveTimes[mode - 2].length}
            </small>
            <button
              className="btn btn-secondary py-2 w-1"
              onClick={downloadCSV}
              title="Save as CSV file"
            >
              Save
            </button>
          </div>

          <div className="table-responsive timer-sidebar list-group">
            <table
              className={`table table-hover align-middle text-center ${theme === "dark" ? "table-dark" : ""
                }`}
            >
              <thead>
                <tr>
                  <th scope="col" style={{ width: "10%" }}>#</th>
                  <th scope="col" style={{ width: "30%" }}>Time</th>
                  <th scope="col" style={{ width: "30%" }}>ao5</th>
                  <th scope="col" style={{ width: "30%" }}>ao12</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const solves = solveTimes[mode - 2];
                  const { retArr: ao5Arr } = aoList(5, solves);
                  const { retArr: ao12Arr } = aoList(12, solves);

                  return [...solves].reverse().map((element, revIndex) => {
                    const originalIndex = solves.length - revIndex - 1;

                    const timeDisplay =
                      element.verdict === "DNF"
                        ? "DNF"
                        : formatTime(
                          element.solveTime + (element.verdict === "+2" ? 2000 : 0)
                        ) + (element.verdict === "+2" ? "+" : "");

                    const ao5Display = ao5Arr[originalIndex];
                    const ao12Display = ao12Arr[originalIndex];

                    return (
                      <tr
                        key={revIndex}
                        className="table-row-hover"
                        style={{ cursor: "pointer" }}
                        onClick={() => setIsSeeingSolve(originalIndex)}
                      >
                        <td className="text-muted">#{solves.length - revIndex}</td>
                        <td className={effectiveTextColor}>{timeDisplay}</td>
                        <td className={effectiveTextColor}>{ao5Display}</td>
                        <td className={effectiveTextColor}>{ao12Display}</td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </aside>


      <main className={`flex-grow-1 d-flex flex-column align-items-center overflow-auto ${isRunning || isReady ? "justify-content-center" : "justify-content-between"}`}>
        <div className={`d-flex flex-column align-items-center py-3`}>
          <div className={`${isRunning || isReady ? "d-none" : ""} mb-4 text-center d-flex flex-column flex-md-row align-items-center justify-content-center gap-2`}>
            <div className="d-flex gap-2">
              <select
                className="form-select"
                title="Select cube type"
                value={mode}
                onChange={(e) => {
                  setMode(Number(e.target.value));
                  localStorage.setItem("mode", e.target.value);
                }}
              >
                <option value={2}>2x2x2</option>
                <option value={3}>3x3x3</option>
              </select>

              <select
                className="form-select"
                title="Time to hold before starting."
                value={holdDuration}
                onChange={(e) => {
                  setHoldDuration(Number(e.target.value));
                  localStorage.setItem("holdDuration", e.target.value);
                }}
              >
                <option value={250}>250 ms</option>
                <option value={500}>500 ms</option>
                <option value={750}>750 ms</option>
                <option value={1000}>1000 ms</option>
                <option value={1250}>1250 ms</option>
                <option value={1500}>1500 ms</option>
              </select>
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                title="Change theme."
                className="btn btn-outline-secondary"
                onClick={toggleTheme}
              >
                {theme === "dark" ? "Light" : "Dark"} Theme
              </button>

              <button
                type="button"
                title="Generate a new scramble."
                className="btn btn-outline-success"
                onClick={() => setScramble(Scramble(mode))}
              >
                Next Scramble
              </button>
            </div>

            <label title="Allows you to enter your own scrmable, visualise and solve." className="btn btn-primary fs-6 d-inline-flex align-items-center gap-2 mx-md-3">
              <input
                type="checkbox"
                id="custom"
                className="form-check-input"
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsUsingCustomScramble(checked);
                  if (!checked) {
                    setScramble(Scramble(mode));
                  } else {
                    setScramble([]);
                  }
                }}
              />
              Custom Scramble?
            </label>
          </div>


          <div className={`${isRunning || isReady ? "d-none" : ""} text-center w-100 -4 ${isRunning ? "invisible" : ""}`}>
            {isUsingCustomScramble ? (
              <ScrambleInput scramble={scramble} setScramble={setScramble} />
            ) : (
              <div
                className={`fs-3 fw-semibold px-3 ${getTextColor()}`}
                style={{
                  fontFamily: "monospace",
                  letterSpacing: "1px",
                  userSelect: "none",
                  fontWeight: "bold"
                }}
              >
                {scramble.join(" ")}
              </div>
            )}
          </div>
        </div>
        <h1
          className={`fw-bold ${getTextColor()}`}
          style={{
            fontSize: '10vw', userSelect: "none",
            fontFamily: "monospace",
          }}
        >
          {isRunning ? formatTime(time).slice(0, -1) : formatTime(time)}
        </h1>


        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, auto)",
            gridTemplateRows: "repeat(3, auto)",
            gap: "2px",
            width: "fit-content",
          }}
          className={`${isRunning || isReady ? "d-none" : ""} ms-auto me-4 mb-4 ${isRunning ? "invisible" : ""}`}
        >
          <CubeSVG faceColors={faces[0]} size={30} mode={mode} />
          <CubeSVG faceColors={faces[1]} size={30} mode={mode} />
          <CubeSVG faceColors={faces[0]} size={30} mode={mode} />
          <CubeSVG faceColors={faces[0]} size={30} mode={mode} />
          <CubeSVG faceColors={faces[2]} size={30} mode={mode} />
          <CubeSVG faceColors={faces[3]} size={30} mode={mode} />
          <CubeSVG faceColors={faces[4]} size={30} mode={mode} />
          <CubeSVG faceColors={faces[5]} size={30} mode={mode} />
          <CubeSVG faceColors={faces[0]} size={30} mode={mode} />
          <CubeSVG faceColors={faces[6]} size={30} mode={mode} />
          <CubeSVG faceColors={faces[0]} size={30} mode={mode} />
          <CubeSVG faceColors={faces[0]} size={30} mode={mode} />
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
            style={{ zIndex: 1050, maxWidth: "80vw" }}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="d-flex justify-content-between">
              <div
                onClick={() => setIsSeeingSolve(-1)}
                className="d-flex justify-content-center align-items-center fs-1 text-danger mb-2 rounded-circle"
                style={{
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                title="Close"
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                &times;
              </div>
              <button
                className="btn btn-outline-success"
                title="Copy the statistics for this solve"
                onClick={() => {
                  navigator.clipboard.writeText(`Solve No. ${isSeeingSolve + 1}
Attempted At: ${new Date(solveTimes[mode - 2][isSeeingSolve].attemptedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
Time: ${formatTime(solveTimes[mode - 2][isSeeingSolve].solveTime)}s
Scramble: ${solveTimes[mode - 2][isSeeingSolve].scramble.join(" ")}
Verdict: ${solveTimes[mode - 2][isSeeingSolve].verdict}`);
                }}
              >Copy statistics</button>
            </span>
            <h2
              style={{
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word"
              }}
              className="text-monospace"
            >
              {`Solve No. ${isSeeingSolve + 1}`}
              <div
                className="d-flex flex-column flex-md-row align-items-start align-items-md-center mb-2"
                title="Update the verdict"
              >
                <div className="d-flex flex-column flex-md-row gap-2 w-100 w-md-auto">
                  <span className="me-md-2 fw-medium mb-2 mb-md-0">Verdict:</span>
                  {["OK", "+2", "DNF"].map((status) => {
                    const isSelected = solveTimes[mode - 2][isSeeingSolve].verdict === status;
                    let btnClass =
                      status === "OK"
                        ? "btn-success"
                        : status === "+2"
                          ? "btn-secondary"
                          : "btn-danger";
                    if (!isSelected) btnClass = "btn-outline-" + btnClass.split("-")[1];

                    return (
                      <button
                        key={status}
                        type="button"
                        className={`btn ${btnClass} flex-fill flex-md-auto`}
                        onClick={() => {
                          updateStatus(isSeeingSolve, status);
                          setIsSeeingSolve(-1);
                        }}
                      >
                        {status}
                      </button>
                    );
                  })}

                  <button
                    className="btn btn-outline-danger flex-fill flex-md-auto"
                    onClick={() => {
                      setSolveTimes((prev) => {
                        const updated = [...prev];
                        updated[mode - 2] = updated[mode - 2].filter((_, i) => i !== isSeeingSolve);
                        localStorage.setItem("solveTimes", JSON.stringify(updated));
                        return updated;
                      });
                      setIsSeeingSolve(-1);
                    }}
                  >
                    Delete ?
                  </button>
                </div>
              </div>

              {`Attempted At: ${new Date(solveTimes[mode - 2][isSeeingSolve].attemptedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`}
              {`\nTime: ${formatTime(solveTimes[mode - 2][isSeeingSolve].solveTime)}s`}
              {`\nScramble: ${solveTimes[mode - 2][isSeeingSolve].scramble.join(" ")}`}
            </h2>
          </div>
        </div>
      )}
    </div>
  );
}
