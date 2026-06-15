'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { 
  X, Printer, Download, Car, Bike, Check, 
  MapPin, ShieldCheck, Mail, Calendar, CreditCard, AlertCircle 
} from 'lucide-react';
import { Invoice, useAppStore } from '@/lib/store';

interface InvoiceModalProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
}

export default function InvoiceModal({ invoice, isOpen, onClose }: InvoiceModalProps) {
  const { addManualNotification } = useAppStore();
  const [downloading, setDownloading] = React.useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    // Print dialog triggered directly!
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleDownloadPdf = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      addManualNotification(
        'Invoice Downloaded',
        `Invoice ${invoice.id} has been compiled into PDF and downloaded to your disk!`,
        'reminder'
      );
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
        id="invoice-modal-content"
      >
        {/* Modal Toolbar */}
        <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Automated Billing Vault</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              aria-label="Print Invoice"
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownloadPdf}
              aria-label="Download Invoice PDF"
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors flex items-center gap-1 text-xs"
            >
              {downloading ? (
                <span className="w-3.5 h-3.5 border-2 border-white/35 border-t-white rounded-full animate-spin"></span>
              ) : (
                <Download className="w-4 h-4" />
              )}
            </button>
            <div className="w-px h-5 bg-slate-800 mx-1"></div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Invoice Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 print:bg-white" id="invoice-print-area">
          {/* Header Brand */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white text-xs">WD</div>
                <span className="font-black text-lg text-slate-900 tracking-tight">WashDash <span className="text-blue-600 font-normal">SaaS</span></span>
              </div>
              <p className="text-[10px] text-slate-400">NextGen Vehicle Detailing Systems</p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full ${
                invoice.id.startsWith('temp') 
                  ? 'bg-amber-100 text-amber-800' 
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                <Check className="w-3 h-3 text-emerald-600" />
                {invoice.id.startsWith('temp') ? 'PENDING SYNC' : 'PAID & SECURED'}
              </span>
              <p className="text-xs text-slate-400 font-mono mt-1 pt-1 font-bold">{invoice.id}</p>
            </div>
          </div>

          <div className="h-px bg-slate-200"></div>

          {/* Addresses Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <h5 className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Service Facility</h5>
              <p className="text-xs font-bold text-slate-800">{invoice.serviceCenterName}</p>
              <p className="text-[11px] text-slate-500 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>Downtown District HQ, Ward 4</span>
              </p>
              <p className="text-[10px] text-slate-400 font-mono">GSTIN: 29AABCW1493A1ZX</p>
            </div>

            <div className="space-y-1 text-right">
              <h5 className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Billed To Client</h5>
              <p className="text-xs font-bold text-slate-800">{invoice.customerName}</p>
              <p className="text-[11px] text-slate-500 flex items-center justify-end gap-1">
                <Mail className="w-3 h-3 text-slate-400" />
                <span>{invoice.customerEmail}</span>
              </p>
              <p className="text-[11px] text-slate-400 font-normal">Account Member #60184</p>
            </div>
          </div>

          {/* Details Row */}
          <div className="bg-slate-100/70 rounded-2xl p-4 grid grid-cols-3 gap-2 text-center border border-slate-200/50">
            <div className="text-left">
              <h6 className="text-[10px] uppercase font-bold text-slate-400">Invoice Date</h6>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">
                {new Date(invoice.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div>
              <h6 className="text-[10px] uppercase font-bold text-slate-400">Payment Vehicle</h6>
              <p className="text-xs font-semibold text-slate-700 mt-0.5 flex items-center justify-center gap-1">
                <CreditCard className="w-3 h-3 text-slate-500" />
                <span>{invoice.paymentMethod}</span>
              </p>
            </div>
            <div className="text-right">
              <h6 className="text-[10px] uppercase font-bold text-slate-400">Vehicle Registered</h6>
              <p className="text-xs font-semibold text-slate-700 mt-0.5 flex items-center justify-end gap-1 capitalize">
                {invoice.vehicleType === 'car' ? <Car className="w-3.5 h-3.5" /> : <Bike className="w-3.5 h-3.5" />}
                <span>{invoice.vehicleModel}</span>
              </p>
            </div>
          </div>

          {/* Invoice Table */}
          <div className="space-y-2">
            <h5 className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Itemized Ledger</h5>
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <th className="px-4 py-2.5 text-left">Description</th>
                    <th className="px-4 py-2.5 text-center">Unit</th>
                    <th className="px-4 py-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="text-slate-700">
                    <td className="px-4 py-3">
                      <div className="font-bold">{invoice.serviceName}</div>
                      <div className="text-[10px] text-slate-400">Professional ride cleaning service, bio-shampoos & wax finish.</div>
                    </td>
                    <td className="px-4 py-3 text-center">1</td>
                    <td className="px-4 py-3 text-right font-bold">${invoice.basePrice.toFixed(2)}</td>
                  </tr>
                  {/* Tax components */}
                  <tr className="text-slate-500 font-medium">
                    <td className="px-4 py-1.5 text-right font-semibold" colSpan={2}>CGST (9%)</td>
                    <td className="px-4 py-1.5 text-right font-mono">${(invoice.tax / 2).toFixed(2)}</td>
                  </tr>
                  <tr className="text-slate-500 font-medium">
                    <td className="px-4 py-1.5 text-right font-semibold" colSpan={2}>SGST (9%)</td>
                    <td className="px-4 py-1.5 text-right font-mono">${(invoice.tax / 2).toFixed(2)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900 text-white font-black">
                    <td className="px-4 py-3 text-left" colSpan={2}>Gross Net Payable</td>
                    <td className="px-4 py-3 text-right font-mono text-base">${invoice.total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Bottom Security Note */}
          <div className="bg-blue-50/50 p-4 border border-blue-100 rounded-2xl flex items-start gap-2 text-xs text-blue-800 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Automated Sync & Security Assurance</p>
              <p className="text-[11px] text-blue-600/90 mt-0.5 font-normal">
                This receipt was compiled automatically by the WashDash billing engine. Transactions are registered on the secure cloud layer. In offline mode, the signature token confirms local cache integrity.
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="w-full py-3 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={handleDownloadPdf}
            className="w-full py-3 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center gap-1.5"
          >
            {downloading ? 'Compiling PDF...' : 'Download Invoice'}
            <Download className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
