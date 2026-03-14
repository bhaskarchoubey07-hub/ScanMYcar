import { Link, NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('svqcs_token');
  const user = JSON.parse(localStorage.getItem('svqcs_user') || 'null');

  const logout = () => {
    localStorage.removeItem('svqcs_token');
    localStorage.removeItem('svqcs_user');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-lg font-bold tracking-wide text-white">
          Smart Vehicle QR
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <NavLink to="/" className="text-white/80 hover:text-white">
            Home
          </NavLink>
          {token ? (
            <>
              <NavLink to="/dashboard" className="text-white/80 hover:text-white">
                Dashboard
              </NavLink>
              <NavLink to="/add-vehicle" className="text-white/80 hover:text-white">
                Add Vehicle
              </NavLink>
              {user?.role === 'admin' && (
                <NavLink to="/admin" className="text-white/80 hover:text-white">
                  Admin
                </NavLink>
              )}
              <button type="button" onClick={logout} className="btn-secondary px-4 py-2">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="text-white/80 hover:text-white">
                Login
              </NavLink>
              <NavLink to="/register" className="btn-primary px-4 py-2">
                Get Started
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
