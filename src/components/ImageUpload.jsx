import React, { useEffect, useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import { API_URL } from '../services/api';

const VisuallyHiddenInput = styled('input')({
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function ImageUpload({
  imagenes = [],
  onChange,
  imagenesExistentes = [],
  onEliminarExistente,
}) {
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const nuevasPreviews = imagenes.map((imagen) => ({
      file: imagen,
      url: URL.createObjectURL(imagen),
    }));

    setPreviews(nuevasPreviews);

    return () => {
      nuevasPreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, [imagenes]);

  const obtenerUrlImagen = (url) => {
    if (url.startsWith('http')) {
      return url;
    }

    // Si la API devuelve una ruta relativa, usar el origen del backend.
    return `https://localhost:7204${url}`;
  };

  const handleImagenesChange = (event) => {
    const archivos = Array.from(event.target.files ?? []);

    onChange((prev) => [...prev, ...archivos]);

    event.target.value = '';
  };

  const handleEliminar = (index) => {
    onChange((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle1">
          Si el evento requiere difusión y cuenta con un flyer o imagen
          promocional, puede subirlo aquí.
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Si no cuenta con uno, el área de Comunicación podrá brindar asistencia
          para su elaboración.
        </Typography>
      </Box>

      <Box
        sx={{
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 2,
          p: 2,
          minHeight: 150,
        }}
      >
        <Box
          component="label"
          sx={{
            width: '100%',
            height: 120,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 32 }} />

          <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
            Agregar imágenes
          </Typography>

          <VisuallyHiddenInput
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagenesChange}
          />
        </Box>

        {/* Imágenes existentes */}
        {imagenesExistentes.length > 0 && (
          <>
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              Imágenes actuales
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
              {imagenesExistentes.map((url, index) => (
                <Box
                  key={`${url}-${index}`}
                  sx={{
                    position: 'relative',
                    width: 140,
                    height: 110,
                    flexShrink: 0,
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box
                    component="img"
                    src={obtenerUrlImagen(url)}
                    alt={`Imagen actual ${index + 1}`}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />

                  <IconButton
                    size="small"
                    aria-label="Quitar imagen existente"
                    onClick={() => onEliminarExistente?.(url)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 26,
                      height: 26,
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </>
        )}

        {/* Imágenes nuevas */}
        {previews.length > 0 && (
          <>
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              Imágenes nuevas
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
              {previews.map((preview, index) => (
                <Box
                  key={`${preview.file.name}-${index}`}
                  sx={{
                    position: 'relative',
                    width: 140,
                    height: 110,
                    flexShrink: 0,
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box
                    component="img"
                    src={preview.url}
                    alt={preview.file.name}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />

                  <IconButton
                    size="small"
                    aria-label="Quitar imagen nueva"
                    onClick={() => handleEliminar(index)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 26,
                      height: 26,
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
