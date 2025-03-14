import { Link } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
    return (
        <nav className="navbar">
            <h1 className="navbar-title">Connect 4</h1>
            <div className="navbar-links">
                <Link to="/" className="navbar-link">Home</Link>
                <Link to="/Connect4" className="navbar-link">Play Game</Link>
            </div>
        </nav>
    );
};

export default Navbar;
