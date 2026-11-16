export const tokens = {
  spacing: 8,
  radius: { small: 8, medium: 12, large: 16 },
  colors: {
    primary: { main: '#1F8A4C', light: '#4EAA72', dark: '#176B3B', contrastText: '#FFFFFF' },
    secondary: { main: '#26A69A', light: '#64D8CB', dark: '#00766C', contrastText: '#FFFFFF' },
    background: { default: '#F7F8FA', paper: '#FFFFFF', soft: '#F2F4F7' },
    theme: {
      dark: {
        background: '#0F1115', surface: '#161A20', elevated: '#1C2128',
        border: 'rgba(255, 255, 255, 0.08)', rowDivider: 'rgba(255, 255, 255, 0.05)',
        textPrimary: '#E6EAF0', textSecondary: '#9AA4B2', textDisabled: '#8792A0',
        primary: '#1B8247', primaryLight: '#2FB468', primaryDark: '#16683B',
        hover: 'rgba(255, 255, 255, 0.04)', selected: 'rgba(47, 180, 104, 0.14)',
        primarySoft: 'rgba(47, 180, 104, 0.14)',
        calendarIconFilter: 'invert(58%) sepia(49%) saturate(546%) hue-rotate(93deg) brightness(96%) contrast(91%)',
        tareo: {
          page: '#0F1115', panel: '#161A20', border: 'rgba(255, 255, 255, 0.08)',
          tableHeader: '#1C2128', tableHeaderBorder: 'rgba(255, 255, 255, 0.08)',
          filterBorder: 'rgba(255, 255, 255, 0.08)', shadow: 'none',
          placeholder: '#8792A0',
          tabSuccessBg: 'rgba(117, 214, 162, 0.14)', tabSuccessText: '#9FE3BE',
          tabNeutralBg: 'rgba(255, 255, 255, 0.08)', tabNeutralText: '#AEB7C2',
          tabWarningBg: 'rgba(245, 188, 105, 0.15)', tabWarningText: '#F5BC69',
          primarySoft: 'rgba(47, 180, 104, 0.14)',
        },
      },
      light: {
        calendarIconFilter: 'invert(37%) sepia(36%) saturate(793%) hue-rotate(94deg) brightness(90%) contrast(94%)',
        primarySoft: '#ECFDF3',
        tareo: {
          page: '#F5F7FA', panel: '#FFFFFF', border: '#E4E7EC',
          tableHeader: '#F8FAFC', tableHeaderBorder: '#D0D5DD',
          filterBorder: '#D0D5DD', shadow: '0 1px 2px rgba(16, 24, 40, 0.06)',
          placeholder: '#667085',
          tabSuccessBg: '#ECFDF3', tabSuccessText: '#067647',
          tabNeutralBg: '#F2F4F7', tabNeutralText: '#667085',
          tabWarningBg: '#FEF3C7', tabWarningText: '#7A4B00',
          primarySoft: '#ECFDF3',
        },
      },
    },
    surface: { white: '#FFFFFF', soft: '#F8F9FB', hover: '#F4F6F8', selected: '#EEF1F4' },
    border: { main: '#E4E7EC', light: '#EAECF0', dark: '#D0D5DD' },
    text: { primary: '#202A35', secondary: '#667085', disabled: '#98A2B3' },
    status: {
      success: { light: '#177245', dark: '#75D6A2', softLight: '#E8F5ED', softDark: 'rgba(117, 214, 162, 0.14)' },
      warning: { light: '#A65308', dark: '#F5BC69', softLight: '#FFF4E5', softDark: 'rgba(245, 188, 105, 0.15)' },
      error: { light: '#B42318', dark: '#FF8A80', softLight: '#FEECEB', softDark: 'rgba(255, 138, 128, 0.15)' },
      info: { light: '#175CD3', dark: '#84ADFF', softLight: '#EFF8FF', softDark: 'rgba(132, 173, 255, 0.15)' },
      neutral: { light: '#667085', dark: '#AEB7C2' },
    },
    stage: {
      campo: { lightBg: '#E8F5ED', lightText: '#176B3B', lightBorder: '#B9DEC8', darkBg: 'rgba(117, 214, 162, 0.14)', darkText: '#9FE3BE', darkBorder: 'rgba(117, 214, 162, 0.34)' },
      vivero: { lightBg: '#EFF6FF', lightText: '#1849A9', lightBorder: '#C7D7FE', darkBg: 'rgba(132, 173, 255, 0.14)', darkText: '#B2CCFF', darkBorder: 'rgba(132, 173, 255, 0.34)' },
      levante: { lightBg: '#FFF4E5', lightText: '#8A4B08', lightBorder: '#F4D4A8', darkBg: 'rgba(245, 188, 105, 0.14)', darkText: '#FFD18A', darkBorder: 'rgba(245, 188, 105, 0.34)' },
    },
    action: { hover: '#F4F6F8', selected: '#EEF1F4' },
  },
  shadows: {
    card: '0 1px 2px rgba(16, 24, 40, 0.04)',
    cardHover: '0 2px 6px rgba(16, 24, 40, 0.07)',
    dialog: '0 12px 32px rgba(16, 24, 40, 0.16)',
  },
}

export default tokens
