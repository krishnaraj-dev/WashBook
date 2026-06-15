import { create } from 'zustand';

// --- TYPES & INTERFACES ---

export interface Vehicle {
  id: string;
  userId: string;
  type: 'car' | 'bike';
  model: string;
  paint: string;
  vehicleNumber: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'center_admin' | 'app_admin';
  centerId?: string; // Managed center ID if center_admin
}

export interface WashSlot {
  id: string;
  serviceCenterId: string;
  date: string; // ISO yyyy-mm-dd
  timeSlot: string; // "10:00 AM - 11:00 AM" etc
  isBooked: boolean;
}

export interface ServiceCenter {
  id: string;
  name: string;
  description: string;
  rating: number;
  reviewsCount: number;
  distance: string;
  image: string;
  specialties: string[];
  address: string;
}

export interface WashService {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  priceCar: number;
  priceBike: number;
}

export type BookingStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  serviceCenterId: string;
  vehicleType: 'car' | 'bike';
  vehicleModel: string;
  serviceId: string;
  status: BookingStatus;
  trackingStep: number; // 0 to 5
  date: string;
  timeSlot: string;
  price: number;
  invoiceId: string;
  isOfflineCreated?: boolean;
  synced?: boolean;
}

export interface ServicePackage {
  id: string;
  centerId: string;
  name: string;
  description: string;
  category: 'car-wash' | 'upholstery' | 'wax-polish' | 'steam-sterilization' | 'oil-change' | 'ac-service' | 'detailing' | 'other';
  inclusions: string[];
  pricingType: 'per_vehicle_size' | 'flat_rate' | 'subscription';
  vehicleSizePricing?: {
    smallMedium: number;
    sedan: number;
    suv: number;
    largeSuv: number;
  };
  flatPrice?: number;
  applicableVehicleTypes: ('car' | 'bike' | 'suv' | 'truck')[];
  bikepricing?: {
    bike: number;
    superBike: number;
  };
  isActive: boolean;
  displayOrder: number;
}

export interface SubscriptionPlan {
  id: string;
  centerId: string;
  name: string;
  description: string;
  includedServices: string[]; // IDs of ServicePackage
  vehicleTierPricing: {
    hatchback: number;
    sedan: number;
    suv: number;
    largeSuv: number;
  };
  validityDays: number;
  usageLimit: number;
  conditions: string;
  isActive: boolean;
}

export interface CustomerSubscription {
  id: string;
  customerId: string;
  centerId: string;
  planId: string;
  vehicleId: string;
  vehicleTier: 'hatchback' | 'sedan' | 'suv' | 'largeSuv';
  startDate: string;
  expiryDate: string;
  totalWashesAllowed: number;
  washesUsed: number;
  status: 'active' | 'expired' | 'exhausted';
}

export interface Invoice {
  id: string;
  bookingId: string;
  date: string;
  customerName: string;
  customerEmail: string;
  vehicleModel: string;
  vehicleType: 'car' | 'bike';
  serviceName: string;
  serviceCenterName: string;
  basePrice: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: 'paid' | 'pending';
}

export interface PushNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'booking' | 'sync' | 'subscription' | 'reminder';
}

export interface DailyRevenue {
  date: string;
  revenue: number;
}

export interface RetentionRate {
  month: string;
  rate: number;
}

// --- INITIAL MOCK DATA ---

export const SERVICE_CENTERS: ServiceCenter[] = [
  {
    id: 'sc-1',
    name: 'V3 CAR SPA',
    description: 'Car Wash, Upholstery, Shampooing & Anti Bacterial Steam Sterilization Services.',
    rating: 5.0,
    reviewsCount: 15,
    distance: '0.1 miles',
    image: 'https://picsum.photos/seed/v3-car-spa/600/400',
    specialties: ['Steam Sterilization', 'Upholstery Cleaning', 'Wax Polish'],
    address: '#114, Kodati Gate, Sarjapur Main Road, Near Uniform City, Bengaluru - 560035'
  }
];

