# DocGenius AI — Document Generation Service

FastAPI microservice that converts structured JSON content into professionally formatted files.

## Endpoints

| Method | Path | Output |
|--------|------|--------|
| POST | `/generate/docx` | Word (.docx) |
| POST | `/generate/pdf` | PDF |
| POST | `/generate/pptx` | PowerPoint (.pptx) |
| POST | `/generate/xlsx` | Excel (.xlsx) |
| GET | `/health` | Service health check |

## Running Locally

```bash
# 1. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the service
uvicorn main:app --reload --port 8000
```

Service runs at `http://localhost:8000`.  
Interactive API docs at `http://localhost:8000/docs`.

## Deploy to Railway / Render

1. Push the `python-service/` folder as a separate repo, OR configure Railway/Render root directory to `python-service/`
2. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Set `PYTHON_SERVICE_URL` in your Next.js environment to the deployed URL

## Request Format

### Word / PDF
```json
{
  "title": "Document Title",
  "sections": [
    { "heading": "Introduction", "body": "Content here...", "bullets": ["Point 1", "Point 2"] }
  ],
  "metadata": { "author": "John Doe" }
}
```

### PowerPoint
```json
{
  "title": "Presentation Title",
  "subtitle": "Optional subtitle",
  "slides": [
    { "title": "Slide Title", "content": "Content", "bullets": ["Bullet 1"], "slideType": "content" }
  ]
}
```

### Excel
```json
{
  "title": "Report Title",
  "sheets": [
    {
      "name": "Revenue",
      "headers": ["Month", "Revenue", "Expenses"],
      "rows": [["Jan", 50000, 30000], ["Feb", 65000, 35000]],
      "chartType": "bar",
      "chartTitle": "Monthly Revenue vs Expenses"
    }
  ]
}
```
