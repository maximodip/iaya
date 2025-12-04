/**
 * Utilidades para manejar pricing dinámico con early bird
 */

export const PRICING_CONFIG = {
  EARLY_BIRD_PRICE: 997,
  REGULAR_PRICE: 1997,
  EARLY_BIRD_LIMIT: 2,
} as const

export type PricingInfo = {
  currentPrice: number
  isEarlyBird: boolean
  earlyBirdSpotsRemaining: number
  totalPurchases: number
}

/**
 * Calcula el precio actual basado en el número de compras completadas
 */
export const calculateCurrentPrice = (totalPurchases: number): number => {
  if (totalPurchases < PRICING_CONFIG.EARLY_BIRD_LIMIT) {
    return PRICING_CONFIG.EARLY_BIRD_PRICE
  }
  return PRICING_CONFIG.REGULAR_PRICE
}

/**
 * Verifica si aún hay spots disponibles para early bird
 */
export const isEarlyBirdAvailable = (totalPurchases: number): boolean => {
  return totalPurchases < PRICING_CONFIG.EARLY_BIRD_LIMIT
}

/**
 * Calcula cuántos spots de early bird quedan
 */
export const getEarlyBirdSpotsRemaining = (totalPurchases: number): number => {
  const remaining = PRICING_CONFIG.EARLY_BIRD_LIMIT - totalPurchases
  return Math.max(0, remaining)
}

