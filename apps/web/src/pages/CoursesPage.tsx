import React, { useState } from 'react';
import type { CourseData } from '@healthtrack/schemas';

const CoursesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  // Mock data - replace with actual API call
  const activeCourses: CourseData[] = [
    {
      courseId: '1',
      medicine: 'Amoxicillin 500 mg',
      dosage: '1 tablet',
      frequency: 'twice daily',
      startDate: '2025-11-05',
      endDate: '2025-11-12',
      doctor: 'Dr. A. Kumar',
      status: 'active',
      daysRemaining: 2,
    },
    {
      courseId: '2',
      medicine: 'Metformin 850 mg',
      dosage: '1 tablet',
      frequency: 'once daily',
      startDate: '2025-10-01',
      endDate: '2025-12-31',
      doctor: 'Dr. B. Sharma',
      status: 'active',
      daysRemaining: 51,
    },
  ];

  const pastCourses: CourseData[] = [
    {
      courseId: '3',
      medicine: 'Azithromycin 250 mg',
      dosage: '1 tablet',
      frequency: 'once daily',
      startDate: '2025-10-15',
      endDate: '2025-10-20',
      doctor: 'Dr. A. Kumar',
      status: 'completed',
    },
  ];

  const courses = activeTab === 'active' ? activeCourses : pastCourses;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Medication Courses</h1>
        <button className="btn-primary">+ Add Course</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'active'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Active Courses ({activeCourses.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'past'
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Past Courses ({pastCourses.length})
        </button>
      </div>

      {/* Course List */}
      <div className="space-y-4">
        {courses.map((course) => (
          <div key={course.courseId} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{course.medicine}</h3>
                <p className="text-gray-600">
                  {course.dosage} {course.frequency && `• ${course.frequency}`}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  course.status === 'active'
                    ? 'bg-success text-white'
                    : 'bg-gray-300 text-gray-700'
                }`}
              >
                {course.status === 'active' ? 'Active' : 'Completed'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Doctor</p>
                <p className="font-medium">{course.doctor}</p>
              </div>
              <div>
                <p className="text-gray-500">Duration</p>
                <p className="font-medium">
                  {course.startDate} to {course.endDate}
                </p>
              </div>
              {course.daysRemaining !== undefined && (
                <div>
                  <p className="text-gray-500">Days Remaining</p>
                  <p className="font-bold text-success">{course.daysRemaining} days</p>
                </div>
              )}
            </div>

            {course.status === 'active' && (
              <div className="mt-4 flex gap-2">
                <button className="btn-secondary text-sm">Mark Completed</button>
                <button className="text-sm text-gray-600 hover:text-gray-900">
                  Edit
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No {activeTab} courses found</p>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
