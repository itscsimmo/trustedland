"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

// Profession icons mapping
const getProfessionIcon = (profession: string | null): string => {
  if (!profession) return "👤";

  const iconMap: { [key: string]: string } = {
    "Architect": "🏛️",
    "Landscape Architect": "🌳",
    "Interior Designer": "🛋️",
    "Urban Designer": "🏙️",
    "Planning Consultant": "📋",
    "Development Manager": "📊",
    "Project Manager": "📁",
    "Construction Manager": "👷",
    "Structural Engineer": "🏗️",
    "Civil Engineer": "🛣️",
    "MEP Engineer (Mechanical, Electrical, Plumbing)": "⚡",
    "Geotechnical Engineer": "⛏️",
    "Acoustic Consultant": "🔊",
    "Façade Engineer": "🏢",
    "Quantity Surveyor (QS)": "💷",
    "Building Surveyor": "📐",
    "Land Surveyor": "🗺️",
    "Sustainability Consultant": "♻️",
    "Energy Consultant": "💡",
    "Ecology Consultant": "🦋",
    "Arboricultural Consultant": "🌲",
    "Fire Safety Consultant / Fire Engineer": "🔥",
    "Transport Consultant": "🚗",
    "Daylight & Sunlight Consultant": "☀️",
    "Heritage Consultant": "🏰",
    "Archaeology Consultant": "🏺",
    "Construction Lawyer": "⚖️",
    "Planning Lawyer": "📜",
    "CDM (Construction Design & Management) Advisor": "🛡️",
    "Health & Safety Consultant": "⚕️",
  };

  return iconMap[profession] || "👤";
};

interface Professional {
  id: string;
  companyName: string | null;
  profession: string | null;
  bio: string | null;
  website: string | null;
  companyRegNo: string | null;
  establishedYear: number | null;
  numEmployees: string | null;
  turnoverRange: string | null;
  insuranceLevel: string | null;
  servicesOffered: string | null;
  accreditations: string | null;
  awards: string | null;
  ratingAverage: number;
  ratingCount: number;
  user: {
    fullName: string;
    email: string;
  };
  qualifications: Array<{
    id: string;
    title: string;
    authority: string | null;
    credentialId: string | null;
    issuedAt: string | null;
    expiresAt: string | null;
  }>;
  portfolio: Array<{
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    units: number | null;
    startDate: string | null;
    endDate: string | null;
    coverImageUrl: string | null;
  }>;
}

