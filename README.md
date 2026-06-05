# Tradehub

A simple TradeHub marketplace web app built with HTML, CSS, and JavaScript.

## Files
- `index.html` - landing page
- `login.html` - login flow
- `register.html` - user registration
- `shop.html` - product catalog and cart
- `dashboard.html` - orders dashboard
- `js/main.js` - app logic for auth, products, cart, and orders
- `css/style.css` - application styling

## Setup
Open the project in a browser or serve with a local static server.

## Notes
Firebase config files are not included in this repository. To use Firebase auth or Firestore, add your local `firebase.js` configuration file separately.

## Email notifications
This project includes a Firebase Cloud Functions backend for email notifications:

- `functions/sendRegistrationEmail` sends an email when a user registers.
- `functions/notifyVisit` sends an email when a visitor loads the site (if `window.visitNotifyUrl` is configured).

### Setup
1. Copy `firebase.example.js` to `firebase.js` and replace the Firebase config values.
2. Update `window.visitNotifyUrl` in `firebase.js` after deploying the Cloud Function.
3. Install and deploy functions:

```bash
cd functions
npm install
firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY" admin.email="you@example.com" admin.from="noreply@yourdomain.com"
firebase deploy --only functions
```

4. Use the deployed `notifyVisit` URL in `firebase.js`.
5. When a user registers, the `sendRegistrationEmail` function sends a notification email automatically.

### Deploy helper
A simple PowerShell script is included to deploy your Firebase Functions:

```powershell
.\deploy-functions.ps1 -ProjectId "your-project-id" -SendGridKey "YOUR_SENDGRID_API_KEY" -AdminEmail "you@example.com" -FromEmail "noreply@yourdomain.com"
```

Make sure to update `.firebaserc` with your Firebase project ID before running the script.

### Notes on email delivery
- This code uses SendGrid for email delivery.
- You must set a SendGrid API key via Firebase config.
- If you want plain email without SendGrid, replace the provider code in `functions/index.js`.
