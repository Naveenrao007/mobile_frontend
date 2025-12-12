/**
 * Card theme configuration based on card name
 * Same card names will have the same design and colors
 */

export interface CardTheme {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  gradientColors?: string[];
  logoColor?: string;
  chipColor?: string;
}

/**
 * Normalizes card name for consistent matching
 */
function normalizeCardName(cardName: string): string {
  return cardName.toLowerCase().trim();
}

/**
 * Gets card theme based on card name
 */
export function getCardTheme(cardName: string): CardTheme {
  const normalized = normalizeCardName(cardName);
  
  // Flipkart Axis Card - Flipkart blue/yellow theme
  if (normalized.includes('flipkart') && normalized.includes('axis')) {
    return {
      backgroundColor: '#1a237e', // Deep blue
      textColor: '#ffffff',
      accentColor: '#ffc107', // Yellow
      gradientColors: ['#1a237e', '#283593', '#3949ab'],
      logoColor: '#ffc107',
      chipColor: '#ffc107',
    };
  }
  
  // Amazon Pay ICICI Card - Amazon orange/black theme
  if (normalized.includes('amazon') && normalized.includes('pay')) {
    return {
      backgroundColor: '#232f3e', // Amazon dark blue-gray
      textColor: '#ffffff',
      accentColor: '#ff9900', // Amazon orange
      gradientColors: ['#232f3e', '#37475a', '#131921'],
      logoColor: '#ff9900',
      chipColor: '#ff9900',
    };
  }
  
  // Axis Bank cards - Red theme
  if (normalized.includes('axis')) {
    return {
      backgroundColor: '#c8102e', // Axis red
      textColor: '#ffffff',
      accentColor: '#ffffff',
      gradientColors: ['#c8102e', '#e63946', '#d62828'],
      logoColor: '#ffffff',
      chipColor: '#d4af37',
    };
  }
  
  // ICICI Bank cards - Blue theme
  if (normalized.includes('icici')) {
    return {
      backgroundColor: '#004d99', // ICICI blue
      textColor: '#ffffff',
      accentColor: '#ff6b00', // ICICI orange
      gradientColors: ['#004d99', '#0066cc', '#003366'],
      logoColor: '#ff6b00',
      chipColor: '#d4af37',
    };
  }
  
  // HDFC Bank cards - Blue theme
  if (normalized.includes('hdfc')) {
    return {
      backgroundColor: '#004c97', // HDFC blue
      textColor: '#ffffff',
      accentColor: '#00a651', // HDFC green
      gradientColors: ['#004c97', '#0066cc', '#003366'],
      logoColor: '#00a651',
      chipColor: '#d4af37',
    };
  }
  
  // SBI Cards - Blue theme
  if (normalized.includes('sbi')) {
    return {
      backgroundColor: '#0052a5', // SBI blue
      textColor: '#ffffff',
      accentColor: '#ffc72c', // SBI yellow
      gradientColors: ['#0052a5', '#0066cc', '#003d7a'],
      logoColor: '#ffc72c',
      chipColor: '#d4af37',
    };
  }
  
  // Default dark theme
  return {
    backgroundColor: '#1a1a1a',
    textColor: '#ffffff',
    accentColor: '#d4af37',
    gradientColors: ['#1a1a1a', '#2d2d2d', '#0d0d0d'],
    logoColor: '#ffffff',
    chipColor: '#d4af37',
  };
}

/**
 * Gets card-specific badge colors
 */
export function getCardBadgeColors(cardName: string): {
  cardNameBadge: string;
  cardTypeBadge: string;
  bankLogo: string;
} {
  const theme = getCardTheme(cardName);
  
  return {
    cardNameBadge: `rgba(255, 255, 255, 0.2)`,
    cardTypeBadge: `rgba(255, 255, 255, 0.15)`,
    bankLogo: theme.logoColor || theme.textColor,
  };
}
