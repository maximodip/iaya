import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  calculateCurrentPrice,
  isEarlyBirdAvailable,
  getEarlyBirdSpotsRemaining,
  PRICING_CONFIG,
  type PricingInfo,
} from '@/lib/pricing'

/**
 * GET /api/pricing
 * Obtiene el precio actual y información de early bird
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // Contar agencias que han completado el pago (tienen purchase_date)
    const { count, error } = await supabase
      .from('agencies')
      .select('*', { count: 'exact', head: true })
      .not('purchase_date', 'is', null)

    if (error) {
      console.error('Error counting purchases:', error)
      // Si hay error, asumimos 0 compras para mostrar precio early bird
      const totalPurchases = 0
      const currentPrice = calculateCurrentPrice(totalPurchases)
      const earlyBirdSpotsRemaining = getEarlyBirdSpotsRemaining(totalPurchases)

      return NextResponse.json<PricingInfo>({
        currentPrice,
        isEarlyBird: isEarlyBirdAvailable(totalPurchases),
        earlyBirdSpotsRemaining,
        totalPurchases,
      })
    }

    const totalPurchases = count || 0
    const currentPrice = calculateCurrentPrice(totalPurchases)
    const earlyBirdSpotsRemaining = getEarlyBirdSpotsRemaining(totalPurchases)

    const pricingInfo: PricingInfo = {
      currentPrice,
      isEarlyBird: isEarlyBirdAvailable(totalPurchases),
      earlyBirdSpotsRemaining,
      totalPurchases,
    }

    return NextResponse.json(pricingInfo)
  } catch (error) {
    console.error('Error fetching pricing:', error)
    // En caso de error, retornar precio early bird por defecto
    return NextResponse.json<PricingInfo>({
      currentPrice: PRICING_CONFIG.EARLY_BIRD_PRICE,
      isEarlyBird: true,
      earlyBirdSpotsRemaining: PRICING_CONFIG.EARLY_BIRD_LIMIT,
      totalPurchases: 0,
    })
  }
}

