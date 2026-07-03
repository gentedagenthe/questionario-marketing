import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import QuestionarioMarketing from "./QuestionarioMarketing";
import AdminPanel from "./AdminPanel";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<QuestionarioMarketing />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
