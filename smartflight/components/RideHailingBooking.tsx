"use client";

import React, { useState } from "react";

interface RideHailingBookingProps {
  airportCode?: string;
}

// Mock ride-hailing data for different airports
const RIDE_SERVICES: Record<string, Array<{
  provider: string;
  logo: string;
  vehicleTypes: Array<{
    name: string;
    capacity: string;
    estimatedPrice: string;
    estimatedTime: string;
    features: string[];
  }>;
  bookingUrl: string;
}>> = {
  ICN: [
    {
      provider: "Kakao T",
      logo: "🚕",
      vehicleTypes: [
        {
          name: "Standard Taxi",
          capacity: "1-4 passengers",
          estimatedPrice: "₩65,000-85,000 (~$50-65)",
          estimatedTime: "50-70 min to Seoul",
          features: ["Fixed rate", "Meter-based", "Credit card accepted"]
        },
        {
          name: "Deluxe Taxi",
          capacity: "1-4 passengers",
          estimatedPrice: "₩95,000-120,000 (~$75-95)",
          estimatedTime: "50-70 min to Seoul",
          features: ["Larger vehicle", "English-speaking driver", "Premium service"]
        },
        {
          name: "Jumbo Taxi",
          capacity: "5-8 passengers",
          estimatedPrice: "₩120,000-150,000 (~$95-120)",
          estimatedTime: "50-70 min to Seoul",
          features: ["Large luggage space", "Group travel", "Fixed rate"]
        }
      ],
      bookingUrl: "https://t.kakao.com"
    },
    {
      provider: "Uber",
      logo: "🚗",
      vehicleTypes: [
        {
          name: "UberX",
          capacity: "1-4 passengers",
          estimatedPrice: "₩70,000-90,000 (~$55-70)",
          estimatedTime: "50-70 min to Seoul",
          features: ["App-based booking", "Upfront pricing", "Cashless payment"]
        },
        {
          name: "Uber Black",
          capacity: "1-4 passengers",
          estimatedPrice: "₩130,000-160,000 (~$100-125)",
          estimatedTime: "50-70 min to Seoul",
          features: ["Premium vehicles", "Professional drivers", "Business travel"]
        }
      ],
      bookingUrl: "https://uber.com"
    }
  ],
  NRT: [
    {
      provider: "JapanTaxi",
      logo: "🚕",
      vehicleTypes: [
        {
          name: "Standard Taxi",
          capacity: "1-4 passengers",
          estimatedPrice: "¥20,000-25,000 (~$140-175)",
          estimatedTime: "60-90 min to Tokyo",
          features: ["Fixed rate available", "Credit card accepted", "English support"]
        },
        {
          name: "Large Taxi",
          capacity: "5-9 passengers",
          estimatedPrice: "¥30,000-40,000 (~$210-280)",
          estimatedTime: "60-90 min to Tokyo",
          features: ["Extra luggage space", "Group friendly", "Fixed rate"]
        }
      ],
      bookingUrl: "https://japantaxi.jp"
    },
    {
      provider: "Uber",
      logo: "🚗",
      vehicleTypes: [
        {
          name: "Uber Premium",
          capacity: "1-4 passengers",
          estimatedPrice: "¥22,000-28,000 (~$155-195)",
          estimatedTime: "60-90 min to Tokyo",
          features: ["App-based", "Upfront pricing", "English interface"]
        }
      ],
      bookingUrl: "https://uber.com"
    }
  ]
};

export default function RideHailingBooking({ airportCode = "ICN" }: RideHailingBookingProps) {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const services = RIDE_SERVICES[airportCode] || RIDE_SERVICES.ICN;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-purple-600 text-2xl">
            🚖
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Fixed-Rate Taxi Booking</h3>
            <p className="mt-1 text-sm text-gray-600">
              Book anti-fraud, fixed-rate rides directly from the airport. No surge pricing, no surprises.
            </p>
          </div>
        </div>
      </div>

      {/* Service Providers */}
      <div className="space-y-4">
        {services.map((service, idx) => (
          <div key={idx} className="rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Provider Header */}
            <button
              onClick={() => setSelectedProvider(selectedProvider === service.provider ? null : service.provider)}
              className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{service.logo}</span>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{service.provider}</h4>
                  <p className="text-sm text-gray-500">{service.vehicleTypes.length} vehicle options</p>
                </div>
              </div>
              <svg
                className={`h-6 w-6 text-gray-400 transition-transform ${
                  selectedProvider === service.provider ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Vehicle Types (Expanded) */}
            {selectedProvider === service.provider && (
              <div className="border-t border-gray-200 p-5">
                <div className="space-y-4">
                  {service.vehicleTypes.map((vehicle, vIdx) => (
                    <div
                      key={vIdx}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <h5 className="font-semibold text-gray-900">{vehicle.name}</h5>
                          <p className="mt-1 text-sm text-gray-600">{vehicle.capacity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-purple-600">{vehicle.estimatedPrice}</p>
                          <p className="text-xs text-gray-500">{vehicle.estimatedTime}</p>
                        </div>
                      </div>
                      <div className="mb-4 flex flex-wrap gap-2">
                        {vehicle.features.map((feature, fIdx) => (
                          <span
                            key={fIdx}
                            className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm"
                          >
                            ✓ {feature}
                          </span>
                        ))}
                      </div>
                      <a
                        href={service.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full rounded-lg bg-purple-600 py-3 text-center font-semibold text-white transition-colors hover:bg-purple-700"
                      >
                        Book {vehicle.name} Now →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Anti-Fraud Notice */}
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <div className="flex gap-3">
          <svg className="h-5 w-5 flex-shrink-0 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div className="text-sm">
            <p className="font-medium text-green-900">Anti-Fraud Protection</p>
            <p className="mt-1 text-green-700">
              All listed services offer fixed rates or upfront pricing. Book through official apps to avoid unlicensed taxis and price gouging at the airport.
            </p>
          </div>
        </div>
      </div>

      {/* Affiliate Revenue Notice */}
      <div className="rounded-lg bg-gray-100 p-3 text-center text-xs text-gray-600">
        💼 Tern may earn affiliate commissions from bookings. This helps us keep the service free for travelers.
      </div>
    </div>
  );
}
