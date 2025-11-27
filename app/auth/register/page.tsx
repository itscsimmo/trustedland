"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    role: "DEVELOPER" as "DEVELOPER" | "PROFESSIONAL",
    orgName: "",
    companyName: "",
    profession: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          role: formData.role,
          ...(formData.role === "DEVELOPER" && formData.orgName
            ? { orgName: formData.orgName }
            : {}),
          ...(formData.role === "PROFESSIONAL"
            ? {
                companyName: formData.companyName || undefined,
                profession: formData.profession,
              }
            : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      // Redirect to login after successful registration
      router.push("/auth/login?registered=true");
    } catch (err) {
      setError("An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your TrustedLand account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join the property development collaboration platform
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                I am a...
              </label>
              <select
                id="role"
                name="role"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as "DEVELOPER" | "PROFESSIONAL",
                    profession: e.target.value === "DEVELOPER" ? "" : formData.profession,
                  })
                }
              >
                <option value="DEVELOPER">Property Developer</option>
                <option value="PROFESSIONAL">
                  Professional Consultant
                </option>
              </select>
            </div>

            {formData.role === "PROFESSIONAL" && (
              <div>
                <label
                  htmlFor="profession"
                  className="block text-sm font-medium text-gray-700"
                >
                  Profession
                </label>
                <select
                  id="profession"
                  name="profession"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-medium"
                  value={formData.profession}
                  onChange={(e) =>
                    setFormData({ ...formData, profession: e.target.value })
                  }
                >
                  <option value="">Select your profession...</option>
                  <optgroup label="Architecture & Design">
                    <option value="Architect">Architect</option>
                    <option value="Landscape Architect">Landscape Architect</option>
                    <option value="Interior Designer">Interior Designer</option>
                    <option value="Urban Designer">Urban Designer</option>
                  </optgroup>
                  <optgroup label="Planning & Development">
                    <option value="Planning Consultant">Planning Consultant</option>
                    <option value="Development Manager">Development Manager</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Construction Manager">Construction Manager</option>
                  </optgroup>
                  <optgroup label="Engineering">
                    <option value="Structural Engineer">Structural Engineer</option>
                    <option value="Civil Engineer">Civil Engineer</option>
                    <option value="MEP Engineer (Mechanical, Electrical, Plumbing)">MEP Engineer (Mechanical, Electrical, Plumbing)</option>
                    <option value="Geotechnical Engineer">Geotechnical Engineer</option>
                    <option value="Highways Engineer">Highways Engineer</option>
                    <option value="Drainage Engineer">Drainage Engineer</option>
                  </optgroup>
                  <optgroup label="Surveying & Cost">
                    <option value="Quantity Surveyor">Quantity Surveyor</option>
                    <option value="Building Surveyor">Building Surveyor</option>
                    <option value="Land Surveyor">Land Surveyor</option>
                    <option value="Party Wall Surveyor">Party Wall Surveyor</option>
                  </optgroup>
                  <optgroup label="Environmental & Sustainability">
                    <option value="Sustainability Consultant">Sustainability Consultant</option>
                    <option value="Environmental Consultant">Environmental Consultant</option>
                    <option value="Ecology Consultant">Ecology Consultant</option>
                    <option value="Arboriculture Consultant">Arboriculture Consultant</option>
                    <option value="Energy Assessor">Energy Assessor</option>
                  </optgroup>
                  <optgroup label="Specialist Consultants">
                    <option value="Fire Safety Consultant / Fire Engineer">Fire Safety Consultant / Fire Engineer</option>
                    <option value="Acoustic Consultant">Acoustic Consultant</option>
                    <option value="Daylight & Sunlight Consultant">Daylight & Sunlight Consultant</option>
                    <option value="Transport Consultant">Transport Consultant</option>
                    <option value="Townscape & Visual Impact Consultant">Townscape & Visual Impact Consultant</option>
                    <option value="Heritage Consultant">Heritage Consultant</option>
                    <option value="Façade Engineer">Façade Engineer</option>
                    <option value="Wind Consultant">Wind Consultant</option>
                    <option value="Air Quality Consultant">Air Quality Consultant</option>
                    <option value="Flood Risk Consultant">Flood Risk Consultant</option>
                    <option value="Contaminated Land Consultant">Contaminated Land Consultant</option>
                    <option value="Rights of Light Consultant">Rights of Light Consultant</option>
                  </optgroup>
                  <optgroup label="Legal & Compliance">
                    <option value="Building Control Consultant">Building Control Consultant</option>
                    <option value="CDM Adviser / Principal Designer">CDM Adviser / Principal Designer</option>
                    <option value="Health & Safety Consultant">Health & Safety Consultant</option>
                  </optgroup>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}

            {formData.role === "DEVELOPER" && (
              <div>
                <label
                  htmlFor="orgName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Organization Name (Optional)
                </label>
                <input
                  id="orgName"
                  name="orgName"
                  type="text"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.orgName}
                  onChange={(e) =>
                    setFormData({ ...formData, orgName: e.target.value })
                  }
                />
              </div>
            )}

            {formData.role === "PROFESSIONAL" && (
              <div>
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Company Name (Optional)
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                />
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link
              href="/auth/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
