# Dev Commands

## Install
```bash
npm install
```

## Run dev server
```bash
npm run dev
```

## Run tests
```bash
npm run test
```

## Run all gates
```bash
npm run gate:all
```

## Toggle mock mode
Set in `.env`:
```bash
VITE_USE_MOCK_API=true
```

## Future real backend mode
```bash
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:8000/api/v1
```
