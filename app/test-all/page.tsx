"use client";

import { useState } from "react";
import { Search, Database } from "lucide-react";
import Image from "next/image";
import { SearchResult } from "@/lib/smartSearch";

type ChatAPI = "vector-search";

interface TestResult {
  api: ChatAPI;
  response: string;
  context: string;
  searchResults?: SearchResult[];
  error?: string;
  time: number;
}

export default function TestAllPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const testAPI = async (api: ChatAPI) => {
    if (!query.trim()) return;

    setIsLoading(true);
    const startTime = Date.now();

    try {
      const endpoint = "/api/chat";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: query }),
      });

      const data = await response.json();
      const time = Date.now() - startTime;

      setResults((prev) => [
        ...prev,
        {
          api,
          response: data.response || data.error || "No response",
          context: data.context || "No context",
          searchResults: data.searchResults,
          error: data.error,
          time,
        },
      ]);
    } catch (error) {
      const time = Date.now() - startTime;
      setResults((prev) => [
        ...prev,
        {
          api,
          response: "Error occurred",
          context: "Error",
          error: error instanceof Error ? error.message : "Unknown error",
          time,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const testAll = async () => {
    if (!query.trim()) return;
    setResults([]);
    await testAPI("vector-search");
  };

  const getAPIInfo = () => {
    return {
      name: "Huawei Certification Search",
      description: "Learn more about Huawei certifications and exams",
      icon: <Database className="w-4 h-4" />,
      color: "bg-purple-600",
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 md:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Image
            src="/logo2.jpg"
            alt="Huawei logo"
            width={100}
            height={100}
            className="rounded-full mx-auto w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28"
          />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mt-4">
            Huawei Assistant
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Test the Huawei chatbot with AI-powered semantic vector search!
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about Huawei certifications..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              onKeyDown={(e) => e.key === "Enter" && testAll()}
            />
            <button
              onClick={testAll}
              disabled={isLoading || !query.trim()}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              <Search className="w-4 h-4" />
              <span>{isLoading ? "Testing..." : "Test All APIs"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(["vector-search"] as ChatAPI[]).map((api) => {
              const info = getAPIInfo();
              return (
                <button
                  key={api}
                  onClick={() => testAPI(api)}
                  disabled={isLoading || !query.trim()}
                  className="p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div
                      className={`w-8 h-8 ${info.color} rounded-full flex items-center justify-center text-white`}
                    >
                      {info.icon}
                    </div>
                    <span className="font-medium">{info.name}</span>
                  </div>
                  <p className="text-sm text-gray-600 text-left">
                    {info.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {results.length > 0 && (
          <div className="space-y-6">
            {results.map((result, index) => {
              const info = getAPIInfo();
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-lg p-4 sm:p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-8 h-8 ${info.color} rounded-full flex items-center justify-center text-white`}
                    >
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{info.name}</h3>
                      <p className="text-sm text-gray-500">
                        {result.time}ms • {result.context}
                      </p>
                    </div>
                  </div>

                  {result.error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
                      <p className="text-red-800 font-medium">Error:</p>
                      <p className="text-red-700">{result.error}</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap">
                      {result.response}
                    </div>
                  )}

                  {/* {result.searchResults && result.searchResults.length > 0 && (
                    <div className="mt-4 text-sm">
                      <p className="font-medium text-gray-700 mb-2">
                        Search Results:
                      </p>
                      <div className="space-y-2">
                        {result.searchResults.map((sr, idx) => (
                          <div
                            key={idx}
                            className="bg-blue-50 p-2 rounded text-gray-700"
                          >
                            <span className="font-medium">{sr.title}</span> (
                            {sr.category}) - Score: {sr.relevance}
                          </div>
                        ))}
                      </div>
                    </div>
                  )} */}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-sm text-gray-500">
          <p className="font-medium mb-2">
            Test Queries for AI-Powered Vector Search:
          </p>
          <ul className="space-y-1 pl-4 list-disc">
            <li>HCIA IoT exam requirements</li>
            <li>5G core network architecture</li>
            <li>Cloud computing certification path</li>
            <li>Data center networking best practices</li>
            <li>Security solutions implementation</li>
            <li>HCIE prerequisites and preparation</li>
          </ul>
        </div>

        <footer className="mt-10 text-xs text-gray-400 text-center">
          &copy; {new Date().getFullYear()} Fahad Al-Khalidy. All rights
          reserved.
        </footer>
      </div>
    </div>
  );
}
