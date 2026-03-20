const PlanCard = ({ name, price, features, highlight }) => (
  <div className={`rounded-2xl border shadow-lg p-6 bg-white ${highlight ? 'ring-2 ring-accent' : ''}`}>
    <div className="text-2xl font-bold text-navy">{name}</div>
    <div className="text-3xl font-extrabold mt-2">{price}</div>
    <ul className="mt-4 space-y-2 text-gray-700 text-sm">
      {features.map((f) => (
        <li key={f}>• {f}</li>
      ))}
    </ul>
    <button className="btn-primary w-full mt-6">Choose {name}</button>
  </div>
);

const Subscription = () => {
  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-navy mb-6">Choose your plan</h1>

        <div className="grid md:grid-cols-3 gap-6">
          <PlanCard
            name="Free Trial"
            price="$0"
            features={["Basic matching", "Earn XP", "Starter badge"]}
          />
          <PlanCard
            name="Bai Plus"
            price="$5/mo"
            features={["More matches", "XP bonus +10%", "Plus badge"]}
            highlight
          />
          <PlanCard
            name="Bai Premium"
            price="$12/mo"
            features={["Priority matching", "XP bonus +20%", "Buy Tokens access"]}
          />
        </div>
      </div>
    </div>
  );
};

export default Subscription;


