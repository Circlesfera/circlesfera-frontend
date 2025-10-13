/**
 * 🎨 DESIGN SYSTEM - EXPORT CENTRAL
 * ==================================
 * Export único de todos los componentes del sistema de diseño
 *
 * @version 2.0.0
 * @see src/design-system/tokens/ para design tokens
 */

// ==========================================
// 🎯 COMPONENTES BASE (v2.0)
// ==========================================

// Button
export { Button, buttonVariants } from './Button'
export type { ButtonProps } from './Button'

// Input ✨ NUEVO
export { Input, inputVariants } from './Input'
export type { InputProps } from './Input'

// Avatar ✨ NUEVO
export { Avatar, avatarVariants } from './Avatar'
export type { AvatarProps } from './Avatar'

// Badge ✨ NUEVO
export { Badge, badgeVariants } from './Badge'
export type { BadgeProps } from './Badge'

// Modal ✨ NUEVO
export { Modal, modalVariants } from './Modal'
export type { ModalProps } from './Modal'

// Card
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './Card'
export type { CardProps } from './Card'

// ==========================================
// 🎨 DESIGN TOKENS
// ==========================================
export {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  transitions,
  breakpoints,
  zIndex,
} from './tokens'

// Legacy tokens (mantener por compatibilidad)
export { designTokens as legacyTokens, getColor, getSpacing, getShadow, getTransition, utilityClasses } from './design-tokens'

// ==========================================
// 🧩 SUB-COMPONENTS (Legacy)
// ==========================================
export { default as ComponentButton } from './components/Button'
export { default as ComponentCard } from './components/Card'
export { default as ComponentInput } from './components/Input'
export { default as ComponentAvatar } from './components/Avatar'
export { default as PostCard } from './components/PostCard'
export { default as Sidebar } from './components/Sidebar'
export { default as Header } from './components/Header'
export { default as StoriesBar } from './components/StoriesBar'

// Types (Legacy)
export type { ButtonProps as ComponentButtonProps } from './components/Button'
export type { CardProps as ComponentCardProps } from './components/Card'
export type { InputProps as ComponentInputProps } from './components/Input'
export type { AvatarProps as ComponentAvatarProps } from './components/Avatar'
export type { PostCardProps } from './components/PostCard'
export type { SidebarProps, SidebarItem } from './components/Sidebar'
export type { HeaderProps } from './components/Header'
