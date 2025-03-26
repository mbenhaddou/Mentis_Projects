import React, { useState, useEffect } from 'react';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { Card } from '@/components/ui/card';
import { Loader2, AlertTriangle } from 'lucide-react';
import analyticsService from '../services/analyticsService';

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // This is mostly for visual effect - to show the loading state
    // The actual data loading happens in the AnalyticsDashboard component
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mr-2" />
        <span className="text-gray-700 font-medium">Loading analytics data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 text-red-500">
        <AlertTriangle className="h-8 w-8 mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </div>
      </div>

      <Card className="p-0 shadow-sm">
        <AnalyticsDashboard />
      </Card>
    </div>
  );
};

export default AnalyticsPage;