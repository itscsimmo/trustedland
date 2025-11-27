"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewProjectPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    siteAddress: "",
    localAuthority: "",
    unitsPlanned: "",
    budgetEstimate: "",
    currentStage: "STAGE_0",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const ribaStages = [
    { value: "STAGE_0", label: "Stage 0: Strategic Definition" },
    { value: "STAGE_1", label: "Stage 1: Preparation & Brief" },
    { value: "STAGE_2", label: "Stage 2: Concept Design" },
    { value: "STAGE_3", label: "Stage 3: Spatial Coordination" },
    { value: "STAGE_4", label: "Stage 4: Technical Design" },
    { value: "STAGE_5", label: "Stage 5: Manufacturing & Construction" },
    { value: "STAGE_6", label: "Stage 6: Handover & Close Out" },
    { value: "STAGE_7", label: "Stage 7: In Use" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || undefined,
          siteAddress: formData.siteAddress || undefined,
          localAuthority: formData.localAuthority || undefined,
          unitsPlanned: formData.unitsPlanned
            ? parseInt(formData.unitsPlanned)
            : undefined,
          budgetEstimate: formData.budgetEstimate
            ? parseInt(formData.budgetEstimate)
            : undefined,
          currentStage: formData.currentStage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create project");
        return;
      }

      router.push("/dashboard/projects");
    } catch (err) {
      setError("An error occurred while creating the project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/dashboard/projects"
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          ← Back to Projects
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">
          Create New Project
        </h1>
        <p className="mt-2 text-gray-600">
          Start a new property development project
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 max-w-3xl">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Project Title *
            </label>
            <input
              type="text"
              id="title"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div>
            <label
              htmlFor="siteAddress"
              className="block text-sm font-medium text-gray-700"
            >
              Site Address
            </label>
            <input
              type="text"
              id="siteAddress"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.siteAddress}
              onChange={(e) =>
                setFormData({ ...formData, siteAddress: e.target.value })
              }
            />
          </div>

          <div>
            <label
              htmlFor="localAuthority"
              className="block text-sm font-medium text-gray-700"
            >
              Local Authority
            </label>
            <input
              type="text"
              id="localAuthority"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g. London Borough of Camden"
              value={formData.localAuthority}
              onChange={(e) =>
                setFormData({ ...formData, localAuthority: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="unitsPlanned"
                className="block text-sm font-medium text-gray-700"
              >
                Units Planned
              </label>
              <input
                type="number"
                id="unitsPlanned"
                min="1"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.unitsPlanned}
                onChange={(e) =>
                  setFormData({ ...formData, unitsPlanned: e.target.value })
                }
              />
            </div>

            <div>
              <label
                htmlFor="budgetEstimate"
                className="block text-sm font-medium text-gray-700"
              >
                Budget Estimate (£)
              </label>
              <input
                type="number"
                id="budgetEstimate"
                min="1"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.budgetEstimate}
                onChange={(e) =>
                  setFormData({ ...formData, budgetEstimate: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="currentStage"
              className="block text-sm font-medium text-gray-700"
            >
              RIBA Stage
            </label>
            <select
              id="currentStage"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={formData.currentStage}
              onChange={(e) =>
                setFormData({ ...formData, currentStage: e.target.value })
              }
            >
              {ribaStages.map((stage) => (
                <option key={stage.value} value={stage.value}>
                  {stage.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Select the current RIBA stage of your project
            </p>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Link
              href="/dashboard/projects"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
