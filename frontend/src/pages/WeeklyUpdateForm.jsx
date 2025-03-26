// src/components/WeeklyUpdateForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import taskService from '../services/taskService';
import updateService from '../services/updateService';

const WeeklyUpdateForm = ({ projectId, onSubmit, onCancel, initialData }) => {
  const navigate = useNavigate();

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState("In Progress");
  const [notes, setNotes] = useState("");
  const [generateAiSummary, setGenerateAiSummary] = useState(true);

  // Tasks state
  const [activeTab, setActiveTab] = useState("details");
  const [tasks, setTasks] = useState([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    completionRate: 0
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [error, setError] = useState(null);
  const [taskError, setTaskError] = useState(null);

  // Initialize form if editing existing update
  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setStatus(initialData.status);
      setNotes(initialData.notes);
      setGenerateAiSummary(initialData.generate_ai_summary !== false);

      // Set selected task IDs if present - ensure they are stored as strings
      if (initialData.linked_task_ids && Array.isArray(initialData.linked_task_ids)) {
        // Convert all IDs to strings for consistency
        const stringTaskIds = initialData.linked_task_ids.map(id =>
          id !== null && id !== undefined ? id.toString() : null
        ).filter(id => id !== null);

        console.log("Setting selected task IDs from initial data:", stringTaskIds);
        setSelectedTaskIds(stringTaskIds);
      }
    }
  }, [initialData]);

  // Fetch project tasks
  useEffect(() => {
    if (projectId) {
      fetchProjectTasks();
    }
  }, [projectId]);

  const fetchProjectTasks = async () => {
    try {
      setIsLoadingTasks(true);
      setTaskError(null);

      console.log("Fetching tasks for project ID:", projectId);

      const response = await taskService.getProjectTasks(projectId);
      console.log("Tasks received:", response);

      setTasks(response);

      // Calculate statistics
      const total = response.length;
      const completed = response.filter(task => task.status === 'Done').length;
      const inProgress = response.filter(task => task.status === 'In Progress').length;
      const pending = response.filter(task => task.status === 'Pending').length;

      setTaskStats({
        total,
        completed,
        inProgress,
        pending,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      });
    } catch (error) {
      console.error('Failed to fetch project tasks:', error);
      setTaskError('Could not load project tasks');
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleTaskToggle = (taskId) => {
    // Ensure taskId is a string
    const stringTaskId = taskId.toString();

    setSelectedTaskIds(prev => {
      if (prev.includes(stringTaskId)) {
        return prev.filter(id => id !== stringTaskId);
      } else {
        return [...prev, stringTaskId];
      }
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setIsSubmitting(true);
    setError(null);

    // Ensure all task IDs are strings before submission
    const stringTaskIds = selectedTaskIds.map(id => id.toString());
    console.log("Task IDs being submitted:", stringTaskIds);

    // Create update data WITHOUT generate_ai_summary in the body
    const updateData = {
      date,
      status,
      notes,
      linked_task_ids: stringTaskIds // Use string IDs
    };

    console.log("Submitting update with data:", updateData);

    // Try to use provided onSubmit prop
    if (typeof onSubmit === 'function') {
      // Pass the generateAiSummary value separately if needed
      await onSubmit(updateData, generateAiSummary);
    } else {
      // Direct submission fallback
      console.warn("onSubmit prop not provided, using direct submission");

      // We need to add the query parameter to the URL instead
      if (initialData?.id) {
        // For update endpoint
        await updateService.updateProjectUpdate(
          projectId,
          initialData.id,
          updateData,
          { regenerate_ai_summary: generateAiSummary } // Pass as options/query params
        );
      } else {
        // For create endpoint
        await updateService.createProjectUpdate(
          projectId,
          updateData,
          { generate_ai_summary: generateAiSummary } // Pass as options/query params
        );
      }

      // Navigate back to project
      if (typeof onCancel === 'function') {
        onCancel();
      } else {
        navigate(`/projects/${projectId}`);
      }
    }
  } catch (err) {
    console.error('Error submitting update:', err);
    setError('Failed to create update. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};

  // Styles
  const styles = {
    container: {
      maxWidth: '800px',
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
    card: {
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
    },
    header: {
      padding: '24px',
      borderBottom: '1px solid #e2e8f0',
    },
    title: {
      margin: '0 0 8px 0',
      fontSize: '24px',
      fontWeight: '600',
    },
    description: {
      margin: 0,
      color: '#718096',
    },
    content: {
      padding: '24px',
    },
    error: {
      backgroundColor: '#fff5f5',
      color: '#c53030',
      padding: '12px',
      borderRadius: '4px',
      marginBottom: '16px',
    },
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '500',
    },
    input: {
      width: '100%',
      padding: '8px 12px',
      borderRadius: '4px',
      border: '1px solid #cbd5e0',
      fontSize: '16px',
    },
    textarea: {
      width: '100%',
      padding: '8px 12px',
      borderRadius: '4px',
      border: '1px solid #cbd5e0',
      fontSize: '16px',
      minHeight: '120px',
      resize: 'vertical',
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
    },
    footer: {
      padding: '16px 24px',
      borderTop: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
    },
    button: {
      padding: '8px 16px',
      borderRadius: '4px',
      fontWeight: '500',
      cursor: 'pointer',
      border: 'none',
      fontSize: '14px',
    },
    outlineButton: {
      background: 'white',
      border: '1px solid #cbd5e0',
      color: '#4a5568',
    },
    primaryButton: {
      backgroundColor: '#4299e1',
      color: 'white',
    },
    radioGroup: {
      display: 'flex',
      gap: '16px',
    },
    radioOption: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    radio: {
      marginRight: '4px',
    },
    tabs: {
      display: 'flex',
      borderBottom: '1px solid #e2e8f0',
      marginBottom: '20px',
    },
    tab: {
      padding: '12px 16px',
      cursor: 'pointer',
      borderBottom: '2px solid transparent',
      fontWeight: '500',
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
    progressBar: {
      height: '8px',
      width: '100%',
      backgroundColor: '#edf2f7',
      borderRadius: '4px',
      overflow: 'hidden',
      marginBottom: '20px',
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#4299e1',
    },
    taskList: {
      marginTop: '20px',
    },
    taskCategory: {
      marginBottom: '16px',
    },
    taskCategoryTitle: {
      fontSize: '16px',
      fontWeight: '500',
      marginBottom: '8px',
    },
    taskItem: {
      display: 'flex',
      padding: '8px',
      borderRadius: '4px',
      border: '1px solid #e2e8f0',
      marginBottom: '8px',
      alignItems: 'flex-start',
    },
    taskCheckbox: {
      marginTop: '3px',
      marginRight: '8px',
    },
    taskDetails: {
      flex: 1,
    },
    taskTitle: {
      fontWeight: '500',
    },
    taskDueDate: {
      fontSize: '12px',
      color: '#718096',
    },
    loadingTasks: {
      textAlign: 'center',
      padding: '20px',
      color: '#718096',
    },
    taskError: {
      backgroundColor: '#fff5f5',
      color: '#c53030',
      padding: '12px',
      borderRadius: '4px',
      marginBottom: '16px',
      textAlign: 'center',
    },
    taskDebug: {
      marginTop: '20px',
      padding: '12px',
      backgroundColor: '#F0FFF4',
      borderRadius: '4px',
      fontSize: '14px',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>{initialData ? 'Edit Weekly Update' : 'New Weekly Update'}</h1>
        </div>

        {/* Tabs Navigation */}
        <div style={styles.tabs}>
          <div
            style={{
              ...styles.tab,
              borderBottom: activeTab === "details" ? '2px solid #4299e1' : '2px solid transparent',
              color: activeTab === "details" ? '#4299e1' : 'inherit'
            }}
            onClick={() => setActiveTab("details")}
          >
            Update Details
          </div>
          <div
            style={{
              ...styles.tab,
              borderBottom: activeTab === "tasks" ? '2px solid #4299e1' : '2px solid transparent',
              color: activeTab === "tasks" ? '#4299e1' : 'inherit'
            }}
            onClick={() => setActiveTab("tasks")}
          >
            Tasks Progress
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Details Tab */}
          {activeTab === "details" && (
            <div style={styles.content}>
              {error && (
                <div style={styles.error}>
                  {error}
                </div>
              )}

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="date">Date</label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Status</label>
                <div style={styles.radioGroup}>
                  <div style={styles.radioOption}>
                    <input
                      id="status-completed"
                      type="radio"
                      name="status"
                      value="Completed"
                      checked={status === "Completed"}
                      onChange={() => setStatus("Completed")}
                      style={styles.radio}
                    />
                    <label htmlFor="status-completed">Completed</label>
                  </div>
                  <div style={styles.radioOption}>
                    <input
                      id="status-in-progress"
                      type="radio"
                      name="status"
                      value="In Progress"
                      checked={status === "In Progress"}
                      onChange={() => setStatus("In Progress")}
                      style={styles.radio}
                    />
                    <label htmlFor="status-in-progress">In Progress</label>
                  </div>
                  <div style={styles.radioOption}>
                    <input
                      id="status-blocked"
                      type="radio"
                      name="status"
                      value="Blocked"
                      checked={status === "Blocked"}
                      onChange={() => setStatus("Blocked")}
                      style={styles.radio}
                    />
                    <label htmlFor="status-blocked">Blocked</label>
                  </div>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="notes">Update Notes</label>
                <textarea
                  id="notes"
                  placeholder="Describe what was accomplished this week, any challenges faced, and next steps..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={styles.textarea}
                  required
                />
              </div>

              <div style={styles.checkbox}>
                <input
                  id="generate-ai-summary"
                  type="checkbox"
                  checked={generateAiSummary}
                  onChange={(e) => setGenerateAiSummary(e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                <label htmlFor="generate-ai-summary">Generate AI Summary</label>
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === "tasks" && (
            <div style={styles.content}>
              {taskError && (
                <div style={styles.taskError}>
                  {taskError}
                  <button
                    type="button"
                    style={{...styles.button, ...styles.outlineButton, marginLeft: '8px'}}
                    onClick={fetchProjectTasks}
                  >
                    Try Again
                  </button>
                </div>
              )}

              {isLoadingTasks ? (
                <div style={styles.loadingTasks}>Loading tasks...</div>
              ) : (
                <>
                  {/* Task Statistics */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Task Completion</label>
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
                        <div style={styles.statTitle}>Selected</div>
                        <div style={{...styles.statValue, color: '#4A5568'}}>
                          {selectedTaskIds.length}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Task Selection */}
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Link Tasks to Update</label>
                    <p style={{color: '#718096', marginBottom: '16px'}}>
                      Select tasks that were worked on or completed during this update period.
                    </p>

                    {tasks.length === 0 ? (
                      <div style={{textAlign: 'center', padding: '20px', color: '#718096'}}>
                        No tasks found for this project.
                      </div>
                    ) : (
                      <div style={styles.taskList}>
                        {/* Completed Tasks */}
                        {tasks.filter(task => task.status === 'Done').length > 0 && (
                          <div style={styles.taskCategory}>
                            <div style={{...styles.taskCategoryTitle, color: '#38a169'}}>
                              ✓ Completed Tasks
                            </div>
                            {tasks
                              .filter(task => task.status === 'Done')
                              .map(task => (
                                <div key={task.id} style={styles.taskItem}>
                                  <input
                                    type="checkbox"
                                    id={`task-${task.id}`}
                                    checked={selectedTaskIds.includes(task.id.toString())}
                                    onChange={() => handleTaskToggle(task.id)}
                                    style={styles.taskCheckbox}
                                  />
                                  <div style={styles.taskDetails}>
                                    <div style={styles.taskTitle}>{task.title}</div>
                                    <div style={styles.taskDueDate}>
                                      Completed: {new Date(task.updated_at || task.due_date).toLocaleDateString()}
                                    </div>
                                    <div style={{fontSize: '10px', color: '#A0AEC0'}}>
                                      ID: {task.id} (type: {typeof task.id})
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}

                        {/* In Progress Tasks */}
                        {tasks.filter(task => task.status === 'In Progress').length > 0 && (
                          <div style={styles.taskCategory}>
                            <div style={{...styles.taskCategoryTitle, color: '#3182ce'}}>
                              ⟳ In Progress Tasks
                            </div>
                            {tasks
                              .filter(task => task.status === 'In Progress')
                              .map(task => (
                                <div key={task.id} style={styles.taskItem}>
                                  <input
                                    type="checkbox"
                                    id={`task-${task.id}`}
                                    checked={selectedTaskIds.includes(task.id.toString())}
                                    onChange={() => handleTaskToggle(task.id)}
                                    style={styles.taskCheckbox}
                                  />
                                  <div style={styles.taskDetails}>
                                    <div style={styles.taskTitle}>{task.title}</div>
                                    <div style={styles.taskDueDate}>
                                      Due: {new Date(task.due_date).toLocaleDateString()}
                                    </div>
                                    <div style={{fontSize: '10px', color: '#A0AEC0'}}>
                                      ID: {task.id} (type: {typeof task.id})
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}

                        {/* Pending Tasks */}
                        {tasks.filter(task => task.status === 'Pending').length > 0 && (
                          <div style={styles.taskCategory}>
                            <div style={{...styles.taskCategoryTitle, color: '#d69e2e'}}>
                              ! Pending Tasks
                            </div>
                            {tasks
                              .filter(task => task.status === 'Pending')
                              .map(task => (
                                <div key={task.id} style={styles.taskItem}>
                                  <input
                                    type="checkbox"
                                    id={`task-${task.id}`}
                                    checked={selectedTaskIds.includes(task.id.toString())}
                                    onChange={() => handleTaskToggle(task.id)}
                                    style={styles.taskCheckbox}
                                  />
                                  <div style={styles.taskDetails}>
                                    <div style={styles.taskTitle}>{task.title}</div>
                                    <div style={styles.taskDueDate}>
                                      Due: {new Date(task.due_date).toLocaleDateString()}
                                    </div>
                                    <div style={{fontSize: '10px', color: '#A0AEC0'}}>
                                      ID: {task.id} (type: {typeof task.id})
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}

                        {/* Other Tasks - Fallback for tasks with unknown status */}
                        {tasks.filter(task =>
                          task.status !== 'Done' &&
                          task.status !== 'In Progress' &&
                          task.status !== 'Pending'
                        ).length > 0 && (
                          <div style={styles.taskCategory}>
                            <div style={{...styles.taskCategoryTitle, color: '#4A5568'}}>
                              Other Tasks
                            </div>
                            {tasks
                              .filter(task =>
                                task.status !== 'Done' &&
                                task.status !== 'In Progress' &&
                                task.status !== 'Pending'
                              )
                              .map(task => (
                                <div key={task.id} style={styles.taskItem}>
                                  <input
                                    type="checkbox"
                                    id={`task-${task.id}`}
                                    checked={selectedTaskIds.includes(task.id.toString())}
                                    onChange={() => handleTaskToggle(task.id)}
                                    style={styles.taskCheckbox}
                                  />
                                  <div style={styles.taskDetails}>
                                    <div style={styles.taskTitle}>{task.title}</div>
                                    <div style={styles.taskDueDate}>
                                      Status: {task.status || 'Unknown'}
                                      {task.due_date && (`, Due: ${new Date(task.due_date).toLocaleDateString()}`)}
                                    </div>
                                    <div style={{fontSize: '10px', color: '#A0AEC0'}}>
                                      ID: {task.id} (type: {typeof task.id})
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Debug information for selected tasks */}
                  {selectedTaskIds.length > 0 && (
                    <div style={styles.taskDebug}>
                      <div style={{fontWeight: '500', marginBottom: '4px'}}>Selected Task IDs:</div>
                      <pre style={{margin: '0', fontSize: '12px', overflowX: 'auto'}}>
                        {JSON.stringify(selectedTaskIds, null, 2)}
                      </pre>
                      <div style={{marginTop: '8px', fontSize: '12px', color: '#4A5568'}}>
                        Types: {selectedTaskIds.map(id => typeof id).join(', ')}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div style={styles.footer}>
            <button
              type="button"
              style={{...styles.button, ...styles.outlineButton}}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{...styles.button, ...styles.primaryButton, opacity: isSubmitting ? 0.7 : 1}}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : initialData ? 'Update' : 'Submit Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WeeklyUpdateForm;