export default function ProfessionalProfilePage() {
  const params = useParams();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfessional();
  }, [params.professionalId]);

  const fetchProfessional = async () => {
    try {
      const response = await fetch(`/api/directory/${params.professionalId}`);
      const data = await response.json();

      if (response.ok) {
        setProfessional(data.professional);
      }
    } catch (err) {
      console.error("Error fetching professional:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Professional not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/dashboard/directory"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Directory
        </Link>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-lg shadow-xl p-8 mb-8 text-white">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">
              {professional.companyName || professional.user.fullName}
            </h1>
            {professional.companyName && (
              <p className="text-indigo-100 text-lg mb-3">
                {professional.user.fullName}
              </p>
            )}
            {professional.profession && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-800 rounded-full font-semibold text-lg">
                <span className="text-2xl">{getProfessionIcon(professional.profession)}</span>
                {professional.profession}
              </span>
            )}
          </div>
          {professional.ratingCount > 0 && (
            <div className="text-right bg-white bg-opacity-20 rounded-lg p-4">
              <div className="flex items-center mb-1">
                <svg
                  className="w-8 h-8 text-yellow-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="ml-2 text-3xl font-bold">
                  {professional.ratingAverage.toFixed(1)}
                </span>
              </div>
              <p className="text-indigo-100 text-sm">
                Based on {professional.ratingCount} reviews
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {professional.establishedYear && (
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <p className="text-indigo-100 text-sm">Established</p>
              <p className="text-2xl font-bold">{professional.establishedYear}</p>
            </div>
          )}
          {professional.numEmployees && (
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <p className="text-indigo-100 text-sm">Team Size</p>
              <p className="text-2xl font-bold">{professional.numEmployees}</p>
            </div>
          )}
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <p className="text-indigo-100 text-sm">Qualifications</p>
            <p className="text-2xl font-bold">{professional.qualifications.length}</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <p className="text-indigo-100 text-sm">Projects</p>
            <p className="text-2xl font-bold">{professional.portfolio.length}</p>
          </div>
        </div>
      </div>

      {/* TRUST & VERIFICATION SECTION - PROMINENT */}
      <div className="bg-white shadow-lg rounded-lg p-8 mb-8 border-4 border-green-500">
        <div className="flex items-center mb-6">
          <svg
            className="w-10 h-10 text-green-600 mr-3"
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
          <h2 className="text-3xl font-bold text-gray-900">
            Trust & Verification
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Professional Qualifications */}
          {professional.qualifications.length > 0 && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
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
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
                Professional Qualifications
              </h3>
              <div className="space-y-3">
                {professional.qualifications.map((qual) => (
                  <div
                    key={qual.id}
                    className="bg-white p-4 rounded-lg border border-green-300"
                  >
                    <p className="font-bold text-gray-900">{qual.title}</p>
                    {qual.authority && (
                      <p className="text-sm text-gray-700 mt-1">
                        Issued by: {qual.authority}
                      </p>
                    )}
                    {qual.credentialId && (
                      <p className="text-xs text-gray-600 mt-1">
                        Credential ID: {qual.credentialId}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accreditations & Approvals */}
          {professional.accreditations && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <svg
                  className="w-6 h-6 text-blue-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Accreditations & Approvals
              </h3>
              <div className="flex flex-wrap gap-3">
                {professional.accreditations.split(",").map((acc, idx) => (
                  <div
                    key={idx}
                    className="bg-white px-4 py-3 rounded-lg border-2 border-blue-300 font-semibold text-blue-900"
                  >
                    {acc.trim()}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insurance & Registration */}
          {(professional.insuranceLevel || professional.companyRegNo) && (
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <svg
                  className="w-6 h-6 text-purple-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Insurance & Registration
              </h3>
              <div className="space-y-3">
                {professional.insuranceLevel && (
                  <div className="bg-white p-3 rounded-lg border border-purple-300">
                    <p className="text-sm text-gray-600">
                      Professional Indemnity Insurance
                    </p>
                    <p className="font-bold text-gray-900 text-lg">
                      {professional.insuranceLevel}
                    </p>
                  </div>
                )}
                {professional.companyRegNo && (
                  <div className="bg-white p-3 rounded-lg border border-purple-300">
                    <p className="text-sm text-gray-600">Company Registration</p>
                    <p className="font-bold text-gray-900">
                      {professional.companyRegNo}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Awards & Recognition */}
          {professional.awards && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <svg
                  className="w-6 h-6 text-yellow-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
                Awards & Recognition
              </h3>
              <p className="text-gray-800 whitespace-pre-wrap">{professional.awards}</p>
            </div>
          )}
        </div>
      </div>

      {/* About Section */}
      {professional.bio && (
        <div className="bg-white shadow rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {professional.bio}
          </p>
        </div>
      )}

      {/* Company Information */}
      <div className="bg-white shadow rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Company Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professional.website && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Website</p>
              <a
                href={professional.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {professional.website}
              </a>
            </div>
          )}
          {professional.turnoverRange && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Annual Turnover</p>
              <p className="text-gray-900 font-medium">
                {professional.turnoverRange}
              </p>
            </div>
          )}
          {professional.servicesOffered && (
            <div className="md:col-span-2 lg:col-span-3">
              <p className="text-sm text-gray-600 mb-2">Services Offered</p>
              <p className="text-gray-900">{professional.servicesOffered}</p>
            </div>
          )}
        </div>
      </div>

      {/* PREVIOUS DEVELOPMENTS - CLEAR DISPLAY */}
      {professional.portfolio.length > 0 && (
        <div className="bg-white shadow rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <svg
              className="w-8 h-8 text-indigo-600 mr-3"
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
            Previous Development Projects ({professional.portfolio.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {professional.portfolio.map((project) => (
              <div
                key={project.id}
                className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-indigo-500 hover:shadow-lg transition-all"
              >
                {/* Project Image */}
                {project.coverImageUrl ? (
                  <img
                    src={project.coverImageUrl}
                    alt={project.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-48 flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {project.title}
                  </h3>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    {project.location && (
                      <div>
                        <p className="text-gray-600">Location</p>
                        <p className="font-semibold text-gray-900">
                          {project.location}
                        </p>
                      </div>
                    )}
                    {project.units && (
                      <div>
                        <p className="text-gray-600">Units</p>
                        <p className="font-semibold text-gray-900">
                          {project.units}
                        </p>
                      </div>
                    )}
                    {(project.startDate || project.endDate) && (
                      <div className="col-span-2">
                        <p className="text-gray-600">Timeline</p>
                        <p className="font-semibold text-gray-900">
                          {project.startDate &&
                            new Date(project.startDate).getFullYear()}
                          {project.startDate && project.endDate && " - "}
                          {project.endDate &&
                            new Date(project.endDate).getFullYear()}
                        </p>
                      </div>
                    )}
                  </div>

                  {project.description && (
                    <div className="border-t pt-4">
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Section */}
      <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Interested in Working Together?
        </h2>
        <p className="text-gray-700 mb-6">
          Get in touch to discuss your project requirements and how{" "}
          {professional.companyName || professional.user.fullName} can help.
        </p>
        <div className="flex gap-4">
          {professional.website && (
            <a
              href={professional.website}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
            >
              Visit Website
            </a>
          )}
          <a
            href={`mailto:${professional.user.email}`}
            className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 font-medium"
          >
            Send Email
          </a>
        </div>
      </div>
    </div>
  );
}
