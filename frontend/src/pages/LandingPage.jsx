import { Link } from 'react-router-dom';
import SectionTitle from '../components/SectionTitle';

const featureCards = [
  {
    title: 'Privacy-first contact',
    text: 'Anyone can reach the owner instantly without your phone number sitting openly on the sticker.'
  },
  {
    title: 'Real-time scan logs',
    text: 'Track when your QR was scanned, from which device, and optionally where it happened.'
  },
  {
    title: 'Fast QR onboarding',
    text: 'Register a vehicle, generate a printable QR code, and start using it in minutes.'
  }
];

const faqs = [
  {
    q: 'Will my number be visible on the webpage?',
    a: 'No. The public page keeps contact details out of the HTML and routes actions through secure server redirects.'
  },
  {
    q: 'Can I manage multiple vehicles?',
    a: 'Yes. Your dashboard supports multiple vehicles, QR codes, and scan tracking from one account.'
  },
  {
    q: 'What happens when somebody scans the QR?',
    a: 'They see a lightweight contact page with safe call, WhatsApp, and message actions, while the scan is logged for you.'
  }
];

const LandingPage = () => {
  return (
    <div className="bg-mesh">
      <section className="mx-auto grid min-h-[88vh] max-w-7xl gap-12 px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div>
          <div className="mb-6 inline-flex rounded-full border border-glow/30 bg-glow/10 px-4 py-2 text-sm text-glow">
            Production-ready QR contact system for cars and bikes
          </div>
          <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl">
            Make your vehicle reachable without exposing personal data.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
            Smart Vehicle QR creates a secure contact page for your vehicle sticker so helpers,
            security staff, or other drivers can reach you instantly when needed.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/register" className="btn-primary">
              Create Account
            </Link>
            <a href="#how-it-works" className="btn-secondary">
              See How It Works
            </a>
          </div>
        </div>

        <div className="card relative overflow-hidden p-8">
          <div className="absolute right-6 top-6 rounded-full bg-orange-500/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-orange-200">
            Printable Sticker
          </div>
          <div className="mt-12 rounded-[2rem] border border-white/10 bg-slate-900/80 p-8">
            <div className="rounded-3xl bg-white p-8 text-center text-slate-900">
              <p className="text-xs font-bold uppercase tracking-[0.4em] text-slate-500">
                Need to contact the vehicle owner?
              </p>
              <div className="mx-auto my-6 grid h-56 w-56 place-items-center rounded-3xl border-8 border-slate-900 text-xl font-bold">
                Scan QR
              </div>
              <p className="text-sm font-medium text-slate-500">Vehicle ID: SVQ-1024</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20">
        <SectionTitle
          eyebrow="How It Works"
          title="Three simple steps from signup to secure contact."
          text="This system is designed for real-world parking situations, emergency handoffs, apartment communities, office campuses, and commercial fleets."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            'Create your account and log in.',
            'Register each vehicle and generate a QR sticker.',
            'Scanners land on a safe contact page with protected actions.'
          ].map((item, index) => (
            <div key={item} className="card p-6">
              <p className="text-sm uppercase tracking-[0.35em] text-glow">Step {index + 1}</p>
              <p className="mt-4 text-xl font-semibold text-white">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionTitle
          eyebrow="Features"
          title="Built for privacy, speed, and operational visibility."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {featureCards.map((card) => (
            <div key={card.title} className="card p-6">
              <h3 className="text-xl font-semibold text-white">{card.title}</h3>
              <p className="mt-4 leading-7 text-slate-300">{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="card grid gap-10 p-8 md:grid-cols-2 md:p-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-glow">
              Buy QR Sticker
            </p>
            <h2 className="mt-4 text-4xl font-bold text-white">Ready for your car, bike, or fleet.</h2>
            <p className="mt-4 text-slate-300">
              Use the generated QR image for vinyl stickers, laminated cards, windscreen tags, or fleet labels.
            </p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-8">
            <p className="text-5xl font-bold text-white">$9</p>
            <p className="mt-2 text-slate-300">per digital sticker-ready QR setup</p>
            <Link to="/register" className="btn-primary mt-6 w-full">
              Start Now
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionTitle eyebrow="FAQ" title="Common questions before you deploy stickers." />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {faqs.map((faq) => (
            <div key={faq.q} className="card p-6">
              <h3 className="text-lg font-semibold text-white">{faq.q}</h3>
              <p className="mt-3 leading-7 text-slate-300">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
