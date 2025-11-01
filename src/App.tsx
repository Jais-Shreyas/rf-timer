import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Timer";
import Solver from "./Solver";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/solver" element={<Solver />} />
      </Routes>
    </Router>
  );
}
