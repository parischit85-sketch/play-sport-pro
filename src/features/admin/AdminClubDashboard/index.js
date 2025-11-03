/**
 * ✅ FIX #22 (Sprint 4+): Refactored AdminClubDashboard subcomponents
 * Barrel export for all dashboard subcomponents
 * 
 * This structure improves maintainability by splitting a 1,500+ line component
 * into smaller, focused, reusable components
 */

export { default as DashboardStats } from './DashboardStats.jsx';
export { default as DashboardBookings } from './DashboardBookings.jsx';
export { default as DashboardLessons } from './DashboardLessons.jsx';
export { default as DashboardInstructors } from './DashboardInstructors.jsx';
// Additional subcomponents can be added here as they're created:
// export { default as CreateTimeslotModal } from './CreateTimeslotModal';
