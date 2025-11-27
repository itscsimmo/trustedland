"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Project {
  id: string;
  title: string;
  description: string | null;
  siteAddress: string | null;
  currentStage: string;
  createdAt: string;
  _count: {
    tasks: number;
    documents: number;
    bids: number;
  };
}

export default function ProjectsPage() {
  const { data: session } = useSession();
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

      if (!response.ok) {
        setError(data.error || "Failed to fetch projects");
        return;
      }

      setProjects(data.projects || []);
    } catch (err) {
      setError("An error occurred while fetching projects");
    } finally {
      setLoading(false);
    }
  };

  const getRIBAStageLabel = (stage: string) => {
    const stages: Record<string, string> = {
      STAGE_0: "Stage 0: Strategic Definition",
      STAGE_1: "Stage 1: Preparation & Brief",
      STAGE_2: "Stage 2: Concept Design",
      STAGE_3: "Stage 3: Spatial Coordination",
      STAGE_4: "Stage 4: Technical Design",
      STAGE_5: "Stage 5: Manufacturing & Construction",
      STAGE_6: "Stage 6: Handover & Close Out",
      STAGE_7: "Stage 7: In Use",
    };
    return stages[stage] || stage;
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
          <p className="mt-2 text-gray-600">
            Manage your property development projects
          </p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
        >
          New Project
        </Link>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
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
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No projects yet
          </h3>
          <p className="mt-2 text-gray-600">
            Get started by creating your first project.
          </p>
          <Link
            href="/dashboard/projects/new"
            className="mt-4 inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
          >
            Create Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Link
                      href={`/dashboard/projects/${project.id}`}
                      className="text-xl font-semibold text-gray-900 hover:text-indigo-600"
                    >
                      {project.title}
                    </Link>
                    {project.siteAddress && (
                      <p className="text-sm text-gray-600 mt-1">
                        {project.siteAddress}
                      </p>
                    )}
                  </div>
                </div>

                {project.description && (
                  <p className="text-gray-700 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="mb-4">
                  <span className="inline-block px-3 py-1 text-sm font-medium text-indigo-800 bg-indigo-100 rounded-full">
                    {getRIBAStageLabel(project.currentStage)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-600 border-t pt-4">
                  <div className="flex gap-4">
                    <span>{project._count.tasks} tasks</span>
                    <span>{project._count.documents} docs</span>
                    <span>{project._count.bids} bids</span>
                  </div>
                  <span>
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
