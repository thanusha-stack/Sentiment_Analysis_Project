import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-600 to-blue-300 text-white">
      <h1 className="text-5xl font-bold mb-6 text-center">
        Welcome to E-Consultation Sentiment Analysis
      </h1>
      <p className="text-lg mb-8 text-center max-w-xl">
        Analyze customers feedback and consultation comments instantly. Get insights
        and improve services with our sentiment analysis platform.
      </p>
      <div className="flex gap-4">
        <Button
          onClick={() => navigate("/register")}
          className="bg-white text-indigo-600 hover:bg-gray-200"
        >
          Register
        </Button>
        <Button
          onClick={() => navigate("/login")}
          className="bg-white text-indigo-600 hover:bg-gray-200"
        >
          Login
        </Button>
      </div>
    </div>
  );
}
