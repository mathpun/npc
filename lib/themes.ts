// Theme definitions for the color skins feature

export interface Theme {
  id: string
  name: string
  emoji: string
  description: string
  colors: {
    // Background colors
    background: string
    backgroundAlt: string
    backgroundAccent: string

    // Primary palette (array of colors for components)
    primary: string[]

    // Specific UI colors
    navHome: string
    navDashboard: string
    navChat: string
    navMuseum: string
    navWorld: string

    // Message colors
    userMessage: string
    userAvatar: string
    assistantAvatar: string

    // Accent colors
    accent1: string
    accent2: string
    accent3: string
    accent4: string
    accent5: string

    // Button colors
    buttonPrimary: string
    buttonSecondary: string
    buttonSuccess: string
    buttonDanger: string

    // Glow/shadow color
    glow: string
  }
}

export const themes: Record<string, Theme> = {
  bubblegum: {
    id: 'bubblegum',
    name: 'Bubblegum Pop',
    emoji: '🍬',
    description: 'the og pink vibes',
    colors: {
      background: '#FFB6C1',
      backgroundAlt: '#7FDBFF',
      backgroundAccent: '#98FB98',

      primary: ['#FF69B4', '#90EE90', '#87CEEB', '#FFD700', '#DDA0DD', '#FFA500', '#98FB98', '#FF6B6B'],

      navHome: '#FFB6C1',
      navDashboard: '#87CEEB',
      navChat: '#98FB98',
      navMuseum: '#DDA0DD',
      navWorld: '#FFD700',

      userMessage: '#90EE90',
      userAvatar: '#FF69B4',
      assistantAvatar: '#DDA0DD',

      accent1: '#FF69B4',
      accent2: '#FFD700',
      accent3: '#90EE90',
      accent4: '#87CEEB',
      accent5: '#DDA0DD',

      buttonPrimary: '#FF69B4',
      buttonSecondary: '#87CEEB',
      buttonSuccess: '#90EE90',
      buttonDanger: '#FFB6C1',

      glow: 'rgba(255, 105, 180, 0.3)',
    },
  },

  ocean: {
    id: 'ocean',
    name: 'Ocean Wave',
    emoji: '🌊',
    description: 'chill beach vibes',
    colors: {
      background: '#B4E7FF',
      backgroundAlt: '#7FDBFF',
      backgroundAccent: '#48D1CC',

      primary: ['#00CED1', '#48D1CC', '#20B2AA', '#5F9EA0', '#87CEEB', '#B0E0E6', '#7FDBFF', '#40E0D0'],

      navHome: '#87CEEB',
      navDashboard: '#48D1CC',
      navChat: '#7FDBFF',
      navMuseum: '#00CED1',
      navWorld: '#B0E0E6',

      userMessage: '#40E0D0',
      userAvatar: '#00CED1',
      assistantAvatar: '#5F9EA0',

      accent1: '#00CED1',
      accent2: '#48D1CC',
      accent3: '#40E0D0',
      accent4: '#87CEEB',
      accent5: '#20B2AA',

      buttonPrimary: '#00CED1',
      buttonSecondary: '#48D1CC',
      buttonSuccess: '#40E0D0',
      buttonDanger: '#FF6B6B',

      glow: 'rgba(0, 206, 209, 0.3)',
    },
  },

  sunset: {
    id: 'sunset',
    name: 'Sunset Glow',
    emoji: '🌅',
    description: 'golden hour energy',
    colors: {
      background: '#FFE4B5',
      backgroundAlt: '#FFDAB9',
      backgroundAccent: '#FFD700',

      primary: ['#FF8C00', '#FFA500', '#FFD700', '#FF7F50', '#FF6347', '#FFDAB9', '#F4A460', '#FFB347'],

      navHome: '#FFD700',
      navDashboard: '#FF8C00',
      navChat: '#FFA500',
      navMuseum: '#FF7F50',
      navWorld: '#FFB347',

      userMessage: '#FFD700',
      userAvatar: '#FF8C00',
      assistantAvatar: '#FF7F50',

      accent1: '#FF8C00',
      accent2: '#FFD700',
      accent3: '#FFA500',
      accent4: '#FF7F50',
      accent5: '#FFDAB9',

      buttonPrimary: '#FF8C00',
      buttonSecondary: '#FFD700',
      buttonSuccess: '#FFB347',
      buttonDanger: '#FF6347',

      glow: 'rgba(255, 140, 0, 0.3)',
    },
  },

  galaxy: {
    id: 'galaxy',
    name: 'Galaxy Quest',
    emoji: '🌌',
    description: 'space explorer mode',
    colors: {
      background: '#E6E6FA',
      backgroundAlt: '#DDA0DD',
      backgroundAccent: '#9370DB',

      primary: ['#9370DB', '#8A2BE2', '#9932CC', '#BA55D3', '#DA70D6', '#EE82EE', '#DDA0DD', '#E6E6FA'],

      navHome: '#DDA0DD',
      navDashboard: '#9370DB',
      navChat: '#BA55D3',
      navMuseum: '#8A2BE2',
      navWorld: '#DA70D6',

      userMessage: '#EE82EE',
      userAvatar: '#8A2BE2',
      assistantAvatar: '#9370DB',

      accent1: '#9370DB',
      accent2: '#8A2BE2',
      accent3: '#BA55D3',
      accent4: '#DA70D6',
      accent5: '#DDA0DD',

      buttonPrimary: '#8A2BE2',
      buttonSecondary: '#9370DB',
      buttonSuccess: '#BA55D3',
      buttonDanger: '#FF6B6B',

      glow: 'rgba(138, 43, 226, 0.3)',
    },
  },

  forest: {
    id: 'forest',
    name: 'Forest Fairy',
    emoji: '🌲',
    description: 'nature core aesthetic',
    colors: {
      background: '#98FB98',
      backgroundAlt: '#90EE90',
      backgroundAccent: '#3CB371',

      primary: ['#2E8B57', '#3CB371', '#90EE90', '#98FB98', '#8FBC8F', '#66CDAA', '#20B2AA', '#00FA9A'],

      navHome: '#90EE90',
      navDashboard: '#3CB371',
      navChat: '#98FB98',
      navMuseum: '#2E8B57',
      navWorld: '#66CDAA',

      userMessage: '#98FB98',
      userAvatar: '#2E8B57',
      assistantAvatar: '#3CB371',

      accent1: '#3CB371',
      accent2: '#2E8B57',
      accent3: '#90EE90',
      accent4: '#66CDAA',
      accent5: '#98FB98',

      buttonPrimary: '#2E8B57',
      buttonSecondary: '#3CB371',
      buttonSuccess: '#00FA9A',
      buttonDanger: '#FF6B6B',

      glow: 'rgba(60, 179, 113, 0.3)',
    },
  },

  candy: {
    id: 'candy',
    name: 'Candy Crush',
    emoji: '🍭',
    description: 'sweet overload fr',
    colors: {
      background: '#FFB6C1',
      backgroundAlt: '#E6E6FA',
      backgroundAccent: '#DDA0DD',

      primary: ['#FF69B4', '#DA70D6', '#FF1493', '#FF6EB4', '#FFB6C1', '#DDA0DD', '#EE82EE', '#FF77FF'],

      navHome: '#FF69B4',
      navDashboard: '#DA70D6',
      navChat: '#FF6EB4',
      navMuseum: '#DDA0DD',
      navWorld: '#EE82EE',

      userMessage: '#FF77FF',
      userAvatar: '#FF1493',
      assistantAvatar: '#DA70D6',

      accent1: '#FF69B4',
      accent2: '#DA70D6',
      accent3: '#FF1493',
      accent4: '#EE82EE',
      accent5: '#FFB6C1',

      buttonPrimary: '#FF1493',
      buttonSecondary: '#DA70D6',
      buttonSuccess: '#FF69B4',
      buttonDanger: '#FF6B6B',

      glow: 'rgba(255, 20, 147, 0.3)',
    },
  },
}

export const themeList = Object.values(themes)
export const defaultTheme = themes.bubblegum
