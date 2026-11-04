import GuideList from '../components/education/guideavailability/GuideList';
import GuideScheduleCalendar from '../components/education/guideavailability/GuideScheduleCalendar';
import FormularioAusenciaGuia from '../components/education/guideavailability/AbsencesForm';
import GuideAbsencesList from '../components/education/guideavailability/GuideAbsencesList';
import RegistrarGuia from '../components/education/guideavailability/RegistrarGuia';

export default function GuideAvailabilityPage() {
  return (
    <>
      <GuideList />
      <GuideScheduleCalendar />
      <FormularioAusenciaGuia />
      <GuideAbsencesList />
      <RegistrarGuia />
    </>
  );
}
