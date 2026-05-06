import React, { useState, useEffect, useRef } from 'react';

interface Place {
  id: string;
  type: string;
  code: string;
  name: string;
  country_name: string;
  city_name: string;
}

interface AirportAutocompleteProps {
  name: string;
  placeholder: string;
  required?: boolean;
  defaultValue?: string;
}

const AirportAutocomplete: React.FC<AirportAutocompleteProps> = ({ name, placeholder, required, defaultValue = '' }) => {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const response = await fetch(`https://autocomplete.travelpayouts.com/places2?locale=en&types[]=city,airport&term=${query}`);
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Error fetching places", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      if (isOpen) {
        fetchSuggestions();
      }
    }, 100);

    return () => clearTimeout(debounceTimer);
  }, [query, isOpen]);

  const handleSelect = (place: Place) => {
    const displayName = place.type === 'city' ? `${place.name} (${place.code})` : `${place.city_name || place.name} ${place.name} (${place.code})`;
    setQuery(displayName);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600 z-10">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
      </span>
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
        onFocus={() => { if (query.length >= 2) setIsOpen(true); }}
        className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none font-bold text-slate-900 placeholder:text-slate-400"
        required={required}
        autoComplete="off"
      />
      {isLoading && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 z-10">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      )}
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
          {suggestions.map((place) => (
            <li 
              key={place.id}
              onClick={() => handleSelect(place)}
              className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-slate-800">{place.name}</div>
                <div className="text-xs text-slate-500">{place.country_name}</div>
              </div>
              <div className="font-black text-purple-600 bg-purple-50 px-2 py-1 rounded-md text-xs">{place.code}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AirportAutocomplete;
