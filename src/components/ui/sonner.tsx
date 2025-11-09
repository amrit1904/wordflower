"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      toastOptions={{
        style: {
          fontSize: "16px",
          padding: "16px 20px",
          minHeight: "60px",
          borderRadius: "12px",
          fontWeight: "500",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
        },
        classNames: {
          error: "!bg-red-50 !text-red-900 !border-red-200 dark:!bg-red-950 dark:!text-red-100 dark:!border-red-800",
          warning: "!bg-orange-50 !text-orange-900 !border-orange-200 dark:!bg-orange-950 dark:!text-orange-100 dark:!border-orange-800",
          success: "!bg-green-50 !text-green-900 !border-green-200 dark:!bg-green-950 dark:!text-green-100 dark:!border-green-800",
          info: "!bg-blue-50 !text-blue-900 !border-blue-200 dark:!bg-blue-950 dark:!text-blue-100 dark:!border-blue-800",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
