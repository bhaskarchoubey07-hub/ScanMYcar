import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const AddVehiclePage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('svqcs_user') || 'null');
  const [form, setForm] = useState({
    vehicle_number: '',
    vehicle_type: 'car',
    owner_name: user?.name || '',
    contact_phone: user?.phone || '',
    emergency_contact: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/vehicle/add', form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add vehicle.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="card p-8">
        <h1 className="text-3xl font-bold text-white">Register a vehicle</h1>
        <p className="mt-2 text-slate-300">
          Add your vehicle details and we'll generate a unique QR code sticker.
        </p>

        <form onSubmit={submit} className="mt-8 grid gap-4 md:grid-cols-2">
          <input className="input" placeholder="Vehicle number" value={form.vehicle_number} onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })} />
          <select className="input" value={form.vehicle_type} onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}>
            <option value="car">Car</option>
            <option value="bike">Bike</option>
            <option value="scooter">Scooter</option>
            <option value="truck">Truck</option>
            <option value="other">Other</option>
          </select>
          <input className="input" placeholder="Owner name" value={form.owner_name} onChange={(e) => setForm({ ...form, owner_name: e.target.value })} />
          <input className="input" placeholder="Primary contact phone" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
          <input className="input md:col-span-2" placeholder="Emergency contact number" value={form.emergency_contact} onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })} />
          {error && <p className="text-sm text-red-300 md:col-span-2">{error}</p>}
          <button type="submit" className="btn-primary md:col-span-2" disabled={loading}>
            {loading ? 'Generating QR...' : 'Add Vehicle'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddVehiclePage;
