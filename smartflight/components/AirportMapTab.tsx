"use client";

import React from "react";

interface AirportMapTabProps {
  airportCode?: string;
}

// Mock 3D map data for airports
const AIRPORT_MAP_DATA: Record<string, {
  name: string;
  terminals: Array<{
    name: string;
    gates: string;
    facilities: string[];
  }>;
  transitConnections: Array<{
    type: string;
    location: string;
    walkTime: string;
  }>;
}> = {
  ICN: {
    name: "Incheon International Airport",
    terminals: [
      {
        name: "Terminal 1",
        gates: "Gates 1-50",
        facilities: ["Duty Free", "Restaurants", "Lounges", "Prayer Room", "Sleeping Pods"]
      },
      {
        name: "Terminal 2",
        gates: "Gates 101-132",
        facilities: ["Duty Free", "Korean Culture Center", "Spa", "Transit Hotel", "Restaurants"]
      }
    ],
    transitConnections: [
      {
        type: "AREX (Airport Railroad)",
        location: "B1 Floor, Terminal 1 & 2",
        walkTime: "5-8 min from baggage claim"
      },
      {
        type: "Airport Limousine Bus",
        location: "1F Exit 4-13 (T1), 1F Exit 1-4 (T2)",
        walkTime: "2-5 min from baggage claim"
      },
      {
        type: "Taxi Stand",
        location: "1F Exit 4-8 (T1), 1F Exit 1-2 (T2)",
        walkTime: "3-5 min from baggage claim"
      }
    ]
  },
  NRT: {
    name: "Narita International Airport",
    terminals: [
      {
        name: "Terminal 1",
        gates: "Gates 11-58",
        facilities: ["Duty Free", "Restaurants", "Shower Rooms", "Observation Deck"]
      },
      {
        name: "Terminal 2",
        gates: "Gates 60-99",
        facilities: ["Duty Free", "Japanese Culture Zone", "Restaurants", "Rest Areas"]
      }
    ],
    transitConnections: [
      {
        type: "Narita Express (N'EX)",
        location: "B1 Floor, Terminal 1 & 2",
        walkTime: "5-10 min from baggage claim"
      },
      {
        type: "Airport Limousine Bus",
        location: "1F Bus Terminal",
        walkTime: "3-7 min from baggage claim"
      },
      {
        type: "Taxi Stand",
        location: "1F Arrival Lobby",
        walkTime: "2-4 min from baggage claim"
      }
    ]
  }
};

export default function AirportMapTab({ airportCode = "ICN" }: AirportMapTabProps) {
  const airportData = AIRPORT_MAP_DATA[airportCode] || AIRPORT_MAP_DATA.ICN;

  return (
    <div className="space-y-6">
      {/* Airport Overview */}
      <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <h3 className="mb-2 text-xl font-bold text-gray-900">{airportData.name}</h3>
        <p className="text-sm text-gray-600">
          Interactive airport navigation to help you find ground transportation quickly after landing.
        </p>
      </div>

      {/* 3D Map Placeholder */}
      <div className="relative overflow-hidden rounded-xl border border-gray-300 bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <p className="mt-3 text-sm font-medium text-gray-600">3D Airport Map</p>
            <p className="mt-1 text-xs text-gray-500">
              Integration with Mapbox SDK for interactive terminal navigation
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/20 to-transparent p-4">
          <p className="text-xs text-gray-700">
            📍 Tap terminals and transit points for detailed directions
          </p>
        </div>
      </div>

      {/* Terminal Information */}
      <div>
        <h4 className="mb-3 text-lg font-bold text-gray-900">Terminal Guide</h4>
        <div className="grid gap-4 md:grid-cols-2">
          {airportData.terminals.map((terminal, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <h5 className="mb-2 font-semibold text-gray-900">{terminal.name}</h5>
              <p className="mb-3 text-sm text-gray-600">{terminal.gates}</p>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500">Key Facilities:</p>
                <div className="flex flex-wrap gap-1">
                  {terminal.facilities.map((facility, fIdx) => (
                    <span
                      key={fIdx}
                      className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transit Connections */}
      <div>
        <h4 className="mb-3 text-lg font-bold text-gray-900">Ground Transportation Access</h4>
        <div className="space-y-3">
          {airportData.transitConnections.map((connection, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-gray-900">{connection.type}</h5>
                <p className="mt-1 text-sm text-gray-600">{connection.location}</p>
                <div className="mt-2 flex items-center gap-2">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs text-gray-500">Walking time: {connection.walkTime}</span>
                </div>
              </div>
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                Navigate
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Pro Tips */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex gap-3">
          <svg className="h-5 w-5 flex-shrink-0 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
          <div className="text-sm">
            <p className="font-medium text-amber-900">Pro Tip</p>
            <p className="mt-1 text-amber-700">
              Follow the color-coded signs after baggage claim. Most ground transportation is on the 1st floor (Arrivals level).
              Download offline maps before your flight for backup navigation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