export const WASH_SERVICES: WashService[] = [
  {
    id: 'ws-1',
    name: 'Standard Car/Bike Wash',
    description: 'Complete washing and cleaning services for your vehicle. (Price incl. GST)',
    duration: 30,
    priceCar: 550,
    priceBike: 120
  },
  {
    id: 'ws-2',
    name: 'Interior Upholstery Dry Cleaning',
    description: 'Complete seat, roof, dash and door pad cleaning & stain removal. (Price incl. GST)',
    duration: 90,
    priceCar: 2500,
    priceBike: 150
  },
  {
    id: 'ws-3',
    name: 'Exterior Body Wax Polish',
    description: 'Complete car exterior body liquid/wax polish for paint protection. (Price incl. GST)',
    duration: 60,
    priceCar: 1750,
    priceBike: 0
  },
  {
    id: 'ws-4',
    name: 'Super Bike Wash',
    description: 'Detailed super bike premium wash. (Price incl. GST)',
    duration: 30,
    priceCar: 0,
    priceBike: 150
  }
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'sub-silver',
    name: 'Silver Hydro',
    price: 39,
    description: 'Affordable regular maintenance for daily commuters.',
    features: [
      '2 Express Hydro-Spritzes per month',
      '1 Signature Ceramic Foam Upgrade',
      '10% off any deep detailing add-on',
      'Free interior scent tag each visit'
    ],
    vehicleType: 'both'
  },
  {
    id: 'sub-gold',
    name: 'Gold Gloss Premium',
    price: 79,
    description: 'Keep your machine in pristine shape year-round.',
    features: [
      '4 Signature Ceramic-Foam washes',
      '1 Full Cabin Ozone Sanitation session',
      'Complimentary wheel alloy buffing',
      'Priority booking slot allocation'
    ],
    vehicleType: 'both'
  },
  {
    id: 'sub-apex',
    name: 'Apex Showroom Club',
    price: 139,
    description: 'The ultimate luxury coat for perfectionist owners.',
    features: [
      'Unlimited Express & Ceramic washes',
      '1 Bespoke Showroom Detailing per quarter',
      'Free bike chain degrease & tire polish',
      'Complimentary vehicle pick-and-drop service'
    ],
    vehicleType: 'both'
  }
];

export const getInitialServicePackages = (): ServicePackage[] => [
  {
    id: 'sp-1', centerId: 'sc-1', name: 'Standard Car Wash', description: 'Complete exterior and interior wash.', category: 'car-wash',
    inclusions: ["Complete Vacuuming", "Floor Mats", "Under Chassis", "Tyre Arch", "Exterior Shampoo", "Door Frames", "Wiping and Drying", "Dashboard & Door Pad", "Tyre Polishing"],
    pricingType: 'per_vehicle_size', vehicleSizePricing: { smallMedium: 450, sedan: 500, suv: 550, largeSuv: 600 },
    applicableVehicleTypes: ['car'], isActive: true, displayOrder: 1
  },
  {
    id: 'sp-2', centerId: 'sc-1', name: 'Interior Upholstery Dry Cleaning', description: 'Deep cleaning for seats and interior.', category: 'upholstery',
    inclusions: ["Seat Upholstery Stain Removal", "Roof Cleaning", "Dashboard Cleaning", "Door Pad Polishing"],
    pricingType: 'per_vehicle_size', vehicleSizePricing: { smallMedium: 1750, sedan: 2000, suv: 2500, largeSuv: 3000 },
    applicableVehicleTypes: ['car'], isActive: true, displayOrder: 2
  },
  {
    id: 'sp-3', centerId: 'sc-1', name: 'Exterior Body Wax Polish', description: 'Paint protection and gloss.', category: 'wax-polish',
    inclusions: ["Liquid Polish", "Wax Polish", "Paint Life Enhancement"],
    pricingType: 'per_vehicle_size', vehicleSizePricing: { smallMedium: 1250, sedan: 1500, suv: 1750, largeSuv: 2000 },
    applicableVehicleTypes: ['car'], isActive: true, displayOrder: 3
  },
  {
    id: 'sp-4', centerId: 'sc-1', name: 'Bike Wash', description: 'Premium bike wash.', category: 'car-wash',
    inclusions: ["Complete Wash", "Tyre Polishing"],
    pricingType: 'flat_rate', bikepricing: { bike: 120, superBike: 150 },
    applicableVehicleTypes: ['bike'], isActive: true, displayOrder: 4
  }
];

