export type ToastColor = 'success' | 'warn' | 'danger'

export interface Toast {
	message: string
	color: ToastColor
	show: boolean
}

export interface AccessToken {
	accessToken: string
	tokenType: string
	expiresIn: Date
}

export type IterationStatus = 'skip' | 'step-back' | null
