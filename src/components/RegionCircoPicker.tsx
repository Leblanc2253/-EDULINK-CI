import { useState, useRef, useEffect, useId, type MouseEvent } from 'react';
import { MapPin, ChevronDown, ChevronRight, Search, X, Check } from 'lucide-react';
import { CI_REGIONS_AND_CIRCOS, searchLocations, LocationHierarchy } from '../utils/locations';

interface RegionCircoPickerProps {
  value: string;
  onChange: (location: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
  showAllOption?: boolean;
  allOptionLabel?: string;
}

export default function RegionCircoPicker({
  value,
  onChange,
  placeholder = "Sélectionner ou taper une région / circonscription...",
  label,
  required = false,
  className = "",
  showAllOption = false,
  allOptionLabel = "Toutes les localités (Côte d'Ivoire)"
}: RegionCircoPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>({
    'District Autonome d\'Abidjan': true // Abidjan expanded by default
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uniqueId = useId();

  // Filter locations dynamically based on what user types
  const filtered = searchLocations(searchQuery);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When user types in search query, automatically unfold all matching regions
  useEffect(() => {
    if (searchQuery.trim()) {
      const nextExpanded: Record<string, boolean> = {};
      filtered.forEach(f => {
        nextExpanded[f.region.districtOrRegion] = true;
      });
      setExpandedRegions(nextExpanded);
    }
  }, [searchQuery]);

  const toggleRegion = (regionName: string, e: MouseEvent) => {
    e.stopPropagation();
    setExpandedRegions(prev => ({
      ...prev,
      [regionName]: !prev[regionName]
    }));
  };

  const handleSelect = (selectedLoc: string) => {
    onChange(selectedLoc);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`relative ${className}`} ref={containerRef} id={`region-picker-${uniqueId}`}>
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
          {label} {required && <span className="text-orange-600">*</span>}
        </label>
      )}

      {/* Main Trigger Button / Display */}
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        className={`w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition shadow-2xs hover:border-orange-400 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 ${
          isOpen ? 'ring-2 ring-orange-500 border-orange-500' : ''
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
          <span className={`text-sm truncate ${value ? 'font-semibold text-slate-900' : 'text-slate-400'}`}>
            {value || placeholder}
          </span>
        </div>
        
        <div className="flex items-center gap-1 shrink-0">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
              title="Effacer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-orange-600' : ''}`} />
        </div>
      </div>

      {/* Interactive Nested Accordion Dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[380px]">
          
          {/* Quick Search Input */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/80 sticky top-0 z-10 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Taper une région (ex: Gbêkê, Poro, Abidjan) ou ville..."
              className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Region & Circonscription List */}
          <div className="overflow-y-auto p-2 space-y-1 divide-y divide-slate-100/60">
            
            {showAllOption && (
              <button
                type="button"
                onClick={() => handleSelect('')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between transition mb-1 ${
                  !value ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>🌐 {allOptionLabel}</span>
                {!value && <Check className="w-4 h-4 text-orange-600" />}
              </button>
            )}

            {filtered.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs sm:text-sm font-medium">
                Aucune région ou circonscription trouvée pour « {searchQuery} »
              </div>
            ) : (
              filtered.map(({ region, matchingCircos }) => {
                const isExpanded = expandedRegions[region.districtOrRegion] ?? false;
                const isRegionSelected = value === region.districtOrRegion;

                return (
                  <div key={region.districtOrRegion} className="pt-1 first:pt-0">
                    
                    {/* Region Header Row */}
                    <div 
                      className={`flex items-center justify-between px-2.5 py-2 rounded-xl transition cursor-pointer group ${
                        isRegionSelected 
                          ? 'bg-orange-50 border border-orange-200 text-orange-950 font-bold' 
                          : 'hover:bg-slate-50 text-slate-900 font-semibold'
                      }`}
                      onClick={() => handleSelect(region.districtOrRegion)}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => toggleRegion(region.districtOrRegion, e)}
                          className="p-1 hover:bg-slate-200/80 rounded-lg text-slate-400 group-hover:text-slate-600 transition"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-orange-600" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </button>
                        
                        <div className="text-left">
                          <div className="text-xs sm:text-sm truncate">
                            {region.districtOrRegion}
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            Chef-lieu : {region.capital} • {region.circos.length} circonscriptions
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(region.districtOrRegion);
                          }}
                          className="text-[10px] bg-slate-100 hover:bg-orange-600 hover:text-white text-slate-600 font-bold px-2 py-0.5 rounded-md transition"
                        >
                          Toute la région
                        </button>
                      </div>
                    </div>

                    {/* Nested Circonscriptions (Deploys smoothly when region is expanded or typed) */}
                    {isExpanded && (
                      <div className="pl-6 pr-1 py-1 space-y-0.5 border-l-2 border-orange-200 ml-4 my-1">
                        {matchingCircos.map(circo => {
                          const isCircoSelected = value === circo;
                          return (
                            <button
                              key={circo}
                              type="button"
                              onClick={() => handleSelect(circo)}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center justify-between ${
                                isCircoSelected
                                  ? 'bg-orange-600 text-white font-bold shadow-2xs'
                                  : 'text-slate-600 hover:bg-orange-50 hover:text-orange-950 font-medium'
                              }`}
                            >
                              <span className="truncate">{circo}</span>
                              {isCircoSelected && <Check className="w-3 h-3 text-white shrink-0 ml-1" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Helper */}
          <div className="p-2 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-500 text-center font-medium flex items-center justify-center gap-1">
            <span>🇨🇮 31 Régions & 2 Districts Autonomes de Côte d'Ivoire</span>
          </div>

        </div>
      )}
    </div>
  );
}
