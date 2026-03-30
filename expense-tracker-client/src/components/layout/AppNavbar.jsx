import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

export default function AppNavbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark app-navbar">
      <div className="container">
        <Link className="navbar-brand brand-mark" to="/">
          ExpenseTracker
        </Link>

        <div className="d-flex align-items-center gap-3 ms-auto flex-wrap justify-content-end px-3 py-2 ">
          <ul className="navbar-nav me-auto">
            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/">
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/categories">
                    Categorías
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/transactions">
                    Transacciones
                  </Link>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3 text-white">
            {isAuthenticated && (
              <div className="small text-white-50 ms-3">
                Hola, <span className="text-white fw-semibold">{user?.name}</span>
              </div>
            )}

            {isAuthenticated ? (
              <button className="btn btn-outline-light btn-sm px-3" onClick={handleLogout}>
                Salir
              </button>
            ) : (
              <>
                <Link className="btn btn-outline-light btn-sm px-3" to="/login">
                  Login
                </Link>
                <Link className="btn btn-light btn-sm px-3" to="/register">
                  Registro
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}