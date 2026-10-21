/**
 * Andhra Kesari University (AKU) UG Examination Portal API Service
 * Connects to live endpoints:
 * - /CollegeLoginStatus (GET)
 * - /LoadCollegeMenu (GET)
 * - /AdminLoginStatus (GET)
 * - /LoadAdminMenu (GET)
 * - /LoadAdminNotifications (GET)
 */

export interface CollegeUser {
  colCode: string;
  colname: string;
  princname: string;
  mobile1: string;
  mobile2?: string;
  district: string;
}

export interface CollegeLoginResponse {
  status: 'Success' | 'Failed' | string;
  message: string;
  admin?: CollegeUser;
}

export interface CollegeMenuItem {
  menuid: string;
  text: string;
  description: string;
  navigateurl: string;
  parentid: string; // "" = parent group/top level, "2" = under Enrollment, "3" = under Exam Enrollment
  isactive: string;
  iConClass: string;
}

export interface CollegeMenuResponse {
  status: 'Success' | 'Failed' | string;
  message: string;
  admin: CollegeMenuItem[];
}

export interface AdminUser {
  userid: string;
  userGroup: string;
  isActive: string;
  mobile: string;
}

export interface AdminLoginResponse {
  status: 'Success' | 'Failed' | string;
  message: string;
  admin?: AdminUser;
}

export interface AdminMenuItem {
  menuid: string;
  smenuid: string; // "" = main group, "1", "2"... = sub-items
  text: string;
  description: string;
  navigateurl: string;
  iConClass: string;
  isactive: string;
}

export interface AdminMenuResponse {
  status: 'Success' | 'Failed' | string;
  message: string;
  admin: AdminMenuItem[];
}

export interface AdminNotification {
  sno: string;
  description: string;
  notificationType: string; // 'File' | 'Link'
  colour: string; // 'Blue' | 'RED' | 'Green'
  order: string;
  gif: string; // 'True' | 'False'
  url: string;
  isActive: string;
}

export interface AdminNotificationResponse {
  status: 'Success' | 'Failed' | string;
  message: string;
  notifications: AdminNotification[];
}

// In development, Vite server proxy forwards '/api' to 'https://api.akuexams.com'
// to avoid browser CORS restrictions. In production, use configured base URL.
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || (import.meta.env.DEV ? '/api' : 'https://api.akuexams.com');

// ---------------------------------------------------------------------------
// College Portal API
// ---------------------------------------------------------------------------

/**
 * College Login API
 * GET /CollegeLoginStatus?Colcode={Colcode}&Pwd={Pwd}
 */
