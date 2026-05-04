import React, { useState } from 'react';
import { SearchParams } from '../types';

interface HeroProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
}

const Hero: React.FC<HeroProps> = ({ onSearch, isLoading, title, subtitle, badge }) => {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const from = (formData.get('from') as string).trim();
    const to = (formData.get('to') as string).trim();
    const date = formData.get('date') as string;
    const returnDate = formData.get('returnDate') as string;
    const passengers = Number(formData.get('passengers')) || 1;
    const travelClass = (formData.get('travelClass') as string) || 'Economy';

    if (!from || !to || !date) {
      setError('Please fill all required fields');
      setIsPending(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      await onSearch({ from, to, date, returnDate, passengers, travelClass });
      setIsPending(false);
    }, 600); // 600ms debounce
  };

  return (
    <div className="relative min-h-[520px] md:min-h-[560px] lg:min-h-[600px] bg-white overflow-hidden flex flex-col justify-center">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-gradient-to-br from-purple-50 via-white to-blue-50"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10 w-full pt-12 pb-20">
        <div className="text-center mb-12">
          {title ? (
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight">
              {title}
            </h1>
          ) : (
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
              Where will you <span className="text-purple-600">fly next?</span>
            </h1>
          )}

          {subtitle ? (
            <p className="text-slate-700 text-2xl md:text-3xl font-bold max-w-2xl mx-auto mb-4">
              {subtitle}
            </p>
          ) : (
            <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto">
             Book international flights with trusted global airlines. Experience comfort, seamless service, and luxury in every journey
            </p>
          )}

          {badge && (
            <div className="inline-block bg-purple-100 text-purple-700 px-6 py-2 rounded-full text-lg md:text-xl font-black shadow-sm">
              {badge}
            </div>
          )}
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl md:rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-5 sm:p-6 md:p-8 lg:p-10 max-w-6xl mx-auto border border-white/50">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* From */}
              <div className="md:col-span-6 lg:col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">From</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </span>
                  <input
                    type="text"
                    name="from"
                    placeholder="Departure City"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none font-bold text-slate-900 placeholder:text-slate-300"
                    required
                  />
                </div>
              </div>

              {/* To */}
              <div className="md:col-span-6 lg:col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">To</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </span>
                  <input
                    type="text"
                    name="to"
                    placeholder="Arrival City"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none font-bold text-slate-900 placeholder:text-slate-300"
                    required
                  />
                </div>
              </div>

              {/* Date */}
              <div className="md:col-span-6 lg:col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Departure</label>
                <input
                  type="date"
                  name="date"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none font-bold text-slate-900"
                  required
                />
              </div>

              {/* Return Date */}
              <div className="md:col-span-6 lg:col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Return</label>
                <input
                  type="date"
                  name="returnDate"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none font-bold text-slate-900"
                />
              </div>

              {/* Passengers */}
              <div className="md:col-span-6 lg:col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Travelers</label>
                <select
                  name="passengers"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none font-bold appearance-none text-slate-900"
                  defaultValue="1"
                >
                  <option value="1">1 Adult</option>
                  <option value="2">2 Adults</option>
                  <option value="3">3 Adults</option>
                  <option value="4">4+ Travelers</option>
                </select>
              </div>

              {/* CTA */}
              <div className="md:col-span-6 lg:col-span-2 flex items-end">
                <button
                  type="submit"
                  disabled={isLoading || isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-purple-100 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 h-[58px]"
                >
                  {(isLoading || isPending) ? (
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <>
                      <span>Search</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </>
                  )}
                </button>
              </div>

              {/* Mobile/Tablet Call Now Button */}
              <div className="col-span-1 md:col-span-12 lg:hidden flex items-end mt-1">
                <a 
                  href="tel:18887918007"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-100 active:scale-95 flex items-center justify-center gap-2 h-[58px]"
                >
                  <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  Call for Offline Booking
                </a>
              </div>
            </div>

            <input type="hidden" name="travelClass" value="Economy" />
          </form>
        </div>
      </div>
    </div>
  );
};

export default Hero;
