import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
  AreaChart, Area
} from "recharts";
import {
  Loader2, Calendar, Users, AlertTriangle, CheckCircle,
  Activity, BarChart3, ChevronUp, ChevronDown
} from "lucide-react";

import analyticsService from '../services/analyticsService';

// Color palette for charts
const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'
];

// Default empty data structures for safety
const DEFAULT_PROJECT_DATA = {
  statusDistribution: [],
  monthlyProgress: [],
  delayRisk: [],
  activityTimeline: []
};

const DEFAULT_USER_DATA = {
  roleDistribution: [],
  topContributors: [],
  activityByDay: [],
  projectAssignments: []
};

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("projects");

  // Analytics data states
  const [projectData, setProjectData] = useState(DEFAULT_PROJECT_DATA);
  const [userData, setUserData] = useState(DEFAULT_USER_DATA);

  // Function to validate data structure and provide defaults for missing data
  const validateProjectData = (data) => {
    if (!data) return DEFAULT_PROJECT_DATA;

    return {
      statusDistribution: Array.isArray(data.statusDistribution) ? data.statusDistribution : [],
      monthlyProgress: Array.isArray(data.monthlyProgress) ? data.monthlyProgress : [],
      delayRisk: Array.isArray(data.delayRisk) ? data.delayRisk : [],
      activityTimeline: Array.isArray(data.activityTimeline) ? data.activityTimeline : []
    };
  };

  const validateUserData = (data) => {
    if (!data) return DEFAULT_USER_DATA;

    return {
      roleDistribution: Array.isArray(data.roleDistribution) ? data.roleDistribution : [],
      topContributors: Array.isArray(data.topContributors) ? data.topContributors : [],
      activityByDay: Array.isArray(data.activityByDay) ? data.activityByDay : [],
      projectAssignments: Array.isArray(data.projectAssignments) ? data.projectAssignments : []
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Option 1: Fetch comprehensive dashboard data in one call
        const dashboardData = await analyticsService.getDashboardAnalytics();
        if (dashboardData && dashboardData.projects && dashboardData.users) {
          setProjectData(validateProjectData(dashboardData.projects));
          setUserData(validateUserData(dashboardData.users));
          console.log("Loaded dashboard data:", dashboardData);
        } else {
          // Option 2: Fetch project and user data separately as fallback
          console.log("Dashboard data not available, fetching separately");
          const projectsResponse = await analyticsService.getProjectsAnalytics();
          const usersResponse = await analyticsService.getUsersAnalytics();

          setProjectData(validateProjectData(projectsResponse));
          setUserData(validateUserData(usersResponse));
        }
      } catch (err) {
        console.error('Failed to fetch analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading analytics data...</span>
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

  // Safety check for empty data
  const hasProjectData = projectData.statusDistribution.length > 0;
  const hasUserData = userData.roleDistribution.length > 0;

  if (!hasProjectData && !hasUserData) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <span className="text-lg font-medium">No analytics data available</span>
        <p className="mt-2 text-sm text-center max-w-md">
          There isn't enough project or user data to display analytics yet.
          Try adding more projects, tasks, or team members.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      </div>

      <Tabs defaultValue="projects" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="projects" className="text-base py-3">Project Analytics</TabsTrigger>
          <TabsTrigger value="users" className="text-base py-3">User Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6">
          {!hasProjectData ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <span className="text-lg font-medium">No project data available</span>
              <p className="mt-2 text-sm text-center max-w-md">
                Try adding more projects and activities to see analytics here.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Total Projects"
                  value={projectData.statusDistribution.reduce((sum, item) => sum + item.value, 0)}
                  icon={<Calendar className="h-5 w-5" />}
                />
                <MetricCard
                  title="Active Projects"
                  value={projectData.statusDistribution.find(item => item.name === 'Active')?.value || 0}
                  icon={<Activity className="h-5 w-5" />}
                  trend={projectData.monthlyProgress.length >= 2 ? {
                    value: calculateTrend(
                      projectData.monthlyProgress[projectData.monthlyProgress.length - 1]?.activeProjects || 0,
                      projectData.monthlyProgress[projectData.monthlyProgress.length - 2]?.activeProjects || 0
                    ),
                    isPositive: (projectData.monthlyProgress[projectData.monthlyProgress.length - 1]?.activeProjects || 0) >=
                                (projectData.monthlyProgress[projectData.monthlyProgress.length - 2]?.activeProjects || 0)
                  } : null}
                />
                <MetricCard
                  title="Completed Projects"
                  value={projectData.statusDistribution.find(item => item.name === 'Completed')?.value || 0}
                  icon={<CheckCircle className="h-5 w-5" />}
                />
                <MetricCard
                  title="At Risk Projects"
                  value={projectData.delayRisk.filter(item => item.risk === 'High').length}
                  icon={<AlertTriangle className="h-5 w-5" />}
                  trend={projectData.delayRisk.length >= 2 ? {
                    value: projectData.delayRisk.filter(item => item.risk === 'High').length,
                    isPositive: false
                  } : null}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Project Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {projectData.statusDistribution.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No status data available
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={projectData.statusDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {projectData.statusDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} projects`, 'Count']} />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Monthly Progress Tracking</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {projectData.monthlyProgress.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No progress data available
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={projectData.monthlyProgress}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Legend />
                          <Line yAxisId="left" type="monotone" dataKey="completed" stroke="#10B981" name="Completed Tasks" />
                          <Line yAxisId="left" type="monotone" dataKey="added" stroke="#3B82F6" name="New Tasks" />
                          <Line yAxisId="right" type="monotone" dataKey="activeProjects" stroke="#F59E0B" name="Active Projects" />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Project Delay Risk Assessment</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {projectData.delayRisk.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No risk assessment data available
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={projectData.delayRisk}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(value) => `${value}%`} />
                          <Tooltip formatter={(value) => [`${value}%`, 'Risk Percentage']} />
                          <Legend />
                          <Bar dataKey="riskPercentage" name="Delay Risk" fill="#EF4444">
                            {projectData.delayRisk.map((entry, index) => {
                              let color = '#10B981'; // Green for low risk
                              if (entry.risk === 'Medium') color = '#F59E0B'; // Yellow for medium risk
                              if (entry.risk === 'High') color = '#EF4444'; // Red for high risk
                              return <Cell key={`cell-${index}`} fill={color} />;
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Project Activity Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {projectData.activityTimeline.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No activity timeline data available
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={projectData.activityTimeline}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Area type="monotone" dataKey="updates" stackId="1" stroke="#8884d8" fill="#8884d8" name="Updates" />
                          <Area type="monotone" dataKey="tasks" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Tasks" />
                          <Area type="monotone" dataKey="comments" stackId="1" stroke="#ffc658" fill="#ffc658" name="Comments" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {!hasUserData ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <span className="text-lg font-medium">No user data available</span>
              <p className="mt-2 text-sm text-center max-w-md">
                Try adding more users and assigning them to projects to see analytics here.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Total Users"
                  value={userData.roleDistribution.reduce((sum, item) => sum + item.value, 0)}
                  icon={<Users className="h-5 w-5" />}
                />
                <MetricCard
                  title="Active Users"
                  value={userData.topContributors.length}
                  icon={<Activity className="h-5 w-5" />}
                  trend={{
                    value: 8,
                    isPositive: true
                  }}
                />
                <MetricCard
                  title="Project Managers"
                  value={userData.roleDistribution.find(item => item.name === 'Manager')?.value || 0}
                  icon={<BarChart3 className="h-5 w-5" />}
                />
                <MetricCard
                  title="Contributors"
                  value={userData.roleDistribution.find(item => item.name === 'Contributor')?.value || 0}
                  icon={<Users className="h-5 w-5" />}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">User Role Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {userData.roleDistribution.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No role distribution data available
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={userData.roleDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {userData.roleDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} users`, 'Count']} />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Top Contributors</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {userData.topContributors.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No contributor data available
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={userData.topContributors}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="name" />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="updates" fill="#8884d8" name="Updates" />
                          <Bar dataKey="tasks" fill="#82ca9d" name="Tasks Completed" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">User Activity by Day of Week</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {userData.activityByDay.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No activity data available
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={userData.activityByDay}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="updates" fill="#3B82F6" name="Updates" />
                          <Bar dataKey="comments" fill="#F59E0B" name="Comments" />
                          <Bar dataKey="tasks" fill="#10B981" name="Tasks" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Project Assignments per User</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px] overflow-auto">
                    {userData.projectAssignments.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No project assignment data available
                      </div>
                    ) : (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projects</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Tasks</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {userData.projectAssignments.map((user, i) => (
                            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <Badge variant={user.role === 'Admin' ? 'destructive' : user.role === 'Manager' ? 'default' : 'outline'}>
                                  {user.role}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.projectCount}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.activeTasks}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper function to calculate percentage change
const calculateTrend = (current, previous) => {
  if (!previous) return 0;
  return Math.round(((current - previous) / previous) * 100);
};

// Metric Card Component
const MetricCard = ({ title, value, icon, trend }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="text-gray-500">{title}</div>
          <div className="bg-blue-100 p-2 rounded-full text-blue-600">
            {icon}
          </div>
        </div>
        <div className="text-2xl font-bold mt-2">{value}</div>
        {trend && (
          <div className={`flex items-center mt-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? (
              <ChevronUp className="h-4 w-4 mr-1" />
            ) : (
              <ChevronDown className="h-4 w-4 mr-1" />
            )}
            <span>{trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}% from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticsDashboard;