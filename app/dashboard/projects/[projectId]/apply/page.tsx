"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
  description: string | null;
  siteAddress: string | null;
  localAuthority: string | null;
  unitsPlanned: number | null;
  budgetEstimate: number | null;
  currentStage: string;
  developer: {
    name: string;
  };
}

interface Qualification {
  id: string;
  title: string;
  authority: string | null;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  units: number | null;
}

export default function ApplyToProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    proposalText: "",
    selectedQualifications: [] as string[],
    selectedPortfolio: [] as string[],
    feeProposal: "",
    methodology: "",
    timeline: "",
  });

  useEffect(() => {
    fetchProjectAndProfile();
  }, [projectId]);

  const fetchProjectAndProfile = async () => {
    try {
      // Fetch project details
      const projectRes = await fetch(`/api/projects?id=${projectId}`);
      const projectData = await projectRes.json();
      if (projectRes.ok && projectData.projects?.length > 0) {
        setProject(projectData.projects[0]);
      }

      // Fetch professional profile with qualifications and portfolio
      const profileRes = await fetch("/api/profile");
      const profileData = await profileRes.json();
      if (profileRes.ok && profileData.profile) {
        setQualifications(profileData.profile.qualifications || []);
        setPortfolio(profileData.profile.portfolio || []);
      }
    } catch (err) {
      setError("Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proposalText: formData.proposalText,
          feeProposal: formData.feeProposal,
          methodology: formData.methodology,
          timeline: formData.timeline,
          qualificationIds: formData.selectedQualifications,
          portfolioIds: formData.selectedPortfolio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to submit application");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/browse");
      }, 2000);
    } catch (err) {
      setError("An error occurred while submitting your application");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleQualification = (id: string) => {
    setFormData({
      ...formData,
      selectedQualifications: formData.selectedQualifications.includes(id)
        ? formData.selectedQualifications.filter((q) => q !== id)
        : [...formData.selectedQualifications, id],
    });
  };

  const togglePortfolio = (id: string) => {
    setFormData({
      ...formData,
      selectedPortfolio: formData.selectedPortfolio.includes(id)
        ? formData.selectedPortfolio.filter((p) => p !== id)
        : [...formData.selectedPortfolio, id],
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Project not found</p>
        <Link
          href="/dashboard/browse"
          className="mt-4 inline-block text-indigo-600 hover:text-indigo-700"
        >
          ← Back to Projects
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-green-50 rounded-lg p-8">
          <svg
            className="mx-auto h-16 w-16 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            Application Submitted Successfully!
          </h2>
          <p className="mt-2 text-gray-600">
            Your tender application has been sent to the developer. They will
            review your proposal and contact you.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Redirecting to browse projects...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link
          href="/dashboard/browse"
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          ← Back to Projects
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">
          Submit Tender Application
        </h1>
        <p className="mt-2 text-gray-600">
          Complete the form below to submit your application for this project
        </p>
      </div>

      {/* Project Summary */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-indigo-900">
          {project.title}
        </h2>
        <p className="mt-1 text-sm text-indigo-700">
          {project.developer.name}
        </p>
        {project.description && (
          <p className="mt-3 text-indigo-800">{project.description}</p>
        )}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          {project.siteAddress && (
            <div>
              <span className="text-indigo-600 font-medium">Location:</span>
              <span className="ml-2 text-indigo-900">{project.siteAddress}</span>
            </div>
          )}
          {project.unitsPlanned && (
            <div>
              <span className="text-indigo-600 font-medium">Units:</span>
              <span className="ml-2 text-indigo-900">{project.unitsPlanned}</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Cover Letter / Proposal */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Cover Letter & Proposal
          </h3>
          <textarea
            required
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={formData.proposalText}
            onChange={(e) =>
              setFormData({ ...formData, proposalText: e.target.value })
            }
            placeholder="Introduce yourself and explain why you're the right professional for this project. Highlight your relevant experience and approach..."
          />
          <p className="mt-2 text-sm text-gray-500">
            Tip: Mention specific experience relevant to this project type and location
          </p>
        </div>

        {/* Select Qualifications */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Professional Qualifications
          </h3>
          {qualifications.length > 0 ? (
            <div className="space-y-3">
              {qualifications.map((qual) => (
                <label
                  key={qual.id}
                  className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50"
                  style={{
                    borderColor: formData.selectedQualifications.includes(qual.id)
                      ? "#4F46E5"
                      : "#E5E7EB",
                    backgroundColor: formData.selectedQualifications.includes(qual.id)
                      ? "#EEF2FF"
                      : "white",
                  }}
                >
                  <input
                    type="checkbox"
                    className="mt-1 mr-3 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    checked={formData.selectedQualifications.includes(qual.id)}
                    onChange={() => toggleQualification(qual.id)}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{qual.title}</div>
                    {qual.authority && (
                      <div className="text-sm text-gray-600 mt-1">
                        {qual.authority}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-3">
                No qualifications added to your profile yet
              </p>
              <Link
                href="/dashboard/profile"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Add qualifications to your profile →
              </Link>
            </div>
          )}
        </div>

        {/* Select Portfolio Items */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Previous Developments & Portfolio
          </h3>
          {portfolio.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.map((item) => (
                <label
                  key={item.id}
                  className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50"
                  style={{
                    borderColor: formData.selectedPortfolio.includes(item.id)
                      ? "#4F46E5"
                      : "#E5E7EB",
                    backgroundColor: formData.selectedPortfolio.includes(item.id)
                      ? "#EEF2FF"
                      : "white",
                  }}
                >
                  <input
                    type="checkbox"
                    className="mt-1 mr-3 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    checked={formData.selectedPortfolio.includes(item.id)}
                    onChange={() => togglePortfolio(item.id)}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.title}</div>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="mt-2 flex gap-3 text-xs text-gray-500">
                      {item.location && <span>📍 {item.location}</span>}
                      {item.units && <span>{item.units} units</span>}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-3">
                No portfolio items added yet
              </p>
              <Link
                href="/dashboard/profile"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Add portfolio projects →
              </Link>
            </div>
          )}
        </div>

        {/* Fee Proposal */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Fee Proposal
          </h3>
          <textarea
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={formData.feeProposal}
            onChange={(e) =>
              setFormData({ ...formData, feeProposal: e.target.value })
            }
            placeholder="Provide your approximate fee structure. Example: £25,000 - £35,000 depending on scope, or 6% of construction costs..."
          />
          <p className="mt-2 text-sm text-gray-500">
            Note: This is an indicative fee only. Final fees will be negotiated.
          </p>
        </div>

        {/* Methodology */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Proposed Methodology & Approach
          </h3>
          <textarea
            required
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={formData.methodology}
            onChange={(e) =>
              setFormData({ ...formData, methodology: e.target.value })
            }
            placeholder="Describe how you would approach this project. Include your process, deliverables, and any unique value you bring..."
          />
        </div>

        {/* Timeline */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Proposed Timeline
          </h3>
          <textarea
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={formData.timeline}
            onChange={(e) =>
              setFormData({ ...formData, timeline: e.target.value })
            }
            placeholder="Outline your proposed timeline for this project. Example: Initial survey - 2 weeks, Design development - 6 weeks, Planning submission - 12 weeks..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Submitting Application..." : "Submit Tender Application"}
          </button>
          <Link
            href="/dashboard/browse"
            className="px-6 py-3 border-2 border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
