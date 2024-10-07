// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getMedilinkCookies") {
      chrome.cookies.getAll({ url: 'https://saludfeet.app.softwaremedilink.com' }, (cookies) => {
        if (!cookies || cookies.length === 0) {
          sendResponse({ error: "No se pudieron obtener las cookies de Medilink. Asegúrate de estar logueado." });
          return;
        }
  
        const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
  
        sendResponse({ cookies: cookieString });
      });
  
      return true; // Indica que la respuesta es asíncrona
    }
  });
  