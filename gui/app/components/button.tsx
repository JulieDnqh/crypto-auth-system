// gui/src/components/button.tsx
import React from "react"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export function Button({ children, className, ...rest }: ButtonProps) {
  return (
    <button className={`px-4 py-2 rounded ${className}`} {...rest}>
      {children}
    </button>
  )
}