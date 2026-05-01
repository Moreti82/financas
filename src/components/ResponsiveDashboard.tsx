import { useDeviceType } from '../hooks/useDeviceType';
import { ModernDashboardSimple } from './ModernDashboardSimple';
import { TabletDashboard } from './TabletDashboard';
import { MobileDashboard } from './MobileDashboard';

export function ResponsiveDashboard() {
  const deviceType = useDeviceType();

  switch (deviceType) {
    case 'mobile':
      return <MobileDashboard />;
    case 'tablet':
      return <TabletDashboard />;
    case 'desktop':
    default:
      return <ModernDashboardSimple />;
  }
}
