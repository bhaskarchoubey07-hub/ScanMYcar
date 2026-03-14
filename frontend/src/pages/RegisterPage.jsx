import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import getApiErrorMessage from '../api/getApiErrorMessage';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/register', form);
      localStorage.setItem('svqcs_token', data.token);
      localStorage.setItem('svqcs_user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-90px)] max-w-xl items-center px-6 py-16">
      <form onSubmit={submit} className="card w-full p-8">
        <h1 className="text-3xl font-bold text-white">Create your account</h1>
        <p className="mt-2 text-slate-300">Register your vehicle and generate a protected QR sticker.</p>
        <div className="mt-8 space-y-4">
          <input className="input" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="input" type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
        <button type="submit" className="btn-primary mt-6 w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
        <p className="mt-4 text-sm text-slate-300">
          Already have an account?{' '}
          <Link to="/login" className="text-glow">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
