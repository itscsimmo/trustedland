"use client";

import { useEffect, useState } from "react";
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
  _count: {
    tasks: number;
    documents: number;
    bids: number;
  };
}

export default function BrowseProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();

      if (response.ok) {
        setProjects(data.projects || []);
      } else {
        setError(data.error || "Failed to load projects");
      }
    } catch (err) {
      setError("An error occurred while loading projects");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "Not specified";
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatStage = (stage: string) => {
    const stageMap: { [key: string]: string } = {
      STAGE_0: "Stage 0: Strategic Definition",
      STAGE_1: "Stage 1: Preparation & Brief",
      STAGE_2: "Stage 2: Concept Design",
      STAGE_3: "Stage 3: Spatial Coordination",
      STAGE_4: "Stage 4: Technical Design",
      STAGE_5: "Stage 5: Manufacturing & Construction",
      STAGE_6: "Stage 6: Handover & Close Out",
      STAGE_7: "Stage 7: In Use",
    };
    return stageMap[stage] || stage;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading projects...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Projects</h1>
        <p className="mt-2 text-gray-600">
          Explore development projects and submit applications
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
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
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No projects available
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Check back later for new development opportunities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {project.title}
                      </h2>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {formatStage(project.currentStage)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {project.developer.name}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/projects/${project.id}`}
                      className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 text-sm font-medium"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/dashboard/projects/${project.id}/apply`}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
                    >
                      Apply Now
                    </Link>
                  </div>
                </div>

                {project.description && (
                  <p className="mt-4 text-gray-700 line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {project.siteAddress && (
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {project.siteAddress}
                      </p>
                    </div>
                  )}
                  {project.localAuthority && (
                    <div>
                      <p className="text-xs text-gray-500">Local Authority</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {project.localAuthority}
                      </p>
                    </div>
                  )}
                  {project.unitsPlanned && (
                    <div>
                      <p className="text-xs text-gray-500">Units Planned</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {project.unitsPlanned}
                      </p>
                    </div>
                  )}
                  {project.budgetEstimate && (
                    <div>
                      <p className="text-xs text-gray-500">Budget Estimate</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {formatCurrency(project.budgetEstimate)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span>{project._count.documents} documents</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <span>{project._count.tasks} tasks</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
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
                    <span>{project._count.bids} applications</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
