"use client";

import React from "react";

interface PublicTransitTabProps {
  airportCode?: string;
}

// Mock data for ICN (Incheon) - can be expanded for other airports
const TRANSIT_DATA: Record<string, {
  arex: Array<{
    destination: string;
    frequency: string;
    duration: string;
    price: string;
    operatingHours: string;
  }>;
  limousine: Array<{
    route: string;
    destinations: string;
    frequency: string;
    duration: string;
    price: string;
    operatingHours: string;
  }>;
}> = {
  ICN: {
    arex: [
      {
        destination: "Seoul Station (Direct Express)",
        frequency: "Every 30-40 min",
        duration: "43 min",
        price: "₩10,300 (~$8)",
        operatingHours: "05:20 - 22:40"
      },
      {
        destination: "Seoul Station (All-Stop)",
        frequency: "Every 12 min",
        duration: "59 min",
        price: "₩4,750 (~$4)",
        operatingHours: "05:18 - 23:48"
      },
      {
        destination: "Hongik University",
        frequency: "Every 12 min",
        duration: "51 min",
        price: "₩4,150 (~$3.50)",
        operatingHours: "05:18 - 23:48"
      }
    ],
    limousine: [
      {
        route: "6001",
        destinations: "Gangnam, COEX, Samsung",
        frequency: "Every 15-20 min",
        duration: "70-90 min",
        price: "₩16,000 (~$13)",
        operatingHours: "05:00 - 23:30"
      },
      {
        route: "6002",
        destinations: "Jamsil, Lotte World",
        frequency: "Every 20-30 min",
        duration: "60-80 min",
        price: "₩16,000 (~$13)",
        operatingHours: "05:30 - 22:30"
      },
      {
        route: "6015",
        destinations: "Myeongdong, City Hall, Dongdaemun",
        frequency: "Every 15-20 min",
        duration: "70-90 min",
        price: "₩16,000 (~$13)",
        operatingHours: "05:20 - 23:00"
      },
      {
        route: "6021",
        destinations: "Itaewon, Yongsan",
        frequency: "Every 25-35 min",
        duration: "80-100 min",
        price: "₩16,000 (~$13)",
        operatingHours: "06:00 - 22:00"
      }
    ]
  },
  NRT: {
    arex: [
      {
        destination: "Tokyo Station (Narita Express)",
        frequency: "Every 30-60 min",
        duration: "60 min",
        price: "¥3,070 (~$21)",
        operatingHours: "06:30 - 21:44"
      },
      {
        destination: "Shinjuku Station",
        frequency: "Every 30-60 min",
        duration: "85 min",
        price: "¥3,250 (~$22)",
        operatingHours: "07:43 - 21:23"
      }
    ],
    limousine: [
      {
        route: "Airport Limousine",
        destinations: "Major Tokyo Hotels",
        frequency: "Every 20-40 min",
        duration: "90-120 min",
        price: "¥3,200 (~$22)",
        operatingHours: "06:00 - 23:00"
      }
    ]
  }
};

export default function PublicTransitTab({ airportCode = "ICN" }: PublicTransitTabProps) {
  const transitData = TRANSIT_DATA[airportCode] || TRANSIT_DATA.ICN;

  return (
    <div className="space-y-6">
      {/* Airport Express Section */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Airport Express (AREX)</h3>
            <p className="text-sm text-gray-600">Fast rail connection to city center</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {transitData.arex.map((train, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">{train.destination}</h4>
                  <p className="mt-1 text-xs text-gray-500">{train.operatingHours}</p>
                </div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                  {train.price}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Frequency</p>
                  <p className="font-medium text-gray-900">{train.frequency}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="font-medium text-gray-900">{train.duration}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Airport Limousine Bus Section */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Airport Limousine Bus</h3>
            <p className="text-sm text-gray-600">Comfortable direct service to major districts</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {transitData.limousine.map((bus, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-green-600 px-2 py-0.5 text-xs font-bold text-white">
                      {bus.route}
                    </span>
                    <h4 className="font-semibold text-gray-900">{bus.destinations}</h4>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{bus.operatingHours}</p>
                </div>
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                  {bus.price}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Frequency</p>
                  <p className="font-medium text-gray-900">{bus.frequency}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="font-medium text-gray-900">{bus.duration}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex gap-3">
          <svg className="h-5 w-5 flex-shrink-0 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm">
            <p className="font-medium text-blue-900">Travel Tips</p>
            <p className="mt-1 text-blue-700">
              Purchase tickets at airport counters or use T-money/Suica cards for seamless travel. 
              Check real-time schedules on arrival for the most accurate departure times.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
