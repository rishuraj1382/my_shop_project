// frontend/src/components/ui/StatCard.js
import React from 'react';

function StatCard({ label, value, icon, bg, color, iconColor }) {
  return (
    <div className={`${bg} rounded-2xl p-5 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
        <span className={`material-symbols-outlined text-2xl ${iconColor}`}>{icon}</span>
      </div>
      <div>
        <p className={`text-2xl font-headline font-extrabold ${color}`}>{value}</p>
        <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

export default StatCard;
