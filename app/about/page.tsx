import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-green-400 via-green-450 to-blue-400">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-400 via-green-450 to-blue-400 mt-16">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              About Huddle Social
            </h1>
            <p className="mt-6 text-lg leading-8 text-white">
              The campus companion we wish we had—built by students, for students.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Side by Side Cards */}
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8 w-full">
        <div className="flex flex-col lg:flex-row gap-8 justify-center items-stretch w-full">
          {/* Our Mission Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-white/20 flex-1 min-w-0">
            <h2 className="text-2xl font-bold tracking-tight text-green-600 mb-4">Our Mission</h2>
            <p className="text-lg leading-8 text-gray-700 mb-6">
              Whether you're looking for events, housing, or clubs at your university, Huddle makes it easy to discover what's happening around you. We believe campus life shouldn't feel like a scavenger hunt across random group chats and outdated websites. That's why we're building a better way to connect with your college community—faster, smarter, and all in one place.
            </p>
            <p className="text-lg leading-8 text-gray-700 mb-6">
              From your first housing search to finding that niche club or last-minute event, Huddle brings it all together in a single, student-powered app. We're passionate about giving every student the tools to feel informed, involved, and inspired on campus.
            </p>
          </div>

          {/* Building for the Future Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-white/20 flex-1 min-w-0">
            <h2 className="text-2xl font-bold tracking-tight text-green-600 mb-4">Building for the Future</h2>
            <p className="text-lg leading-8 text-gray-700">
              And we're not stopping there. In a tech landscape evolving faster than ever—especially with the rise of generative AI—we're building with the future in mind. By leveraging next-gen tools like AI-powered chatbots, intelligent clustering, and real-time campus insights, we aim to define what was once thought impossible. Huddle isn't just about keeping up—it's about leading the next big leap in how students experience college.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 