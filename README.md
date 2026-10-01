# Apna Ghar

Apna Ghar is a static HTML/CSS/JavaScript site served by a small Node.js API. The API uses MongoDB Atlas for accounts, public property listings, enquiries, and GridFS photo storage.

## Run locally

1. Install Node.js 22 or newer.
2. In this folder, run `npm install`.
3. In PowerShell, copy `.env.example` to `.env` with `Copy-Item .env.example .env`, then open `.env` in VS Code and fill in the values:
   - `MONGODB_URI`: Atlas connection string using the `apna_ghar_app` database user. Keep it private. URL-encode special characters in the password.
   - `DB_NAME`: keep `apnaghar`.
   - `JWT_SECRET`: replace the example with a long random secret. You can generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
4. In Atlas Network Access, allow the public IP address of the computer running this local server.
5. Run `npm run dev` and open `http://localhost:3000`.

The Atlas database user should have `readWrite` on the `apnaghar` database only. Never put the MongoDB connection string in browser JavaScript or commit `.env`.

New accounts require passwords of at least 10 characters. Sessions use an HttpOnly cookie. Property photos are stored in MongoDB GridFS and are limited to three JPG, PNG, WebP, or AVIF files of 1 MB each.

Before public launch, deploy this Node.js server over HTTPS, update the Atlas IP access list for the hosting environment, and configure account email verification and password recovery. The enquiry inbox is available to the property owner after sign-in.
