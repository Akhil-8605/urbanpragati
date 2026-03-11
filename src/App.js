import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LoginPage from './Auth/login/LoginPage';
import Signup from './Auth/signup/Signup';

import HomePage from './HomePage';
import ProtectedRoute from './components/ProtectedRoute';
import ChatBot from './ChatBot';

import CitizenDashboard from './Citizens/pages/CitizenDashboard';
import WaterService from './Citizens/pages/WaterService';
import ElectricityService from './Citizens/pages/ElectricityService';
import SanitationService from './Citizens/pages/SanitationService';
import PropertyTax from './Citizens/pages/PropertyTax';
import RoadRepair from './Citizens/pages/RoadRepair';
import DevelopmentVoting from './Citizens/pages/DevelopmentVoting';
import FeedbackPage from './Citizens/pages/FeedbackPage';
import BestCitizen from './Citizens/pages/BestCitizen';

import AdminDashboard from './Muncipal/pages/AdminDashboard';
import WaterDept from './Muncipal/pages/WaterDept';
import ElectricityDept from './Muncipal/pages/ElectricityDept';
import SanitationDept from './Muncipal/pages/SanitationDept';
import PropertyTaxDept from './Muncipal/pages/PropertyTaxDept';
import RoadRepairDept from './Muncipal/pages/RoadRepairDept';
import DevelopmentMgmt from './Muncipal/pages/DevelopmentMgmt';
import FeedbackMgmt from './Muncipal/pages/FeedbackMgmt';
import BestCitizenMgmt from './Muncipal/pages/BestCitizenMgmt';

import WorkerDashboard from './Worker/WorkerDashboard';
import WorkerTasks from './Worker/WorkerTasks';
import WorkerTaskDetail from './Worker/WorkerTaskDetail';

export default function App() {
  return (
    <Router>
      <ChatBot />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/citizen-dashboard" element={<ProtectedRoute allowedRoles={['citizen']}><CitizenDashboard /></ProtectedRoute>} />
        <Route path="/citizen/water" element={<ProtectedRoute allowedRoles={['citizen']}><WaterService /></ProtectedRoute>} />
        <Route path="/citizen/electricity" element={<ProtectedRoute allowedRoles={['citizen']}><ElectricityService /></ProtectedRoute>} />
        <Route path="/citizen/sanitation" element={<ProtectedRoute allowedRoles={['citizen']}><SanitationService /></ProtectedRoute>} />
        <Route path="/citizen/property-tax" element={<ProtectedRoute allowedRoles={['citizen']}><PropertyTax /></ProtectedRoute>} />
        <Route path="/citizen/road-repair" element={<ProtectedRoute allowedRoles={['citizen']}><RoadRepair /></ProtectedRoute>} />
        <Route path="/citizen/development" element={<ProtectedRoute allowedRoles={['citizen']}><DevelopmentVoting /></ProtectedRoute>} />
        <Route path="/citizen/feedback" element={<ProtectedRoute allowedRoles={['citizen']}><FeedbackPage /></ProtectedRoute>} />
        <Route path="/citizen/best-citizen" element={<BestCitizen />} />

        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/water" element={<ProtectedRoute allowedRoles={['admin']}><WaterDept /></ProtectedRoute>} />
        <Route path="/admin/electricity" element={<ProtectedRoute allowedRoles={['admin']}><ElectricityDept /></ProtectedRoute>} />
        <Route path="/admin/sanitation" element={<ProtectedRoute allowedRoles={['admin']}><SanitationDept /></ProtectedRoute>} />
        <Route path="/admin/property-tax" element={<ProtectedRoute allowedRoles={['admin']}><PropertyTaxDept /></ProtectedRoute>} />
        <Route path="/admin/road-repair" element={<ProtectedRoute allowedRoles={['admin']}><RoadRepairDept /></ProtectedRoute>} />
        <Route path="/admin/development" element={<ProtectedRoute allowedRoles={['admin']}><DevelopmentMgmt /></ProtectedRoute>} />
        <Route path="/admin/feedback" element={<ProtectedRoute allowedRoles={['admin']}><FeedbackMgmt /></ProtectedRoute>} />
        <Route path="/admin/best-citizen" element={<ProtectedRoute allowedRoles={['admin']}><BestCitizenMgmt /></ProtectedRoute>} />

        <Route path="/worker" element={<ProtectedRoute allowedRoles={['worker']}><WorkerDashboard /></ProtectedRoute>} />
        <Route path="/worker/tasks" element={<ProtectedRoute allowedRoles={['worker']}><WorkerTasks /></ProtectedRoute>} />
        <Route path="/worker/tasks/:id" element={<ProtectedRoute allowedRoles={['worker']}><WorkerTaskDetail /></ProtectedRoute>} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}