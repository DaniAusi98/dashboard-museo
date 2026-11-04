import GuidedEducationPopover from './GuidedEducationPopover';
import EducationalActivityPopover from './EducationalActivityPopover';

export default function CalendarEventPopover({
  open,
  position,
  event,
  onClose,
}) {
  if (!event) return null;

  const { tipo, visit, actividad } = event;

  if (tipo === 'visitaGuiada') {
    return (
      <GuidedEducationPopover
        open={open}
        position={position}
        visit={visit}
        onClose={onClose}
      />
    );
  }

  if (tipo === 'actividadEducativa') {
    return (
      <EducationalActivityPopover
        open={open}
        position={position}
        actividad={actividad}
        onClose={onClose}
      />
    );
  }

  return null;
}
