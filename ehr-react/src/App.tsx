import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { FacilityProvider } from './contexts/facility-context';
import { TabProvider } from './contexts/tab-context';
import { ProtectedRoute } from './components/permissions/ProtectedRoute';

// Import pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientNew from './pages/PatientNew';
import PatientDetail from './pages/PatientDetail';
import PatientEdit from './pages/PatientEdit';
import Appointments from './pages/Appointments';
import EncounterDetail from './pages/EncounterDetail';
import Billing from './pages/Billing';
import Admin from './pages/Admin';
import Settings from './pages/Settings';
import Staff from './pages/Staff';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Inventory from './pages/Inventory';
import MedicalCodes from './pages/MedicalCodes';
import AuditLogs from './pages/AuditLogs';
import AcceptInvitation from './pages/AcceptInvitation';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FacilityProvider>
          <TabProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/accept-invitation/:token" element={<AcceptInvitation />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />

              {/* Patient routes */}
              <Route
                path="/patients"
                element={
                  <ProtectedRoute>
                    <Patients />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patients/new"
                element={
                  <ProtectedRoute>
                    <PatientNew />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patients/:id"
                element={
                  <ProtectedRoute>
                    <PatientDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patients/:id/edit"
                element={
                  <ProtectedRoute>
                    <PatientEdit />
                  </ProtectedRoute>
                }
              />

              {/* Appointments */}
              <Route
                path="/appointments"
                element={
                  <ProtectedRoute>
                    <Appointments />
                  </ProtectedRoute>
                }
              />

              {/* Encounters */}
              <Route
                path="/encounters/:id"
                element={
                  <ProtectedRoute>
                    <EncounterDetail />
                  </ProtectedRoute>
                }
              />

              {/* Billing */}
              <Route
                path="/billing/*"
                element={
                  <ProtectedRoute>
                    <Billing />
                  </ProtectedRoute>
                }
              />

              {/* Admin */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                }
              />

              {/* Settings */}
              <Route
                path="/settings/*"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              {/* Staff */}
              <Route
                path="/staff"
                element={
                  <ProtectedRoute>
                    <Staff />
                  </ProtectedRoute>
                }
              />

              {/* Users */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <Users />
                  </ProtectedRoute>
                }
              />

              {/* Roles */}
              <Route
                path="/roles"
                element={
                  <ProtectedRoute>
                    <Roles />
                  </ProtectedRoute>
                }
              />

              {/* Inventory */}
              <Route
                path="/inventory"
                element={
                  <ProtectedRoute>
                    <Inventory />
                  </ProtectedRoute>
                }
              />

              {/* Medical Codes */}
              <Route
                path="/medical-codes"
                element={
                  <ProtectedRoute>
                    <MedicalCodes />
                  </ProtectedRoute>
                }
              />

              {/* Audit Logs */}
              <Route
                path="/audit-logs"
                element={
                  <ProtectedRoute>
                    <AuditLogs />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </TabProvider>
        </FacilityProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
