import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-5xl font-bold text-green-600">404</span>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-gray-800 mb-4 font-playfair">
            Page Not Found
          </h1>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            Oops! The page you're looking for doesn't exist. 
            It might have been moved, deleted, or you entered the wrong URL.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <Home size={18} />
              Back to Dashboard
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              <ArrowLeft size={18} />
              Go Back
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-8 text-sm text-gray-500">
            <p>If you think this is an error, please contact our support team.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;
