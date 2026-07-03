"use client";
import React from "react";

interface TicketCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "result";
}

export default function TicketCard({ children, className = "", variant = "default" }: TicketCardProps) {
  if (variant === "result") {
    return (
      <div className={`relative ${className}`}>
        {/* Ticket shape with perforated edges */}
        <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          {/* Left perforation circles */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-[#F4F7FC] rounded-full border-2 border-gray-200" />
          
          {/* Right perforation circles */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 bg-[#F4F7FC] rounded-full border-2 border-gray-200" />
          
          {/* Dashed line in the middle */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-gray-300" />
          
          {/* Content */}
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Default search form ticket style
  return (
    <div className={`relative ${className}`}>
      {/* Main ticket body */}
      <div className="relative bg-white rounded-[34px] shadow-2xl overflow-hidden border-2 border-blue-100">
        {/* Top perforation line */}
        <div className="absolute top-0 left-0 right-0 flex justify-between px-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="w-1 h-3 bg-[#F4F7FC] rounded-b-full" />
          ))}
        </div>
        
        {/* Bottom perforation line */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="w-1 h-3 bg-[#F4F7FC] rounded-t-full" />
          ))}
        </div>
        
        {/* Content */}
        <div className="relative z-10 pt-4 pb-4">
          {children}
        </div>
      </div>
    </div>
  );
}
