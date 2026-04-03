import React, { useState } from "react";

const BenefitCard = ({ icon, title, subtitle, tooltip }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="
        relative group flex-1
        flex items-center justify-center gap-3
        bg-white border border-gray-100
        rounded-2xl px-5 py-4
        shadow-card hover:shadow-card-hover
        hover:-translate-y-0.5
        transition-all duration-300
        cursor-pointer
      "
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Icon with subtle gold glow */}
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold-50 flex items-center justify-center group-hover:bg-gold-100 transition-premium">
        <img alt={title} loading="lazy" width="28" height="28" src={icon} />
      </div>
      <div className="flex flex-col">
        <span className="text-brand-dark font-bold text-sm sm:text-base leading-tight">
          {title}
        </span>
        {subtitle && (
          <span className="text-gold-600 font-medium text-xs sm:text-sm">
            {subtitle}
          </span>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-max max-w-[300px] bg-white border border-gray-100 shadow-card-hover rounded-xl p-4 z-50 text-sm text-gray-600 leading-relaxed animate-fade-in-up">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45" />
          {tooltip}
        </div>
      )}
    </div>
  );
};

export default BenefitCard;
