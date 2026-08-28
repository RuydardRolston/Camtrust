/**
 * CamTrust - Finance Overview View (Screen 15)
 * Matches reference poster: SVG Donut Chart representation, total budget vs spent breakdown,
 * expense categories, and milestone payment log.
 */

import React from 'react';
import {
  DollarSign,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

export const FinanceView: React.FC = () => {
  const totalBudget = 250000;
  const spent = 162500;
  const remaining = totalBudget - spent;
  const spentPercent = Math.round((spent / totalBudget) * 100);
  const remainingPercent = 100 - spentPercent;
  const { convert } = useCurrency();

  const categories = [
    { name: 'Materials (Cement, Steel, Wood)', amount: 85000, percent: 52, color: 'bg-orange-500' },
    { name: 'Labor & Subcontractors', amount: 45000, percent: 28, color: 'bg-amber-500' },
    { name: 'Equipment Rental & Heavy Machinery', amount: 20000, percent: 12, color: 'bg-blue-500' },
    { name: 'Government Permits & Inspections', amount: 7500, percent: 5, color: 'bg-emerald-500' },
    { name: 'Contingency & Miscellaneous', amount: 5000, percent: 3, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="text-orange-500" size={22} />
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Finance Overview
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Track total project budget, verified contractor disbursements, and remaining capital.
          </p>
        </div>

        <button
          onClick={() => alert('Exporting financial report spreadsheet...')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm rounded-xl shadow-md transition"
        >
          <FileSpreadsheet size={16} />
          <span>Export Breakdown</span>
        </button>
      </div>

      {/* 2. Main Budget Gauge (Screen 15) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart & Overview */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative w-52 h-52 flex items-center justify-center">
            {/* SVG Donut Chart */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke="#e2e8f0"
                strokeWidth="14"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke="#f97316"
                strokeWidth="14"
                fill="transparent"
                strokeDasharray="238.7"
                strokeDashoffset={238.7 - (238.7 * spentPercent) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-gray-400 font-bold uppercase">Total Budget</span>
              <span className="text-2xl font-extrabold text-gray-900">{convert(totalBudget)}</span>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full mt-1">
                {spentPercent}% Spent
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-gray-100">
            <div className="p-3 bg-orange-50/80 rounded-xl border border-orange-100 text-left">
              <div className="text-[10px] font-bold text-orange-700 uppercase">Total Spent</div>
              <div className="text-base font-extrabold text-orange-600 mt-0.5">
                {convert(spent)}
              </div>
              <div className="text-[10px] text-orange-600/80 font-medium">({spentPercent}%)</div>
            </div>

            <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-100 text-left">
              <div className="text-[10px] font-bold text-emerald-700 uppercase">Remaining</div>
              <div className="text-base font-extrabold text-emerald-600 mt-0.5">
                {convert(remaining)}
              </div>
              <div className="text-[10px] text-emerald-600/80 font-medium">({remainingPercent}%)</div>
            </div>
          </div>

          <button
            onClick={() => alert('Generating detailed audit trail...')}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/20 transition"
          >
            View Detailed Report
          </button>
        </div>

        {/* Expense Category Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Expense Allocation by Category</h2>
            <p className="text-xs text-gray-500">Breakdown of all certified invoices and procurement costs</p>
          </div>

          <div className="space-y-4">
            {categories.map((c, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100 space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-bold text-gray-900">{c.name}</span>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">{convert(c.amount)}</span>
                    <span className="text-xs text-gray-400 ml-1.5">({c.percent}%)</span>
                  </div>
                </div>

                <div className="w-full bg-gray-200/80 h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${c.color} rounded-full`} style={{ width: `${c.percent}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Payment Milestone Log */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Recent Milestone Disbursements</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span className="font-semibold text-gray-800">Foundation Milestone Release</span>
                </div>
                <span className="font-bold text-emerald-700">{convert(35000)} • Paid 28 Apr 2025</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span className="font-semibold text-gray-800">Walls & Masonry Milestone Release</span>
                </div>
                <span className="font-bold text-emerald-700">{convert(42000)} • Paid 02 Jun 2025</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceView;
