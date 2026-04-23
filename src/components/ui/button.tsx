import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils/index"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* ─── Legacy shadcn variants (유지, 기능성 영역) ─── */
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",

        /* ─── Cozy Card Game variants (신규) ──────────────── */
        /** 메인 CTA: 카드 리본 배너 느낌. 4px 눌림 효과 + display 폰트 */
        ribbon:
          "font-display text-white border-2 border-white/70 rounded-xl " +
          "bg-gradient-to-b from-primary-400 to-primary-600 " +
          "shadow-[0_4px_0_theme(colors.primary.700)] " +
          "hover:translate-y-[1px] hover:shadow-[0_3px_0_theme(colors.primary.700)] " +
          "active:translate-y-[4px] active:shadow-[0_0_0_theme(colors.primary.700)] " +
          "transition-transform duration-100",

        /** 히어로 (랜딩 대형 CTA) */
        hero:
          "font-display text-white border-2 border-white/70 rounded-2xl " +
          "bg-gradient-to-b from-primary-400 to-primary-600 " +
          "shadow-[0_6px_0_theme(colors.primary.700),0_10px_30px_rgba(108,92,231,0.35)] " +
          "hover:translate-y-[2px] hover:shadow-[0_4px_0_theme(colors.primary.700),0_8px_24px_rgba(108,92,231,0.3)] " +
          "active:translate-y-[6px] active:shadow-[0_0_0_theme(colors.primary.700),0_4px_12px_rgba(108,92,231,0.25)] " +
          "transition-transform duration-100",

        /** 소프트 파스텔 (보조 액션) */
        pastel:
          "bg-white border-2 border-primary-200 text-primary-700 font-semibold rounded-xl " +
          "shadow-[0_3px_0_theme(colors.primary.100)] " +
          "hover:bg-primary-50 hover:translate-y-[1px] hover:shadow-[0_2px_0_theme(colors.primary.100)] " +
          "active:translate-y-[3px] active:shadow-[0_0_0_theme(colors.primary.100)] " +
          "transition-transform duration-100",

        /** 오행: 木 */
        'oheng-wood':
          "font-display text-white border-2 border-white/70 rounded-xl " +
          "bg-gradient-to-b from-oheng-wood-300 to-oheng-wood-500 " +
          "shadow-[0_4px_0_theme(colors.oheng.wood.700)] " +
          "hover:translate-y-[1px] hover:shadow-[0_3px_0_theme(colors.oheng.wood.700)] " +
          "active:translate-y-[4px] active:shadow-[0_0_0_theme(colors.oheng.wood.700)] " +
          "transition-transform duration-100",

        /** 오행: 火 */
        'oheng-fire':
          "font-display text-white border-2 border-white/70 rounded-xl " +
          "bg-gradient-to-b from-oheng-fire-300 to-oheng-fire-500 " +
          "shadow-[0_4px_0_theme(colors.oheng.fire.700)] " +
          "hover:translate-y-[1px] hover:shadow-[0_3px_0_theme(colors.oheng.fire.700)] " +
          "active:translate-y-[4px] active:shadow-[0_0_0_theme(colors.oheng.fire.700)] " +
          "transition-transform duration-100",

        /** 오행: 土 */
        'oheng-earth':
          "font-display text-white border-2 border-white/70 rounded-xl " +
          "bg-gradient-to-b from-oheng-earth-300 to-oheng-earth-500 " +
          "shadow-[0_4px_0_theme(colors.oheng.earth.700)] " +
          "hover:translate-y-[1px] hover:shadow-[0_3px_0_theme(colors.oheng.earth.700)] " +
          "active:translate-y-[4px] active:shadow-[0_0_0_theme(colors.oheng.earth.700)] " +
          "transition-transform duration-100",

        /** 오행: 金 */
        'oheng-metal':
          "font-display text-white border-2 border-white/70 rounded-xl " +
          "bg-gradient-to-b from-oheng-metal-300 to-oheng-metal-500 " +
          "shadow-[0_4px_0_theme(colors.oheng.metal.700)] " +
          "hover:translate-y-[1px] hover:shadow-[0_3px_0_theme(colors.oheng.metal.700)] " +
          "active:translate-y-[4px] active:shadow-[0_0_0_theme(colors.oheng.metal.700)] " +
          "transition-transform duration-100",

        /** 오행: 水 */
        'oheng-water':
          "font-display text-white border-2 border-white/70 rounded-xl " +
          "bg-gradient-to-b from-oheng-water-300 to-oheng-water-500 " +
          "shadow-[0_4px_0_theme(colors.oheng.water.700)] " +
          "hover:translate-y-[1px] hover:shadow-[0_3px_0_theme(colors.oheng.water.700)] " +
          "active:translate-y-[4px] active:shadow-[0_0_0_theme(colors.oheng.water.700)] " +
          "transition-transform duration-100",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-2xl px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
