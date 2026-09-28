import React, { useState } from 'react';
import { AdminInstituteData } from '../types';
import { DEMO_ADMIN_ID, DemoInstituteState } from '../data/demoInstitute';
import { AdminInstituteActions, AdminInstituteView } from './AdminInstituteView';
import { CreateTeacherModal } from './Modals/CreateTeacherModal';

interface DemoAdminHomeViewProps {
  data: AdminInstituteData;
  onChange: (update: (prev: DemoInstituteState) => DemoInstituteState) => void;
  onViewStudentProgress: (studentId: string) => void;
}

// /demo/admin: the same panel as the real /admin, but its actions only change the
// temporary demo state (reset on reload). Nothing is sent to the backend.
export const DemoAdminHomeView: React.FC<DemoAdminHomeViewProps> = ({ data, onChange, onViewStudentProgress }) => {
  const [isCreateTeacherOpen, setIsCreateTeacherOpen] = useState(false);

  const emailTaken = (email: string, exceptId?: string) =>
    data.users.some((u) => u.id !== exceptId && u.email.toLowerCase() === email.toLowerCase());

  const actions: AdminInstituteActions = {
    createTeacher: () => setIsCreateTeacherOpen(true),
    updateUser: async (id, values) => {
      if (emailTaken(values.email, id)) return 'El email ya está registrado.';
      onChange((prev) => ({ ...prev, edits: { ...prev.edits, [id]: values } }));
      return null;
    },
    setUserActive: async (id, isActive) => {
      onChange((prev) => ({
        ...prev,
        inactiveIds: isActive ? prev.inactiveIds.filter((x) => x !== id) : [...prev.inactiveIds, id],
      }));
      return null;
    },
    setUserCourses: async (id, courseIds) => {
      onChange((prev) => ({ ...prev, courseIds: { ...prev.courseIds, [id]: courseIds } }));
      return null;
    },
  };

  const banner = (
    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-semibold">
      <span className="material-symbols-outlined text-base text-amber-600">info</span>
      <span>Los cambios que hagas en la demostración son temporales: se reflejan en toda la demo y se descartan al recargar la página.</span>
    </div>
  );

  return (
    <>
      <AdminInstituteView data={data} actions={actions} currentUserId={DEMO_ADMIN_ID} banner={banner} onViewStudentProgress={onViewStudentProgress} />
      <CreateTeacherModal
        isOpen={isCreateTeacherOpen}
        onClose={() => setIsCreateTeacherOpen(false)}
        onSubmit={async ({ name, lastName, email }) => {
          if (emailTaken(email)) return 'El email ya está registrado.';
          const id = `dt-new-${Date.now()}`;
          onChange((prev) => ({
            ...prev,
            createdTeachers: [...prev.createdTeachers, { id, name, lastName, email: email.toLowerCase() }],
            courseIds: { ...prev.courseIds, [id]: [] },
          }));
          return null;
        }}
      />
    </>
  );
};
