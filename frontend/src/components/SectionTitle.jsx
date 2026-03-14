const SectionTitle = ({ eyebrow, title, text }) => (
  <div className="max-w-2xl">
    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-glow">{eyebrow}</p>
    <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{title}</h2>
    {text && <p className="mt-4 text-base leading-7 text-slate-300">{text}</p>}
  </div>
);

export default SectionTitle;
