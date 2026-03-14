import { useEffect, useState } from 'react';
import api from '../api/client';

const AdminPage = () => {
  const [data, setData] = useState({
    users: [],
    vehicles: [],
    scans: [],
    totalScans: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const [usersRes, vehiclesRes, scansRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/vehicles'),
          api.get('/admin/scans')
        ]);

        setData({
          users: usersRes.data.users || [],
          vehicles: vehiclesRes.data.vehicles || [],
          scans: scansRes.data.scans || [],
          totalScans: scansRes.data.totalScans || 0
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load admin dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-4xl font-bold text-white">Admin analytics dashboard</h1>
      <p className="mt-2 text-slate-300">Users, vehicles, scans, and active QR overview.</p>

      {loading ? (
        <p className="mt-8 text-slate-300">Loading analytics...</p>
      ) : error ? (
        <p className="mt-8 text-red-300">{error}</p>
      ) : (
        <>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            <div className="card p-6">
              <p className="text-sm uppercase tracking-[0.35em] text-glow">Users</p>
              <p className="mt-3 text-4xl font-bold">{data.users.length}</p>
            </div>
            <div className="card p-6">
              <p className="text-sm uppercase tracking-[0.35em] text-glow">Vehicles</p>
              <p className="mt-3 text-4xl font-bold">{data.vehicles.length}</p>
            </div>
            <div className="card p-6">
              <p className="text-sm uppercase tracking-[0.35em] text-glow">Scans</p>
              <p className="mt-3 text-4xl font-bold">{data.totalScans}</p>
            </div>
            <div className="card p-6">
              <p className="text-sm uppercase tracking-[0.35em] text-glow">Active QR</p>
              <p className="mt-3 text-4xl font-bold">
                {data.vehicles.filter((vehicle) => vehicle.qr_code_url).length}
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="card p-6">
              <h2 className="text-2xl font-semibold text-white">Users</h2>
              <div className="mt-6 space-y-4">
                {data.users.map((user) => (
                  <div key={user.id} className="rounded-2xl border border-white/10 p-4">
                    <p className="font-semibold text-white">{user.name}</p>
                    <p className="text-sm text-slate-300">{user.email}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-2xl font-semibold text-white">Recent scans</h2>
              <div className="mt-6 space-y-4">
                {data.scans.slice(0, 8).map((scan) => (
                  <div key={scan.id} className="rounded-2xl border border-white/10 p-4">
                    <p className="font-semibold text-white">{scan.vehicle_number}</p>
                    <p className="text-sm text-slate-300">{scan.device}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(scan.scan_time).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPage;
