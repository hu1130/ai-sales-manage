export const BASE_URL = 'http://localhost:8080';
export const API_BASE = 'http://localhost:3001/api';

export const CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
};

export async function login(page) {
  await page.goto(BASE_URL);
  await page.fill('#username', CREDENTIALS.username);
  await page.fill('#password', CREDENTIALS.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
}

export async function resetDatabase() {
  try {
    await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(CREDENTIALS),
    }).then(async (res) => {
      const data = await res.json();
      return data.token;
    }).then(async (token) => {
      for (const resource of ['contracts', 'quotes', 'customers', 'leads']) {
        try {
          const listRes = await fetch(`${API_BASE}/${resource}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (listRes.ok) {
            const listData = await listRes.json();
            for (const item of listData.data || listData) {
              await fetch(`${API_BASE}/${resource}/${item.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
              });
            }
          }
        } catch (e) {
          console.log(`Skipping ${resource} reset`);
        }
      }
    });
  } catch (e) {
    console.log('Database reset failed:', e.message);
  }
}
