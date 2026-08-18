import React, { useEffect, useState } from 'react';
import { MapPin, Building2, ChevronDown } from 'lucide-react';
import { 
  CI_REGIONS_AND_CIRCOS, 
  CI_REGION_NAMES, 
  getDepartmentsForRegion, 
  parseLocation 
} from '../utils/locations';

interface CascadingLocationSelectProps {
  value?: string;
  regionValue?: string;
  departmentValue?: string;
  onChange: (fullLocation: string, details: { region: string; department: string }) => void;
  required?: boolean;
  regionLabel?: string;
  departmentLabel?: string;
  layout?: 'grid' | 'stacked';
  className?: string;
}

export default function CascadingLocationSelect({
  value = '',
  regionValue,
  departmentValue,
  onChange,
  required = false,
  regionLabel = "Région / District Autonome",
  departmentLabel = "Département / Circonscription / Commune",
  layout = 'grid',
  className = ''
}: CascadingLocationSelectProps) {
  // Local state for cascaded selection
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);

  // Sync internal state from props when value or explicit regionValue/departmentValue changes
  useEffect(() => {
    if (regionValue !== undefined || departmentValue !== undefined) {
      const reg = regionValue || '';
      setSelectedRegion(reg);
      const depts = getDepartmentsForRegion(reg);
      setAvailableDepartments(depts);
      setSelectedDepartment(departmentValue || '');
    } else if (value) {
      const parsed = parseLocation(value);
      setSelectedRegion(parsed.region);
      const depts = getDepartmentsForRegion(parsed.region);
      setAvailableDepartments(depts);
      setSelectedDepartment(parsed.department);
    }
  }, [value, regionValue, departmentValue]);

  // Handle Region Change
  const handleRegionChange = (newRegion: string) => {
    setSelectedRegion(newRegion);
    if (!newRegion) {
      setAvailableDepartments([]);
      setSelectedDepartment('');
      onChange('', { region: '', department: '' });
      return;
    }

    const depts = getDepartmentsForRegion(newRegion);
    setAvailableDepartments(depts);

    // If previously selected department is not in this new region, reset department
    const nextDept = depts.includes(selectedDepartment) ? selectedDepartment : '';
    setSelectedDepartment(nextDept);

    const fullLocation = nextDept ? nextDept : newRegion;
    onChange(fullLocation, { region: newRegion, department: nextDept });
  };

  // Handle Department Change
  const handleDepartmentChange = (newDept: string) => {
    setSelectedDepartment(newDept);
    const fullLocation = newDept ? newDept : selectedRegion;
    onChange(fullLocation, { region: selectedRegion, department: newDept });
  };

  const containerClasses = layout === 'grid' 
    ? `grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`
    : `space-y-4 ${className}`;

  return (
    <div className={containerClasses}>
      {/* 1. Region / District Dropdown */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
          <span>{regionLabel}</span>
          {required && <span className="text-orange-600">*</span>}
        </label>
        
        <div className="relative">
          <select
            value={selectedRegion}
            onChange={(e) => handleRegionChange(e.target.value)}
            required={required}
            className="w-full appearance-none py-2.5 pl-3 pr-9 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm font-medium text-slate-900 outline-none transition shadow-2xs cursor-pointer hover:border-orange-400"
          >
            <option value="">-- Choisir une région / district --</option>
            {CI_REGIONS_AND_CIRCOS.map((item) => (
              <option key={item.districtOrRegion} value={item.districtOrRegion}>
                {item.type === 'DISTRICT_AUTONOME' ? '🏛️ ' : '📍 '}
                {item.districtOrRegion} (Chef-lieu : {item.capital})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          31 Régions et 2 Districts Autonomes de Côte d'Ivoire
        </div>
      </div>

      {/* 2. Cascaded Department / Circonscription Dropdown */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
          <span>{departmentLabel}</span>
          {required && <span className="text-orange-600">*</span>}
        </label>

        <div className="relative">
          <select
            value={selectedDepartment}
            onChange={(e) => handleDepartmentChange(e.target.value)}
            disabled={!selectedRegion || availableDepartments.length === 0}
            required={required && availableDepartments.length > 0}
            className={`w-full appearance-none py-2.5 pl-3 pr-9 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm font-medium outline-none transition shadow-2xs cursor-pointer ${
              !selectedRegion
                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-white border-slate-300 text-slate-900 hover:border-orange-400'
            }`}
          >
            {!selectedRegion ? (
              <option value="">Sélectionnez d'abord une région...</option>
            ) : (
              <>
                <option value="">-- Toute la région ({selectedRegion}) --</option>
                {availableDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </>
            )}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        <div className="text-[11px] text-slate-400 mt-1">
          {selectedRegion 
            ? `${availableDepartments.length} départements / circonscriptions disponibles` 
            : 'Activé dès la sélection de la région ci-contre'}
        </div>
      </div>
    </div>
  );
}
