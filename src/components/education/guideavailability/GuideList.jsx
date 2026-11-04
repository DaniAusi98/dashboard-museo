import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../lib/auth';
import { API_URL } from '../../../services/api';
import { Alert, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';

export default function GuideList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const diasSemana = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado',
    7: 'Domingo',
  };

  const loadGuides = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.authenticatedFetch(
        `${API_URL}/api/v1/Guia/getGuides`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error('No se pudieron obtener los guías');
      }

      const data = await response.json();
      setRows(data.data.items);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGuides();
  }, [loadGuides]);

  const handleRowEdit = useCallback(
    (guide) => () => {
      navigate(`/guides/${guide.id}/edit`);
    },
    [navigate]
  );

  const columns = [
    {
      field: 'nombreCompleto',
      headerName: 'Nombre y apellido',
      flex: 1.5,
      minWidth: 200,
      valueGetter: (_, row) =>
        [row.nombre, row.apellido].filter(Boolean).join(' ') || 'Sin nombre',
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1.5,
      minWidth: 220,
      valueGetter: (value) => value || '—',
    },
    {
      field: 'telefono',
      headerName: 'Teléfono',
      flex: 1,
      minWidth: 150,
      valueGetter: (value) => value || '—',
    },
    {
      field: 'activo',
      headerName: 'Estado',
      flex: 1,
      minWidth: 120,
      valueGetter: (value) => (value ? 'Activo' : 'Inactivo'),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      width: 100,
      getActions: ({ row }) => [
        <GridActionsCellItem
          key="edit-item"
          icon={<EditIcon />}
          label="Editar guía"
          onClick={handleRowEdit(row)}
        />,
      ],
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {error ? (
        <Alert severity="error">{error.message}</Alert>
      ) : (
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
        />
      )}
    </Box>
  );
}
