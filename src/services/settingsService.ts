import api from './axios';

export interface PrivacySettings {
  isPrivate: boolean;
  allowMessages: 'all' | 'followers' | 'none';
  showEmail: boolean;
  showPhone: boolean;
  showBirthDate: boolean;
}

export interface NotificationSettings {
  likes: boolean;
  comments: boolean;
  follows: boolean;
  mentions: boolean;
  messages: boolean;
  stories: boolean;
  posts: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  suspiciousActivityAlerts: boolean;
}

export interface UserSettings {
  privacy: PrivacySettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
}

// Obtener configuraciones del usuario
export const getUserSettings = async (): Promise<{ success: boolean; settings: UserSettings }> => {
  const res = await api.get('/users/settings');
  return res.data;
};

// Actualizar configuraciones de privacidad
export const updatePrivacySettings = async (settings: Partial<PrivacySettings>): Promise<{ success: boolean; message: string }> => {
  const res = await api.put('/users/settings/privacy', settings);
  return res.data;
};

// Actualizar configuraciones de notificaciones
export const updateNotificationSettings = async (settings: Partial<NotificationSettings>): Promise<{ success: boolean; message: string }> => {
  const res = await api.put('/users/settings/notifications', settings);
  return res.data;
};

// Actualizar configuraciones de seguridad
export const updateSecuritySettings = async (settings: Partial<SecuritySettings>): Promise<{ success: boolean; message: string }> => {
  const res = await api.put('/users/settings/security', settings);
  return res.data;
};

// Cambiar contraseña
export const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  const res = await api.put('/users/change-password', { currentPassword, newPassword });
  return res.data;
};

// Habilitar/deshabilitar autenticación de dos factores
export const toggleTwoFactor = async (enabled: boolean): Promise<{ success: boolean; message: string; qrCode?: string }> => {
  const res = await api.put('/users/two-factor', { enabled });
  return res.data;
}; 