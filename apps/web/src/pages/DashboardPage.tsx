import React from 'react';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Stats */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Courses</h3>
          <p className="text-4xl font-bold text-primary">3</p>
          <Link to="/courses" className="text-sm text-primary hover:underline mt-2 inline-block">
            View all →
          </Link>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Lab Reports</h3>
          <p className="text-4xl font-bold text-secondary">12</p>
          <Link to="/lab-reports" className="text-sm text-secondary hover:underline mt-2 inline-block">
            View all →
          </Link>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Records</h3>
          <p className="text-4xl font-bold text-success">27</p>
          <Link to="/records" className="text-sm text-success hover:underline mt-2 inline-block">
            View all →
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-semibold">Lab Report Added</p>
              <p className="text-sm text-gray-500">Hemoglobin test results</p>
            </div>
            <span className="text-sm text-gray-400">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-semibold">Course Updated</p>
              <p className="text-sm text-gray-500">Amoxicillin 500mg marked completed</p>
            </div>
            <span className="text-sm text-gray-400">1 day ago</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-semibold">Document Uploaded</p>
              <p className="text-sm text-gray-500">Prescription scan verified</p>
            </div>
            <span className="text-sm text-gray-400">3 days ago</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 flex gap-4">
        <Link to="/upload" className="btn-primary">
          Upload Document
        </Link>
        <Link to="/courses" className="btn-secondary">
          Add Medication
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;
