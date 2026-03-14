import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import getApiErrorMessage from '../api/getApiErrorMessage';

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('svqcs_token', data.token);
      localStorage.setItem('svqcs_user', JSON.stringify(data.user));
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Login failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-90px)] max-w-xl items-center px-6 py-16">
      <form onSubmit={submit} className="card w-full p-8">
        <h1 className="text-3xl font-bold text-white">Welcome back</h1>
        <p className="mt-2 text-slate-300">Login to manage your vehicles and QR scans.</p>
        <div className="mt-8 space-y-4">
          <input className="input" type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
        <button type="submit" className="btn-primary mt-6 w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </button>
        <p className="mt-4 text-sm text-slate-300">
          New here?{' '}
          <Link to="/register" className="text-glow">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
