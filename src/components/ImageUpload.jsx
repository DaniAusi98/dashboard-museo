import React, { useEffect, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";

const VisuallyHiddenInput = styled("input")({
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export default function ImageUpload({ imagenes, onChange }) {
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

  const handleImagenesChange = (event) => {
    const archivos = Array.from(event.target.files);

    onChange((prev) => [...prev, ...archivos]);

    event.target.value = "";
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
          (Si no cuenta con uno, el área de Comunicación podrá proporcionarlo o
          brindar asistencia para su elaboración.)
        </Typography>
      </Box>

      <Box
        sx={{
          border: "2px dashed",
          borderColor: "divider",
          borderRadius: 2,
          p: 2,
          minHeight: 150,
        }}
      >
        {/* AGREGAR IMÁGENES */}
        <Box
          component="label"
          sx={{
            width: "100%",
            height: 120,

            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,

            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",

            cursor: "pointer",

            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 32 }} />

          <Typography
            variant="body2"
            sx={{
              mt: 1,
              textAlign: "center",
            }}
          >
            Agregar imágenes
          </Typography>

          <VisuallyHiddenInput
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagenesChange}
          />
        </Box>

        {/* PREVIEWS */}
        {previews.length > 0 && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              mt: 2,
            }}
          >
            {previews.map((preview, index) => (
              <Box
                key={`${preview.file.name}-${index}`}
                sx={{
                  position: "relative",

                  width: 140,
                  height: 110,

                  flexShrink: 0,

                  borderRadius: 1,
                  overflow: "hidden",

                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box
                  component="img"
                  src={preview.url}
                  alt={preview.file.name}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />

                <IconButton
                  size="small"
                  onClick={() => handleEliminar(index)}
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,

                    width: 26,
                    height: 26,

                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    color: "white",

                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                    },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
