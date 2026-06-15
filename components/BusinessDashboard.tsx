'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, Users, Package, Sliders, Play, CheckCircle, 
  Car, Bike, DollarSign, Clock, Info, ArrowUpRight, FileSpreadsheet, Eye, 
  Plus, Trash2, Edit3, MapPin, Sparkles, Calendar, Layers, ShieldAlert, Check
} from 'lucide-react';
import { 
  useAppStore, TRACKING_STEPS, Booking, Invoice, ServiceCenter, WashService, WashSlot 
} from '@/lib/store';
import InvoiceModal from './InvoiceModal';

export default function BusinessDashboard() {
  const { 
    currentUser, serviceCenters, washServices, washSlots, bookings, invoices, 
    advanceActiveWashProgress, isOffline, addManualNotification,
    updateCenterDetails, createWashSlot, deleteWashSlot,
    addServiceCenter, deleteServiceCenter, updateWashServicePrice,
    updateBookingStatus
  } = useAppStore();

  const [activeTab, setActiveTab] = React.useState<string>('operations');
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null);
  const [hoveredPoint, setHoveredPoint] = React.useState<number | null>(null);

  // Auto-simulation step runner logic
  const [isAutoSimulating, setIsAutoSimulating] = React.useState(false);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoSimulating) {
      interval = setInterval(() => {
        advanceActiveWashProgress();
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoSimulating, advanceActiveWashProgress]);

  // Center Admin specific inputs
  const [managedCenter, setManagedCenter] = React.useState<ServiceCenter | null>(null);
  const [centerName, setCenterName] = React.useState('');
  const [centerDesc, setCenterDesc] = React.useState('');
  const [centerAddr, setCenterAddr] = React.useState('');
  const [centerSpecs, setCenterSpecs] = React.useState('');

  // Slot Form inputs
  const [slotDate, setSlotDate] = React.useState(() => new Date().toISOString().split('T')[0]);
  const [slotTime, setSlotTime] = React.useState('10:00 AM - 11:00 AM');

  // Platform Admin inputs (new center form)
  const [newCenterName, setNewCenterName] = React.useState('');
  const [newCenterDesc, setNewCenterDesc] = React.useState('');
  const [newCenterAddr, setNewCenterAddr] = React.useState('');
  const [newCenterSpecs, setNewCenterSpecs] = React.useState('Interior Steam, Hydro-Coat, Detailing');

  // Load and pre-fill managed center details for center_admin
  React.useEffect(() => {
    if (currentUser?.role === 'center_admin' && currentUser.centerId) {
      const center = serviceCenters.find(c => c.id === currentUser.centerId);
      if (center) {
        setManagedCenter(center);
        setCenterName(center.name);
        setCenterDesc(center.description);
        setCenterAddr(center.address);
        setCenterSpecs(center.specialties.join(', '));
      }
    }
  }, [currentUser, serviceCenters]);

  // Guard view for unauthorized access
  if (!currentUser || (currentUser.role !== 'center_admin' && currentUser.role !== 'app_admin')) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-red-100 text-center space-y-4 max-w-lg mx-auto shadow-sm">
        <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-900 text-lg">Access Restrained</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
            You are logged into a Customer account context. Visual metric monitors, service fee rates, and custom slot creation are only accessible by logged-in center managers or SaaS administrators.
          </p>
        </div>
        <p className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
          Try clicking a &ldquo;Demo Account&rdquo; login shortcut in the auth page to preview these features!
        </p>
      </div>
    );
  }

  // Filter calculations matching admin scope
  const isPlatformAdmin = currentUser.role === 'app_admin';
  const isCenterAdmin = currentUser.role === 'center_admin';
  const myCenterId = currentUser.centerId || '';

  // Filter app bookings and invoices to only show this center's data if center_admin
  const filteredBookings = isPlatformAdmin 
    ? bookings 
    : bookings.filter(b => b.serviceCenterId === myCenterId);

  const filteredInvoices = isPlatformAdmin 
    ? invoices 
    : invoices.filter(inv => {
        // match invoices to bookings at this center
        const b = bookings.find(x => x.id === inv.bookingId);
        return b && b.serviceCenterId === myCenterId;
      });

  // KPI Calculations
  const grossServicesCount = filteredBookings.length;
  const activeWashesCount = filteredBookings.filter(b => b.status === 'in_progress').length;
  const completedWashesCount = filteredBookings.filter(b => b.status === 'completed').length;
  const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);

  // Booking split ratio
  const carCount = filteredBookings.filter(b => b.vehicleType === 'car').length;
  const bikeCount = filteredBookings.filter(b => b.vehicleType === 'bike').length;
  const totalVehicles = carCount + bikeCount || 1;
  const carRatio = Math.round((carCount / totalVehicles) * 100);
  const bikeRatio = 100 - carRatio;

  // Revenue SVG graph calculations
  const revenueTrendData = isPlatformAdmin ? [
    { label: 'Jan', value: 12000 },
    { label: 'Feb', value: 15400 },
    { label: 'Mar', value: 18200 },
    { label: 'Apr', value: 22100 },
    { label: 'May', value: 27900 },
    { label: 'Jun (Today)', value: totalRevenue }
  ] : [
    { label: 'Jan', value: 3400 },
    { label: 'Feb', value: 4100 },
    { label: 'Mar', value: 4900 },
    { label: 'Apr', value: 5500 },
    { label: 'May', value: 6800 },
    { label: 'Jun (Today)', value: totalRevenue }
  ];

  const maxRevenue = Math.max(...revenueTrendData.map(d => d.value)) || 1;

  // Actions
  const handleSaveCenterDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managedCenter) return;
    const specialtiesArray = centerSpecs.split(',').map(s => s.trim()).filter(Boolean);
    updateCenterDetails(managedCenter.id, centerName, centerDesc, centerAddr, specialtiesArray);
  };

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const targetCid = isPlatformAdmin 
      ? (serviceCenters[0]?.id || 'sc-1') 
      : myCenterId;
    createWashSlot(targetCid, slotDate, slotTime);
  };

  const handleRegisterCenter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCenterName || !newCenterAddr) {
      addManualNotification('Missing Fields', 'Please fulfill name and address blanks to register center.', 'reminder');
      return;
    }
    const specialtiesArray = newCenterSpecs.split(',').map(s => s.trim()).filter(Boolean);
    addServiceCenter({
      name: newCenterName,
      description: newCenterDesc || 'Premium, water-conscious WashDash detailing hub with quick cleaning bays.',
      address: newCenterAddr,
      specialties: specialtiesArray,
      distance: '5.0 miles',
      image: `https://picsum.photos/seed/${newCenterName.substring(0, 4)}/600/400`
    });
    // Clear form
    setNewCenterName('');
    setNewCenterDesc('');
    setNewCenterAddr('');
  };

  const handleUpdatePrice = (serviceId: string, carPrice: string, bikePrice: string) => {
    const cp = parseFloat(carPrice);
    const bp = parseFloat(bikePrice);
    if (isNaN(cp) || isNaN(bp)) return;
    updateWashServicePrice(serviceId, cp, bp);
  };

  return (
    <div className="space-y-6" id="business-admin-viewport">
      
      {/* 1. ADMIN HEADER CARD */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest font-mono">
              {isPlatformAdmin ? 'Platform Cross-SaaS Hub' : `Manager: ${managedCenter ? managedCenter.name : 'Facility Control'}`}
            </span>
          </div>
          <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
            <span>Workspace Operations Control Panel</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              {currentUser.role === 'app_admin' ? 'App Admin' : 'Center Admin'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isPlatformAdmin 
              ? 'Aggregated cross-center transactions, service tier rate settings, and global detailing center registry control.' 
              : 'Add wash slots, manage local facility description, and track live detailing progress.'}
          </p>
        </div>

        {/* Live Simulator buttons */}
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={() => {
              advanceActiveWashProgress();
              addManualNotification('Washing Simulated Run', 'Step trackers updated for pending or active vehicles.', 'sync');
            }}
            className="px-3.5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 text-white"
          >
            <Sliders className="w-3.5 h-3.5 text-white animate-pulse" />
            <span className="hidden sm:inline">Simulate Wash Step</span>
            <span className="sm:hidden font-mono text-[10px]">+1 step</span>
          </button>
          <button
            onClick={() => setIsAutoSimulating(!isAutoSimulating)}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              isAutoSimulating 
                ? 'bg-amber-600 text-white hover:bg-amber-500' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isAutoSimulating ? 'animate-spin' : ''}`} />
            <span>{isAutoSimulating ? 'Auto (5s)' : 'Auto Run'}</span>
          </button>
        </div>
      </div>

      {/* 2. ADMIN ROLE SWITCH TABS */}
      <div className="flex border-b border-gray-100 overflow-x-auto pb-px scrollbar-none gap-2">
        <button
          onClick={() => setActiveTab('operations')}
          className={`px-4.5 py-2.5 text-xs font-black border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'operations' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          📈 High-Level Metrics
        </button>

        {/* Tab if Center Admin */}
        {isCenterAdmin && (
          <>
            <button
              onClick={() => setActiveTab('center-profile')}
              className={`px-4.5 py-2.5 text-xs font-black border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'center-profile' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              🏢 Facility Center Profile
            </button>
            <button
              onClick={() => setActiveTab('bookings-mgmt')}
              className={`px-4.5 py-2.5 text-xs font-black border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'bookings-mgmt' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              📋 Bookings Manager
            </button>
            <button
              onClick={() => setActiveTab('slots-mgmt')}
              className={`px-4.5 py-2.5 text-xs font-black border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'slots-mgmt' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              📅 Slot Scheduling Creator
            </button>
            <button
              onClick={() => setActiveTab('services-mgmt')}
              className={`px-4.5 py-2.5 text-xs font-black border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'services-mgmt' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              ⚙️ Services & Pricing
            </button>
          </>
        )}

        {/* Tab if Platform Admin */}
        {isPlatformAdmin && (
          <>
            <button
              onClick={() => setActiveTab('centers-registry')}
              className={`px-4.5 py-2.5 text-xs font-black border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'centers-registry' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              🛠️ Centers Registry ({serviceCenters.length})
            </button>
            <button
              onClick={() => setActiveTab('rates-mgmt')}
              className={`px-4.5 py-2.5 text-xs font-black border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'rates-mgmt' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              ⚙️ Manage Detailing Rates
            </button>
            <button
              onClick={() => setActiveTab('slots-mgmt')}
              className={`px-4.5 py-2.5 text-xs font-black border-b-2 whitespace-nowrap transition-all ${
                activeTab === 'slots-mgmt' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              📅 Slots Overseer (SaaS)
            </button>
          </>
        )}
      </div>

      {/* 3. WORKSPACE TAB CONTENTS */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          className="space-y-6"
        >
          {/* TAB: HIGH LEVEL METRICS */}
          {activeTab === 'operations' && (
            <div className="space-y-6">
              
              {/* Dynamic KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4.5 rounded-3xl border border-gray-100 shadow-3xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Gross Booked Volume</span>
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="text-xl font-black text-gray-900 tracking-tight">${totalRevenue.toFixed(2)}</span>
                    <span className="text-[9px] text-emerald-600 font-bold block mt-0.5 flex items-center gap-0.5">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      +14.2% MoM
                    </span>
                  </div>
                </div>

                <div className="bg-white p-4.5 rounded-3xl border border-gray-100 shadow-3xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Services Dispatched</span>
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="text-xl font-black text-gray-900 tracking-tight">{grossServicesCount} orders</span>
                    <span className="text-[9px] text-blue-500 font-bold block mt-0.5 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {completedWashesCount} finished
                    </span>
                  </div>
                </div>

                <div className="bg-white p-4.5 rounded-3xl border border-gray-100 shadow-3xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Washing Active</span>
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Clock className="w-4 h-4 animate-spin-slow" />
                    </div>
                  </div>
                  <div>
                    <span className="text-xl font-black text-gray-900 tracking-tight text-indigo-600">{activeWashesCount} bays</span>
                    <span className="text-[9px] text-indigo-400 font-medium block mt-0.5">Needs step advances</span>
                  </div>
                </div>

                <div className="bg-white p-4.5 rounded-3xl border border-gray-100 shadow-3xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Vehicle Mix split</span>
                    <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                      <Car className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="text-lg font-black text-slate-800 tracking-tight">{carCount}🚗 vs {bikeCount}🏍️</span>
                    <span className="text-[9px] text-slate-400 font-medium block mt-0.5">
                      {carRatio}% Car wash ratio
                    </span>
                  </div>
                </div>
              </div>

              {/* Graphical Analysis row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Graph Card */}
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm">Revenue Real-time Trend ($)</h3>
                      <p className="text-xs text-gray-400 font-normal">Tracking invoice values compiled this period</p>
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg">
                      {isPlatformAdmin ? 'Platform Global Trend' : 'Local Facility Trend'}
                    </span>
                  </div>

                  <div className="relative pt-4">
                    <div className="flex items-end justify-between h-40 border-b border-gray-100 pb-1 relative">
                      {revenueTrendData.map((point, index) => {
                        const heightPercent = Math.max(15, (point.value / maxRevenue) * 100);
                        const isHovered = hoveredPoint === index;
                        return (
                          <div 
                            key={point.label} 
                            className="flex-1 flex flex-col items-center group relative cursor-pointer"
                            onMouseEnter={() => setHoveredPoint(index)}
                            onMouseLeave={() => setHoveredPoint(null)}
                          >
                            {isHovered && (
                              <div className="absolute -top-12 bg-gray-900 text-white text-[10px] py-1 px-2.5 rounded-lg z-10 shadow-lg font-bold pointer-events-none text-center">
                                <div>{point.label}</div>
                                <div className="text-emerald-400">${point.value.toFixed(2)}</div>
                              </div>
                            )}
                            <div className="w-8 sm:w-12 bg-slate-100 rounded-t-lg overflow-hidden h-32 flex items-end relative">
                              <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${heightPercent}%` }}
                                className={`w-full rounded-t-lg transition-all ${
                                  index === revenueTrendData.length - 1
                                    ? 'bg-gradient-to-t from-blue-600 to-blue-400'
                                    : 'bg-gradient-to-t from-slate-600 to-slate-400'
                                }`}
                              />
                            </div>
                            <span className="text-[9px] text-gray-400 font-extrabold mt-1.5 font-mono">{point.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Occupancy and Ledgers logs */}
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">Automated Invoice Log</h3>
                    <p className="text-xs text-gray-400">Invoices dispatched dynamically</p>
                  </div>

                  {filteredInvoices.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-100 rounded-2xl">
                      No invoices compiled yet.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                      {filteredInvoices.map((inv) => (
                        <div key={inv.id} className="text-xs flex items-center justify-between p-2.5 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-mono">
                              <span className="font-bold text-slate-800">{inv.id}</span>
                              <span className="text-[8px] bg-emerald-50 text-emerald-700 font-extrabold px-1 rounded">Paid</span>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate max-w-40 capitalize">
                              {inv.vehicleModel} • ${inv.total.toFixed(2)}
                            </p>
                          </div>
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="p-1 px-2.5 text-[10px] font-bold text-blue-600 hover:bg-blue-100 bg-blue-50 focus:outline-hidden rounded-lg flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bay Status Indicator Map for operations tracking */}
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">Active Wash Bays Occupancy Monitor</h3>
                  <p className="text-xs text-gray-400">Visual mapping of active bays with structural order checking</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {serviceCenters.slice(0, 4).map((sc, i) => {
                    const centerActive = bookings.find(b => b.serviceCenterId === sc.id && (b.status === 'in_progress' || b.status === 'pending'));
                    return (
                      <div key={sc.id} className="border border-gray-100 p-4 rounded-2xl bg-gray-50/50 space-y-3.5 relative overflow-hidden flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono">Bay #{i+1}</span>
                          <span className={`w-2.5 h-2.5 rounded-full ${centerActive ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`}></span>
                        </div>

                        <div>
                          <h4 className="text-xs font-extrabold text-gray-800 truncate">{sc.name}</h4>
                          <span className="text-[9px] px-1.5 py-0.5 bg-slate-200/80 rounded text-slate-500 font-semibold block mt-1 w-fit">
                            {sc.address.split(',')[0]}
                          </span>
                        </div>

                        {centerActive ? (
                          <div className="space-y-1.5 pt-2">
                            <div className="flex justify-between text-[10px] font-bold text-gray-700">
                              <span className="capitalize text-blue-600 flex items-center gap-1">
                                {centerActive.vehicleType === 'car' ? <Car className="w-3 h-3" /> : <Bike className="w-3 h-3" />}
                                {centerActive.vehicleModel.split(' ')[0]}
                              </span>
                              <span className="font-normal text-slate-400">Step {centerActive.trackingStep}/5</span>
                            </div>
                            <p className="text-[9px] text-gray-500 font-extrabold truncate">👉 {TRACKING_STEPS[centerActive.trackingStep].name}</p>
                            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${(centerActive.trackingStep + 1) * 16.6}%` }} />
                            </div>
                          </div>
                        ) : (
                          <p className="text-[10px] text-emerald-600 font-bold bg-emerald-50 py-1 text-center rounded-lg mt-3">
                            🟢 Ready / Vacant
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: LOCAL CENTER PROFILE (ONLY CENTER_ADMIN) */}
          {activeTab === 'center-profile' && managedCenter && (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Facility Details Manager</h3>
                <p className="text-xs text-slate-400">Modifications made here compile instantly to client booking menus and listing maps.</p>
              </div>

              <form onSubmit={handleSaveCenterDetails} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Center Name</label>
                    <input 
                      type="text" 
                      value={centerName} 
                      onChange={(e) => setCenterName(e.target.value)} 
                      required
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Address Description</label>
                    <input 
                      type="text" 
                      value={centerAddr} 
                      onChange={(e) => setCenterAddr(e.target.value)} 
                      required
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Operational Specialties (Comma Separated)</label>
                  <input 
                    type="text" 
                    value={centerSpecs} 
                    onChange={(e) => setCenterSpecs(e.target.value)} 
                    placeholder="e.g. Ceramic Foam, Paint Correction, Deep Vacuum"
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:outline-hidden focus:border-blue-500"
                  />
                  <p className="text-[9px] text-slate-400 mt-0.5">Use commas to divide multiple highlighting badges in customer lists.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Center Promotional Description</label>
                  <textarea 
                    value={centerDesc} 
                    onChange={(e) => setCenterDesc(e.target.value)} 
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Update Profile Coordinates</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB: BOOKINGS MANAGEMENT (CENTER_ADMIN AND APP_ADMIN) */}
          {activeTab === 'bookings-mgmt' && (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Active Bookings Management</h3>
                <p className="text-xs text-slate-400">View and update live booking progress for your facility.</p>
              </div>

              <div className="space-y-3">
                {filteredBookings.map((bk) => (
                    <div key={bk.id} className="border border-slate-100 p-4 rounded-xl flex items-center justify-between text-xs bg-slate-50/50">
                        <div>
                            <p className="font-bold text-sm text-slate-800">{bk.vehicleModel}</p>
                            <p className="text-slate-500">{bk.date} | {bk.timeSlot} • Status: {bk.status} (Step: {bk.trackingStep}/5)</p>
                        </div>
                        <div className="flex gap-2">
                             {bk.status === 'in_progress' && (
                                <button 
                                    onClick={() => updateBookingStatus(bk.id, 'completed', 5)}
                                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold"
                                >
                                    Complete Wash
                                </button>
                             )}
                             {bk.status === 'pending' && (
                                <button
                                    onClick={() => updateBookingStatus(bk.id, 'in_progress', 0)}
                                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold"
                                >
                                    Start Wash
                                </button>
                             )}
                        </div>
                    </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SERVICES & PRICING MANAGEMENT (CENTER_ADMIN) */}
          {activeTab === 'services-mgmt' && (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base">Services & Pricing Management</h3>
              <p className="text-xs text-slate-400">Configure Service Packages and Monthly Subscription Plans.</p>
              {/* Implementation for service and package management will go here */}
            </div>
          )}

          {/* TAB: SLOT SCHEDULING CREATOR (CENTER_ADMIN AND APP_ADMIN) */}
          {activeTab === 'slots-mgmt' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Form panel to create slots */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-5">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span>Create Wash Slot</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-normal">Add available slots for customers on custom calendar dates.</p>
                </div>

                <form onSubmit={handleCreateSlot} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Select Target Date</label>
                    <input 
                      type="date" 
                      value={slotDate} 
                      onChange={(e) => setSlotDate(e.target.value)} 
                      required
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Designate Time Slot</label>
                    <select
                      value={slotTime}
                      onChange={(e) => setSlotTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:outline-hidden"
                    >
                      <option value="08:00 AM - 09:00 AM">08:00 AM - 09:00 AM (Early Ride)</option>
                      <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                      <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM (Mid-Morning)</option>
                      <option value="11:30 AM - 12:30 PM">11:30 AM - 12:30 PM</option>
                      <option value="01:00 PM - 02:00 PM">01:00 PM - 02:00 PM (Midday Spot)</option>
                      <option value="02:30 PM - 03:30 PM">02:30 PM - 03:30 PM</option>
                      <option value="04:30 PM - 05:30 PM">04:30 PM - 05:30 PM (Evening Rush)</option>
                      <option value="06:00 PM - 07:00 PM">06:00 PM - 07:00 PM (Late Detailing)</option>
                    </select>
                  </div>

                  {isPlatformAdmin && (
                    <div className="p-3 bg-blue-50 text-blue-800 text-[10px] font-bold rounded-xl flex items-start gap-1.5 border border-blue-100">
                      <ZapIcon className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span>Note: As SaaS Admin, you are generating this wash slot for your primary flagship center Elite Auto Shield!</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Generate Wash Slot</span>
                  </button>
                </form>
              </div>

              {/* List of active created slots */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs md:col-span-2 space-y-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Currently Available Bookable Slots</h3>
                  <p className="text-xs text-slate-400">Manage dynamically registered wash slots for bookings.</p>
                </div>

                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {washSlots
                    .filter(s => isPlatformAdmin || s.serviceCenterId === myCenterId)
                    .map((slot) => {
                      const associatedCenter = serviceCenters.find(c => c.id === slot.serviceCenterId);
                      return (
                        <div key={slot.id} className="text-xs flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-800">{slot.timeSlot}</span>
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                                slot.isBooked ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              }`}>
                                {slot.isBooked ? 'Booked/Occupied' : 'Open'}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400">Date: {slot.date} {associatedCenter ? `• Center: ${associatedCenter.name}` : ''}</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => deleteWashSlot(slot.id)}
                            className="p-1 px-2.5 text-[10px] font-bold text-red-500 hover:bg-red-50 border border-red-100 rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>

            </div>
          )}

          {/* TAB: CENTERS REGISTRY (ONLY APP_ADMIN) */}
          {activeTab === 'centers-registry' && isPlatformAdmin && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Form to list new center */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-5">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Register New Center</h3>
                  <p className="text-xs text-slate-400">Expand the SaaS network by onboarding a new detailing studio.</p>
                </div>

                <form onSubmit={handleRegisterCenter} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Center Name</label>
                    <input 
                      type="text" 
                      value={newCenterName} 
                      onChange={(e) => setNewCenterName(e.target.value)} 
                      placeholder="e.g. Apex Detailing Club"
                      required
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Full Physical Address</label>
                    <input 
                      type="text" 
                      value={newCenterAddr} 
                      onChange={(e) => setNewCenterAddr(e.target.value)} 
                      placeholder="e.g. 101 Bayside Blvd, Sector 5"
                      required
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Specialties (Separate with commas)</label>
                    <input 
                      type="text" 
                      value={newCenterSpecs} 
                      onChange={(e) => setNewCenterSpecs(e.target.value)} 
                      placeholder="e.g. Ceramic-Coat, Alloy Polish"
                      required
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Short Pitch Description</label>
                    <textarea 
                      value={newCenterDesc} 
                      onChange={(e) => setNewCenterDesc(e.target.value)} 
                      placeholder="Enter pitch..."
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Onboard Detailing Center</span>
                  </button>
                </form>
              </div>

              {/* List of registered centers with delete capability */}
              <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Active Network Centers</h3>
                  <p className="text-xs text-slate-400">Live service center locations registered in our cloud database.</p>
                </div>

                <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
                  {serviceCenters.map((sc) => (
                    <div key={sc.id} className="border border-slate-100 p-4 rounded-2xl bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-slate-800 text-sm">{sc.name}</h4>
                          <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-500 font-bold px-1.5 py-0.5 rounded font-mono">
                            {sc.id}
                          </span>
                        </div>
                        <p className="text-slate-400 font-normal">{sc.address}</p>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {sc.specialties.map(sp => (
                            <span key={sp} className="bg-blue-50 text-blue-600 border border-blue-100 text-[9px] px-2 py-0.5 rounded font-medium">
                              {sp}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteServiceCenter(sc.id)}
                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors border border-red-100 font-bold text-[10px] shrink-0 inline-flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Center</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB: RATES MANAGEMENT (ONLY APP_ADMIN) */}
          {activeTab === 'rates-mgmt' && isPlatformAdmin && (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-5">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Global Service Rates Settings</h3>
                <p className="text-xs text-slate-400">Configure global base prices for different wash tiers. Changes apply dynamically during checkout.</p>
              </div>

              <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-3xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 border-b border-gray-100 font-extrabold text-slate-400 uppercase tracking-widest text-[9px]">
                    <tr>
                      <th className="p-4">Wash Service Tier</th>
                      <th className="p-4 text-center">Duration</th>
                      <th className="p-4">Car Rate ($)</th>
                      <th className="p-4">Bike Rate ($)</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {washServices.map((srv) => (
                      <WashServiceRow key={srv.id} service={srv} onUpdatePrice={handleUpdatePrice} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* 4. MODAL DETAILED INVOICE */}
      {selectedInvoice && (
        <InvoiceModal 
          invoice={selectedInvoice} 
          isOpen={true} 
          onClose={() => setSelectedInvoice(null)} 
        />
      )}
    </div>
  );
}

// Inner helper component to manage individual rows gracefully in Zustand state updates
interface WashServiceRowProps {
  service: WashService;
  onUpdatePrice: (id: string, carVal: string, bikeVal: string) => void;
}

function WashServiceRow({ service, onUpdatePrice }: WashServiceRowProps) {
  const [carVal, setCarVal] = React.useState(service.priceCar.toString());
  const [bikeVal, setBikeVal] = React.useState(service.priceBike.toString());
  const [isSaved, setIsSaved] = React.useState(false);

  // Keep in sync with state changes
  React.useEffect(() => {
    setCarVal(service.priceCar.toString());
    setBikeVal(service.priceBike.toString());
  }, [service]);

  const handleLocalSave = () => {
    onUpdatePrice(service.id, carVal, bikeVal);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="p-4">
        <div>
          <span className="font-extrabold text-slate-800 block text-xs">{service.name}</span>
          <span className="text-[10px] text-slate-400 block max-w-sm font-normal mt-0.5 leading-relaxed">
            {service.description}
          </span>
        </div>
      </td>
      <td className="p-4 text-center font-bold text-slate-500 font-mono text-[10px]">
        {service.duration} mins
      </td>
      <td className="p-4">
        <div className="relative w-20">
          <span className="absolute left-2.5 top-2 text-slate-400 text-[10px] font-bold">$</span>
          <input 
            type="text" 
            value={carVal} 
            onChange={(e) => setCarVal(e.target.value)} 
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-1.5 pl-5 focus:outline-hidden focus:border-blue-500 font-mono font-bold"
          />
        </div>
      </td>
      <td className="p-4">
        <div className="relative w-20">
          <span className="absolute left-2.5 top-2 text-slate-400 text-[10px] font-bold">$</span>
          <input 
            type="text" 
            value={bikeVal} 
            onChange={(e) => setBikeVal(e.target.value)} 
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-1.5 pl-5 focus:outline-hidden focus:border-blue-500 font-mono font-bold"
          />
        </div>
      </td>
      <td className="p-4 text-center">
        <button
          type="button"
          onClick={handleLocalSave}
          className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all border shrink-0 inline-flex items-center gap-1 leading-none ${
            isSaved 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'
          }`}
        >
          {isSaved ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3 h-3" />}
          <span>{isSaved ? 'Saved' : 'Save'}</span>
        </button>
      </td>
    </tr>
  );
}

// Inline Quick Icon fallback for typesafety
function ZapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
