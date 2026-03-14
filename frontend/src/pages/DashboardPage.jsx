import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

const DashboardPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [stats, setStats] = useState({ totalVehicles: 0, totalScans: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const { data } = await api.get('/vehicle/my');
        setVehicles(data.vehicles || []);
        setStats(data.stats || { totalVehicles: 0, totalScans: 0 });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white">Your dashboard</h1>
          <p className="mt-2 text-slate-300">Monitor vehicles, QR codes, and scan activity.</p>
        </div>
        <Link to="/add-vehicle" className="btn-primary">
          Add Vehicle
        </Link>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="card p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-glow">Vehicles</p>
          <p className="mt-3 text-4xl font-bold">{stats.totalVehicles || 0}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-glow">Scans</p>
          <p className="mt-3 text-4xl font-bold">{stats.totalScans || 0}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-glow">Active QR</p>
          <p className="mt-3 text-4xl font-bold">{vehicles.filter((item) => item.qr_code_url).length}</p>
        </div>
      </div>

      <div className="mt-10 card overflow-hidden">
        <div className="border-b border-white/10 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Registered vehicles</h2>
        </div>
        {loading ? (
          <p className="px-6 py-8 text-slate-300">Loading vehicles...</p>
        ) : error ? (
          <p className="px-6 py-8 text-red-300">{error}</p>
        ) : vehicles.length === 0 ? (
          <div className="px-6 py-8 text-slate-300">
            No vehicles yet. Add your first one to generate a QR sticker.
          </div>
        ) : (
          <div className="grid gap-0">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="grid gap-4 border-t border-white/10 px-6 py-6 md:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="text-xl font-semibold text-white">{vehicle.vehicle_number}</p>
                  <p className="mt-1 text-slate-300">
                    {vehicle.vehicle_type} - {vehicle.owner_name}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">Scans: {vehicle.total_scans}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <a href={vehicle.qr_code_url} target="_blank" rel="noreferrer" className="btn-secondary">
                    View QR
                  </a>
                  <Link to={`/vehicle/${vehicle.id}`} className="btn-secondary">
                    Public Page
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
