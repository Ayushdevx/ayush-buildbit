This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## BuildBit API Documentation

BuildBit provides a comprehensive API for managing website projects. The API follows RESTful principles and uses standard HTTP methods.

### API Endpoints

#### Projects API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects` | GET | Retrieve a specific project by ID (requires id query parameter) |
| `/api/projects` | PUT | Create or update a project |
| `/api/projects` | DELETE | Delete a project by ID (requires id query parameter) |
| `/api/projects/list` | GET | List all projects with sorting and filtering |
| `/api/projects/stats` | GET | Get statistics about all projects |
| `/api/projects/activity` | GET | View project activity history |
| `/api/health` | GET | API health check and monitoring endpoint |

#### Query Parameters for List Endpoint

- `sortBy`: Field to sort by (e.g., createdAt, updatedAt, contentSize)
- `sortOrder`: Sort direction (asc or desc)
- `limit`: Maximum number of results to return
- `offset`: Number of results to skip
- `search`: Text to search for in project names and content

### Example Requests

#### Create/Update a Project

```bash
curl -X PUT http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"id":"my-project", "completeHtml": "<!DOCTYPE html><html><body>Hello World</body></html>"}'
```

#### List Projects

```bash
curl "http://localhost:3000/api/projects/list?sortBy=updatedAt&sortOrder=desc&limit=10"
```

#### Delete a Project

```bash
curl -X DELETE "http://localhost:3000/api/projects?id=my-project"
```

### Authentication

Authentication is currently bypassed for development purposes. In a production environment, proper authentication should be implemented.

### Error Handling

All API endpoints return standardized error responses with appropriate HTTP status codes and detailed error messages.

```json
{
  "success": false,
  "error": {
    "message": "Project not found",
    "code": "NOT_FOUND",
    "details": null
  },
  "meta": {
    "timestamp": "2025-05-22T10:30:45.123Z",
    "requestId": "7f28c5c9-2cb3-4f06-94b0-56038d0331f2"
  }
}
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
#   a y u s h - b u i l d b i t  
 