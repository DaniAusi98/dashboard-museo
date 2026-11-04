export function getVisitStatusRowClassName({ row }) {
  switch (row.estado) {
    case 'Activa':
      return 'visit-status--active';
    case 'Reprogramada':
      return 'visit-status--rescheduled';
    case 'Cancelada':
      return 'visit-status--cancelled';
    default:
      return '';
  }
}

export const visitStatusGridSx = {
  '& .MuiDataGrid-row.visit-status--active': {
    backgroundColor: '#edf7ed',
    '&:hover': {
      backgroundColor: '#e3f1e3',
    },
  },
  '& .MuiDataGrid-row.visit-status--rescheduled': {
    backgroundColor: '#fff8e1',
    '&:hover': {
      backgroundColor: '#fff2cc',
    },
  },
  '& .MuiDataGrid-row.visit-status--cancelled': {
    backgroundColor: '#fdeeee',
    '&:hover': {
      backgroundColor: '#f9dfdf',
    },
  },
};
