import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  BookOpen,
  Tag as TagIcon,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PlusCircle,
  BarChart3,
  Lock,
  ArrowLeft,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_COURSES, INITIAL_TAGS, INITIAL_PROFILES } from '../lib/mockData';
import { Course, Tag } from '../types';

export const AdminPage: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'courses' | 'tags' | 'faculty' | 'reports'>('courses');
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [tags, setTags] = useState<Tag[]>(INITIAL_TAGS);

  // New course modal state
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseDept, setNewCourseDept] = useState('');

  // New tag state
  const [newTagName, setNewTagName] = useState('');

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Administrator Privilege Required
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          Admin portal requires verified administrative authorization to manage university courses, approve faculty credentials, and moderate reports.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <Link
            to="/dashboard"
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Link>
          <Link
            to="/auth"
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-purple-600 text-white shadow-md hover:bg-purple-500 transition-all flex items-center justify-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In as Admin</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName || !newCourseCode) return;
    const added: Course = {
      id: `course-${Date.now()}`,
      name: newCourseName,
      course_code: newCourseCode,
      description: 'Departmental curriculum course',
      department: newCourseDept || 'Computer Science',
      is_active: true,
      color: '#6366f1',
      icon: 'BookOpen',
      created_at: new Date().toISOString(),
    };
    setCourses((prev) => [...prev, added]);
    setNewCourseName('');
    setNewCourseCode('');
    setNewCourseDept('');
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName) return;
    const added: Tag = {
      id: `tag-${Date.now()}`,
      name: newTagName,
      slug: newTagName.toLowerCase().replace(/\s+/g, '-'),
      category: 'Curriculum',
      description: 'Academic topic tag',
      created_at: new Date().toISOString(),
    };
    setTags((prev) => [...prev, added]);
    setNewTagName('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Administrative Control Center
            </h1>
          </div>
          <p className="mt-1 text-slate-500">
            System governance, approved courses, tag indexing, and faculty authorization.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'courses'
              ? 'bg-purple-600 text-white'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Curriculum Courses ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab('tags')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'tags'
              ? 'bg-purple-600 text-white'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Concept Tags ({tags.length})
        </button>
        <button
          onClick={() => setActiveTab('faculty')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'faculty'
              ? 'bg-purple-600 text-white'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Faculty Approvals (2 Active)
        </button>
      </div>

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          {/* Add Course Form */}
          <form onSubmit={handleAddCourse} className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
              <PlusCircle className="w-4 h-4 text-purple-500" />
              <span>Register New Course Offering</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Course Name (e.g. Distributed Systems)"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                required
              />
              <input
                type="text"
                placeholder="Course Code (e.g. CS-402)"
                value={newCourseCode}
                onChange={(e) => setNewCourseCode(e.target.value)}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                required
              />
              <input
                type="text"
                placeholder="Department (e.g. Computer Science)"
                value={newCourseDept}
                onChange={(e) => setNewCourseDept(e.target.value)}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-xs"
              >
                Add Course to System
              </button>
            </div>
          </form>

          {/* Courses Table */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase bg-slate-50 dark:bg-slate-950">
                  <th className="py-3 px-5">Code</th>
                  <th className="py-3 px-5">Course Title</th>
                  <th className="py-3 px-5">Department</th>
                  <th className="py-3 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {courses.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3.5 px-5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {c.course_code}
                    </td>
                    <td className="py-3.5 px-5 text-slate-900 dark:text-white font-bold">{c.name}</td>
                    <td className="py-3.5 px-5 text-slate-500">{c.department}</td>
                    <td className="py-3.5 px-5 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tags Tab */}
      {activeTab === 'tags' && (
        <div className="space-y-6">
          <form onSubmit={handleAddTag} className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 flex gap-3">
            <input
              type="text"
              placeholder="Tag Name (e.g. Graph Theory, Transformers)"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl font-bold bg-purple-600 text-white"
            >
              Add Tag
            </button>
          </form>

          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t.id}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
              >
                #{t.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Faculty Approvals Tab */}
      {activeTab === 'faculty' && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Approved Faculty Reviewers
          </h3>
          <p className="text-slate-500">
            Faculty accounts have certified authority to verify peer answers and grant official endorsements.
          </p>
          <div className="space-y-3 pt-2">
            {INITIAL_PROFILES.filter((p) => p.role === 'faculty').map((fac) => (
              <div
                key={fac.id}
                className="flex items-center justify-between p-4 rounded-2xl border border-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-950/20"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={fac.avatar_url || ''}
                    alt={fac.display_name}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-emerald-500/30"
                  />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {fac.display_name}
                    </div>
                    <div className="text-[11px] text-slate-500">{fac.department} • {fac.year_of_study}</div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                  Approved Faculty
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
