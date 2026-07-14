# FHIR R5 Encounter API — Petstore-style Swagger UI

This project renders `openapi.yaml` using the same open-source Swagger UI used by the Swagger Petstore demo.

## What the manager will see

- API title and description
- Server selector
- Encounter endpoint groups
- Expandable GET, POST, PUT and PATCH operations
- Request headers and parameters
- Request/response examples
- Schemas / Models
- Authorize button for Bearer JWT
- Try it out button

## Run on Windows with Docker Desktop

Open PowerShell in this folder:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\start.ps1
```

Open:

```text
http://localhost:8085
```

Stop:

```powershell
.\stop.ps1
```

## Run without Docker

Do not double-click `index.html`, because browsers may block loading `openapi.yaml` from `file://`.

From this folder run one of these:

```powershell
python -m http.server 8085
```

or:

```bash
npx serve . -l 8085
```

Then open `http://localhost:8085`.

## Publish a public link using GitHub Pages

1. Create a new GitHub repository.
2. Upload all files from this folder, including `.github`.
3. Push to the `main` branch.
4. In repository Settings → Pages, select **GitHub Actions** as the source.
5. The included workflow deploys the site and shows the public URL in the Actions run.

## Deploy on Vercel or Netlify

The included `vercel.json` and `netlify.toml` make this folder suitable for static deployment. Import the repository in the selected platform and deploy it as a static site.

## Important: UI versus working API

This package deploys interactive API documentation. The `Try it out` request is sent to a URL listed under `servers` in `openapi.yaml`. It will work only after the Spring Boot Encounter API is running at that URL and its CORS, OAuth/Keycloak, gateway and tenant rules are configured.

Before production, replace:

- `https://api.example.org/fhir/R5`
- local server URLs
- example Keycloak URLs
- sample hospital, tenant, organization and patient identifiers

Do not commit real access tokens or patient data.
