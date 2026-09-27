import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardLayout from "../layout/Layout";

import MainCalendarPage from "../pages/MainCalendarPage";
import GroupVisitsPage from "../pages/GroupVisitsPage";
import EventsActivitiesPage from "../pages/EventsActivitiesPage";
import EducationPage from "../pages/EducationPage";
import EventPage from "../pages/EventPage";
import ReportsPage from "../pages/ReportsPage";
import GroupVisitsReportPage from "../pages/GroupVisitsReportPage";
import { LoginPage } from "../pages/LoginPage";

export const RoutesApp = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<MainCalendarPage />} />

          <Route path="/login" element={<LoginPage />} />

          <Route path="/groupVisits" element={<GroupVisitsPage />} />

          <Route path="/eventsActivities" element={<EventsActivitiesPage />} />

          <Route path="/education" element={<EducationPage />} />

          <Route path="/eventForm" element={<EventPage />} />

          <Route path="/reports" element={<ReportsPage />} />

          <Route
            path="/reports/groupVisits"
            element={<GroupVisitsReportPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
