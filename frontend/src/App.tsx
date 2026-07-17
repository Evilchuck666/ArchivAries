import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';
import { Spinner } from './components/ui/Spinner';

import { PublicLayout } from './layouts/PublicLayout';
import { AppLayout } from './layouts/AppLayout';
import { ProtectedRoute } from './router/ProtectedRoute';
import { PermissionRoute } from './router/PermissionRoute';

import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { ActivatePage } from './pages/auth/ActivatePage';

import { DashboardPage } from './pages/dashboard/DashboardPage';

import { MemberListPage } from './pages/members/MemberListPage';
import { MemberDetailPage } from './pages/members/MemberDetailPage';
import { MemberEditPage } from './pages/members/MemberEditPage';

import { EventListPage } from './pages/events/EventListPage';
import { CalendarPage } from './pages/events/CalendarPage';
import { EventDetailPage } from './pages/events/EventDetailPage';
import { EventCreatePage } from './pages/events/EventCreatePage';
import { EventEditPage } from './pages/events/EventEditPage';

import { DocumentListPage } from './pages/documents/DocumentListPage';
import { DocumentDetailPage } from './pages/documents/DocumentDetailPage';
import { DocumentCreatePage } from './pages/documents/DocumentCreatePage';
import { DocumentEditPage } from './pages/documents/DocumentEditPage';

import { NewsListPage } from './pages/news/NewsListPage';
import { NewsDetailPage } from './pages/news/NewsDetailPage';
import { NewsCreatePage } from './pages/news/NewsCreatePage';
import { NewsEditPage } from './pages/news/NewsEditPage';

import { LoreListPage } from './pages/lore/LoreListPage';
import { LoreDetailPage } from './pages/lore/LoreDetailPage';
import { LoreCreatePage } from './pages/lore/LoreCreatePage';
import { LoreEditPage } from './pages/lore/LoreEditPage';

import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { PermissionsPage } from './pages/admin/PermissionsPage';
import { RolesPage } from './pages/admin/RolesPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<Spinner className="min-h-screen" />}>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/activate" element={<ActivatePage />} />
            </Route>

            {/* Protected app routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/app" element={<DashboardPage />} />

                {/* Members */}
                <Route element={<PermissionRoute permission="members.read" />}>
                  <Route path="/app/members" element={<MemberListPage />} />
                  <Route path="/app/members/:id" element={<MemberDetailPage />} />
                </Route>
                <Route element={<PermissionRoute permission="members.edit_own" redirectTo="/app/members/me" />}>
                  <Route path="/app/members/me/edit" element={<MemberEditPage />} />
                </Route>

                {/* Events */}
                <Route path="/app/events" element={<EventListPage />} />
                <Route path="/app/events/calendar" element={<CalendarPage />} />
                <Route path="/app/events/:id" element={<EventDetailPage />} />
                <Route element={<PermissionRoute permission="events.create" redirectTo="/app/events" />}>
                  <Route path="/app/events/create" element={<EventCreatePage />} />
                </Route>
                <Route element={<PermissionRoute permission="events.edit" redirectTo="/app/events/:id" />}>
                  <Route path="/app/events/:id/edit" element={<EventEditPage />} />
                </Route>

                {/* Documents */}
                <Route path="/app/documents" element={<DocumentListPage />} />
                <Route path="/app/documents/:id" element={<DocumentDetailPage />} />
                <Route element={<PermissionRoute permission="documents.create" redirectTo="/app/documents" />}>
                  <Route path="/app/documents/create" element={<DocumentCreatePage />} />
                </Route>
                <Route element={<PermissionRoute permission="documents.edit" redirectTo="/app/documents/:id" />}>
                  <Route path="/app/documents/:id/edit" element={<DocumentEditPage />} />
                </Route>

                {/* News */}
                <Route path="/app/news" element={<NewsListPage />} />
                <Route path="/app/news/:id" element={<NewsDetailPage />} />
                <Route element={<PermissionRoute permission="news.create" redirectTo="/app/news" />}>
                  <Route path="/app/news/create" element={<NewsCreatePage />} />
                </Route>
                <Route element={<PermissionRoute permission="news.edit" redirectTo="/app/news/:id" />}>
                  <Route path="/app/news/:id/edit" element={<NewsEditPage />} />
                </Route>

                {/* Lore */}
                <Route path="/app/lore" element={<LoreListPage />} />
                <Route path="/app/lore/:id" element={<LoreDetailPage />} />
                <Route element={<PermissionRoute permission="lore.create" redirectTo="/app/lore" />}>
                  <Route path="/app/lore/create" element={<LoreCreatePage />} />
                </Route>
                <Route element={<PermissionRoute permission="lore.edit" redirectTo="/app/lore/:id" />}>
                  <Route path="/app/lore/:id/edit" element={<LoreEditPage />} />
                </Route>

                {/* Edición de miembro por admin */}
                <Route element={<PermissionRoute permission="members.edit_any" redirectTo="/app/members/:id" />}>
                  <Route path="/app/members/:id/edit" element={<MemberEditPage />} />
                </Route>

                {/* Admin */}
                <Route element={<PermissionRoute permission="users.manage" />}>
                  <Route path="/app/admin" element={<AdminDashboardPage />} />
                  <Route path="/app/admin/users" element={<UserManagementPage />} />
                  <Route element={<PermissionRoute permission="permissions.manage" redirectTo="/app/admin" />}>
                    <Route path="/app/admin/permissions" element={<PermissionsPage />} />
                  </Route>
                  <Route element={<PermissionRoute permission="roles.manage" redirectTo="/app/admin" />}>
                    <Route path="/app/admin/roles" element={<RolesPage />} />
                  </Route>
                </Route>
              </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
