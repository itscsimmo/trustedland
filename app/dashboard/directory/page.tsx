"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Professional {
  id: string;
  companyName: string | null;
  profession: string | null;
  bio: string | null;
  website: string | null;
  establishedYear: number | null;
  numEmployees: string | null;
  insuranceLevel: string | null;
  accreditations: string | null;
  awards: string | null;
  ratingAverage: number;
  ratingCount: number;
  user: {
    fullName: string;
  };
  qualifications: Array<{
    id: string;
    title: string;
    authority: string | null;
  }>;
  portfolio: Array<{
    id: string;
    title: string;
    location: string | null;
  }>;
}

// Profession icons mapping - similar to Approved Business category symbols
const getProfessionIcon = (profession: string | null): string => {
  if (!profession) return "👤";

  const iconMap: { [key: string]: string } = {
    // Architecture & Design
    "Architect": "🏛️",
    "Landscape Architect": "🌳",
    "Interior Designer": "🛋️",
    "Urban Designer": "🏙️",

    // Planning & Development
    "Planning Consultant": "📋",
    "Development Manager": "📊",
    "Project Manager": "📁",
    "Construction Manager": "👷",

    // Engineering
    "Structural Engineer": "🏗️",
    "Civil Engineer": "🛣️",
    "MEP Engineer (Mechanical, Electrical, Plumbing)": "⚡",
    "Geotechnical Engineer": "⛏️",
    "Acoustic Consultant": "🔊",
    "Façade Engineer": "🏢",

    // Surveying & Cost
    "Quantity Surveyor (QS)": "💷",
    "Building Surveyor": "📐",
    "Land Surveyor": "🗺️",

    // Environmental & Sustainability
    "Sustainability Consultant": "♻️",
    "Energy Consultant": "💡",
    "Ecology Consultant": "🦋",
    "Arboricultural Consultant": "🌲",

    // Specialist Consultants
    "Fire Safety Consultant / Fire Engineer": "🔥",
    "Transport Consultant": "🚗",
    "Daylight & Sunlight Consultant": "☀️",
    "Heritage Consultant": "🏰",
    "Archaeology Consultant": "🏺",

    // Legal & Compliance
    "Construction Lawyer": "⚖️",
    "Planning Lawyer": "📜",
    "CDM (Construction Design & Management) Advisor": "🛡️",
    "Health & Safety Consultant": "⚕️",
  };

  return iconMap[profession] || "👤";
};

