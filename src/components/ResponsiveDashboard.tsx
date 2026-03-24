import { useMobile } from '../hooks/useMobile';
import { ModernDashboardSimple } from './ModernDashboardSimple';
import { MobileDashboard } from './MobileDashboard';

export function ResponsiveDashboard() {
  const isMobile = useMobile();

  return isMobile ? <MobileDashboard /> : <ModernDashboardSimple />;
}
