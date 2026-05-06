
import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Offers from './components/Offers';
import TrustBar from './components/TrustBar';
import FlightResults from './components/FlightResults';
import AIAssistant from './components/AIAssistant';
import Footer from './components/Footer';
import InternationalRoutes from './components/InternationalRoutes';
import SkeletonLoader from './components/SkeletonLoader';

const PromotionalPopup = React.lazy(() => import('./components/PromotionalPopup'));
const FlightDetails = React.lazy(() => import('./components/FlightDetails'));
const CustomerService = React.lazy(() => import('./components/CustomerService'));
const OffersPage = React.lazy(() => import('./components/OffersPage'));
const TermsPage = React.lazy(() => import('./components/TermsPage'));
const AboutPage = React.lazy(() => import('./components/AboutPage'));
const PrivacyPolicyPage = React.lazy(() => import('./components/PrivacyPolicyPage'));
const TermsOfUsePage = React.lazy(() => import('./components/TermsOfUsePage'));
const CreditCardVerificationPage = React.lazy(() => import('./components/CreditCardVerificationPage'));
const HotelsPage = React.lazy(() => import('./components/HotelsPage'));
const ContactUsPage = React.lazy(() => import('./components/ContactUsPage'));
const Login = React.lazy(() => import('./components/Login'));
const PromoLandingPage = React.lazy(() => import('./components/PromoLandingPage'));
import { SearchParams, Flight } from './types';
import { flightService } from './services/flightService';
import { ClerkProvider } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';
const App: React.FC = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Flight[]>([]);
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [view, setView] = useState<'home' | 'promo' | 'login' | 'details' | 'customer-service' | 'offers' | 'terms' | 'hotels' | 'about' | 'privacy' | 'termsOfUse' | 'creditCardVerification' | 'contact'>('home');
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'fastest' | 'nonstop'>('price');
  const [showPromo, setShowPromo] = useState(false);

  useEffect(() => {
    let timer: number;
    if (searchResults.length > 0 && !isSearching && view === 'home') {
      timer = window.setTimeout(() => {
        setShowPromo(true);
      }, 5000); // Set to 5 seconds as requested
    }
    return () => clearTimeout(timer);
  }, [searchResults, isSearching, view]);

  useEffect(() => {
    if (searchParams && searchResults.length === 0 && !isSearching) {
      setTimeout(() => {
        document.getElementById('no-flights-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [searchParams, searchResults, isSearching]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const handleSearch = async (params: SearchParams) => {
    setIsSearching(true);
    setSearchResults([]); 
    setSearchParams(params);
    setShowPromo(false);
    setView('home');
    
    try {
      // Call API to search flights
      const flights = await flightService.searchFlights(params);
      setSearchResults(flights);
      window.scrollTo({ top: 500, behavior: 'smooth' });
    } catch (error) {
      console.error('Search error:', error);
      // Removed mock data fallback
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // SEO Soft Routing: Parse URL and trigger search automatically
  useEffect(() => {
    const path = window.location.pathname;
    // Match /flights/jfk-to-lax pattern
    const match = path.match(/^\/flights\/([a-zA-Z0-9]+)-to-([a-zA-Z0-9]+)\/?$/);
    
    if (match) {
      const origin = match[1].toUpperCase();
      const destination = match[2].toUpperCase();
      
      // Update the page title for SEO based on the URL
      document.title = `Cheap Flights from ${origin} to ${destination} - Tour Help Desk`;
      
      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', `Find the cheapest unpublished flights from ${origin} to ${destination}. Call now for exclusive offline booking discounts and no waiting time.`);
      
      // Use a date 14 days in the future for SEO searches
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + 14);
      const dateStr = futureDate.toISOString().split('T')[0];
      
      // Auto-trigger the search
      handleSearch({
        from: origin,
        to: destination,
        date: dateStr,
        passengers: 1,
        travelClass: 'Economy'
      });
    } else if (path === '/cheap-flights' || path === '/special-offer') {
      setView('promo');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRouteClick = (from: string, to: string) => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 14);
    const dateStr = futureDate.toISOString().split('T')[0];
    
    handleSearch({
      from: from,
      to: to,
      date: dateStr,
      passengers: 1,
      travelClass: 'Economy'
    });
  };

  const handleLogoClick = () => {
    setView('home');
    setSearchParams(null);
    setSearchResults([]);
    setShowPromo(false);
    setSelectedFlight(null);
  };

  const handleBookClick = (flight: Flight) => {
    setSelectedFlight(flight);
    setView('details');
    setShowPromo(false);
  };

  const sortedFlights = useMemo(() => {
    const flights = [...searchResults];
    if (sortBy === 'price') {
      return flights.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'fastest') {
      return flights.sort((a, b) => a.durationMinutes - b.durationMinutes);
    } else if (sortBy === 'nonstop') {
      return flights.sort((a, b) => a.stops - b.stops);
    }
    return flights;
  }, [searchResults, sortBy]);

  const minPrice = useMemo(() => {
    if (searchResults.length === 0) return 0;
    return Math.min(...searchResults.map(f => f.price));
  }, [searchResults]);

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <Suspense fallback={<SkeletonLoader />}>
      {view === 'promo' ? (
        <PromoLandingPage 
          onSearch={handleSearch} 
          isLoading={isSearching} 
          onLogoClick={handleLogoClick}
          onLegalClick={() => setView('terms')} 
          onAboutClick={() => setView('about')} 
          onPrivacyClick={() => setView('privacy')}
          onTermsClick={() => setView('termsOfUse')}
          onCreditCardVerificationClick={() => setView('creditCardVerification')}
          onContactClick={() => setView('contact')}
        />
      ) : (
      <div className="min-h-screen flex flex-col">
      <Navbar 
        onLoginClick={() => setView('login')} 
        onLogoClick={handleLogoClick} 
        onSupportClick={() => setView('customer-service')}
        onOffersClick={() => setView('offers')}
        onHotelsClick={() => setView('hotels')}
        activeView={view}
        showHotels={true}
      />
      
      <main className="flex-grow">
        {view === 'customer-service' ? (
          <CustomerService />
        ) : view === 'offers' ? (
          <OffersPage onBack={() => setView('home')} />
        ) : view === 'terms' ? (
          <TermsPage onBack={() => setView('home')} />
        ) : view === 'about' ? (
          <AboutPage onBack={() => setView('home')} />
        ) : view === 'privacy' ? (
          <PrivacyPolicyPage onBack={() => setView('home')} />
        ) : view === 'termsOfUse' ? (
          <TermsOfUsePage onBack={() => setView('home')} />
        ) : view === 'creditCardVerification' ? (
          <CreditCardVerificationPage onBack={() => setView('home')} />
        ) : view === 'hotels' ? (
          <HotelsPage />
        ) : view === 'contact' ? (
          <ContactUsPage onBack={() => setView('home')} />
        ) : view === 'login' ? (
          <Login onBack={() => setView('home')} />
        ) : view === 'details' && selectedFlight ? (
          <FlightDetails 
            flight={selectedFlight} 
            onBack={() => setView('home')} 
          />
        ) : (
          <>
            <Hero onSearch={handleSearch} isLoading={isSearching} />
            
            {isSearching && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-20 text-center">
                 <div className="inline-block w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                 <p className="text-slate-500 font-bold">Finding the best flights for you...</p>
              </div>
            )}

            {searchParams && searchResults.length > 0 && !isSearching && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div className="max-w-full md:max-w-2xl">
                    <h2 className="text-lg md:text-xl font-black text-slate-800 leading-snug mb-1">
                      <span className="text-slate-400 font-bold mr-2 uppercase text-[10px] md:text-xs tracking-widest hidden md:inline">Route</span> 
                      <span className="text-blue-600">{searchParams?.from}</span> 
                      <span className="text-slate-300 mx-2">→</span> 
                      <span className="text-blue-600">{searchParams?.to}</span>
                    </h2>
                    <p className="text-slate-500 text-xs md:text-sm font-semibold">{searchResults.length} premium flights found • <span className="text-slate-700">{searchParams?.date}</span></p>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                    <button 
                      onClick={() => setSortBy('price')}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${sortBy === 'price' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Cheapest
                    </button>
                    <button 
                      onClick={() => setSortBy('fastest')}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${sortBy === 'fastest' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Fastest
                    </button>
                    <button 
                      onClick={() => setSortBy('nonstop')}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${sortBy === 'nonstop' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Non-stop
                    </button>
                  </div>
                </div>
                
                <FlightResults flights={sortedFlights} onBook={handleBookClick} />
              </div>
            )}

            {searchParams && searchResults.length === 0 && !isSearching && (
              <div id="no-flights-card" className="max-w-[90%] md:max-w-2xl mx-auto px-2 sm:px-6 py-10 md:py-16">
                <div className="bg-white rounded-3xl p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  {/* Decorative backgrounds */}
                  <div className="absolute top-[-10%] right-[-10%] w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="absolute bottom-[-10%] left-[-10%] w-40 h-40 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

                  <div className="w-14 h-14 md:w-16 md:h-16 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 mb-4 md:mb-5 relative z-10">
                    <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  </div>
                  
                  <div className="flex items-center justify-center gap-3 md:gap-4 mb-3 md:mb-4 relative z-10">
                    <span className="text-xl md:text-3xl font-black text-slate-800 uppercase">{searchParams.from?.split(',')[0]}</span>
                    
                    <div className="flex flex-col items-center px-2">
                      <div className="w-12 md:w-16 h-[2px] bg-slate-200 relative rounded-full">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-1">
                          <svg className="w-5 h-5 md:w-6 md:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.2c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    <span className="text-xl md:text-3xl font-black text-slate-800 uppercase">{searchParams.to?.split(',')[0]}</span>
                  </div>
                  
                  <div className="mb-6 md:mb-8 relative z-10 mt-1 md:mt-2">
                    <p className="text-xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400 tracking-tight leading-tight">
                      WE HAVE MORE THAN 21 UNPUBLISHED FLIGHTS
                    </p>
                    <p className="text-slate-500 mt-2 text-sm md:text-base font-bold uppercase tracking-widest">
                      No Waiting Time • Connect Instantly
                    </p>
                  </div>
                  
                  <a 
                    href="tel:18887918007" 
                    className="relative z-10 flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 md:px-10 md:py-4 rounded-xl text-lg md:text-xl transition-all shadow-lg shadow-blue-200 active:scale-95 group w-full sm:w-auto justify-center"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 md:w-5 md:h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    </div>
                    CALL NOW
                  </a>
                </div>
              </div>
            )}

            {!searchParams && !isSearching && (
              <>
                <Offers onSeeAll={() => setView('offers')} />
                <InternationalRoutes onRouteClick={handleRouteClick} />
                <TrustBar />
                <div className="bg-slate-50 py-16 md:py-24 overflow-hidden">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-16">
                      <div className="md:w-1/2 relative z-10">
                        <div className="inline-block px-4 py-1 bg-purple-100 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                          Premium Travel Partner
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 leading-tight">
                          Experience Premium Travel with <span className="text-purple-600">Tour Help Desk</span>
                        </h2>
                        <p className="text-slate-600 mb-10 text-lg leading-relaxed">
                          We redefine the way you travel. From seamless booking to exceptional in-flight service,
                          Tour Help Desk is your partner in exploring the world. Our deep-rooted commitment to security
                          and customer satisfaction makes us India's preferred travel partner.
                        </p>
                        <div className="grid grid-cols-2 gap-8">
                          <div className="flex flex-col gap-2">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-purple-600 shadow-lg shadow-purple-50">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <span className="font-bold text-slate-800 text-sm">Lowest Prices</span>
                            <p className="text-xs text-slate-500">Best market rates guaranteed</p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-purple-600 shadow-lg shadow-purple-50">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <span className="font-bold text-slate-800 text-sm">24/7 Support</span>
                            <p className="text-xs text-slate-500">Always here when you need us</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="md:w-1/2 relative">
                        <img 
                          src="https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&q=80&w=800&fm=webp" 
                          alt="Canada Tourism" 
                          loading="lazy"
                          className="rounded-[3rem] shadow-2xl relative z-10 w-full h-auto object-cover"
                        />
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl z-0"></div>
                        <div className="absolute -top-6 -left-6 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl z-0"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>

      {showPromo && minPrice > 0 && <PromotionalPopup route={`${searchParams.from ? searchParams.from.split(',')[0] : ''} to ${searchParams.to ? searchParams.to.split(',')[0] : ''}`} minPrice={minPrice} onClose={() => setShowPromo(false)} />}
      <AIAssistant />
      <Footer 
        onLegalClick={() => setView('terms')} 
        onAboutClick={() => setView('about')} 
        onPrivacyClick={() => setView('privacy')}
        onTermsClick={() => setView('termsOfUse')}
        onCreditCardVerificationClick={() => setView('creditCardVerification')}
        onContactClick={() => setView('contact')}
      />
    </div>
    )}
    </Suspense>
    </ClerkProvider>
  );
};

export default App;
