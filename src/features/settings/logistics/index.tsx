import { ContentSection } from '../components/content-section'
import { LogisticsTable } from './components/logistics-table'
import { logisticsData } from './data/data'

export function SettingsLogistics() {
  return (
    <ContentSection
      title='Logistics'
      desc='Manage your shipping methods and logistics settings.'
    >
      <LogisticsTable data={logisticsData} />
    </ContentSection>
  )
}

