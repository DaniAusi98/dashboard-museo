import { useEffect, useState, useCallback } from 'react';
import { API_URL } from '../../services/api';
import { authService } from '../../lib/auth';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import useDialogs from '../../components/hooks/dialog/useDialogs';

export default function ClosingDaysList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingIds, setDeletingIds] = useState([]);

  const { confirm } = useDialogs();

  const loadClosingDays = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.authenticatedFetch(
        `${API_URL}/api/v1/ConfiguracionHorarioMuseo/get-closyng-day`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error('No se pudieron obtener los días de cierre');
      }

      const data = await response.json();
      setRows(data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClosingDays();
  }, [loadClosingDays]);

  const formatDate = (value) => {
    if (!value) return '—';

    // Evita desplazamientos de fecha por zona horaria.
    const [year, month, day] = value.split('T')[0].split('-');

    return `${day}/${month}/${year}`;
  };

  const handleDelete = useCallback(
    (id) => async () => {
      const confirmed = await confirm(
        '¿Estás seguro de que querés eliminar este día de cierre? Esta acción no se puede deshacer.',
        {
          title: 'Eliminar día de cierre',
          okText: 'Eliminar',
          cancelText: 'Cancelar',
          severity: 'error',
        }
      );

      if (!confirmed) return;

      try {
        setError(null);
        setDeletingIds((prev) => [...prev, id]);

        const response = await authService.authenticatedFetch(
          `${API_URL}/api/v1/ConfiguracionHorarioMuseo/delete-closyng-day?id=${encodeURIComponent(id)}`,
          { method: 'DELETE' }
        );

        if (!response.ok) {
          throw new Error('No se pudo eliminar el día de cierre');
        }

        setRows((prevRows) => prevRows.filter((row) => row.id !== id));
      } catch (error) {
        setError(error);
      } finally {
        setDeletingIds((prev) =>
          prev.filter((deletingId) => deletingId !== id)
        );
      }
    },
    [confirm]
  );

  const columns = [
    {
      field: 'fecha',
      headerName: 'Fecha',
      flex: 1,
      minWidth: 112,
      maxWidth: 120,

      valueGetter: (value) => formatDate(value),
    },
    {
      field: 'observaciones',
      headerName: 'Observaciones',
      flex: 1,
      minWidth: 180,
      valueGetter: (value) => value || '—',
    },
    {
      field: 'motivo',
      headerName: 'Motivo',
      flex: 1,
      maxWidth: 128,
      valueGetter: (value) => value || '—',
    },

    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      width: 100,
      getActions: ({ row }) => [
        <GridActionsCellItem
          key="delete-item"
          icon={<DeleteIcon />}
          label="Eliminar día de cierre"
          disabled={deletingIds.includes(row.id)}
          onClick={handleDelete(row.id)}
        />,
      ],
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          mb: 3,
        }}
      >
        <Typography variant="h5" component="h1" fontWeight={600}>
          Días de cierre
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            variant="outlined"
            onClick={loadClosingDays}
            disabled={loading}
            sx={{ minWidth: 0, p: 1 }}
          >
            <RefreshIcon />
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {}}
          >
            Crear
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message || 'Ocurrió un error inesperado'}
        </Alert>
      )}

      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.id}
        disableRowSelectionOnClick
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          sorting: {
            sortModel: [{ field: 'fecha', sort: 'asc' }],
          },
          pagination: {
            paginationModel: { pageSize: 10, page: 0 },
          },
        }}
        localeText={{
          noRowsLabel: 'No hay días de cierre registrados',
          footerRowSelected: (count) =>
            count !== 1
              ? `${count.toLocaleString()} filas seleccionadas`
              : '1 fila seleccionada',
        }}
      />
    </Box>
  );
}
