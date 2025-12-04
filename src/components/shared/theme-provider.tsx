'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface ThemeProviderProps {
  children: React.ReactNode
  theme?: 'light' | 'dark'
  primaryColor?: string
  secondaryColor?: string
}

export const ThemeProvider = ({ children, theme = 'dark', primaryColor, secondaryColor }: ThemeProviderProps) => {
  const pathname = usePathname()

  useEffect(() => {
    // Apply theme to html element first
    const html = document.documentElement
    html.classList.remove('light', 'dark')
    html.classList.add(theme)

    // Debug: Log the colors being applied
    console.log('ThemeProvider - Applying colors:', { theme, primaryColor, secondaryColor })

    // Get or create style element for custom colors
    let styleElement = document.getElementById('agency-custom-colors') as HTMLStyleElement
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = 'agency-custom-colors'
      document.head.appendChild(styleElement)
    }

    // Build CSS with high specificity to override default values
    let css = ''
    
    if (primaryColor && primaryColor.trim() !== '') {
      const primaryOklch = hexToOklch(primaryColor.trim())
      console.log('Primary color conversion:', { hex: primaryColor, oklch: primaryOklch })
      
      if (primaryOklch) {
        const rgb = hexToRgb(primaryColor.trim())
        if (rgb) {
          const lightness = getLightness(rgb)
          const foreground = lightness > 0.5 ? 'oklch(0.141 0.005 285.823)' : 'oklch(0.985 0 0)'
          
          // Use high specificity selectors to override .dark values
          // Apply to both html element and :root for maximum compatibility
          css += `
            :root,
            html,
            html.dark,
            html.light {
              --primary: ${primaryOklch} !important;
              --sidebar-primary: ${primaryOklch} !important;
              --primary-foreground: ${foreground} !important;
              --sidebar-primary-foreground: ${foreground} !important;
            }
          `
        }
      } else {
        console.warn('Failed to convert primary color to oklch:', primaryColor)
      }
      // Store hex for direct use
      html.style.setProperty('--agency-primary', primaryColor.trim())
    } else {
      html.style.removeProperty('--agency-primary')
    }
    
    if (secondaryColor && secondaryColor.trim() !== '') {
      const secondaryOklch = hexToOklch(secondaryColor.trim())
      console.log('Secondary color conversion:', { hex: secondaryColor, oklch: secondaryOklch })
      
      if (secondaryOklch) {
        const rgb = hexToRgb(secondaryColor.trim())
        if (rgb) {
          const lightness = getLightness(rgb)
          const foreground = lightness > 0.5 ? 'oklch(0.141 0.005 285.823)' : 'oklch(0.985 0 0)'
          
          css += `
            :root,
            html,
            html.dark,
            html.light {
              --secondary: ${secondaryOklch} !important;
              --secondary-foreground: ${foreground} !important;
            }
          `
        }
      } else {
        console.warn('Failed to convert secondary color to oklch:', secondaryColor)
      }
      // Store hex for direct use
      html.style.setProperty('--agency-secondary', secondaryColor.trim())
    } else {
      html.style.removeProperty('--agency-secondary')
    }

    // Apply the CSS
    styleElement.textContent = css
    console.log('Applied CSS:', css)
    
    // Also verify the styles were applied
    setTimeout(() => {
      const computedPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary')
      console.log('Computed --primary value:', computedPrimary)
    }, 100)

    // Cleanup function
    return () => {
      if (styleElement && !primaryColor && !secondaryColor) {
        styleElement.textContent = ''
      }
    }
  }, [theme, primaryColor, secondaryColor, pathname])

  return <>{children}</>
}

// Convert hex to oklch using a more accurate method
function hexToOklch(hex: string): string | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  
  // Normalize RGB to 0-1
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255
  
  // Convert to linear RGB (sRGB to linear)
  const rLinear = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)
  const gLinear = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)
  const bLinear = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4)
  
  // Convert to XYZ (D65 white point)
  const x = rLinear * 0.4124564 + gLinear * 0.3575761 + bLinear * 0.1804375
  const y = rLinear * 0.2126729 + gLinear * 0.7151522 + bLinear * 0.0721750
  const z = rLinear * 0.0193339 + gLinear * 0.1191920 + bLinear * 0.9503041
  
  // Normalize XYZ (D65)
  const xn = x / 0.95047
  const yn = y / 1.00000
  const zn = z / 1.08883
  
  // Convert to Lab
  const fx = xn > 0.008856 ? Math.cbrt(xn) : (7.787 * xn + 16/116)
  const fy = yn > 0.008856 ? Math.cbrt(yn) : (7.787 * yn + 16/116)
  const fz = zn > 0.008856 ? Math.cbrt(zn) : (7.787 * zn + 16/116)
  
  const l = 116 * fy - 16
  const a = 500 * (fx - fy)
  const bLab = 200 * (fy - fz)
  
  // Convert Lab to OKLCH
  // First convert Lab to LCH
  const c = Math.sqrt(a * a + bLab * bLab)
  const h = Math.atan2(bLab, a) * (180 / Math.PI)
  const hNormalized = h < 0 ? h + 360 : h >= 360 ? h - 360 : h
  
  // Convert Lab L to OKLCH L (approximation)
  // OKLCH lightness is calculated differently, but we can approximate
  // Using a better approximation: OKLCH L ≈ (Lab L / 100)^0.5 for darker colors
  const labLNormalized = Math.max(0, Math.min(100, l)) / 100
  // Better approximation for OKLCH lightness
  const lightness = Math.pow(labLNormalized, 0.7) // Adjust exponent for better match
  
  // Chroma conversion (OKLCH chroma is typically higher than Lab chroma)
  const chroma = Math.max(0, Math.min(0.4, c / 150)) // Adjusted divisor
  
  return `oklch(${lightness.toFixed(3)} ${chroma.toFixed(3)} ${hNormalized.toFixed(1)})`
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

function getLightness(rgb: { r: number; g: number; b: number }): number {
  // Calculate relative luminance
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255
  
  const rLinear = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)
  const gLinear = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)
  const bLinear = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4)
  
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear
}

