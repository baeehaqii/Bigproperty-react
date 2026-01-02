/**
 * @deprecated This file is deprecated. 
 * Please use the new dashboard structure at: DashboardAgent/Overview/index.tsx
 * 
 * This file is kept for backward compatibility only.
 * The new dashboard uses a modular folder structure:
 * - DashboardAgent/
 *   - components/
 *     - DashboardAgentLayout.tsx (reusable layout)
 *   - Overview/
 *     - index.tsx (overview page)
 *   - UploadListing/
 *     - index.tsx (upload listing page)
 *   - Leads/
 *     - index.tsx (leads page) [placeholder]
 *   - Report/
 *     - index.tsx (report page) [placeholder]
 *   - etc.
 */

// Re-export from new location for backward compatibility
export { default } from './DashboardAgent/Overview'