export const getInitialSubscriptionPlans = (): SubscriptionPlan[] => [
  {
    id: 'sub-1', centerId: 'sc-1', name: 'Monthly Washing Package', description: '4 washes per month.',
    includedServices: ['sp-1'],
    vehicleTierPricing: { hatchback: 1600, sedan: 1800, suv: 2000, largeSuv: 2200 },
    validityDays: 60, usageLimit: 4, conditions: "4 Wash per card / Valid for 60 days", isActive: true
  }
];

// Steps for tracking
export const TRACKING_STEPS = [
  { name: 'Checked In', desc: 'Vehicle checked-in and key logged' },
  { name: 'Pre-Wash & Foaming', desc: 'Applying organic pre-wash dirt loosening foam' },
  { name: 'High-Pressure wash', desc: 'Rinsing off foam and detailed wheel rim blast' },
  { name: 'Detailing & Vacuum', desc: 'Microfiber hand towel wipe and deep interior cabin vacuum' },
  { name: 'Quality Inspection', desc: 'Manager inspection under specialized gloss LEDs' },
  { name: 'Ready for Pickup', desc: 'Wash finished! Ready for delivery' }
];

// Store Interface
export interface AppStore {
  // Auth state
  currentUser: User | null;
  accounts: User[];
  
  // Dynamic datasets (moved to state)
  serviceCenters: ServiceCenter[];
  washServices: WashService[];
  washSlots: WashSlot[];
  vehicles: Vehicle[];
  servicePackages: ServicePackage[];
  subscriptionPlans: SubscriptionPlan[];
  customerSubscriptions: CustomerSubscription[];

  // App states
  isOffline: boolean;
  syncProgress: number; // 0 to 100
  isSyncing: boolean;
  viewMode: 'customer' | 'owner';
  activeSection: string; // 'book' | 'my-bookings' | 'subscriptions' | 'notifications'
  selectedCenter: ServiceCenter | null;
  currentSubscription: string | null; // Plan ID
  bookings: Booking[];
  offlineQueue: Booking[];
  invoices: Invoice[];
  notifications: PushNotification[];
  
  // Auth Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  registerUser: (name: string, email: string, role: 'customer' | 'center_admin' | 'app_admin', centerId?: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;

  // Vehicle Management
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'userId'>) => void;
  updateVehicle: (vehicle: Vehicle) => void;
  deleteVehicle: (vehicleId: string) => void;

  // Management Actions
  updateCenterDetails: (centerId: string, name: string, description: string, address: string, specialties: string[]) => void;
  createWashSlot: (centerId: string, date: string, timeSlot: string) => void;
  deleteWashSlot: (slotId: string) => void;
  addServiceCenter: (center: Omit<ServiceCenter, 'id' | 'rating' | 'reviewsCount'>) => void;
  deleteServiceCenter: (centerId: string) => void;
  updateWashServicePrice: (serviceId: string, priceCar: number, priceBike: number) => void;

  // Actions
  toggleOfflineMode: () => void;
  triggerSync: () => Promise<void>;
  setViewMode: (mode: 'customer' | 'owner') => void;
  setActiveSection: (section: string) => void;
  setSelectedCenter: (center: ServiceCenter | null) => void;
  addBooking: (bookingData: Omit<Booking, 'id' | 'invoiceId' | 'status' | 'trackingStep' | 'synced'>) => void;
  cancelBooking: (bookingId: string) => void;
  buySubscription: (planId: string) => void;
  cancelSubscription: () => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  updateBookingStatus: (bookingId: string, status: BookingStatus, trackingStep: number) => void;
  advanceActiveWashProgress: () => void;
  addManualNotification: (title: string, desc: string, type: 'booking' | 'sync' | 'subscription' | 'reminder') => void;
}

