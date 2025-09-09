"use client";

import { WebSearchData } from "@/models/search";
import { useState } from "react";
import "./search_results.css";

interface WebSearchDisplayProps {
  searchData: WebSearchData;
}

const WebSearchDisplay = ({ searchData }: WebSearchDisplayProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!searchData || !searchData.results || searchData.results.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 border-t border-gray-700 pt-2">
      <div
        className="flex items-center justify-between text-sm text-gray-400 mb-1 cursor-pointer hover:text-gray-300 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            fill="currentColor"
            className="mr-1"
            viewBox="0 0 16 16"
          >
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
          </svg>
          {searchData.queries.some((q) =>
            q.query.startsWith("Fetching data from:")
          ) ? (
            <span>
              Website data retrieved ({searchData.results.length} results)
            </span>
          ) : (
            <span>Web search used ({searchData.results.length} results)</span>
          )}
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 16 16"
          className={`transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        >
          <path
            fillRule="evenodd"
            d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
          />
        </svg>
      </div>

      {isExpanded && (
        <div className="text-sm space-y-4">
          <div className="space-y-2">
            <div className="font-medium text-blue-400">Search Queries:</div>
            <ul className="list-disc pl-5 text-gray-300">
              {searchData.queries.map((query, index) => (
                <li key={`query-${index}`}>&ldquo;{query.query}&rdquo;</li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <div className="font-medium text-blue-400">Search Results:</div>
            <div className="bg-gray-800 rounded-md p-3 max-h-64 overflow-y-auto space-y-3 search-scrollbar">
              {searchData.results.map((result, index) => (
                <div
                  key={`result-${index}`}
                  className="text-gray-300 border-l-2 border-gray-600 pl-3 py-1"
                >
                  <div className="flex items-start">
                    <span className="text-blue-400 mr-2">[{index + 1}]</span>
                    <div>
                      <a
                        href={result.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline font-medium"
                      >
                        {result.title}
                      </a>
                      <p className="text-gray-400 text-sm mt-1">
                        {result.snippet}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <span>{result.source}</span>
                        <span className="mx-1">•</span>
                        <span>
                          {new Date(result.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebSearchDisplay;
