// src/pages/CreateUpdatePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import updateService from '../services/updateService';
import WeeklyUpdateForm from '@/pages/WeeklyUpdateForm';
import projectService from '../services/projectService';
import { ChevronLeft } from 'lucide-react';

const CreateUpdatePage = () => {
  const { projectId, updateId } = useParams();
  console.log("URL Parameters:", { projectId, updateId });

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch project details
        const projectData = await projectService.getProject(projectId);
        setProject(projectData);

        // If updating existing update, fetch it
        if (updateId) {
          const updateData = await updateService.getUpdate(updateId);
          setInitialData(updateData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, updateId]);

const handleSubmit = async (updateData) => {
  try {
    if (updateId) {
      // Use updateUpdate instead of updateProjectUpdate
      console.log(`Updating update with ID ${updateId}`, updateData);
      await updateService.updateUpdate(updateId, updateData);
    } else {
      console.log(`Creating new update for project ${projectId}`, updateData);
      await updateService.createProjectUpdate(projectId, updateData);
    }
    navigate(`/projects/${projectId}`);
  } catch (err) {
    console.error('Failed to save update:', err);
    throw err;
  }
};

  const handleCancel = () => {
    navigate(`/projects/${projectId}`);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          onClick={() => navigate(`/projects/${projectId}`)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Project
        </button>

        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show form when data is loaded
  return (
    <div className="container mx-auto px-4 py-8">
      <button
        className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        onClick={() => navigate(`/projects/${projectId}`)}
      >
        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Project
      </button>

      <WeeklyUpdateForm
        projectId={projectId}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        initialData={initialData}
      />
    </div>
  );
};

export default CreateUpdatePage;