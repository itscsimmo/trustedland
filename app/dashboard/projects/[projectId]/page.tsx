"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Professional {
  id: string;
  companyName: string | null;
  profession: string | null;
  user: {
    fullName: string;
  };
}

interface ProjectProfessional {
  id: string;
  roleDescription: string | null;
  appointedAt: string | null;
  professional: Professional;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  siteAddress: string | null;
  currentStage: string;
  developer: {
    id: string;
    name: string;
  };
  professionals: ProjectProfessional[];
  _count: {
    bids: number;
  };
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNominateForm, setShowNominateForm] = useState(false);
  const [availableProfessionals, setAvailableProfessionals] = useState<Professional[]>([]);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState("");
  const [roleDescription, setRoleDescription] = useState("Lead Developer");

  useEffect(() => {
    fetchProject();
    fetchAvailableProfessionals();
  }, [params.projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.projectId}`);
      const data = await response.json();

      if (response.ok) {
        setProject(data.project);
      } else if (response.status === 403) {
        alert("You don't have permission to view this project");
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Error fetching project:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableProfessionals = async () => {
    try {
      const response = await fetch("/api/directory");
      const data = await response.json();

      if (response.ok) {
        setAvailableProfessionals(data.professionals || []);
      }
    } catch (err) {
      console.error("Error fetching professionals:", err);
    }
  };

  const handleNominateProfessional = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProfessionalId) {
      alert("Please select a professional");
      return;
    }

    try {
      const response = await fetch(`/api/projects/${params.projectId}/nominate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalId: selectedProfessionalId,
          roleDescription,
        }),
      });

      if (response.ok) {
        alert("Professional nominated successfully");
        setShowNominateForm(false);
        setSelectedProfessionalId("");
        setRoleDescription("Lead Developer");
        fetchProject();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to nominate professional");
      }
    } catch (err) {
      console.error("Error nominating professional:", err);
      alert("An error occurred");
    }
  };

  const handleRemoveProfessional = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to remove this professional from the project?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/projects/${params.projectId}/nominate/${assignmentId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("Professional removed successfully");
        fetchProject();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to remove professional");
      }
    } catch (err) {
      console.error("Error removing professional:", err);
      alert("An error occurred");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Project not found</h2>
      </div>
    );
  }

  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === "ADMIN";
  const canManage = isAdmin;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-8 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{project.title}</h1>
            <p className="text-lg text-gray-600">{project.developer.name}</p>
          </div>
          <span className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full font-semibold">
            {project.currentStage}
          </span>
        </div>

        {project.description && <p className="text-gray-700 mb-4">{project.description}</p>}

        {project.siteAddress && (
          <div className="flex items-center text-gray-600">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {project.siteAddress}
          </div>
        )}

        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-gray-600">
            <strong>{project._count.bids}</strong> applications received
          </p>
        </div>
      </div>

      {canManage && (
        <div className="bg-yellow-50 border-4 border-yellow-400 rounded-xl p-8 mb-8">
          <div className="flex items-center mb-6">
            <svg className="w-8 h-8 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div>
              <h2 className="text-2xl font-black text-gray-900">PRIVATE: Nominated Lead Professionals</h2>
              <p className="text-sm font-semibold text-yellow-800">
                This information is only visible to you and TrustedLand administrators
              </p>
            </div>
          </div>

          {project.professionals.length > 0 && (
            <div className="mb-6 space-y-4">
              {project.professionals.map((assignment) => (
                <div key={assignment.id} className="bg-white border-2 border-gray-300 rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">
                        {assignment.professional.companyName || assignment.professional.user.fullName}
                      </h3>
                      {assignment.professional.profession && (
                        <p className="text-gray-600 mt-1">{assignment.professional.profession}</p>
                      )}
                      {assignment.roleDescription && (
                        <span className="inline-block mt-2 px-4 py-2 bg-indigo-600 text-white rounded-full font-bold">
                          {assignment.roleDescription}
                        </span>
                      )}
                      {assignment.appointedAt && (
                        <p className="text-sm text-gray-500 mt-2">
                          Appointed: {new Date(assignment.appointedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Link
                        href={`/dashboard/directory/${assignment.professional.id}`}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                      >
                        View Profile
                      </Link>
                      <button
                        onClick={() => handleRemoveProfessional(assignment.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!showNominateForm && (
            <button
              onClick={() => setShowNominateForm(true)}
              className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-lg rounded-xl hover:from-indigo-700 hover:to-indigo-800 font-bold transition-all shadow-lg"
            >
              + Nominate Lead Professional
            </button>
          )}

          {showNominateForm && (
            <form onSubmit={handleNominateProfessional} className="bg-white border-2 border-indigo-300 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Nominate a Professional</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Select Professional *</label>
                  <select
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    value={selectedProfessionalId}
                    onChange={(e) => setSelectedProfessionalId(e.target.value)}
                  >
                    <option value="">Choose a professional...</option>
                    {availableProfessionals.map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.companyName || prof.user.fullName}{prof.profession && ` - ${prof.profession}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Role/Title *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    placeholder="e.g., Lead Developer, Project Architect, etc."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold">
                  Nominate Professional
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNominateForm(false);
                    setSelectedProfessionalId("");
                    setRoleDescription("Lead Developer");
                  }}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Applications & Bids</h2>
        <p className="text-gray-600">
          {project._count.bids > 0
            ? `${project._count.bids} professional(s) have submitted applications for this project.`
            : "No applications received yet."}
        </p>
      </div>
    </div>
  );
}
