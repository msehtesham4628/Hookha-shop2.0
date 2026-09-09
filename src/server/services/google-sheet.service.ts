const DEFAULT_WEBHOOK = 'https://script.google.com/macros/s/AKfycbzmo8uoaxfU0LnThcu_zTJC7sbBombWB8ZA4ZxiLphR9CFp3yiHt-jbokCNiGysDykbIw/exec';

export async function pushProductToGoogleSheet(action: 'upsert' | 'delete', product: any): Promise<boolean> {
  const webhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL || DEFAULT_WEBHOOK;
  if (!webhook) return false;

  try {
    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, product })
    });
    if (!response.ok) {
      console.warn(`[Google Sheet] ${action} returned HTTP ${response.status}`);
      return false;
    }
    return true;
  } catch (error) {
    console.warn(`[Google Sheet] ${action} sync failed:`, error);
    return false;
  }
}
