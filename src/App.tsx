import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Timer";
import Solver from "./Solver";
import { useState } from "react";

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
  );
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home theme={theme} setTheme={setTheme} />} />
        <Route path="/solver" element={<Solver theme={theme} />} />
      </Routes>
    </Router>
  );
}
