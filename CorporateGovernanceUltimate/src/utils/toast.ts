import type { ToastMessage } from '@/types'

class ToastManager {
  private toasts: Map<string, ToastMessage> = new Map()
  private listeners: Set<(toasts: ToastMessage[]) => void> = new Set()
  private nextId = 0

  private notify() {
    const toastArray = Array.from(this.toasts.values())
    this.listeners.forEach(listener => listener(toastArray))
  }

  subscribe(listener: (toasts: ToastMessage[]) => void) {
    this.listeners.add(listener)
    listener(Array.from(this.toasts.values()))
    return () => this.listeners.delete(listener)
  }

  show(message: string, type: ToastMessage['type'] = 'info', duration = 4000): string {
    const id = `toast-${this.nextId++}`
    this.toasts.set(id, { id, message, type, duration })
    this.notify()

    if (type !== 'loading' && duration > 0) {
      setTimeout(() => this.dismiss(id), duration)
    }

    return id
  }

  success(message: string, options?: { id?: string; duration?: number }): string {
    if (options?.id && this.toasts.has(options.id)) {
      this.update(options.id, message, 'success')
      return options.id
    }
    return this.show(message, 'success', options?.duration)
  }

  error(message: string, options?: { id?: string; duration?: number }): string {
    if (options?.id && this.toasts.has(options.id)) {
      this.update(options.id, message, 'error')
      return options.id
    }
    return this.show(message, 'error', options?.duration)
  }

  loading(message: string, options?: { id?: string }): string {
    if (options?.id && this.toasts.has(options.id)) {
      this.update(options.id, message, 'loading')
      return options.id
    }
    return this.show(message, 'loading', 0)
  }

  info(message: string, options?: { id?: string; duration?: number }): string {
    if (options?.id && this.toasts.has(options.id)) {
      this.update(options.id, message, 'info')
      return options.id
    }
    return this.show(message, 'info', options?.duration)
  }

  update(id: string, message: string, type: ToastMessage['type']) {
    const toast = this.toasts.get(id)
    if (toast) {
      toast.message = message
      toast.type = type
      this.notify()
    }
  }

  dismiss(id: string) {
    this.toasts.delete(id)
    this.notify()
  }

  clear() {
    this.toasts.clear()
    this.notify()
  }
}

export const toast = new ToastManager()
