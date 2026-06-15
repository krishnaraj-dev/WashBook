'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Star, MapPin, ChevronRight, Check, AlertCircle, 
  Calendar, Clock, User, Bell, Car, Bike, RefreshCw, X, Eye, ShieldCheck, Heart 
} from 'lucide-react';
import { 
  useAppStore, TRACKING_STEPS, Booking, Invoice, ServiceCenter, SUBSCRIPTION_PLANS 
} from '@/lib/store';
import BookingModal from './BookingModal';
import InvoiceModal from './InvoiceModal';

export default function CustomerDashboard() {
  const { 
    bookings, offlineQueue, invoices, notifications, currentSubscription, isOffline, isSyncing, syncProgress,
    activeSection, setActiveSection, cancelBooking, buySubscription, cancelSubscription, markNotificationAsRead,
    serviceCenters, washServices, vehicles, addVehicle, updateVehicle, deleteVehicle
  } = useAppStore();

  const [bookingCenter, setBookingCenter] = React.useState<ServiceCenter | null>(null);
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null);
  const [newVehicleModel, setNewVehicleModel] = React.useState('');
  const [newVehicleNumber, setNewVehicleNumber] = React.useState('');
  const [newVehicleType, setNewVehicleType] = React.useState<'car' | 'bike'>('car');
  const [newVehiclePaint, setNewVehiclePaint] = React.useState('Black');
  const [editingVehicleId, setEditingVehicleId] = React.useState<string | null>(null);

  // Filter bookings
  const queueBookings = offlineQueue; // items waiting in cache while offline
  const activeBookings = bookings.filter(b => b.status === 'in_progress' || b.status === 'pending');
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  // Find active subscription plan
  const activePlan = SUBSCRIPTION_PLANS.find(p => p.id === currentSubscription);

  return (
    <div className="space-y-6" id="customer-view-hub">
      
      {/* Dynamic Queue Warning if user has offline bookings cached */}
      {queueBookings.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-4.5 flex gap-3.5 items-start justify-between shadow-xs"
        >
          <div className="flex gap-2.5 items-start">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
              <RefreshCw className="w-5 h-5 text-amber-600 animate-spin" />
            </div>
            <div>
              <h4 className="text-xs font-black text-amber-800">Pending Offline Appointments ({queueBookings.length})</h4>
              <p className="text-[11px] text-amber-600 mt-1 max-w-md leading-relaxed">
                You booked slots while offline. Sync will happen automatically when connectivity is restored!
              </p>
            </div>
          </div>
          <span className="text-[10px] px-2.5 py-1 bg-amber-100 border border-amber-200 text-amber-700/90 rounded-full font-bold uppercase shrink-0">
            Outbox Cache
          </span>
        </motion.div>
      )}

      {/* Synchronizing interactive screen overlay */}
      {isSyncing && (
        <div className="bg-slate-900/15 backdrop-blur-xs p-5 rounded-3xl border border-blue-100 flex flex-col items-center justify-center space-y-3.5 text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <div>
            <h4 className="text-sm font-black text-slate-800">Synchronizing Local Database</h4>
            <p className="text-xs text-slate-400 mt-0.5">Pushing {queueBookings.length} offline orders to facility server...</p>
          </div>
          <div className="w-full max-w-xs bg-slate-200 h-2 rounded-full overflow-hidden">
            <motion.div 
              className="bg-blue-600 h-full" 
              initial={{ width: 0 }}
              animate={{ width: `${syncProgress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <span className="text-xs text-blue-600 font-bold">{syncProgress}% Synced</span>
        </div>
      )}

      {/* VEHICLES TAB */}
      {activeSection === 'vehicles' && (
        <div className="space-y-6" id="manage-vehicles">
           <div>
            <h3 className="font-extrabold text-slate-900 text-base">Your Registered Rides</h3>
            <p className="text-xs text-slate-400">Manage your car or bike fleet for bookings</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map(v => (
              <div key={v.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${v.type === 'car' ? 'bg-blue-50 text-blue-600' : 'bg-teal-50 text-teal-600'}`}>
                    {v.type === 'car' ? <Car className="w-5 h-5" /> : <Bike className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">{v.model}</p>
                    <p className="text-xs text-gray-500">{v.paint} • {v.vehicleNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditingVehicleId(v.id);
                    setNewVehicleModel(v.model);
                    setNewVehicleNumber(v.vehicleNumber);
                    setNewVehicleType(v.type);
                    setNewVehiclePaint(v.paint);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteVehicle(v.id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
           </div>
           
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <h4 className="font-bold text-sm">{editingVehicleId ? 'Edit Vehicle Details' : 'Add New Vehicle'}</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input 
                  type="text" 
                  value={newVehicleModel} 
                  onChange={(e) => setNewVehicleModel(e.target.value)}
                  placeholder="e.g. Tesla Model 3"
                  className="p-3 border rounded-xl text-sm"
                />
                <input 
                  type="text" 
                  value={newVehicleNumber} 
                  onChange={(e) => setNewVehicleNumber(e.target.value)}
                  placeholder="e.g. KA-01-AB-1234"
                  className="p-3 border rounded-xl text-sm"
                />
                <input 
                  type="text" 
                  value={newVehiclePaint} 
                  onChange={(e) => setNewVehiclePaint(e.target.value)}
                  placeholder="e.g. Carbon Black"
                  className="p-3 border rounded-xl text-sm"
                />
                <select 
                  value={newVehicleType}
                  onChange={(e) => setNewVehicleType(e.target.value as 'car' | 'bike')}
                  className="p-3 border rounded-xl text-sm bg-white"
                >
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                </select>
              </div>
              <button
                onClick={() => {
                  if (newVehicleModel && newVehicleNumber) {
                    if (editingVehicleId) {
                      updateVehicle({ id: editingVehicleId, userId: '', model: newVehicleModel, type: newVehicleType, paint: newVehiclePaint, vehicleNumber: newVehicleNumber });
                      setEditingVehicleId(null);
                    } else {
                      addVehicle({ model: newVehicleModel, type: newVehicleType, paint: newVehiclePaint, vehicleNumber: newVehicleNumber });
                    }
                    setNewVehicleModel('');
                    setNewVehicleNumber('');
                    setNewVehiclePaint('Black');
                    setNewVehicleType('car');
                  }
                }}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700"
              >
                {editingVehicleId ? 'Update Vehicle' : 'Save Vehicle'}
              </button>
           </div>
        </div>
      )}

      {/* ACTIVE WASH TRACKER: If any booking is currently in wash bays */}
      {activeSection === 'book' && activeBookings.length > 0 && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-5 shadow-xl space-y-5 relative overflow-hidden border border-slate-800">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-md font-bold uppercase tracking-widest font-mono">
                Wash Bay Active
              </span>
              <h3 className="text-sm font-bold text-white tracking-tight">Real-Time Wash Tracking Feed</h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-mono text-[10px]">Bay #1</span>
            </div>
          </div>

          {activeBookings.map((bk) => {
            const center = serviceCenters.find(s => s.id === bk.serviceCenterId) || serviceCenters[0];
            const service = washServices.find(s => s.id === bk.serviceId) || washServices[0];
            const activeStep = bk.trackingStep;
            
            return (
              <div key={bk.id} className="space-y-4">
                {/* Details card */}
                <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-3 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    {bk.vehicleType === 'car' ? <Car className="w-6 h-6 text-blue-400" /> : <Bike className="w-6 h-6 text-teal-400" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-white truncate">{bk.vehicleModel}</p>
                    <p className="text-[10px] text-slate-400 font-normal truncate">
                      {service.name} • {center.name}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-blue-400">Step {activeStep + 1} of 6</span>
                    <p className="text-[9px] text-slate-400 block font-bold">Est. {service.duration}m</p>
                  </div>
                </div>

                {/* Vertical/Horizontal process indicator */}
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                    <span className="text-xs font-extrabold text-blue-400">Current Action:</span>
                    <span className="text-xs font-extrabold text-white">{TRACKING_STEPS[activeStep].name}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 italic text-center font-normal px-1">
                    &ldquo;{TRACKING_STEPS[activeStep].desc}&rdquo;
                  </p>

                  {/* Horizontal progress dots */}
                  <div className="relative pt-2 pb-1">
                    {/* Line behind */}
                    <div className="absolute top-4.5 left-3 right-3 h-1 bg-white/10 rounded-full z-0"></div>
                    <div 
                      className="absolute top-4.5 left-3 h-1 bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full z-0 transition-all duration-500"
                      style={{ width: `${(activeStep / (TRACKING_STEPS.length - 1)) * 92}%` }}
                    />

                    {/* Nodes row */}
                    <div className="relative z-10 flex justify-between">
                      {TRACKING_STEPS.map((step, idx) => {
                        const isDone = idx < activeStep;
                        const isCurrent = idx === activeStep;
                        return (
                          <div key={step.name} className="flex flex-col items-center">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] transition-all border ${
                              isDone 
                                ? 'bg-emerald-400 border-emerald-400 text-slate-900' 
                                : isCurrent 
                                ? 'bg-blue-600 border-white text-white scale-115 ring-2 ring-blue-600/30 font-extrabold' 
                                : 'bg-slate-800 border-slate-700 text-slate-400'
                            }`}>
                              {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                            </div>
                            <span className={`text-[8px] mt-1 font-bold ${isCurrent ? 'text-blue-400' : 'text-slate-500'}`}>
                              {step.name.split(' ')[0]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Progress helper simulator details */}
                <div className="text-[9px] text-slate-400 text-center font-mono py-1.5 border-t border-white/5 font-bold">
                  ⚡ Watch tracker status changes of your vehicle inside this panel live!
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SEGMENT 1: Active Booking trigger - SERVICE CENTERS CATALOG */}
      {activeSection === 'book' && (
        <div className="space-y-4" id="select-and-book">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>Select Wash Facility</span>
              </h3>
              <p className="text-xs text-slate-400">Choose a rating hub center nearby to schedule your detailing</p>
            </div>
            {activePlan && (
              <span className="text-[10px] px-2.5 py-1 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-full font-bold uppercase shrink-0">
                ⭐ {activePlan.name} active
              </span>
            )}
          </div>

          {/* Service Centers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {serviceCenters.map((hub) => (
              <div 
                key={hub.id} 
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-lg hover:shadow-gray-100/60 transition-all flex flex-col"
              >
                {/* Photo area */}
                <div className="relative h-44 bg-slate-100">
                  <Image 
                    src={hub.image} 
                    alt={hub.name}
                    fill
                    referrerPolicy="no-referrer"
                    className="object-cover"
                  />
                  {/* Rating pill */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-xs rounded-full flex items-center gap-1 shadow-xs">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-300" />
                    <span className="text-xs font-bold text-slate-900">{hub.rating}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({hub.reviewsCount})</span>
                  </div>

                  {/* Distance badge */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-slate-900/75 backdrop-blur-xs rounded-full text-[11px] font-bold text-white uppercase font-mono tracking-tight">
                    {hub.distance}
                  </div>
                </div>

                {/* Copy info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-900 text-sm">{hub.name}</h4>
                    <p className="text-xs text-slate-400 font-normal leading-relaxed">{hub.description}</p>
                    
                    {/* Specialty tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {hub.specialties.map((spec) => (
                        <span 
                          key={spec} 
                          className="text-[9px] font-bold tracking-tight text-slate-500 bg-slate-50 border border-slate-100/80 px-2 py-0.5 rounded-md"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setBookingCenter(hub)}
                    className="w-full py-3 text-xs font-bold text-center text-white bg-blue-600 rounded-2xl hover:bg-blue-700 hover:shadow-md transition-all flex items-center justify-center gap-1"
                  >
                    <span>Book Wash Slot</span>
                    <ChevronRight className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEGMENT 2: Scheduled & Past appointments list */}
      {activeSection === 'my-bookings' && (
        <div className="space-y-5" id="user-booking-records">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Your Booking Records</h3>
            <p className="text-xs text-slate-400">View active slots, cancellation tags, and automated tax invoices</p>
          </div>

          {/* Queue Bookings (offline) */}
          {queueBookings.length > 0 && (
            <div className="space-y-3">
              <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest block">Offline Cache Queue</span>
              <div className="space-y-2.5">
                {queueBookings.map((qt) => {
                  const hub = serviceCenters.find(s => s.id === qt.serviceCenterId) || serviceCenters[0];
                  const service = washServices.find(s => s.id === qt.serviceId) || washServices[0];
                  return (
                    <div key={qt.id} className="bg-white rounded-2xl border border-amber-200 p-4 flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-800 capitalize flex items-center gap-1">
                            {qt.vehicleType === 'car' ? <Car className="w-3.5 h-3.5" /> : <Bike className="w-3.5 h-3.5" />}
                            {qt.vehicleModel}
                          </span>
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded">Offline Queue</span>
                        </div>
                        <p className="text-xs text-slate-400 font-normal">{service.name} • {hub.name}</p>
                        <p className="text-[11px] text-slate-500 font-bold">{qt.date} @ {qt.timeSlot}</p>
                      </div>

                      <button
                        onClick={() => cancelBooking(qt.id)}
                        className="text-xs font-bold text-red-500 hover:bg-red-50 p-1.5 px-3 rounded-lg border border-red-100 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Bookings */}
          <div className="space-y-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Active Scheduled Services</span>
            {activeBookings.length === 0 ? (
              <div className="text-xs text-slate-400 py-6 border border-dashed border-slate-200 rounded-2xl text-center bg-white/50">
                No active car or bike wash scheduled currently. Tap &ldquo;Book Wash&rdquo; on the bottom navigation!
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeBookings.map((bk) => {
                  const hub = serviceCenters.find(s => s.id === bk.serviceCenterId) || serviceCenters[0];
                  const service = washServices.find(s => s.id === bk.serviceId) || washServices[0];
                  
                  return (
                    <div key={bk.id} className="bg-white rounded-3xl border border-slate-100 p-4.5 flex justify-between items-start gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-800 capitalize flex items-center gap-1">
                            {bk.vehicleType === 'car' ? <Car className="w-3.5 h-3.5 text-blue-600" /> : <Bike className="w-3.5 h-3.5 text-teal-600" />}
                            {bk.vehicleModel}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            bk.status === 'in_progress' ? 'bg-indigo-100 text-indigo-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {bk.status === 'in_progress' ? 'WASHING' : 'READY TO SPA'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-normal">{service.name} • {hub.name}</p>
                        
                        <div className="flex items-center gap-4 text-[11px] text-slate-500 font-semibold pt-1">
                          <span className="flex items-center gap-1">📅 {bk.date}</span>
                          <span className="flex items-center gap-1">⏰ {bk.timeSlot.split(' ')[0]} {bk.timeSlot.split(' ')[1]}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 text-right">
                        <span className="font-mono text-xs font-bold text-slate-900">${bk.price.toFixed(2)}</span>
                        <div className="flex gap-1.5 justify-end pt-1">
                          {bk.status === 'pending' && (
                            <button
                              onClick={() => cancelBooking(bk.id)}
                              className="text-[10px] font-bold text-red-500 hover:bg-neutral-50 px-2 py-1 rounded border border-red-100 transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const inv = invoices.find(x => x.bookingId === bk.id);
                              if (inv) setSelectedInvoice(inv);
                            }}
                            className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded bg-blue-50/10 border border-blue-100 flex items-center gap-0.5 transition-all"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Invoice</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past Bookings */}
          <div className="space-y-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Past Wash History</span>
            <div className="space-y-2.5">
              {pastBookings.map((bk) => {
                const hub = serviceCenters.find(s => s.id === bk.serviceCenterId) || serviceCenters[0];
                const service = washServices.find(s => s.id === bk.serviceId) || washServices[0];
                
                return (
                  <div key={bk.id} className="bg-white rounded-3xl border border-slate-100 p-4 shadow-3xs flex justify-between items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-700 capitalize flex items-center gap-1">
                          {bk.vehicleType === 'car' ? <Car className="w-3.5 h-3.5 text-gray-500" /> : <Bike className="w-3.5 h-3.5 text-gray-500" />}
                          {bk.vehicleModel}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                          bk.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {bk.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-normal">{service.name} • {hub.name}</p>
                      <p className="text-[11px] text-slate-400">{bk.date} @ {bk.timeSlot.split(' ')[0]}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-slate-500">${bk.price.toFixed(2)}</span>
                      {bk.status === 'completed' && (
                        <button
                          onClick={() => {
                            const inv = invoices.find(x => x.bookingId === bk.id);
                            if (inv) setSelectedInvoice(inv);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 bg-blue-50/50 rounded-xl transition-all"
                          aria-label="View invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SEGMENT 3: Subscriptions comparison */}
      {activeSection === 'subscriptions' && (
        <div className="space-y-5 animate-view-slide" id="subscription-plans">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Durable Subscription Tiers</h3>
              <p className="text-xs text-slate-400">Save up to 45% on regular washes, priority bays, detailings</p>
            </div>
            {currentSubscription && (
              <button 
                onClick={cancelSubscription}
                className="text-[11px] font-bold text-red-500 hover:underline"
              >
                Deactivate Status
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isActive = plan.id === currentSubscription;
              
              return (
                <div 
                  key={plan.id} 
                  className={`bg-white rounded-3xl p-5 border flex flex-col justify-between space-y-5 relative overflow-hidden transition-all duration-300 ${
                    isActive 
                      ? 'border-blue-600 ring-1 ring-blue-600 shadow-lg shadow-blue-50' 
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {/* Visual flare for popular gold plan */}
                  {plan.id === 'sub-gold' && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-400 to-amber-500 text-white font-extrabold text-[9px] uppercase tracking-widest px-3 py-1 rounded-bl-xl">
                      BEST VALUE CHOICE
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Header */}
                    <div className="space-y-1">
                      <h4 className="text-base font-black text-slate-900">{plan.name}</h4>
                      <p className="text-xs text-slate-400 font-normal">{plan.description}</p>
                    </div>

                    {/* Price tag */}
                    <div>
                      <span className="text-3xl font-black text-slate-900">${plan.price}</span>
                      <span className="text-xs text-slate-400 font-medium"> / Month</span>
                    </div>

                    {/* Checklist */}
                    <div className="space-y-2.5 border-t border-slate-100 pt-4">
                      {plan.features.map((ft) => (
                        <div key={ft} className="flex gap-2.5 items-start text-xs text-slate-600">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-relaxed font-normal">{ft}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => buySubscription(plan.id)}
                    className={`w-full py-3.5 text-xs font-bold rounded-2xl transition-all ${
                      isActive 
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-100' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isActive ? 'Current Plan: Active 🚀' : `Enlist for $${plan.price}/mo`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SEGMENT 4: Push notifications list */}
      {activeSection === 'notifications' && (
        <div className="space-y-4" id="notifications-shelf">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">WashDash Alerts Shelf</h3>
              <p className="text-xs text-slate-400">Push notification history, reminders, offline sync alerts</p>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {notifications.filter(n => !n.read).length} Unread
            </span>
          </div>

          <div className="space-y-2.5">
            {notifications.map((nt) => {
              const dateObj = new Date(nt.timestamp);
              const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
              
              return (
                <div 
                  key={nt.id} 
                  onClick={() => markNotificationAsRead(nt.id)}
                  className={`p-4 rounded-3xl border flex items-start gap-3 cursor-pointer transition-colors ${
                    nt.read 
                      ? 'bg-white border-slate-100 text-slate-600' 
                      : 'bg-blue-50/30 border-blue-100 text-slate-900 shadow-xs'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    nt.type === 'booking' 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : nt.type === 'sync' 
                      ? 'bg-amber-50 text-amber-600' 
                      : nt.type === 'subscription' 
                      ? 'bg-yellow-50 text-yellow-600' 
                      : 'bg-blue-50 text-blue-600'
                  }`}>
                    {nt.type === 'booking' ? <Car className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex justify-between items-center gap-1.5">
                      <h4 className="text-xs font-black truncate">{nt.title}</h4>
                      <span className="text-[9px] text-slate-400 shrink-0 font-mono font-bold uppercase">{formattedTime}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-normal">{nt.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Integrated Modal Overlays */}
      {bookingCenter && (
        <BookingModal 
          center={bookingCenter} 
          isOpen={true} 
          onClose={() => setBookingCenter(null)} 
        />
      )}

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