// Initial state helpers
const getInitialInvoices = (): Invoice[] => [
  {
    id: 'INV-4921',
    bookingId: 'book-completed-1',
    date: '2026-06-10T12:00:00Z',
    customerName: 'Krishna Raj',
    customerEmail: 'krishnaraj.webdev@gmail.com',
    vehicleModel: 'Yamaha R15 V4 (Blue)',
    vehicleType: 'bike',
    serviceName: 'Signature Ceramic-Foam Wash',
    serviceCenterName: 'Apex Moto & Car Spa',
    basePrice: 28,
    tax: 5.04,
    total: 33.04,
    paymentMethod: 'Credit Card',
    status: 'paid'
  },
  {
    id: 'INV-4819',
    bookingId: 'book-completed-2',
    date: '2026-05-28T14:30:00Z',
    customerName: 'Krishna Raj',
    customerEmail: 'krishnaraj.webdev@gmail.com',
    vehicleModel: 'Tesla Model Y (Deep Blue)',
    vehicleType: 'car',
    serviceName: 'Bespoke Showroom Detailing',
    serviceCenterName: 'Elite Auto Shield',
    basePrice: 160,
    tax: 28.8,
    total: 188.8,
    paymentMethod: 'Apple Pay',
    status: 'paid'
  }
];

const getInitialBookings = (): Booking[] => [
  {
    id: 'book-completed-1',
    serviceCenterId: 'sc-4',
    vehicleType: 'bike',
    vehicleModel: 'Yamaha R15 V4 (Blue)',
    serviceId: 'ws-2',
    status: 'completed',
    trackingStep: 5,
    date: '2026-06-10',
    timeSlot: '11:00 AM - 12:00 PM',
    price: 33.04,
    invoiceId: 'INV-4921'
  },
  {
    id: 'book-completed-2',
    serviceCenterId: 'sc-1',
    vehicleType: 'car',
    vehicleModel: 'Tesla Model Y (Deep Blue)',
    serviceId: 'ws-4',
    status: 'completed',
    trackingStep: 5,
    date: '2026-05-28',
    timeSlot: '02:00 PM - 03:00 PM',
    price: 188.80,
    invoiceId: 'INV-4819'
  },
  {
    id: 'book-active-1',
    serviceCenterId: 'sc-1',
    vehicleType: 'car',
    vehicleModel: 'Tesla Model 3 (Midnight Silver)',
    serviceId: 'ws-2',
    status: 'in_progress',
    trackingStep: 1, // Pre-Wash & Foaming
    date: '2026-06-15',
    timeSlot: '08:30 AM - 09:30 AM',
    price: 53.10, // $45 base + 18% GST (9% CGST + 9% SGST is standard, or typical tax = $8.10)
    invoiceId: 'INV-5012'
  }
];

const getInitialInvoicesWithActive = (): Invoice[] => {
  const baseInvoices = getInitialInvoices();
  return [
    ...baseInvoices,
    {
      id: 'INV-5012',
      bookingId: 'book-active-1',
      date: '2026-06-15T08:00:00Z',
      customerName: 'Krishna Raj',
      customerEmail: 'krishnaraj.webdev@gmail.com',
      vehicleModel: 'Tesla Model 3 (Midnight Silver)',
      vehicleType: 'car',
      serviceName: 'Signature Ceramic-Foam Wash',
      serviceCenterName: 'Elite Auto Shield',
      basePrice: 45,
      tax: 8.10,
      total: 53.10,
      paymentMethod: 'Stored Subscription Balance',
      status: 'paid'
    }
  ];
};

const getInitialNotifications = (): PushNotification[] => [
  {
    id: 'notif-1',
    title: 'Welcome to WashDash!',
    description: 'Easily book car/bike washes, track progress offline, and enjoy premium subscription discounts.',
    timestamp: '2026-06-15T07:45:00Z',
    read: false,
    type: 'reminder'
  },
  {
    id: 'notif-2',
    title: 'Reminder: Booking Incoming',
    description: 'Your booking with Elite Auto Shield for Tesla Model 3 starts in 15 minutes! Drive safely.',
    timestamp: '2026-06-15T08:15:00Z',
    read: false,
    type: 'booking'
  }
];

