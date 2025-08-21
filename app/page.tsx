// app/page.tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const handleStartChat = () => {
    router.push("/test-all"); // <-- Update route later if needed
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-white to-gray-100 p-6">
      <div className="text-center max-w-xl">
        <Image
          src="/logo2.jpg" // Ensure this image is in the public/ folder
          alt="Huawei Logo"
          width={100}
          height={100}
          className="mx-auto mb-6 rounded-full shadow-md"
        />

        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Huawei Assistant Bot
        </h1>

        <p className="text-gray-600 text-lg mb-8">
          Get instant answers and guidance on Huawei certifications, ICT
          competition, and more.
        </p>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md shadow-sm max-w-3xl mb-5">
          <h2 className="text-lg font-semibold text-yellow-800 flex items-center mb-2">
            ⚠️ Disclaimer
          </h2>
          <p className="text-sm text-gray-700 mb-2">
            This assistant is designed to provide general guidance about Huawei
            certifications, courses, and related information. While we strive to
            keep the information accurate and up to date, it may not always
            reflect the latest official updates from Huawei.
          </p>
          <p className="text-sm text-gray-700 mb-2">
            For authoritative details, please always refer to the official{" "}
            <a
              href="https://e.huawei.com/en/talent/portal/#/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              Huawei ICT Academy
            </a>{" "}
            and Huawei documentation.
          </p>
          <p className="text-sm text-gray-700">
            This chatbot is not an official Huawei representative or a
            substitute for professional advice. Please do not share sensitive
            personal information such as passwords, ID numbers, or financial
            details.
          </p>
        </div>

        <button
          onClick={handleStartChat}
          className="px-6 py-3 bg-red-600 text-white font-medium rounded-full shadow-lg hover:bg-red-700 transition-all duration-300"
        >
          Start Chatting
        </button>
      </div>
    </main>
  );
}
