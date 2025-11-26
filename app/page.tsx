import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl md:text-7xl">
            <span className="block">Welcome to</span>
            <span className="block text-indigo-600">TrustedLand</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
            The property development collaboration platform connecting developers
            with architects, planners, and construction professionals.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/auth/register"
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
            >
              Get Started
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-24">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="text-indigo-600 font-bold text-lg mb-2">
                For Developers
              </div>
              <h3 className="text-xl font-semibold mb-3">Manage Projects</h3>
              <p className="text-gray-600">
                Create projects, track progress through RIBA stages, and
                collaborate with your team.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="text-indigo-600 font-bold text-lg mb-2">
                For Professionals
              </div>
              <h3 className="text-xl font-semibold mb-3">Find Opportunities</h3>
              <p className="text-gray-600">
                Browse projects, submit bids, and showcase your portfolio to
                potential clients.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="text-indigo-600 font-bold text-lg mb-2">
                For Everyone
              </div>
              <h3 className="text-xl font-semibold mb-3">Collaborate Better</h3>
              <p className="text-gray-600">
                Task management, document sharing, and messaging all in one
                place.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-24 bg-indigo-600 rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to transform your property development workflow?
          </h2>
          <p className="text-indigo-100 mb-8 text-lg">
            Join TrustedLand today and connect with the best professionals in
            the industry.
          </p>
          <Link
            href="/auth/register"
            className="inline-block px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 md:py-4 md:text-lg md:px-10"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    </div>
  );
}
