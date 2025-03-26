import React, { useState, useEffect } from 'react';
import taskService from '../services/taskService';
import projectService from '../services/projectService';
// Removed unused import: updateService

const WeeklyUpdateDetail = ({ update, projectId, onBack, onEdit }) => {
  // Additional state for enhanced details
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Activity history based on real data
  const [activityHistory, setActivityHistory] = useState([]);

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }

    // Only fetch tasks and generate activity history if update exists
    if (update) {
      fetchLinkedTasks();
      generateActivityHistory();
    }
  }, [update, projectId]); // Dependencies are now correct

// Enhanced fetchLinkedTasks function for WeeklyUpdateDetail component

const fetchLinkedTasks = async () => {
  // Return early if update doesn't exist
  if (!update) return;

  try {
    setIsLoadingTasks(true);
    setError(null);

    // Debug logging
    console.log("Debug - Update object:", update);
    console.log("Debug - Linked task IDs property exists:", update.hasOwnProperty('linked_task_ids'));
    console.log("Debug - Linked task IDs value:", update.linked_task_ids);

    // Enhanced validation and error handling
    if (!update.linked_task_ids) {
      console.log("No linked_task_ids property in update object");
      setTasks([]);
      setIsLoadingTasks(false);
      return;
    }

    if (!Array.isArray(update.linked_task_ids)) {
      console.log("linked_task_ids is not an array:", update.linked_task_ids);
      setTasks([]);
      setIsLoadingTasks(false);
      return;
    }

    if (update.linked_task_ids.length === 0) {
      console.log("linked_task_ids array is empty");
      setTasks([]);
      setIsLoadingTasks(false);
      return;
    }

    console.log("Fetching linked tasks with IDs:", update.linked_task_ids);

    // USE THIS FOR QUICK TESTING: Uncomment to test with mock data
    // This will bypass the actual API calls to test your UI rendering
    /*
    const mockTasks = [
      {
        id: update.linked_task_ids[0] || "task-1",
        title: "Update user documentation",
        description: "Revise the user guide to reflect recent UI changes",
        status: "Done",
        due_date: "2024-03-15",
        completed_at: "2024-03-14"
      },
      {
        id: update.linked_task_ids[1] || "task-2",
        title: "Fix navigation bug on mobile",
        description: "Menu items are not clickable on smaller screen sizes",
        status: "In Progress",
        due_date: "2024-03-25"
      }
    ];
    setTasks(mockTasks.slice(0, Math.min(2, update.linked_task_ids.length)));
    setIsLoadingTasks(false);
    return;
    */

    // Attempt to load each task with better error handling
    const taskResults = [];

    for (const id of update.linked_task_ids) {
      try {
        // Normalize the ID - handle both string and numeric IDs
        const normalizedId = id.toString();
        console.log(`Fetching task with ID: ${normalizedId} (original type: ${typeof id})`);

        // Make the API call
        const task = await taskService.getTask(normalizedId);

        // Log success and add to results if valid
        if (task) {
          console.log(`Successfully fetched task:`, task);
          taskResults.push(task);
        } else {
          console.log(`Task service returned null/undefined for ID: ${normalizedId}`);
        }
      } catch (err) {
        console.error(`Error fetching task ${id}:`, err);
      }
    }

    console.log(`Successfully fetched ${taskResults.length} of ${update.linked_task_ids.length} tasks`);

    // Update state based on results
    if (taskResults.length === 0 && update.linked_task_ids.length > 0) {
      console.warn("No tasks could be fetched despite having task IDs");
      setError('Could not retrieve task data. This might be due to network issues, deleted tasks, or permission problems.');
    }

    setTasks(taskResults);
  } catch (err) {
    console.error('Error in fetchLinkedTasks:', err);
    setError(`Failed to load linked tasks: ${err.message || 'Unknown error'}`);
  } finally {
    setIsLoadingTasks(false);
  }
};

  const fetchProjectDetails = async () => {
    try {
      setIsLoadingProject(true);

      const projectData = await projectService.getProject(projectId);
      setProject(projectData);
    } catch (err) {
      console.error('Error fetching project details:', err);
    } finally {
      setIsLoadingProject(false);
    }
  };

  // Get user name helper
  const getUserName = () => {
    if (!update) return 'Unknown User';

    // Try to get the user name from various possible fields
    return update.created_by_name ||
           update.user_name ||
           (update.user_id ? `User ID: ${update.user_id}` : 'Unknown User');
  };

  // Show project context function
  const showProjectContext = () => {
    if (!project || isLoadingProject) return null;

    return (
      <div style={styles.projectInfoCard}>
        <div style={styles.projectInfoHeader}>
          <div style={styles.projectInfoTitle}>{project.name}</div>
          <div>
            <span
              style={{
                ...styles.status,
                backgroundColor: '#EDF2F7',
                color: '#4A5568'
              }}
            >
              {project.status}
            </span>
          </div>
        </div>
        <div style={styles.projectInfoDetails}>
          {project.description && (
            <div style={{ marginBottom: '8px' }}>{project.description}</div>
          )}
          <div style={styles.flexRow}>
            <span>Timeline: {formatDate(project.start_date)} - {formatDate(project.end_date)}</span>
          </div>
        </div>
        {project.progress !== undefined && (
          <div style={styles.projectInfoProgress}>
            <div style={{ fontSize: '14px', marginBottom: '4px' }}>
              Overall Progress: {project.progress || 0}%
            </div>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${project.progress || 0}%`
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Generate activity history based on real update data
  const generateActivityHistory = () => {
    if (!update) return;

    const history = [];
    const timestamp = Date.now(); // Used to generate unique IDs

    // Creation event
    if (update.created_at || update.date) {
      history.push({
        id: `created-${timestamp}`, // Unique ID
        type: 'created',
        date: new Date(update.created_at || update.date),
        user: update.created_by_name || update.user_name || 'User',
        description: 'Created weekly update'
      });
    }

    // AI summary generation (if it exists)
    if (update.ai_summary) {
      history.push({
        id: `ai_summary-${timestamp}`, // Unique ID
        type: 'ai_summary',
        date: new Date(update.created_at || update.date),
        user: 'AI Assistant',
        description: 'Generated summary based on update notes'
      });
    }

    // Task linkage (if tasks are linked)
    if (update.linked_task_ids && update.linked_task_ids.length > 0) {
      history.push({
        id: `tasks_linked-${timestamp}`, // Unique ID
        type: 'task_linked',
        date: new Date(update.created_at || update.date),
        user: update.created_by_name || update.user_name || 'User',
        description: `Linked ${update.linked_task_ids.length} task${update.linked_task_ids.length === 1 ? '' : 's'} to this update`
      });
    }

    // Edit event (if update has been modified)
    if (update.updated_at &&
        update.created_at &&
        new Date(update.updated_at).getTime() > new Date(update.created_at).getTime()) {
      history.push({
        id: `edited-${timestamp}`, // Unique ID
        type: 'edited',
        date: new Date(update.updated_at),
        user: update.updated_by_name || update.created_by_name || update.user_name || 'User',
        description: 'Edited update details'
      });
    }

    // Sort by date (newest first)
    history.sort((a, b) => b.date - a.date);

    setActivityHistory(history);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  // Format full datetime
  const formatDateTime = (dateString) => {
    if (!dateString) return 'No date';
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  // Status indicator styles
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed':
        return { backgroundColor: '#C6F6D5', color: '#22543D' };
      case 'In Progress':
        return { backgroundColor: '#BEE3F8', color: '#2A4365' };
      case 'Blocked':
        return { backgroundColor: '#FED7D7', color: '#822727' };
      default:
        return { backgroundColor: '#EDF2F7', color: '#4A5568' };
    }
  };

  // Get task status style
  const getTaskStatusStyle = (status) => {
    switch (status) {
      case 'Done':
        return { backgroundColor: '#C6F6D5', color: '#22543D' };
      case 'In Progress':
        return { backgroundColor: '#BEE3F8', color: '#2A4365' };
      case 'Pending':
        return { backgroundColor: '#FEFCBF', color: '#744210' };
      default:
        return { backgroundColor: '#EDF2F7', color: '#4A5568' };
    }
  };

  // Get activity icon
  const getActivityIcon = (type) => {
    switch (type) {
      case 'created':
        return '✅';
      case 'edited':
        return '✏️';
      case 'ai_summary':
        return '🤖';
      case 'task_linked':
        return '🔗';
      default:
        return '📝';
    }
  };

  // Styles
  const styles = {
    container: {
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '20px',
    },
    backButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      marginBottom: '20px',
      color: '#4a5568',
    },
    pageHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
    },
    headerLeft: {
      display: 'flex',
      flexDirection: 'column',
    },
    headerRight: {
      display: 'flex',
      gap: '12px',
    },
    pageTitle: {
      fontSize: '28px',
      fontWeight: '700',
      margin: '0 0 4px 0',
    },
    breadcrumb: {
      color: '#718096',
    },
    card: {
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      marginBottom: '24px',
    },
    header: {
      padding: '24px',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    headerContent: {
      flex: 1,
    },
    tabs: {
      display: 'flex',
      borderBottom: '1px solid #e2e8f0',
    },
    tab: {
      padding: '12px 24px',
      cursor: 'pointer',
      fontWeight: '500',
      borderBottom: '2px solid transparent',
    },
    activeTab: {
      borderBottom: '2px solid #4299e1',
      color: '#4299e1',
    },
    title: {
      margin: '0 0 8px 0',
      fontSize: '24px',
      fontWeight: '600',
    },
    date: {
      margin: '0 0 8px 0',
      color: '#718096',
    },
    metaInfo: {
      display: 'flex',
      gap: '16px',
      marginBottom: '16px',
    },
    metaItem: {
      display: 'flex',
      alignItems: 'center',
      color: '#718096',
      fontSize: '14px',
    },
    metaIcon: {
      marginRight: '8px',
    },
    status: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '4px',
      fontWeight: '500',
      fontSize: '14px',
    },
    actions: {
      display: 'flex',
      gap: '8px',
    },
    button: {
      padding: '8px 16px',
      borderRadius: '4px',
      fontWeight: '500',
      cursor: 'pointer',
      fontSize: '14px',
    },
    editButton: {
      backgroundColor: '#EDF2F7',
      border: 'none',
      color: '#4A5568',
    },
    content: {
      padding: '24px',
    },
    section: {
      marginBottom: '32px',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
    },
    sectionIcon: {
      marginRight: '8px',
      color: '#4299e1',
    },
    notes: {
      whiteSpace: 'pre-wrap',
      lineHeight: '1.6',
      backgroundColor: '#F7FAFC',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #E2E8F0',
    },
    aiSummary: {
      padding: '16px',
      backgroundColor: '#EDF2F7',
      borderRadius: '8px',
      lineHeight: '1.6',
      border: '1px solid #CBD5E0',
    },
    taskListContainer: {
      marginTop: '16px',
    },
    progressBar: {
      height: '8px',
      width: '100%',
      backgroundColor: '#edf2f7',
      borderRadius: '4px',
      overflow: 'hidden',
      marginBottom: '16px',
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#4299e1',
    },
    taskStats: {
      display: 'flex',
      gap: '16px',
      marginBottom: '20px',
    },
    statCard: {
      flex: 1,
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      textAlign: 'center',
    },
    statTitle: {
      fontSize: '14px',
      color: '#718096',
      marginBottom: '8px',
    },
    statValue: {
      fontSize: '24px',
      fontWeight: '600',
    },
    taskList: {
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      overflow: 'hidden',
    },
    taskItem: {
      padding: '12px 16px',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    taskTitle: {
      fontWeight: '500',
    },
    taskDetails: {
      fontSize: '14px',
      color: '#718096',
    },
    taskBadge: {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500',
    },
    loadingText: {
      textAlign: 'center',
      padding: '16px',
      color: '#718096',
    },
    errorText: {
      textAlign: 'center',
      padding: '16px',
      color: '#C53030',
    },
    timelineContainer: {
      position: 'relative',
      margin: '24px 0',
      paddingLeft: '24px',
    },
    timelineLine: {
      position: 'absolute',
      left: '12px',
      top: '0',
      bottom: '0',
      width: '2px',
      backgroundColor: '#CBD5E0',
    },
    timelineItem: {
      position: 'relative',
      marginBottom: '24px',
    },
    timelineDot: {
      position: 'absolute',
      left: '-24px',
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      backgroundColor: 'white',
      border: '2px solid #4299e1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
    },
    timelineContent: {
      backgroundColor: 'white',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #E2E8F0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    timelineHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '8px',
    },
    timelineTitle: {
      fontWeight: '600',
    },
    timelineDate: {
      color: '#718096',
      fontSize: '14px',
    },
    timelineDescription: {
      fontSize: '14px',
      color: '#4A5568',
    },
    projectInfoCard: {
      padding: '16px',
      backgroundColor: '#F7FAFC',
      borderRadius: '8px',
      marginBottom: '16px',
    },
    projectInfoHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '8px',
    },
    projectInfoTitle: {
      fontWeight: '600',
    },
    projectInfoDetails: {
      fontSize: '14px',
      color: '#4A5568',
      marginBottom: '8px',
    },
    projectInfoProgress: {
      marginTop: '12px',
    },
    flexRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    separator: {
      padding: '0 8px',
      color: '#CBD5E0',
    }
  };

  if (!update) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.content}>
            <p style={styles.errorText}>Update not found or failed to load.</p>
            <button
              style={{...styles.button, ...styles.editButton}}
              onClick={onBack}
            >
              Back to Project
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate task statistics
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(task => task.status === 'Done').length,
    inProgress: tasks.filter(task => task.status === 'In Progress').length,
    pending: tasks.filter(task => task.status === 'Pending').length,
    completionRate: tasks.length > 0
      ? Math.round((tasks.filter(task => task.status === 'Done').length / tasks.length) * 100)
      : 0
  };

  return (
    <div style={styles.container}>
      <button
        style={styles.backButton}
        onClick={onBack}
      >
        ← Back to Project
      </button>

      <div style={styles.pageHeader}>
        <div style={styles.headerLeft}>
          <h1 style={styles.pageTitle}>Weekly Update Details</h1>
          <div style={styles.breadcrumb}>
            <span>{project ? project.name : 'Project'}</span>
            <span style={styles.separator}>›</span>
            <span>Updates</span>
            <span style={styles.separator}>›</span>
            <span>{formatDate(update.date)}</span>
          </div>
        </div>
        <div style={styles.headerRight}>
          <button
            style={{...styles.button, ...styles.editButton}}
            onClick={() => onEdit(update.id)}
          >
            Edit Update
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.flexRow}>
              <h2 style={styles.title}>Update for {formatDate(update.date)}</h2>
              <span
                style={{
                  ...styles.status,
                  ...getStatusStyle(update.status)
                }}
              >
                {update.status}
              </span>
            </div>

            <div style={styles.metaInfo}>
              <div style={styles.metaItem}>
                <span style={styles.metaIcon}>📅</span>
                <span>Created: {formatDateTime(update.created_at || update.date)}</span>
              </div>
              {update.updated_at && update.updated_at !== update.created_at && (
                <div style={styles.metaItem}>
                  <span style={styles.metaIcon}>🔄</span>
                  <span>Updated: {formatDateTime(update.updated_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div style={styles.tabs}>
          <div
            style={{
              ...styles.tab,
              ...(activeTab === 'overview' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </div>
          <div
            style={{
              ...styles.tab,
              ...(activeTab === 'tasks' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('tasks')}
          >
            Related Tasks
          </div>
          <div
            style={{
              ...styles.tab,
              ...(activeTab === 'history' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('history')}
          >
            Activity History
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={styles.content}>
            {/* Project Context */}
            {showProjectContext()}

            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <span style={styles.sectionIcon}>📝</span>
                Update Notes
              </h3>
              <div style={styles.notes}>{update.notes}</div>
            </div>

            {update.ai_summary && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>
                  <span style={styles.sectionIcon}>🤖</span>
                  AI Summary
                </h3>
                <div style={styles.aiSummary}>{update.ai_summary}</div>
              </div>
            )}

            {/* Created By Info */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <span style={styles.sectionIcon}>👤</span>
                Created By
              </h3>
              <div style={{fontSize: '16px', padding: '8px', backgroundColor: '#F7FAFC', borderRadius: '4px'}}>
                {getUserName()}
                {update.created_at && (
                  <span style={{color: '#718096', marginLeft: '8px'}}>
                    on {formatDateTime(update.created_at)}
                  </span>
                )}
              </div>
            </div>

            {/* Key Metrics Summary - only show if we have tasks */}
            {tasks.length > 0 && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>
                  <span style={styles.sectionIcon}>📊</span>
                  Task Progress
                </h3>

                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${taskStats.completionRate}%`
                    }}
                  ></div>
                </div>

                <div style={styles.taskStats}>
                  <div style={styles.statCard}>
                    <div style={styles.statTitle}>Completed</div>
                    <div style={{...styles.statValue, color: '#38a169'}}>
                      {taskStats.completed}
                    </div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statTitle}>In Progress</div>
                    <div style={{...styles.statValue, color: '#3182ce'}}>
                      {taskStats.inProgress}
                    </div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statTitle}>Pending</div>
                    <div style={{...styles.statValue, color: '#d69e2e'}}>
                      {taskStats.pending}
                    </div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statTitle}>Completion Rate</div>
                    <div style={{...styles.statValue, color: '#4299e1'}}>
                      {taskStats.completionRate}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div style={styles.content}>
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <span style={styles.sectionIcon}>📋</span>
                Related Tasks ({isLoadingTasks ? 'Loading...' : tasks.length})
              </h3>

              {isLoadingTasks ? (
                <div style={styles.loadingText}>Loading tasks...</div>
              ) : error ? (
                <div style={styles.errorText}>{error}</div>
              ) : tasks.length === 0 ? (
                <div style={styles.loadingText}>
                  {update.linked_task_ids && update.linked_task_ids.length > 0
                    ? 'Could not load the linked tasks'
                    : 'No tasks are linked to this update'}
                </div>
              ) : (
                <div>
                  {/* Task stats summary */}
                  <div style={styles.taskStats}>
                    <div style={styles.statCard}>
                      <div style={styles.statTitle}>Total Tasks</div>
                      <div style={{...styles.statValue, color: '#4A5568'}}>
                        {taskStats.total}
                      </div>
                    </div>
                    <div style={styles.statCard}>
                      <div style={styles.statTitle}>Completed</div>
                      <div style={{...styles.statValue, color: '#38a169'}}>
                        {taskStats.completed}
                      </div>
                    </div>
                    <div style={styles.statCard}>
                      <div style={styles.statTitle}>In Progress</div>
                      <div style={{...styles.statValue, color: '#3182ce'}}>
                        {taskStats.inProgress}
                      </div>
                    </div>
                    <div style={styles.statCard}>
                      <div style={styles.statTitle}>Pending</div>
                      <div style={{...styles.statValue, color: '#d69e2e'}}>
                        {taskStats.pending}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>Completion: {taskStats.completionRate}%</div>
                    </div>
                    <div style={styles.progressBar}>
                      <div
                        style={{
                          ...styles.progressFill,
                          width: `${taskStats.completionRate}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Task list */}
                  <div style={styles.taskList}>
                    {tasks.map(task => (
                      <div key={task.id} style={{
                        ...styles.taskItem,
                        borderBottom: task === tasks[tasks.length - 1] ? 'none' : '1px solid #e2e8f0'
                      }}>
                        <div>
                          <div style={{...styles.taskTitle, textDecoration: task.status === 'Done' ? 'line-through' : 'none'}}>
                            {task.title}
                          </div>
                          <div style={styles.taskDetails}>
                            <div>
                              Due: {formatDate(task.due_date)}
                              {task.status === 'Done' && task.completed_at && (
                                <span> · Completed: {formatDate(task.completed_at)}</span>
                              )}
                            </div>
                            {task.description && (
                              <div>
                                {task.description.length > 100
                                  ? `${task.description.substring(0, 100)}...`
                                  : task.description}
                              </div>
                            )}
                          </div>
                        </div>
                        <div
                          style={{
                            ...styles.taskBadge,
                            ...getTaskStatusStyle(task.status)
                          }}
                        >
                          {task.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Debug information for troubleshooting */}
              {update.linked_task_ids && update.linked_task_ids.length > 0 && tasks.length === 0 && !isLoadingTasks && (
                <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#FFF5F5', borderRadius: '4px' }}>
                  <div style={{ fontWeight: '500', marginBottom: '4px' }}>Task Linking Troubleshooting:</div>
                  <div>Task IDs from update: <pre style={{ display: 'inline', background: '#FEEBC8', padding: '2px 4px' }}>{JSON.stringify(update.linked_task_ids)}</pre></div>
                  <div>ID types: {update.linked_task_ids.map(id => typeof id).join(', ')}</div>
                  <div style={{ marginTop: '8px' }}>Possible issues:</div>
                  <ul style={{ margin: '4px 0 8px 20px' }}>
                    <li>Task IDs might be in an incorrect format (number vs string)</li>
                    <li>The tasks may have been deleted from the database</li>
                    <li>Permission issues accessing the tasks</li>
                    <li>API endpoint configuration problems</li>
                  </ul>
                  <div>Try refreshing the page or check your backend implementation.</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div style={styles.content}>
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <span style={styles.sectionIcon}>🕒</span>
                Activity Timeline
              </h3>

              {activityHistory.length === 0 ? (
                <div style={styles.loadingText}>No activity history available</div>
              ) : (
                <div style={styles.timelineContainer}>
                  <div style={styles.timelineLine}></div>

                  {activityHistory.map(activity => (
                    <div key={activity.id} style={styles.timelineItem}>
                      <div style={styles.timelineDot}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div style={styles.timelineContent}>
                        <div style={styles.timelineHeader}>
                          <div style={styles.timelineTitle}>{activity.user}</div>
                          <div style={styles.timelineDate}>
                            {formatDateTime(activity.date)}
                          </div>
                        </div>
                        <div style={styles.timelineDescription}>
                          {activity.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Safer approach to environment check for debug info */}
              {typeof window !== 'undefined' &&
               window.location.hostname === 'localhost' && (
                <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#F7FAFC', borderRadius: '8px', border: '1px dashed #CBD5E0' }}>
                  <h4 style={{ marginBottom: '8px', fontWeight: '600' }}>Update Object (Debug)</h4>
                  <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap', overflow: 'auto' }}>
                    {JSON.stringify(update, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyUpdateDetail;