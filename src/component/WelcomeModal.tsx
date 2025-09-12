"use client";

import { useEffect, useState } from "react";

interface WelcomeModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

interface ProjectStatus {
  version: string;
  service: string;
  phase: string;
  warnings: string[];
}

interface FeatureLimitations {
  webSearch: {
    status: string;
    requirement: string;
  };
  development: {
    status: string;
    seeking: string;
  };
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onAccept }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay to trigger animation
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const projectStatus: ProjectStatus = {
    version: "Development Version",
    service: "Puter JS AI Services",
    phase: "Beta Phase",
    warnings: [
      "The current implementation is functional but has limitations",
      "The model may throw errors because the current JavaScript service is not suitable for production-level applications",
      "We will replace this with a robust model from established model providers in future updates",
      "Currently in beta phase for demonstration purposes only",
    ],
  };

  const featureLimitations: FeatureLimitations = {
    webSearch: {
      status:
        "When implemented, this feature will enable real-time information retrieval",
      requirement:
        "This will expand the system's knowledge beyond its initial training data, significantly improving response accuracy for time-sensitive queries and allowing access to the latest information",
    },
    development: {
      status: "Active development",
      seeking:
        "Project is actively seeking investors for full production development",
    },
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? "bg-opacity-75" : "bg-opacity-0"
        }`}
        onClick={onAccept}
      />

      {/* Modal */}
      <div
        className={`relative bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            Welcome to Brandtize AI Chatbot
          </h2>
          <p className="text-gray-300 mt-1">
            Please review the following important information
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Project Status Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              Project Status Information
            </h3>
            <div className="bg-gray-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Version:</span>
                <span className="text-blue-400 font-medium">
                  {projectStatus.version}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">AI Service:</span>
                <span className="text-blue-400 font-medium">
                  {projectStatus.service}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Phase:</span>
                <span className="text-yellow-400 font-medium">
                  {projectStatus.phase}
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {projectStatus.warnings.map((warning, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-gray-300 text-sm">{warning}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature Limitations Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center">
              Feature Limitations
            </h3>
            <div className="bg-gray-800 rounded-lg p-4 space-y-4">
              <div>
                <h4 className="text-white font-medium mb-2">
                  Web Search Functionality
                </h4>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <span className="text-gray-300 text-sm">
                      {featureLimitations.webSearch.status}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <svg
                      className="w-4 h-4 mr-2 mt-0.5 text-green-400 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-300 text-sm">
                      {featureLimitations.webSearch.requirement}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-medium mb-2">
                  Development Status
                </h4>
                <div className="flex items-start">
                  <svg
                    className="w-4 h-4 mr-2 mt-0.5 text-green-400 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-300 text-sm">
                    {featureLimitations.development.seeking}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={onAccept}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
export type { FeatureLimitations, ProjectStatus, WelcomeModalProps };
