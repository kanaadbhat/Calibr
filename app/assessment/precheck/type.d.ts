export type CheckStatus = 'pending' | 'success' | 'warning' | 'error';

export interface SystemCheck {
  id: string;
  label: string;
  status: CheckStatus;
  message: string;
  value?: number;
  action?: (() => Promise<void>);
}

export interface SystemRequirement {
  name: string;
  description: string;
  minValue?: number;
  required: boolean;
}