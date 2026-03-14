import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';

const VehiclePublicPage = () => {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const { data: vehicleData } = await api.get(`/public/vehicles/${id}`);
        setVehicle(vehicleData.vehicle);

        const submitScan = async (payload) => {
          try {
            await api.post('/public/scan', payload);
            setStatus('Scan logged.');
          } catch {
            setStatus('Opened contact page.');
          }
        };

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) =>
              submitScan({
                vehicle_id: Number(id),
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }),
            () => submitScan({ vehicle_id: Number(id) })
          );
        } else {
          await submitScan({ vehicle_id: Number(id) });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load vehicle contact page.');
      }
    };

    init();
  }, [id]);

  const actionUrl = (method) =>
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/public/vehicles/${id}/contact/${method}`;

  if (error) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-90px)] max-w-2xl items-center px-6 py-16">
        <div className="card w-full p-8 text-center">
          <h1 className="text-3xl font-bold text-white">Vehicle not available</h1>
          <p className="mt-4 text-slate-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-90px)] max-w-2xl items-center px-6 py-16">
        <div className="card w-full p-8 text-center text-slate-300">Loading vehicle contact page...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-90px)] max-w-2xl items-center px-6 py-16">
      <div className="card w-full p-8 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-glow">Vehicle Contact Page</p>
        <h1 className="mt-4 text-4xl font-bold text-white">{vehicle.vehicle_number}</h1>
        <p className="mt-3 text-lg text-slate-300">Owner: {vehicle.owner_name}</p>
        <p className="mt-2 text-sm text-slate-400">
          Use one of the secure contact actions below. The owner's phone number is protected.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <a href={actionUrl('call')} className="btn-primary">
            Call Owner
          </a>
          <a href={actionUrl('whatsapp')} className="btn-secondary">
            Send WhatsApp
          </a>
          <a href={actionUrl('message')} className="btn-secondary">
            Send Message
          </a>
        </div>
        {status && <p className="mt-6 text-sm text-slate-400">{status}</p>}
      </div>
    </div>
  );
};

export default VehiclePublicPage;
