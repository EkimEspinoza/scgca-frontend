import {
    Box,
    Button,
    Typography,
} from '@mui/material'


function PageHeader({
    icon,
    title,
    description,
    actionLabel,
    onAction,
    actionIcon,
}) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                mb: 2,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    minWidth: 0,
                }}
            >
                {icon && (
                    <Box
                        sx={{
                            width: 42,
                            height: 42,
                            flexShrink: 0,
                            borderRadius: 1,
                            backgroundColor:
                                'primary.light',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                        }}
                    >
                        {icon}
                    </Box>
                )}

                <Box
                    sx={{
                        minWidth: 0,
                    }}
                >
                    <Typography
                        variant="h5"
                        fontWeight={700}
                        color="text.primary"
                    >
                        {title}
                    </Typography>

                    {description && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {description}
                        </Typography>
                    )}
                </Box>
            </Box>

            {actionLabel && onAction && (
                <Button
                    variant="contained"
                    startIcon={actionIcon}
                    onClick={onAction}
                    sx={{
                        borderRadius: 0.8,
                        minHeight: 40,
                        px: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        flexShrink: 0,
                    }}
                >
                    {actionLabel}
                </Button>
            )}
        </Box>
    )
}

export default PageHeader