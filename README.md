# React OIDC Application

A React application with OpenID Connect (OIDC) authentication using the `oidc-client-ts` library.

## Features

- ✅ OpenID Connect authentication flow
- ✅ PKCE (Proof Key for Code Exchange) support
- ✅ Protected routes
- ✅ Token management (access & refresh tokens)
- ✅ User profile display
- ✅ Responsive design
- ✅ TypeScript support
- ✅ Modern React with hooks and context

## Project Structure

```
react-oidc-app/
├── src/
│   ├── components/        # Reusable components
│   │   └── ProtectedRoute.tsx
│   ├── context/          # React context providers
│   │   └── OIDCContext.tsx
│   ├── pages/            # Page components
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   └── CallbackPage.tsx
│   ├── config/           # Configuration files
│   │   └── oidsConfig.ts
│   ├── types/            # TypeScript type definitions
│   │   └── oidc.ts
│   ├── utils/            # Utility functions
│   │   └── tokenUtils.ts
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── .env                  # Environment variables (create from .env.example)
├── .env.example          # Environment variables template
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies
```

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

      VITE_CLIENT_ID=your-client-id
      VITE_OIDC_REDIRECT_URI=http://localhost:3000/callback
      ```

3. **Configure your OIDC provider settings:**
    - Set the redirect URI to: `http://localhost:8000/auth/callback`
    - Enable PKCE (Proof Key for Code Exchange)
    - Configure appropriate scopes: `openid profile email nhsperson associatedorgs nationalrbacaccess professionalmemberships organisationalmemberships selectedrole`
    - acr_values: AAL2_OR_AAL3_ANY
    - state: <generated>

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## Test OIDC mock server locally
oidc-provider-mock - A Python-based OpenID Connect provider server for testing authentication PyPI. This is perfect for testing your client applications.
https://pypi.org/project/oidc-provider-mock/ 

To install oidc-provider-mock, use pip:

```bash
pipx install oidc-provider-mock
``` 
To run the mock server:
```bash
oidc-provider-mock
``` 
Enable the metadata in oidsConfig.ts for a local server
