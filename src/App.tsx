import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.tsx";
import Mainpage from "./pages/Mainpage";
import Connect4 from "./pages/Connect4";

const App = () => {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Mainpage />} />
                <Route path="/connect4" element={<Connect4 />} />
            </Routes>
        </Router>
    );
};

export default App;
