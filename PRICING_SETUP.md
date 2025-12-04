# Configuración de Pricing Dinámico

## Resumen

IAya ahora utiliza un sistema de pricing dinámico con early bird:

- **Early Bird**: $997 USD para los primeros 2 usuarios
- **Precio Regular**: $1,997 USD para usuarios posteriores

## Migración de Base de Datos

Para aplicar los cambios de pricing, ejecuta la migración SQL:

```bash
# En Supabase SQL Editor, ejecuta:
supabase/migrations/002_add_pricing_fields.sql
```

O manualmente en el SQL Editor de Supabase, copia y ejecuta el contenido del archivo.

## Campos Agregados

### Tabla `agencies`:
- `purchase_date`: Fecha de compra
- `purchase_amount`: Monto pagado
- `is_early_bird`: Si fue early bird
- `monthly_analysis_limit`: Límite de análisis/mes (default: 50)
- `monthly_analysis_used`: Análisis usados este mes
- `storage_limit_gb`: Límite de almacenamiento (default: 10GB)
- `last_usage_reset`: Última vez que se reseteó el uso mensual

### Nueva Tabla `usage_tracking`:
- Tracking de uso de análisis y almacenamiento
- Para futuras implementaciones de límites y facturación

## API Endpoints

### GET `/api/pricing`
Retorna información de pricing actual:
```json
{
  "currentPrice": 997,
  "isEarlyBird": true,
  "earlyBirdSpotsRemaining": 2,
  "totalPurchases": 0
}
```

## Componentes Actualizados

- `src/components/landing/pricing.tsx`: Muestra precio dinámico con badge de early bird
- `src/app/api/chat/route.ts`: Actualizado con información de pricing dinámico

## Próximos Pasos

1. **Aplicar migración**: Ejecutar `002_add_pricing_fields.sql` en Supabase
2. **Integrar con Stripe**: Cuando implementes pagos, actualiza `purchase_date`, `purchase_amount` e `is_early_bird` después del pago exitoso
3. **Implementar límites**: Usar `monthly_analysis_limit` y `monthly_analysis_used` para controlar uso
4. **Cron job**: Configurar función `reset_monthly_usage()` para resetear contadores mensualmente

## Ejemplo de Actualización después de Pago

```typescript
// Después de pago exitoso en Stripe
const { data, error } = await supabase
  .from('agencies')
  .update({
    purchase_date: new Date().toISOString(),
    purchase_amount: amount,
    is_early_bird: isEarlyBirdAvailable(totalPurchases),
  })
  .eq('id', agencyId)
```

