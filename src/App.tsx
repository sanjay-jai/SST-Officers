/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Search, 
  RefreshCw, 
  Phone, 
  User, 
  MapPin,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchOfficerData } from './lib/dataService';
import { Officer, CONSTITUENCIES } from './types';
import { Button } from './components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './components/ui/select';
import { Badge } from './components/ui/badge';
import { Skeleton } from './components/ui/skeleton';
import { cn } from './lib/utils';

export default function App() {
  const [allOfficers, setAllOfficers] = useState<Officer[]>([]);
  const [filteredOfficers, setFilteredOfficers] = useState<Officer[]>([]);
  const [selectedConstituency, setSelectedConstituency] = useState<string>('All Constituencies');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchOfficerData();
      setAllOfficers(data);
      setFilteredOfficers(data); // Show all by default
      setError(null);
    } catch (err) {
      setError('Failed to load data. Please check your connection.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = () => {
    setIsSearching(true);
    
    // Simulate search delay for UX
    setTimeout(() => {
      if (selectedConstituency === 'All Constituencies') {
        setFilteredOfficers(allOfficers);
      } else {
        const filtered = allOfficers.filter(officer => 
          officer.taluk.toLowerCase().includes(selectedConstituency.toLowerCase())
        );
        setFilteredOfficers(filtered);
      }
      setIsSearching(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F3F6FF] text-[#1E293B] font-sans pb-12">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] p-4 md:p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30">
              <MapPin className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tight">
                Assembly Constituency
              </h1>
              <p className="text-xs md:text-sm font-bold text-white/90 tracking-wide">
                SST
              </p>
            </div>
          </div>
          <button 
            onClick={loadData}
            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <RefreshCw size={24} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 -mt-8 md:-mt-10">
        {/* Search Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl shadow-purple-200/50 p-6 md:p-12 text-center space-y-8"
        >
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-black text-[#1E293B]">Search Officers</h2>
            <p className="text-slate-500 font-medium">Select a constituency to view the assigned SST team</p>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-left space-y-3">
              <label className="flex items-center gap-2 text-[11px] font-bold text-[#4F46E5] tracking-widest uppercase ml-1">
                <MapPin size={16} className="text-[#4F46E5]" />
                SELECT CONSTITUENCY
              </label>
              <Select value={selectedConstituency} onValueChange={setSelectedConstituency}>
                <SelectTrigger className="w-full h-16 rounded-xl border-2 border-[#4F46E5]/40 bg-white px-6 text-lg font-bold text-slate-900 shadow-sm focus:ring-4 focus:ring-blue-500/10 transition-all [&_svg]:text-[#4F46E5] [&_svg]:size-6">
                  <SelectValue placeholder="All Constituencies" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-slate-200 shadow-2xl p-0 overflow-hidden">
                  <SelectItem value="All Constituencies" className="py-3 px-6 font-bold text-lg focus:bg-[#1D68D5] focus:text-white data-[state=checked]:bg-[#1D68D5] data-[state=checked]:text-white transition-colors">All Constituencies</SelectItem>
                  {CONSTITUENCIES.map((c) => (
                    <SelectItem key={c} value={c} className="py-3 px-6 font-bold text-lg focus:bg-[#1D68D5] focus:text-white data-[state=checked]:bg-[#1D68D5] data-[state=checked]:text-white transition-colors">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleSearch}
              disabled={isLoading || isSearching}
              className="w-full h-16 md:h-20 rounded-2xl md:rounded-[1.5rem] bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:opacity-90 text-white text-lg md:text-xl font-black tracking-widest shadow-xl shadow-purple-200 transition-all active:scale-[0.98]"
            >
              {isSearching ? (
                <Loader2 className="animate-spin mr-3" size={28} />
              ) : (
                <Search className="mr-3" size={28} />
              )}
              SEARCH NOW
            </Button>
          </div>
        </motion.div>

        {/* Results Header */}
        <div className="mt-12 mb-8 flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-[#6366F1] rounded-full" />
            <h3 className="text-2xl md:text-3xl font-black text-[#1E293B]">
              {selectedConstituency === 'All Constituencies' ? 'All Officers' : 'Constituency Officers'}
            </h3>
          </div>
          <Badge className="bg-[#E0E7FF] text-[#6366F1] hover:bg-[#E0E7FF] px-4 py-2 rounded-xl text-xs md:text-sm font-black tracking-wider uppercase">
            {filteredOfficers.length} Officers
          </Badge>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-[2rem] bg-white shadow-sm" />
              ))
            ) : filteredOfficers.length > 0 ? (
              filteredOfficers.map((officer, index) => (
                <motion.div
                  key={`${officer.name}-${index}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-[2rem] p-6 md:p-8 shadow-xl shadow-slate-200/50 border border-white relative group hover:shadow-2xl hover:shadow-purple-100 transition-all"
                >
                  <div className="absolute top-6 right-6">
                    <Badge className="bg-[#F0F4FF] text-[#6366F1] hover:bg-[#F0F4FF] rounded-lg px-2 py-1 text-[10px] font-black">
                      {officer.taluk.split('-')[0]}
                    </Badge>
                  </div>

                  <div className="flex items-start gap-4 md:gap-6">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-[#F8FAFC] rounded-2xl flex items-center justify-center text-slate-300">
                      <User size={32} />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-xl md:text-2xl font-black text-[#1E293B] leading-tight">
                          {officer.name}
                        </h4>
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-xs md:text-sm">
                          <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                          {officer.designation}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-300 tracking-widest uppercase">
                          Mobile Number
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[#6366F1] font-black text-lg md:text-xl">
                            <Phone size={18} />
                            {officer.mobile}
                          </div>
                          <a 
                            href={`tel:${officer.mobile}`}
                            className="w-12 h-12 md:w-14 md:h-14 bg-[#10B981] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-100 hover:scale-110 active:scale-95 transition-all"
                          >
                            <Phone size={24} fill="currentColor" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto text-slate-200">
                  <Search size={40} />
                </div>
                <p className="text-xl font-black text-slate-400">No data available</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

