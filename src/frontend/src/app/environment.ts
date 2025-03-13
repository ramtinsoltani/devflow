export const environment = {
  apiBaseUrl: import.meta.env['NG_APP_API_BASE_URL'],
  firebase: JSON.parse(import.meta.env['NG_APP_FIREBASE_CONFIG'])
};