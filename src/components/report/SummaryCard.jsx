import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

export default function SummaryCard({ title, value }) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        flexGrow: 1,
      }}
    >
      <CardContent
        sx={{
          padding: 1,
        }}
      >
        <Typography
          component="h2"
          variant="subtitle2"
          gutterBottom
          sx={{
            fontWeight: 600,
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="h5"
          component="p"
          sx={{
            fontWeight: 700,
          }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}
