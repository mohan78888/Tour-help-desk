
import React from 'react';
import { Offer } from '../types';

const MOCK_OFFERS: Offer[] = [
  {
    id: '1',
    title: 'New Year Special',
    description: 'Get up to 25% off on domestic flights.',
    code: 'NY2024',
    color: 'bg-blue-600',
    image: 'https://picsum.photos/seed/ny/300/200.webp'
  },
  {
    id: '2',
    title: 'International Pass',
    description: 'Flat $5000 off on long-haul destinations.',
    code: 'INTLFLY',
    color: 'bg-indigo-600',
    image: 'https://picsum.photos/seed/fly/300/200.webp'
  },
  {
    id: '3',
    title: 'Bank Offer',
    description: '10% Cashback with Premium Credit Cards.',
    code: 'BANK10',
    color: 'bg-emerald-600',
    image: 'https://picsum.photos/seed/bank/300/200.webp'
  }
];

interface OffersProps {
  onSeeAll?: () => void;
}

const Offers: React.FC<OffersProps> = ({ onSeeAll }) => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Unbeatable Offers</h2>
            <p className="text-slate-500">Curated deals just for your next adventure.</p>
          </div>
          <button 
            onClick={onSeeAll}
            className="text-blue-600 font-semibold hover:underline"
          >
            View All Offers
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {MOCK_OFFERS.map((offer) => (
            <div key={offer.id} className="group relative bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="h-40 overflow-hidden relative">
                <img src={offer.image} alt={offer.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 left-4">
                   <div className={`px-3 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-widest ${offer.color} shadow-lg`}>
                    Flash Deal
                   </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-2">{offer.title}</h3>
                <p className="text-slate-600 mb-4 text-sm leading-relaxed">{offer.description}</p>
                <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                  <div className="bg-slate-200 px-3 py-1.5 rounded-lg border-dashed border-2 border-slate-300 font-mono text-sm font-bold text-slate-700">
                    {offer.code}
                  </div>
                  <button className="text-blue-600 text-sm font-bold hover:text-blue-700 transition-colors">Copy Code</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Offers;