const getInitialWashSlots = (): WashSlot[] => {
  const centers = ['sc-1', 'sc-2', 'sc-3', 'sc-4'];
  const dates = [
    new Date().toISOString().split('T')[0],
    new Date(Date.now() + 86400000).toISOString().split('T')[0],
    new Date(Date.now() + 172800000).toISOString().split('T')[0]
  ];
  const standardSlots = [
    '08:00 AM - 09:00 AM',
    '10:00 AM - 11:00 AM',
    '12:30 PM - 01:30 PM',
    '02:30 PM - 03:30 PM',
    '04:30 PM - 05:30 PM',
    '06:00 PM - 07:00 PM'
  ];

  const slots: WashSlot[] = [];
  let idCounter = 1;
  centers.forEach(cId => {
    dates.forEach(dt => {
      standardSlots.forEach(sl => {
        slots.push({
          id: `slot-${idCounter++}`,
          serviceCenterId: cId,
          date: dt,
          timeSlot: sl,
          // Let's mark a couple as pre-booked
          isBooked: idCounter % 7 === 0
        });
      });
    });
  });
  return slots;
};

const getInitialAccounts = (): User[] => [
  {
    id: 'usr-1',
    name: 'Krishna Raj',
    email: 'customer@washbook.com',
    role: 'customer'
  },
  {
    id: 'usr-2',
    name: 'Elite Auto Manager',
    email: 'admin.elite@washbook.com',
    role: 'center_admin',
    centerId: 'sc-1'
  },
  {
    id: 'usr-3',
    name: 'HyperGloss Manager',
    email: 'admin.gloss@washbook.com',
    role: 'center_admin',
    centerId: 'sc-2'
  },
  {
    id: 'usr-4',
    name: 'SaaS Platform Admin',
    email: 'app.admin@washbook.com',
    role: 'app_admin'
  }
];

// --- ZUSTAND STORE IMPLEMENTATION ---

