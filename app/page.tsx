"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-primary-700 mb-6">
          CoupleConnect
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          Communicate better with your partner through AI-assisted understanding
        </p>
        <p className="text-gray-500 mb-8">
          When emotions run high, words can come out wrong. Our AI therapist
          helps translate your messages into clearer, kinder communication -
          so your partner truly understands what you mean.
        </p>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            How it works
          </h2>
          <div className="grid gap-4 text-left">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <p className="text-gray-600">
                You express how you're feeling in your own words
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold">
                2
              </div>
              <p className="text-gray-600">
                Our AI therapist helps rephrase it with clarity and compassion
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold">
                3
              </div>
              <p className="text-gray-600">
                Your partner receives the message with emotional context
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
