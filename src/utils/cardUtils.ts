/**
 * Detects the credit card type based on the card number
 * @param cardNumber - The card number (can include spaces/dashes)
 * @returns 'visa' | 'mastercard' | 'rupay' | 'unknown'
 */
export function detectCardType(cardNumber: string): 'visa' | 'mastercard' | 'rupay' | 'unknown' {
  // Remove all non-digit characters
  const digits = cardNumber.replace(/\D/g, '');
  
  if (!digits || digits.length < 4) {
    return 'unknown';
  }

  // Get first digits for checking
  const first4 = parseInt(digits.substring(0, 4));
  const first3 = parseInt(digits.substring(0, 3));
  const first2 = parseInt(digits.substring(0, 2));
  const first1 = parseInt(digits.substring(0, 1));

  // Visa: Starts with 4 (13-19 digits)
  if (first1 === 4) {
    return 'visa';
  }

  // Mastercard: Starts with 51-55 or 2221-2720 (16 digits)
  if ((first2 >= 51 && first2 <= 55) || (first4 >= 2221 && first4 <= 2720)) {
    return 'mastercard';
  }

  // RuPay: Starts with 60, 65, or 353-359 (16 digits)
  if (first2 === 60 || first2 === 65) {
    return 'rupay';
  }
  
  // RuPay: Starts with 353-359 (3-digit prefix)
  if (first3 >= 353 && first3 <= 359) {
    return 'rupay';
  }

  return 'unknown';
}

/**
 * Gets the display name for card type
 */
export function getCardTypeDisplayName(cardType: 'visa' | 'mastercard' | 'rupay' | 'unknown'): string {
  switch (cardType) {
    case 'visa':
      return 'Visa';
    case 'mastercard':
      return 'Mastercard';
    case 'rupay':
      return 'RuPay';
    default:
      return '';
  }
}

/**
 * Gets the card type icon/emoji
 */
export function getCardTypeIcon(cardType: 'visa' | 'mastercard' | 'rupay' | 'unknown'): string {
  switch (cardType) {
    case 'visa':
      return '💳';
    case 'mastercard':
      return '💳';
    case 'rupay':
      return '💳';
    default:
      return '';
  }
}

/**
 * Validates card number length based on card type
 */
export function validateCardLength(cardNumber: string, cardType: 'visa' | 'mastercard' | 'rupay' | 'unknown'): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  
  if (cardType === 'visa') {
    return digits.length >= 13 && digits.length <= 19;
  } else if (cardType === 'mastercard' || cardType === 'rupay') {
    return digits.length === 16;
  }
  
  return false;
}
