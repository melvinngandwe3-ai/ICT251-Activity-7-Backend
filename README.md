# ICT251 Activity 7 - IT Support Desk Request API

## Project choice
This project uses **IT Support Desk** from the Activity 6/7 system list. It records requests for Network, Software, Hardware and Account support. The project is designed as a standalone backend and does not require Activity 6's frontend to run.

## Requirements
- Node.js LTS
- npm
- A PostgreSQL database
- Postman or another API client for testing

> The Activity 7 handout lists `pg` as the database package and demonstrates PostgreSQL `$1` query placeholders. This project therefore uses PostgreSQL. If your lecturer specifically requires SQLite, confirm that before submission.

## Files
- `server.js` - Express server, API guide, health check and error handling.
- `routes/records.js` - GET, POST, PUT and DELETE record routes plus validation.
- `db.js` - PostgreSQL connection pool.
- `schema.sql` - database table.
- `seed.sql` - eight made-up starting records.
- `.env.example` - environment variable template.

## Run locally
1. Create a PostgreSQL database named `it_support`.
2. Run `schema.sql` against that database.
3. Run `seed.sql` against that database once.
4. Copy `.env.example` to `.env` and set `DATABASE_URL`.
5. Run `npm install`.
6. Run `npm start`.
7. Open `http://localhost:3000`.

## API routes
| Method | Route | Purpose |
|---|---|---|
| GET | `/` | API guide |
| GET | `/health` | Database health check |
| GET | `/api/records` | List records |
| GET | `/api/records/:id` | Get one record |
| POST | `/api/records` | Create record |
| PUT | `/api/records/:id` | Update all four editable fields |
| DELETE | `/api/records/:id` | Delete record |

### Example POST/PUT body
```json
{
  "title": "Cannot connect to campus Wi-Fi",
  "category": "Network",
  "description": "My device connects but cannot access the internet.",
  "status": "Pending"
}
```
Do not include `id`. Valid statuses are `Pending`, `In progress`, and `Completed`.

## Testing checklist
1. `GET /health` returns 200.
2. `GET /api/records` returns a JSON array.
3. `POST /api/records` with a valid body returns 201 and a generated id.
4. `GET /api/records/{id}` returns the created record.
5. `PUT /api/records/{id}` updates all four fields and preserves the id.
6. `DELETE /api/records/{id}` returns `{"message":"Record deleted."}`.
7. Invalid data returns 400.
8. A valid but missing id returns 404.
9. Restart the service and verify the database record remains.

## Deploy to Render
1. Push this project to a GitHub repository. Do not upload `.env` or `node_modules`.
2. Create a PostgreSQL database in Render (or another lecturer-approved PostgreSQL host).
3. Run `schema.sql` and `seed.sql` on that database using the provider's SQL console or a PostgreSQL client.
4. Create a Render Web Service connected to the GitHub repository.
5. Build command: `npm install`
6. Start command: `npm start`
7. Add environment variables:
   - `DATABASE_URL` = the database's **internal** connection URL when the web service and database are both on Render.
   - `DB_SSL` = `false` for Render internal database connection; use `true` only if your database provider requires SSL.
   - `CLIENT_ORIGINS` = `*` for a public classroom demo, or your exact frontend origin later.
   - `PUBLIC_BASE_URL` = the assigned HTTPS service URL.
8. Deploy, then test `/`, `/health`, and every CRUD route using the live URL.

## Important submission notes
- Add your own student number in the API guide (search for the text `Add your student number before submission.` in `server.js`).
- Activity 7 asks for the **live backend base URL**, not the GitHub repository URL or ZIP file.
- This ZIP is the project source. It has not been deployed or tested against your personal hosting/database accounts. You must complete those account-dependent steps before submitting a live URL.