export async function collegeLogin(colCode: string, pwd: string): Promise<CollegeLoginResponse> {
  const url = `${API_BASE}/CollegeLoginStatus?Colcode=${encodeURIComponent(colCode.trim())}&Pwd=${encodeURIComponent(pwd.trim())}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json, text/plain, */*'
    }
  });

  if (!res.ok) {
    throw new Error(`College login request failed with status: ${res.status} ${res.statusText}`);
  }

  const data: CollegeLoginResponse = await res.json();
  return data;
}

/**
 * Load College Menu API
 * GET /LoadCollegeMenu?Colcode={Colcode}
 */
export async function fetchCollegeMenu(colCode: string): Promise<CollegeMenuItem[]> {
  const url = `${API_BASE}/LoadCollegeMenu?Colcode=${encodeURIComponent(colCode.trim())}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json, text/plain, */*'
    }
  });

  if (!res.ok) {
    throw new Error(`Load college menu failed with status: ${res.status}`);
  }

  const data: CollegeMenuResponse = await res.json();
  if (data.status === 'Success' && Array.isArray(data.admin)) {
    return data.admin;
  }
  return [];
}

// ---------------------------------------------------------------------------
// Admin Portal API
// ---------------------------------------------------------------------------

/**
 * Admin Login API
 * GET /AdminLoginStatus?Userid={Userid}&Pwd={Pwd}
 */
export async function adminLogin(userId: string, pwd: string): Promise<AdminLoginResponse> {
  const url = `${API_BASE}/AdminLoginStatus?Userid=${encodeURIComponent(userId.trim())}&Pwd=${encodeURIComponent(pwd.trim())}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json, text/plain, */*'
    }
  });

  if (!res.ok) {
    throw new Error(`Admin login request failed with status: ${res.status} ${res.statusText}`);
  }

  const data: AdminLoginResponse = await res.json();
  return data;
}

/**
 * Load Admin Menu API
 * GET /LoadAdminMenu?Userid={Userid}
 */
export async function fetchAdminMenu(userId: string): Promise<AdminMenuItem[]> {
  const url = `${API_BASE}/LoadAdminMenu?Userid=${encodeURIComponent(userId.trim())}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json, text/plain, */*'
    }
  });

  if (!res.ok) {
    throw new Error(`Load admin menu failed with status: ${res.status}`);
  }

  const data: AdminMenuResponse = await res.json();
  if (data.status === 'Success' && Array.isArray(data.admin)) {
    return data.admin;
  }
  return [];
}

/**
 * Load Admin Notifications API
 * GET /LoadAdminNotifications
 */
export async function fetchAdminNotifications(): Promise<AdminNotification[]> {
  const url = `${API_BASE}/LoadAdminNotifications`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json, text/plain, */*'
    }
  });

  if (!res.ok) {
    throw new Error(`Load notifications failed with status: ${res.status}`);
  }

  const data: AdminNotificationResponse = await res.json();
  if (data.status === 'Success' && Array.isArray(data.notifications)) {
    return data.notifications;
  }
  return [];
}

// ---------------------------------------------------------------------------
// Session Storage & State Persistence Helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY_COLLEGE_USER = 'aku_college_user';
const STORAGE_KEY_COLLEGE_MENU = 'aku_college_menu';
const STORAGE_KEY_ADMIN_USER = 'aku_admin_user';
const STORAGE_KEY_ADMIN_MENU = 'aku_admin_menu';

export function saveCollegeSession(user: CollegeUser, menu?: CollegeMenuItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_COLLEGE_USER, JSON.stringify(user));
    if (menu) {
      localStorage.setItem(STORAGE_KEY_COLLEGE_MENU, JSON.stringify(menu));
    }
  } catch (err) {
    console.warn('Could not save college session to localStorage', err);
  }
}

export function getCollegeSession(): { user: CollegeUser | null; menu: CollegeMenuItem[] } {
  try {
    const rawUser = localStorage.getItem(STORAGE_KEY_COLLEGE_USER);
    const rawMenu = localStorage.getItem(STORAGE_KEY_COLLEGE_MENU);
    return {
      user: rawUser ? JSON.parse(rawUser) : null,
      menu: rawMenu ? JSON.parse(rawMenu) : [],
    };
  } catch {
    return { user: null, menu: [] };
  }
}

export function clearCollegeSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_COLLEGE_USER);
    localStorage.removeItem(STORAGE_KEY_COLLEGE_MENU);
  } catch (err) {
    console.warn('Could not clear college session', err);
  }
}

export function saveAdminSession(user: AdminUser, menu?: AdminMenuItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ADMIN_USER, JSON.stringify(user));
    if (menu) {
      localStorage.setItem(STORAGE_KEY_ADMIN_MENU, JSON.stringify(menu));
    }
  } catch (err) {
    console.warn('Could not save admin session to localStorage', err);
  }
}

export function getAdminSession(): { user: AdminUser | null; menu: AdminMenuItem[] } {
  try {
    const rawUser = localStorage.getItem(STORAGE_KEY_ADMIN_USER);
    const rawMenu = localStorage.getItem(STORAGE_KEY_ADMIN_MENU);
    return {
      user: rawUser ? JSON.parse(rawUser) : null,
      menu: rawMenu ? JSON.parse(rawMenu) : [],
    };
  } catch {
    return { user: null, menu: [] };
  }
}

export function clearAdminSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_ADMIN_USER);
    localStorage.removeItem(STORAGE_KEY_ADMIN_MENU);
  } catch (err) {
    console.warn('Could not clear admin session', err);
  }
}
