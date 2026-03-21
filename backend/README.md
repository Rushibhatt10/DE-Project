# Smart Home AI Backend

Backend structure (as requested):

```
backend
├── server.js
├── routes
│   └── diagnose.js
├── services
│   └── aiService.js
└── uploads
```

## 1. Setup

```bash
cd backend
npm install
```

## 2. Environment

Create `backend/.env`:

```env
HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxx
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

## 3. Run server

```bash
npm run dev
```

You should see:

```bash
Server running on port 5000
```

## 4. API endpoints

- `GET /api/health`
- `POST /api/diagnose`

## 5. Postman test

Use:

`POST http://localhost:5000/api/diagnose`

Body -> `form-data`:

- `image` (file)
- `description` (text)

Example description:

`water leaking from sink`

Sample response:

```json
{
  "success": true,
  "caption": "a leaking pipe under a sink",
  "category": "Plumbing",
  "issue": "Possible pipe leakage or drainage issue",
  "severity": "medium",
  "confidence": 0.81,
  "visiting_charge_range": "₹149 - ₹574",
  "price_range": "₹149 - ₹574",
  "provider": "Plumber",
  "next_steps": [
    "Book Plumber through the app",
    "This range is the expected minimum visiting charge for home inspection",
    "Final repair/service cost is confirmed after inspection"
  ]
}
```
