"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface ProfessionalProfile {
  id: string;
  companyName: string | null;
  bio: string | null;
  availabilityNote: string | null;
  ratingAverage: number;
  ratingCount: number;
  qualifications: Array<{
    id: string;
    title: string;
    authority: string | null;
  }>;
  portfolio: Array<{
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    units: number | null;
    coverImageUrl: string | null;
  }>;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    bio: "",
    availabilityNote: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Qualification form state
  const [showQualificationForm, setShowQualificationForm] = useState(false);
  const [qualificationData, setQualificationData] = useState({
    title: "",
    authority: "",
    credentialId: "",
  });

  // Portfolio form state
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [portfolioData, setPortfolioData] = useState({
    title: "",
    description: "",
    location: "",
    units: "",
    coverImageUrl: "",
  });
  const [selectedFileName, setSelectedFileName] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();

      if (response.ok && data.profile) {
        setProfile(data.profile);
        setFormData({
          companyName: data.profile.companyName || "",
          bio: data.profile.bio || "",
          availabilityNote: data.profile.availabilityNote || "",
        });
      }
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update profile");
        return;
      }

      setProfile(data.profile);
      setSuccess("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      setError("An error occurred while updating the profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAddQualification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/profile/qualifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(qualificationData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to add qualification");
        return;
      }

      setSuccess("Qualification added successfully!");
      setShowQualificationForm(false);
      setQualificationData({ title: "", authority: "", credentialId: "" });
      fetchProfile();
    } catch (err) {
      setError("An error occurred while adding qualification");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be less than 10MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    setSelectedFileName(file.name);

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPortfolioData({ ...portfolioData, coverImageUrl: base64String });
    };
    reader.readAsDataURL(file);
  };

  const handleAddPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/profile/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...portfolioData,
          units: portfolioData.units ? parseInt(portfolioData.units) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to add portfolio item");
        return;
      }

      setSuccess("Portfolio item added successfully!");
      setShowPortfolioForm(false);
      setPortfolioData({ title: "", description: "", location: "", units: "", coverImageUrl: "" });
      setSelectedFileName("");
      fetchProfile();
    } catch (err) {
      setError("An error occurred while adding portfolio item");
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-2 text-gray-600">
          Manage your professional profile and showcase your expertise
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Profile Information
              </h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    placeholder="Tell developers about your experience and expertise..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Availability
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.availabilityNote}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        availabilityNote: e.target.value,
                      })
                    }
                    placeholder="e.g., Available immediately, 2 weeks notice required"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setError("");
                      setSuccess("");
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p className="mt-1 text-gray-900">{session?.user?.name}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1 text-gray-900">{session?.user?.email}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Company
                  </h3>
                  <p className="mt-1 text-gray-900">
                    {profile?.companyName || "Not specified"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                  <p className="mt-1 text-gray-900">
                    {profile?.bio || "No bio added yet"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Availability
                  </h3>
                  <p className="mt-1 text-gray-900">
                    {profile?.availabilityNote || "Not specified"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Qualifications Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Qualifications
              </h2>
              {!showQualificationForm && (
                <button
                  onClick={() => setShowQualificationForm(true)}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Add Qualification
                </button>
              )}
            </div>

            {showQualificationForm && (
              <form onSubmit={handleAddQualification} className="mb-4 p-4 border border-indigo-200 rounded-lg bg-indigo-50">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Qualification Title *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={qualificationData.title}
                      onChange={(e) =>
                        setQualificationData({ ...qualificationData, title: e.target.value })
                      }
                      placeholder="e.g., ARB Registered Architect"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issuing Authority
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={qualificationData.authority}
                      onChange={(e) =>
                        setQualificationData({ ...qualificationData, authority: e.target.value })
                      }
                      placeholder="e.g., RIBA, RTPI, RICS"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Credential ID (Optional)
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={qualificationData.credentialId}
                      onChange={(e) =>
                        setQualificationData({ ...qualificationData, credentialId: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
                    >
                      Add Qualification
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowQualificationForm(false);
                        setQualificationData({ title: "", authority: "", credentialId: "" });
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}

            {profile?.qualifications && profile.qualifications.length > 0 ? (
              <div className="space-y-3">
                {profile.qualifications.map((qual) => (
                  <div
                    key={qual.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h3 className="font-medium text-gray-900">{qual.title}</h3>
                    {qual.authority && (
                      <p className="text-sm text-gray-600 mt-1">
                        {qual.authority}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              !showQualificationForm && (
                <p className="text-gray-600">
                  No qualifications added yet. Add your professional
                  qualifications to strengthen your applications.
                </p>
              )
            )}
          </div>

          {/* Portfolio Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Portfolio
              </h2>
              {!showPortfolioForm && (
                <button
                  onClick={() => setShowPortfolioForm(true)}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Add Project
                </button>
              )}
            </div>

            {showPortfolioForm && (
              <form onSubmit={handleAddPortfolio} className="mb-4 p-4 border border-indigo-200 rounded-lg bg-indigo-50">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Development Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={portfolioData.title}
                      onChange={(e) =>
                        setPortfolioData({ ...portfolioData, title: e.target.value })
                      }
                      placeholder="e.g., Riverside Apartments"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Development Images
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-400 transition-colors">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none px-2">
                            <span>Upload image</span>
                            <input
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleImageUpload}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        {selectedFileName && (
                          <p className="text-sm text-green-600 font-medium mt-2">✓ {selectedFileName}</p>
                        )}
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Note: Image upload functionality will store images for your development showcase
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={portfolioData.description}
                      onChange={(e) =>
                        setPortfolioData({ ...portfolioData, description: e.target.value })
                      }
                      placeholder="Brief description of the development and your role..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={portfolioData.location}
                        onChange={(e) =>
                          setPortfolioData({ ...portfolioData, location: e.target.value })
                        }
                        placeholder="e.g., London"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Units
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={portfolioData.units}
                        onChange={(e) =>
                          setPortfolioData({ ...portfolioData, units: e.target.value })
                        }
                        placeholder="e.g., 50"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
                    >
                      Add Development
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPortfolioForm(false);
                        setPortfolioData({ title: "", description: "", location: "", units: "" });
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}

            {profile?.portfolio && profile.portfolio.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.portfolio.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {item.coverImageUrl && (
                      <img
                        src={item.coverImageUrl}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 text-lg">{item.title}</h3>
                      {item.location && (
                        <p className="text-sm text-gray-500 mt-1">📍 {item.location}</p>
                      )}
                      {item.units && (
                        <p className="text-sm text-gray-500 mt-1">🏘️ {item.units} units</p>
                      )}
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !showPortfolioForm && (
                <p className="text-gray-600">
                  No portfolio items yet. Showcase your previous work to attract
                  developers.
                </p>
              )
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Profile Stats
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {profile?.ratingAverage.toFixed(1) || "N/A"}
                </p>
                <p className="text-xs text-gray-500">
                  {profile?.ratingCount || 0} reviews
                </p>
              </div>
              <div className="border-t pt-3">
                <p className="text-sm text-gray-600">Portfolio Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {profile?.portfolio?.length || 0}
                </p>
              </div>
              <div className="border-t pt-3">
                <p className="text-sm text-gray-600">Qualifications</p>
                <p className="text-2xl font-bold text-gray-900">
                  {profile?.qualifications?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-indigo-900 mb-2">
              Complete Your Profile
            </h3>
            <p className="text-sm text-indigo-700 mb-4">
              A complete profile helps developers understand your expertise and
              increases your chances of winning tenders.
            </p>
            <ul className="text-sm text-indigo-700 space-y-2">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                Add your bio and company info
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                List your qualifications
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                Showcase portfolio projects
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
