import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import updateService from '../services/updateService';
import projectService from '../services/projectService';
import WeeklyUpdateDetail from '../components/WeeklyUpdateDetail';

const WeeklyUpdateDetailsPage = () => {
  const { projectId, updateId } = useParams();
  const [update, setUpdate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching update data with IDs:", { projectId, updateId });

        // Fetch all updates for the project
        const updatesData = await projectService.getProjectUpdates(projectId);
        console.log("All project updates:", updatesData);

        // Find the specific update we want
        const updateData = updatesData.find(update => update.id === updateId);

        if (!updateData) {
          throw new Error('Update not found');
        }

        console.log("Found update:", updateData);
        setUpdate(updateData);
      } catch (err) {
        console.error('Failed to fetch update data:', err);
        setError('Failed to load update details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, updateId]);

  const handleBack = () => {
    navigate(`/projects/${projectId}`);
  };

  const handleEdit = () => {
    // Navigate to the edit page
    // Note: Your routes might be structured differently
    // Check CreateUpdatePage.jsx to see what URL structure it expects
    navigate(`/projects/${projectId}/updates/${updateId}/edit`);

    // Log for debugging
    console.log(`Navigating to edit update: /projects/${projectId}/updates/${updateId}/edit`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error || !update) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Project
        </button>

        <div className="bg-red-50 text-red-800 p-4 rounded-md flex items-start">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>{error || 'Update not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <WeeklyUpdateDetail
        update={update}
        projectId={projectId}
        onBack={handleBack}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default WeeklyUpdateDetailsPage;