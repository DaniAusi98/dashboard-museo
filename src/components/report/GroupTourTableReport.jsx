import { useEffect, useMemo, useState } from "react";
import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import { getGroupVisitsReport } from "./groupVisitsReportService";
import Typography from "@mui/material/Typography";

export default function GroupTourTableReport({ fechaDesde, fechaHasta }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---------------------------------------------------------
  // FILTER MODEL DE MUI
  // ---------------------------------------------------------

  const [filterModel, setFilterModel] = useState({
    items: [],
  });

  // ---------------------------------------------------------
  // CARGAR DATOS
  // ---------------------------------------------------------

  useEffect(() => {
    const cargarReporte = async () => {
      try {
        setLoading(true);

        const data = await getGroupVisitsReport(
          fechaDesde.format("YYYY-MM-DD"),
          fechaHasta.format("YYYY-MM-DD"),
        );

        setRows(data);
      } catch (error) {
        console.error("Error cargando reporte:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarReporte();
  }, [fechaDesde, fechaHasta]);

  // ---------------------------------------------------------
  // COLUMNAS
  // ---------------------------------------------------------

  const columns = useMemo(
    () => [
      {
        field: "id",
        headerName: "ID",
        width: 70,
      },

      {
        field: "fecha",
        headerName: "Fecha",
        width: 120,

        valueGetter: (_, row) => {
          if (!row.horaInicio) return null;

          return new Date(row.horaInicio);
        },

        valueFormatter: (value) => {
          if (!value) return "";

          return new Date(value).toLocaleDateString("es-AR");
        },
      },

      {
        field: "horario",
        headerName: "Horario",
        width: 140,

        valueGetter: (_, row) => {
          if (!row.horaInicio || !row.horaFin) {
            return "";
          }

          const inicio = new Date(row.horaInicio).toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });

          const fin = new Date(row.horaFin).toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });

          return `${inicio} - ${fin}`;
        },
      },

      {
        field: "tipo",
        headerName: "Tipo",
        width: 130,
      },

      {
        field: "estado",
        headerName: "Estado",
        width: 140,
      },

      {
        field: "estadoConfirmacion",
        headerName: "Confirmación",
        width: 180,
      },

      {
        field: "nivelEducativo",
        headerName: "Nivel educativo",
        width: 160,
      },

      {
        field: "cantidadPersonas",
        headerName: "Personas",
        width: 100,
        type: "number",
      },

      {
        field: "institucion",
        headerName: "Institución",
        flex: 1.3,
        minWidth: 180,
      },

      {
        field: "provincia",
        headerName: "Provincia",
        flex: 1,
        minWidth: 140,
      },

      {
        field: "departamento",
        headerName: "Departamento",
        flex: 1,
        minWidth: 140,
      },

      {
        field: "localidad",
        headerName: "Localidad",
        flex: 1,
        minWidth: 140,
      },
    ],
    [],
  );

  // ---------------------------------------------------------
  // CAMBIAR FILTRO DESDE NUESTROS BOTONES
  // ---------------------------------------------------------

  const aplicarFiltro = (field, value) => {
    if (!value) {
      setFilterModel({
        items: [],
      });

      return;
    }

    setFilterModel({
      items: [
        {
          id: 1,
          field,
          operator: "equals",
          value,
        },
      ],
    });
  };

  // Obtener el valor actualmente seleccionado
  const obtenerValorFiltro = (field) => {
    const item = filterModel.items.find((item) => item.field === field);

    return item?.value ?? "";
  };

  return (
    <Box sx={{ width: "100%", mt: 3 }}>
      <Typography component="h3" variant="h6" sx={{ mb: 2 }}>
        Detalle de visitas grupales
      </Typography>
      {/* ---------------------------------------------------
          FILTROS PROPIOS
          --------------------------------------------------- */}

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mb: 2,
        }}
      >
        {/* TIPO */}

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Tipo</InputLabel>

          <Select
            label="Tipo"
            value={obtenerValorFiltro("tipo")}
            onChange={(event) => aplicarFiltro("tipo", event.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="Guiada">Guiada</MenuItem>
            <MenuItem value="Autoguiada">Autoguiada</MenuItem>
          </Select>
        </FormControl>

        {/* ESTADO */}

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Estado</InputLabel>

          <Select
            label="Estado"
            value={obtenerValorFiltro("estado")}
            onChange={(event) => aplicarFiltro("estado", event.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="Activa">Activa</MenuItem>
            <MenuItem value="Reprogramada">Reprogramada</MenuItem>
            <MenuItem value="Cancelada">Cancelada</MenuItem>
          </Select>
        </FormControl>

        {/* ESTADO CONFIRMACIÓN */}

        <FormControl size="small" sx={{ minWidth: 210 }}>
          <InputLabel>Confirmación</InputLabel>

          <Select
            label="Confirmación"
            value={obtenerValorFiltro("estadoConfirmacion")}
            onChange={(event) =>
              aplicarFiltro("estadoConfirmacion", event.target.value)
            }
          >
            <MenuItem value="">Todos</MenuItem>

            <MenuItem value="PendienteConfirmar">Pendiente confirmar</MenuItem>

            <MenuItem value="Confirmada">Confirmada</MenuItem>
          </Select>
        </FormControl>

        {/* NIVEL EDUCATIVO */}

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Nivel educativo</InputLabel>

          <Select
            label="Nivel educativo"
            value={obtenerValorFiltro("nivelEducativo")}
            onChange={(event) =>
              aplicarFiltro("nivelEducativo", event.target.value)
            }
          >
            <MenuItem value="">Todos</MenuItem>

            <MenuItem value="Inicial">Inicial</MenuItem>

            <MenuItem value="Primario">Primario</MenuItem>

            <MenuItem value="Secundario">Secundario</MenuItem>

            <MenuItem value="Superior">Superior</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* ---------------------------------------------------
          DATA GRID
          --------------------------------------------------- */}

      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        filterModel={filterModel}
        onFilterModelChange={(newModel) => {
          setFilterModel(newModel);
        }}
        disableRowSelectionOnClick
        autoHeight
        pageSizeOptions={[5, 10, 25, 50]}
        initialState={{
          sorting: {
            sortModel: [
              {
                field: "fecha",
                sort: "desc",
              },
            ],
          },

          pagination: {
            paginationModel: {
              pageSize: 10,
              page: 0,
            },
          },
        }}
      />
    </Box>
  );
}
