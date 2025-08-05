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
