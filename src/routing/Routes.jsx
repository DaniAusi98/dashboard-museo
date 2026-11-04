import { BrowserRouter, Routes, Route } from 'react-router-dom';

import DashboardLayout from '../layout/Layout';

import MainCalendarPage from '../pages/MainCalendarPage';
import GroupVisitsPage from '../pages/GroupVisitsPage';
import EventsActivitiesPage from '../pages/EventsActivitiesPage';
import EducationPage from '../pages/EducationPage';
import EventPage from '../pages/EventPage';
import ReportsPage from '../pages/ReportsPage';
import GroupVisitsReportPage from '../pages/GroupVisitsReportPage';
import { LoginPage } from '../pages/LoginPage';
import EventReportPage from '../pages/EventReportPage';
import GuideAvailabilityPage from '../pages/GuideAvailabilityPage';
import GroupVisitDetailsPage from '../pages/GroupVisitDetailsPage';
import SelfGuidedDetailsPage from '../pages/SelfGuidedDetailsPage';
import RegisterStaffPage from '../pages/RegisterStaffPage';
import MuseumHoursPage from '../pages/MuseumHoursPage';
import ClosyngFormPage from '../pages/ClosyngDayFormPage';
import GroupVisitConfigurationPage from '../pages/GroupVisitConfigurationPage';
import EventProposalPage from '../pages/EventProposalPage';
import PropuestaMuestraPage from '../pages/PropuestaMuestraPage';

import CompletarFormularioEventoPage from '../pages/CompletarFormularioEventoPage';
import CompletarMuestraPage from '../pages/CompletarMuestraPage';

export const RoutesApp = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<MainCalendarPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/groupVisits" element={<GroupVisitsPage />} />
          <Route path="/eventsActivities" element={<EventsActivitiesPage />} />
          <Route path="/eventProposal" element={<EventProposalPage />} />
          <Route path="/propuestamuestra" element={<PropuestaMuestraPage />} />

          {/* Educación */}
          <Route path="/education" element={<EducationPage />} />
          <Route
            path="/guideAvailability"
            element={<GuideAvailabilityPage />}
          />
          <Route
            path="/groupVisitConfiguration"
            element={<GroupVisitConfigurationPage />}
          />

          <Route path="/eventForm" element={<EventPage />} />

          {/* Reportes */}
          <Route path="/reports" element={<ReportsPage />} />
          <Route
            path="/reports/groupVisits"
            element={<GroupVisitsReportPage />}
          />
          <Route path="/reports/events" element={<EventReportPage />} />

          {/* Detalles de visitas */}
          <Route path="/groupVisits/:id" element={<GroupVisitDetailsPage />} />
          <Route
            path="/selfGuidedVisits/:id"
            element={<SelfGuidedDetailsPage />}
          />

          {/* Configuración del museo */}
          <Route path="/museumHours" element={<MuseumHoursPage />} />
          <Route path="/closyngDayForm" element={<ClosyngFormPage />} />

          {/* Usuarios */}
          <Route path="/registerStaff" element={<RegisterStaffPage />} />
        </Route>
        {/* FUERA DEL LAYOUT */}

        <Route
          path="/eventos/formulario/:id"
          element={<CompletarFormularioEventoPage />}
        />
        <Route
          path="/muestras/formulario/:id"
          element={<CompletarMuestraPage />}
        />
      </Routes>
    </BrowserRouter>
  );
};
