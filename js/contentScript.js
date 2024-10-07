// Create a container with a Shadow DOM
const container = document.createElement('div');
const shadowRoot = container.attachShadow({ mode: 'open' });
document.body.appendChild(container);

// Create notification container inside the Shadow DOM
const notificationContainer = document.createElement('div');
notificationContainer.id = 'notificationContainer';
shadowRoot.appendChild(notificationContainer);

// Add styles to the Shadow DOM
const style = document.createElement('style');
style.textContent = `
  #notificationContainer {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 300px;
    max-width: calc(100% - 40px);
    z-index: 1000;
    display: flex;
    flex-direction: column-reverse;
    align-items: flex-end;
  }
  
  .notification {
    background-color: #fff;
    padding: 10px;
    margin-top: 10px;
    border-left: 5px solid;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    opacity: 1;
    transition: opacity 0.5s;
  }
  
  .notification.success {
    border-color: #2ecc71;
  }
  
  .notification.error {
    border-color: #e74c3c;
  }
  
  .notification.warning {
    border-color: #f1c40f;
  }
  
  .notification p {
    margin: 0;
    color: #333;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .notification.fade-out {
    opacity: 0;
  }
`;
shadowRoot.appendChild(style);

// Function to display notifications
function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.classList.add('notification', type);
  notification.innerHTML = `<p>${message}</p>`;
  notificationContainer.insertBefore(notification, notificationContainer.firstChild);

  // Fade out and remove notification
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => {
      notificationContainer.removeChild(notification);
    }, 500);
  }, 5000);
}
