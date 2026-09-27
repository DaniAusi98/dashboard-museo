import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";

export default function MenuButton({ showBadge = false, ...props }) {
  return (
    <Badge color="error" variant="dot" invisible={!showBadge}>
      <IconButton size="small" {...props} />
    </Badge>
  );
}
