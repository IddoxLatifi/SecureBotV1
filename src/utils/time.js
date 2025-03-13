async function getHammertime() {
    try {
      const response = await fetch('https://hammertime.cyou/de');
      if (!response.ok) {
        throw new Error(`HTTP-Fehler: ${response.status}`);
      }
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        return new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
      }
      const text = await response.text();
      return text.trim();
    } catch (error) {
      console.warn("getHammertime Fallback: ", error.message);
      return new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
    }
  }
  
  module.exports = { getHammertime };
  