export default function ProfessionalDirectoryPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfession, setSelectedProfession] = useState("");

  useEffect(() => {
    fetchProfessionals();
  }, []);

  useEffect(() => {
    filterProfessionals();
  }, [searchTerm, selectedProfession, professionals]);

  const fetchProfessionals = async () => {
    try {
      const response = await fetch("/api/directory");
      const data = await response.json();

      if (response.ok) {
        setProfessionals(data.professionals || []);
      }
    } catch (err) {
      console.error("Error fetching professionals:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterProfessionals = () => {
    let filtered = [...professionals];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by profession
    if (selectedProfession) {
      filtered = filtered.filter((p) => p.profession === selectedProfession);
    }

    setFilteredProfessionals(filtered);
  };

  const professions = Array.from(
    new Set(professionals.map((p) => p.profession).filter(Boolean))
  ).sort();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading professionals...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-10 bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-xl shadow-2xl p-8 text-white">
        <h1 className="text-5xl font-black mb-3">
          Professional Directory
        </h1>
        <p className="text-xl font-medium">
          Find verified, accredited construction professionals for your development projects
        </p>
        <p className="text-sm mt-2 opacity-90">
          Search the UK's leading property development platform
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-10 bg-white shadow-xl rounded-xl p-8 border-2 border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Search & Filter</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-lg font-bold text-gray-900 mb-3">
              Search Professionals
            </label>
            <input
              type="text"
              placeholder="Search by name, company, or keywords..."
              className="w-full px-5 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-lg font-bold text-gray-900 mb-3">
              Filter by Profession
            </label>
            <select
              className="w-full px-5 py-4 border-2 border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg font-medium"
              value={selectedProfession}
              onChange={(e) => setSelectedProfession(e.target.value)}
            >
              <option value="">All Professions</option>
              {professions.map((profession) => (
                <option key={profession} value={profession}>
                  {profession}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-lg font-bold text-gray-900">
            Showing {filteredProfessionals.length} of {professionals.length} professionals
          </p>
          {(searchTerm || selectedProfession) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedProfession("");
              }}
              className="px-6 py-3 text-lg bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Professional Cards */}
      {filteredProfessionals.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No professionals found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {filteredProfessionals.map((professional) => (
            <div
              key={professional.id}
              className="bg-white shadow-2xl rounded-xl overflow-hidden hover:shadow-3xl transition-all border-4 border-gray-100 hover:border-indigo-300"
            >
              <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h3 className="text-3xl font-black text-gray-900 mb-2">
                      {professional.companyName || professional.user.fullName}
                    </h3>
                    {professional.companyName && (
                      <p className="text-lg font-semibold text-gray-700 mb-3">
                        {professional.user.fullName}
                      </p>
                    )}
                    {professional.profession && (
                      <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-xl font-bold rounded-full shadow-lg">
                        <span className="text-2xl">{getProfessionIcon(professional.profession)}</span>
                        {professional.profession}
                      </span>
                    )}
                  </div>
                  {professional.ratingCount > 0 && (
                    <div className="text-right bg-yellow-50 border-4 border-yellow-400 rounded-xl p-4">
                      <div className="flex items-center mb-1">
                        <svg
                          className="w-8 h-8 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="ml-2 text-3xl font-black text-gray-900">
                          {professional.ratingAverage.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-gray-700">
                        {professional.ratingCount} reviews
                      </p>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {professional.bio && (
                  <p className="text-lg text-gray-800 mb-6 leading-relaxed font-medium line-clamp-3 bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-500">
                    {professional.bio}
                  </p>
                )}

                {/* Key Info - PROMINENT */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {professional.establishedYear && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                      <div className="flex items-center text-blue-700 mb-2">
                        <svg
                          className="w-6 h-6 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-xs font-bold uppercase">Established</span>
                      </div>
                      <p className="text-2xl font-black text-gray-900">{professional.establishedYear}</p>
                    </div>
                  )}
                  {professional.numEmployees && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                      <div className="flex items-center text-green-700 mb-2">
                        <svg
                          className="w-6 h-6 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        <span className="text-xs font-bold uppercase">Team Size</span>
                      </div>
                      <p className="text-2xl font-black text-gray-900">{professional.numEmployees}</p>
                    </div>
                  )}
                  {professional.qualifications.length > 0 && (
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                      <div className="flex items-center text-purple-700 mb-2">
                        <svg
                          className="w-6 h-6 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                          />
                        </svg>
                        <span className="text-xs font-bold uppercase">Qualifications</span>
                      </div>
                      <p className="text-2xl font-black text-gray-900">{professional.qualifications.length}</p>
                    </div>
                  )}
                  {professional.portfolio.length > 0 && (
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                      <div className="flex items-center text-orange-700 mb-2">
                        <svg
                          className="w-6 h-6 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        <span className="text-xs font-bold uppercase">Projects</span>
                      </div>
                      <p className="text-2xl font-black text-gray-900">{professional.portfolio.length}</p>
                    </div>
                  )}
                </div>

                {/* Accreditations - PROMINENT TRUST SIGNALS */}
                {professional.accreditations && (
                  <div className="mb-6 bg-green-50 border-2 border-green-300 rounded-lg p-5">
                    <div className="flex items-center mb-3">
                      <svg
                        className="w-6 h-6 text-green-600 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                      <p className="text-lg font-black text-green-900 uppercase">
                        Accreditations & Trust Signals
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {professional.accreditations.split(",").map((acc, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-4 py-2 bg-white border-2 border-green-400 text-green-900 text-base font-bold rounded-lg shadow-sm"
                        >
                          ✓ {acc.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Developments Preview */}
                {professional.portfolio.length > 0 && (
                  <div className="mb-6 bg-indigo-50 border-2 border-indigo-200 rounded-lg p-5">
                    <p className="text-lg font-black text-indigo-900 uppercase mb-3">
                      Recent Developments
                    </p>
                    <div className="space-y-2">
                      {professional.portfolio.slice(0, 3).map((project) => (
                        <div
                          key={project.id}
                          className="bg-white p-3 rounded-lg border border-indigo-300 flex justify-between items-center"
                        >
                          <div>
                            <p className="font-bold text-gray-900">{project.title}</p>
                            {project.location && (
                              <p className="text-sm text-gray-600">{project.location}</p>
                            )}
                          </div>
                        </div>
                      ))}
                      {professional.portfolio.length > 3 && (
                        <p className="text-sm text-indigo-700 font-semibold">
                          + {professional.portfolio.length - 3} more projects
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 mt-6 pt-6 border-t-4 border-gray-200">
                  <Link
                    href={`/dashboard/directory/${professional.id}`}
                    className="flex-1 text-center px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-lg rounded-xl hover:from-indigo-700 hover:to-indigo-800 font-bold transition-all shadow-lg hover:shadow-xl"
                  >
                    View Full Profile & Credentials
                  </Link>
                  {professional.website && (
                    <a
                      href={professional.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-4 border-4 border-indigo-600 text-indigo-600 text-lg rounded-xl hover:bg-indigo-50 font-bold transition-all"
                    >
                      Visit Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
