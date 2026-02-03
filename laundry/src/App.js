// import logo from './logo.svg';
// import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from "./pages/Home";
import College from './pages/College';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/home" element={<Home />} />

          <Route path="/:college" element={<College />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
