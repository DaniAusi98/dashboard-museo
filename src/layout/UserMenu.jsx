import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useAuth } from '../auth/AuthContext';
import OptionsMenu from './OptionsMenu';

export default function UserMenu({ compact = false, onAction }) {
  const { user } = useAuth();

  const firstName = user?.nombre ?? user?.Nombre ?? '';
  const lastName = user?.apellido ?? user?.Apellido ?? '';
  const fullName = `${firstName} ${lastName}`.trim();
  const displayName = fullName || user?.nombre || user?.email || 'Usuario';
  const email = user?.email ?? '';
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <Stack
      direction="row"
      sx={{
        minWidth: 0,
        flexGrow: 1,
        gap: 1,
        alignItems: 'center',
      }}
    >
      <Avatar
        alt={displayName}
        sx={{
          width: compact ? 24 : 36,
          height: compact ? 24 : 36,
          fontSize: compact ? 12 : 14,
        }}
      >
        {initials}
      </Avatar>

      <Box sx={{ minWidth: 0, mr: 'auto' }}>
        <Typography
          variant={compact ? 'h6' : 'body2'}
          sx={{
            fontWeight: 500,
            lineHeight: compact ? undefined : '16px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {displayName}
        </Typography>

        {!compact && email && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {email}
          </Typography>
        )}
      </Box>

      <OptionsMenu onAction={onAction} />
    </Stack>
  );
}
