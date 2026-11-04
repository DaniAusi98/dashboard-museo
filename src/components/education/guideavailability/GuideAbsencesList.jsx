import { useEffect, useState, useCallback } from 'react';
import { authService } from '../../../lib/auth';
import { API_URL } from '../../../services/api';
import { Alert, Box, IconButton, Stack, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { DataGrid } from '@mui/x-data-grid';

export default function GuideAbsencesList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadAbsences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.authenticatedFetch(
        `${API_URL}/api/v1/Guia/getabsences?pageIndex=1&pageSize=100`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error('No se pudieron obtener las ausencias');
      }

      const data = await response.json();

      setRows(
        (data.data?.items ?? []).map((ausencia, index) => ({
          ...ausencia,
          id: `${ausencia.guiaId}-${ausencia.fechaDesde}-${index}`,
        }))
      );
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAbsences();
  }, [loadAbsences]);

  const formatDateTime = (value) => {
    if (!value) return '—';

    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(value));
  };

  const columns = [
    {
      field: 'nombreCompleto',
      headerName: 'Guía',
      flex: 1.2,
      minWidth: 170,
      valueGetter: (_, row) =>
        [row.nombreGuia, row.apellidoGuia].filter(Boolean).join(' ') ||
        'No disponible',
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1.3,
      minWidth: 210,
      valueGetter: (_, row) => row.email || '—',
    },
    {
      field: 'telefono',
      headerName: 'Teléfono',
      flex: 1,
      minWidth: 140,
      valueGetter: (_, row) => row.telefono || '—',
    },
    {
      field: 'fechaDesde',
      headerName: 'Desde',
      flex: 1,
      minWidth: 160,
      valueFormatter: (value) => formatDateTime(value),
    },
    {
      field: 'fechaHasta',
      headerName: 'Hasta',
      flex: 1,
      minWidth: 160,
      valueFormatter: (value) => formatDateTime(value),
    },
    {
      field: 'motivo',
      headerName: 'Motivo',
      flex: 1.5,
      minWidth: 200,
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Stack
        sx={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          mb: 2,
        }}
      >
        <Tooltip title="Actualizar ausencias">
          <span>
            <IconButton
              onClick={loadAbsences}
              disabled={loading}
              aria-label="Actualizar ausencias"
            >
              <RefreshIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
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
          pagination: {
            paginationModel: { pageSize: 10, page: 0 },
          },
        }}
        autoHeight
        sx={{
          '& .MuiDataGrid-cell': {
            display: 'flex',
            alignItems: 'center',
          },
        }}
      />
    </Box>
  );
}