export const useAppStore = create<AppStore>((set, get) => ({
  // Auth state
  currentUser: null, // Start signed out!
  accounts: getInitialAccounts(),

  // Dynamic datasets (moved to state)
  serviceCenters: SERVICE_CENTERS,
  washServices: WASH_SERVICES,
  washSlots: getInitialWashSlots(),
  vehicles: [],
  servicePackages: getInitialServicePackages(),
  subscriptionPlans: getInitialSubscriptionPlans(),
  customerSubscriptions: [],

  // Base state
  isOffline: false,
  syncProgress: 0,
  isSyncing: false,
  viewMode: 'customer',
  activeSection: 'book',
  selectedCenter: null,
  currentSubscription: 'sub-gold', // Initially subscribed to gold details
  bookings: getInitialBookings(),
  offlineQueue: [],
  invoices: getInitialInvoicesWithActive(),
  notifications: getInitialNotifications(),

  toggleOfflineMode: () => {
    const isNowOffline = !get().isOffline;
    set({ isOffline: isNowOffline });
    
    // Add push notification about connection state change
    const title = isNowOffline ? 'Switched to Offline Mode' : 'Online State Re-established';
    const description = isNowOffline 
      ? 'You can still queue wash bookings. They will sync automatically when connectivity is restored!' 
      : 'Your device is back online. Sync engine is active.';
    
    get().addManualNotification(title, description, 'sync');

    // Trigger sync automatically if toggling back to online
    if (!isNowOffline && get().offlineQueue.length > 0) {
      get().triggerSync();
    }
  },

  login: async (email, password) => {
    // Basic mock logic: find account by email
    const account = get().accounts.find(acc => acc.email.toLowerCase() === email.toLowerCase());
    if (account) {
      set({ currentUser: account });
      
      // Auto match viewMode to role structure
      if (account.role === 'customer') {
        set({ viewMode: 'customer', activeSection: 'book' });
      } else {
        set({ viewMode: 'owner' });
      }

      get().addManualNotification(
        'Welcome Back!',
        `Successfully logged in as ${account.name} (${account.role === 'customer' ? 'Customer' : account.role === 'center_admin' ? 'Center Admin' : 'App Admin'})!`,
        'reminder'
      );
      return true;
    }
    return false;
  },

  logout: () => {
    set({ currentUser: null, activeSection: 'book' });
    get().addManualNotification(
      'Logged Out Successfully',
      'You are now logged out. Enter your credentials to access WashDash again.',
      'reminder'
    );
  },

  registerUser: async (name, email, role, centerId) => {
    const exists = get().accounts.some(acc => acc.email.toLowerCase() === email.toLowerCase());
    if (exists) return false;

    const newUser: User = {
      id: `usr-${Math.floor(Math.random() * 10000) + 100}`,
      name,
      email,
      role,
      centerId
    };

    set({
      accounts: [...get().accounts, newUser],
      currentUser: newUser
    });

    if (role === 'customer') {
      set({ viewMode: 'customer', activeSection: 'book' });
    } else {
      set({ viewMode: 'owner' });
    }

    get().addManualNotification(
      'Account Created!',
      `Welcome to WashDash, ${name}! Your registration as a ${role} is now complete.`,
      'reminder'
    );
    return true;
  },

  forgotPassword: async (email) => {
    const exists = get().accounts.some(acc => acc.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      get().addManualNotification(
        'Password Reset Requested',
        `A passcode reset link has been dispatched to ${email}. Check your inbox!`,
        'reminder'
      );
      return true;
    }
    return false;
  },

  addVehicle: (vehicleData) => {
    const user = get().currentUser;
    if (!user) return;
    
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: `vh-${Math.floor(Math.random() * 1000000)}`,
      userId: user.id
    };
    
    set({
      vehicles: [...get().vehicles, newVehicle]
    });
    
    get().addManualNotification('Vehicle Added', `Added ${newVehicle.model} to your profile.`, 'reminder');
  },

  deleteVehicle: (vehicleId) => {
    set({
      vehicles: get().vehicles.filter(v => v.id !== vehicleId)
    });
    get().addManualNotification('Vehicle Removed', 'The vehicle was removed from your profile.', 'reminder');
  },

  updateVehicle: (vehicle) => {
    set({
      vehicles: get().vehicles.map(v => v.id === vehicle.id ? vehicle : v)
    });
    get().addManualNotification('Vehicle Updated', `Updated ${vehicle.model} details.`, 'reminder');
  },

  updateCenterDetails: (centerId, name, description, address, specialties) => {
    set({
      serviceCenters: get().serviceCenters.map(center => 
        center.id === centerId 
          ? { ...center, name, description, address, specialties } 
          : center
      )
    });
    get().addManualNotification(
      'Center Details Updated',
      `Service center "${name}" profile was modified successfully by the facility admin.`,
      'reminder'
    );
  },

  createWashSlot: (centerId, date, timeSlot) => {
    const id = `slot-created-${Math.floor(Math.random() * 100000)}`;
    const newSlot: WashSlot = {
      id,
      serviceCenterId: centerId,
      date,
      timeSlot,
      isBooked: false
    };
    set({
      washSlots: [newSlot, ...get().washSlots]
    });
    get().addManualNotification(
      'Wash Slot Created',
      `A new slot was added for "${timeSlot}" on ${date}.`,
      'booking'
    );
  },

  deleteWashSlot: (slotId) => {
    set({
      washSlots: get().washSlots.filter(s => s.id !== slotId)
    });
    get().addManualNotification(
      'Wash Slot Removed',
      'The designated booking slot was removed by the administrator.',
      'booking'
    );
  },

  addServiceCenter: (center) => {
    const newCenter: ServiceCenter = {
      ...center,
      id: `sc-${get().serviceCenters.length + 1}`,
      rating: 5.0,
      reviewsCount: 1
    };
    set({
      serviceCenters: [...get().serviceCenters, newCenter]
    });
    get().addManualNotification(
      'New Service Center Registered',
      `Service Center "${center.name}" is now online and available for bookings!`,
      'sync'
    );
  },

  deleteServiceCenter: (centerId) => {
    const center = get().serviceCenters.find(c => c.id === centerId);
    set({
      serviceCenters: get().serviceCenters.filter(c => c.id !== centerId)
    });
    get().addManualNotification(
      'Service Center De-registered',
      `Service Center "${center?.name || centerId}" has been removed from the WashDash network.`,
      'sync'
    );
  },

  updateWashServicePrice: (serviceId, priceCar, priceBike) => {
    set({
      washServices: get().washServices.map(srv => 
        srv.id === serviceId ? { ...srv, priceCar, priceBike } : srv
      )
    });
    get().addManualNotification(
      'Rates Updated',
      `Base service pricing changed to Car: $${priceCar}, Bike: $${priceBike}`,
      'sync'
    );
  },

  triggerSync: async () => {
    if (get().isSyncing || get().isOffline) return;
    
    set({ isSyncing: true, syncProgress: 10 });
    
    // Start step-by-step visual animation for the sync progress
    const steps = [25, 45, 70, 90, 100];
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 400));
      set({ syncProgress: step });
    }

    const currentBookings = [...get().bookings];
    const currentInvoices = [...get().invoices];
    const queue = [...get().offlineQueue];

    // Process all queued bookings
    const syncedBookings = queue.map(booking => ({
      ...booking,
      status: 'pending' as BookingStatus,
      synced: true,
      id: `booking-${Math.floor(Math.random() * 900000 + 100000)}` // Assign proper ID
    }));

    // Generate invoices for synced bookings
    const syncedInvoices = syncedBookings.map(bk => {
      const center = SERVICE_CENTERS.find(sc => sc.id === bk.serviceCenterId) || SERVICE_CENTERS[0];
      const service = WASH_SERVICES.find(ws => ws.id === bk.serviceId) || WASH_SERVICES[0];
      const baseVal = bk.vehicleType === 'car' ? service.priceCar : service.priceBike;
      const taxVal = Number((baseVal * 0.18).toFixed(2));
      const totalVal = baseVal + taxVal;

      return {
        id: bk.invoiceId,
        bookingId: bk.id,
        date: new Date().toISOString(),
        customerName: 'Krishna Raj',
        customerEmail: 'krishnaraj.webdev@gmail.com',
        vehicleModel: bk.vehicleModel,
        vehicleType: bk.vehicleType,
        serviceName: service.name,
        serviceCenterName: center.name,
        basePrice: baseVal,
        tax: taxVal,
        total: totalVal,
        paymentMethod: 'Credit Card (Synced)',
        status: 'paid' as const
      };
    });

    set({
      bookings: [...syncedBookings, ...currentBookings],
      invoices: [...syncedInvoices, ...currentInvoices],
      offlineQueue: [],
      isSyncing: false,
      syncProgress: 0
    });

    get().addManualNotification(
      'Offline Sync Completed',
      `Successfully uploaded ${syncedBookings.length} bookings queued during offline mode. Invoices issued!`,
      'sync'
    );
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  
  setActiveSection: (section) => set({ activeSection: section }),
  
  setSelectedCenter: (center) => set({ selectedCenter: center }),

  addBooking: (bookingData) => {
    const isOffline = get().isOffline;
    const bookingId = `temp-bk-${Math.floor(Math.random() * 1000000)}`;
    const invoiceId = `INV-${Math.floor(Math.random() * 9000 + 1000)}`;

    const newBooking: Booking = {
      ...bookingData,
      id: bookingId,
      invoiceId,
      status: isOffline ? 'pending' : 'pending', // Starts pending
      trackingStep: 0, // Checked In
      isOfflineCreated: isOffline,
      synced: !isOffline
    };

    if (isOffline) {
      set({
        offlineQueue: [newBooking, ...get().offlineQueue]
      });
      get().addManualNotification(
        'Booking Queued Offline',
        `Your slot for ${bookingData.vehicleModel} is saved. It will sync when connection restablishes.`,
        'booking'
      );
    } else {
      // Immediately issue invoice
      const center = SERVICE_CENTERS.find(sc => sc.id === bookingData.serviceCenterId) || SERVICE_CENTERS[0];
      const service = WASH_SERVICES.find(ws => ws.id === bookingData.serviceId) || WASH_SERVICES[0];
      const inclusiveTotal = bookingData.vehicleType === 'car' ? service.priceCar : service.priceBike;
      // GST is 18% (100% + 18% = 118% = 1.18)
      const baseVal = Number((inclusiveTotal / 1.18).toFixed(2));
      const taxVal = Number((inclusiveTotal - baseVal).toFixed(2));

      const newInvoice: Invoice = {
        id: invoiceId,
        bookingId: bookingId,
        date: new Date().toISOString(),
        customerName: 'Krishna Raj',
        customerEmail: 'krishnaraj.webdev@gmail.com',
        vehicleModel: bookingData.vehicleModel,
        vehicleType: bookingData.vehicleType,
        serviceName: service.name,
        serviceCenterName: center.name,
        basePrice: baseVal,
        tax: taxVal,
        total: inclusiveTotal,
        paymentMethod: 'Credit/Debit Card',
        status: 'paid'
      };

      set({
        bookings: [newBooking, ...get().bookings],
        invoices: [newInvoice, ...get().invoices]
      });

      get().addManualNotification(
        'Booking Placed Successfully!',
        `Your slot is confirmed for ${bookingData.date} at ${bookingData.timeSlot}. Invoice ${invoiceId} generated.`,
        'booking'
      );
    }
  },

  cancelBooking: (bookingId) => {
    const isQueued = get().offlineQueue.some(x => x.id === bookingId);
    if (isQueued) {
      set({
        offlineQueue: get().offlineQueue.filter(x => x.id !== bookingId)
      });
      get().addManualNotification('Offline Booking Cancelled', 'Queued book canceled prior to syncing', 'booking');
    } else {
      set({
        bookings: get().bookings.map(bk => 
          bk.id === bookingId ? { ...bk, status: 'cancelled' as BookingStatus } : bk
        )
      });
      get().addManualNotification('Booking Cancelled', 'Your wash appointment has been successfully cancelled.', 'booking');
    }
  },

  buySubscription: (planId) => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) return;

    set({ currentSubscription: planId });
    get().addManualNotification(
      'Subscription Activated!',
      `You are now enrolled in the ${plan.name} ($${plan.price}/mo). Enjoy your clean rides!`,
      'subscription'
    );
  },

  cancelSubscription: () => {
    set({ currentSubscription: null });
    get().addManualNotification(
      'Subscription Cancelled',
      'Your subscription has been deactivated. You will enjoy benefits till period end.',
      'subscription'
    );
  },

  markNotificationAsRead: (id) => set({
    notifications: get().notifications.map(n => n.id === id ? { ...n, read: true } : n)
  }),

  clearNotifications: () => set({ notifications: [] }),

  updateBookingStatus: (bookingId, status, trackingStep) => {
    set({
      bookings: get().bookings.map(bk => 
        bk.id === bookingId ? { ...bk, status, trackingStep } : bk
      )
    });
    get().addManualNotification(
      'Booking Status Updated',
      `Booking ${bookingId} status is now ${status}.`,
      'booking'
    );
  },

  addManualNotification: (title, description, type) => {
    const newNotif: PushNotification = {
      id: `notif-${Math.floor(Math.random() * 1000000)}`,
      title,
      description,
      timestamp: new Date().toISOString(),
      read: false,
      type
    };
    set({
      notifications: [newNotif, ...get().notifications]
    });
  },

  advanceActiveWashProgress: () => {
    // Looks for 'in_progress' or 'pending' active washes and advances them periodically
    let changed = false;
    const updatedBookings = get().bookings.map(bk => {
      if (bk.status === 'in_progress') {
        changed = true;
        const nextStep = bk.trackingStep + 1;
        if (nextStep >= TRACKING_STEPS.length) {
          // Wash completed!
          get().addManualNotification(
            'Your wash is completed! 🎉',
            `Tesla Model 3 wash at ${SERVICE_CENTERS[0].name} is fully ready for pickup. Keys are ready.`,
            'booking'
          );
          return {
            ...bk,
            status: 'completed' as BookingStatus,
            trackingStep: TRACKING_STEPS.length - 1
          };
        } else {
          // Advance step
          get().addManualNotification(
            `Wash Progress Update: ${TRACKING_STEPS[nextStep].name}`,
            `Status: ${TRACKING_STEPS[nextStep].desc}`,
            'booking'
          );
          return {
            ...bk,
            trackingStep: nextStep
          };
        }
      } else if (bk.status === 'pending') {
        // Upgrade from pending to in_progress to start the chain
        changed = true;
        get().addManualNotification(
          'Wash Commenced!',
          `Your vehicle keys were scanned. Detailing has officially started!`,
          'booking'
        );
        return {
          ...bk,
          status: 'in_progress' as BookingStatus,
          trackingStep: 0
        };
      }
      return bk;
    });

    if (changed) {
      set({ bookings: updatedBookings });
    }
  }
}));
