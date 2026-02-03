/**
 * 404 Not Found Page
 */

import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="text-6xl font-bold text-gray-900">404</div>
      <div className="text-2xl font-bold text-gray-700">Page Not Found</div>
      <p className="text-gray-600 text-center">
        Sorry, the page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Go Home
      </Link>
    </div>
  );
}

export default NotFoundPage;
