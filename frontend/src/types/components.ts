/**
 * Frontend Component Type Definitions
 */

import type { ReactNode } from 'react';

/**
 * Common button props
 */
export interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  className?: string;
  children?: ReactNode;
}

/**
 * Modal props
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Card props
 */
export interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'outlined' | 'elevated';
}

/**
 * Form props
 */
export interface FormProps {
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  children: ReactNode;
  className?: string;
  loading?: boolean;
}

/**
 * Input props
 */
export interface InputProps {
  name: string;
  type?: 'text' | 'email' | 'password' | 'number';
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
  onChange?: (value: string) => void;
}

/**
 * Select props
 */
export interface SelectProps {
  name: string;
  label?: string;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
  error?: string;
  className?: string;
  onChange?: (value: string) => void;
}
