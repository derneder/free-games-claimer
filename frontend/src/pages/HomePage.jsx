/**
 * Home Page
 * 
 * Landing page with project information.
 */

import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Free Games Claimer
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Never miss a free game again. Track all your claimed games from Epic Games, GOG, Prime Gaming, and more.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/dashboard"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Get Started
          </Link>
          <Link
            to="#"
            className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 border rounded-lg hover:shadow-lg transition">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-blue-600 text-2xl">📦</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Track Games</h3>
          <p className="text-gray-600">
            Keep track of all free games you've claimed across multiple platforms.
          </p>
        </div>

        <div className="p-6 border rounded-lg hover:shadow-lg transition">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-green-600 text-2xl">📊</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">View Statistics</h3>
          <p className="text-gray-600">
            See detailed statistics about your game library and claimed value.
          </p>
        </div>

        <div className="p-6 border rounded-lg hover:shadow-lg transition">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-purple-600 text-2xl">🔒</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Secure</h3>
          <p className="text-gray-600">
            Your data is safe with enterprise-grade security and encryption.
          </p>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
