# AI Service - Frontend Integration Guide

## Base URL
```
http://localhost:8083/api
```

---

## 1. Analysis Endpoints

### POST /analyze
Upload and analyze a single file.

**Request:** `multipart/form-data`
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | File to analyze (pdf, docx, xlsx, png, jpg, txt, etc.) |
| userId | String | No | User identifier |
| folderId | Long | No | Folder identifier |

**Response 201:**
```json
{
  "id": "uuid",
  "fileId": null,
  "fileName": "report.pdf",
  "fileType": "pdf",
  "summary": "Gemini AI analysis result...",
  "status": "COMPLETED",
  "modelUsed": null,
  "tokensUsed": null,
  "analysis": null,
  "fileMetadata": {
    "fileName": "report.pdf",
    "fileType": "pdf",
    "fileSize": 1024000,
    "extension": "pdf",
    "contentType": "application/pdf"
  },
  "createdAt": "2026-07-28T21:30:00"
}
```

**Response 400:** Invalid file type or size exceeded
**Response 422:** File processing failed
**Response 500:** Gemini API error

---

### POST /analyze/summary
Get a quick AI summary of a file (lighter than full analysis).

**Request:** `multipart/form-data`
| Field | Type | Required |
|-------|------|----------|
| file | File | Yes |

**Response 200:**
```json
{
  "id": "uuid",
  "status": "COMPLETED",
  "summary": "Quick summary text...",
  "fileName": "doc.txt",
  "createdAt": "2026-07-28T21:30:00"
}
```

---

### POST /analyze/batch
Analyze multiple files by their IDs (uses cached summaries if available).

**Request:**
```json
[1001, 1002, 1003]
```

**Response 200:**
```json
[
  {
    "id": "uuid",
    "fileId": 1001,
    "summary": "Cached or pending analysis...",
    "status": "COMPLETED",
    "modelUsed": "gemini-pro",
    "createdAt": "2026-07-28T21:30:00"
  },
  {
    "fileId": 1002,
    "status": "PENDING",
    "createdAt": "2026-07-28T21:30:00"
  }
]
```

---

### GET /analysis/{fileId}
Get cached analysis/summary for a specific file.

**Response 200:**
```json
{
  "id": "uuid",
  "fileId": 1001,
  "summary": "Full summary text...",
  "fileName": "report.pdf",
  "fileType": "pdf",
  "status": "COMPLETED",
  "modelUsed": "gemini-pro",
  "tokensUsed": 512,
  "createdAt": "2026-07-28T21:30:00"
}
```

**Response 404:** No cached analysis found

---

## 2. Conversation Endpoints

### POST /conversations
Create a new conversation session.

**Request:**
```json
{
  "userId": "user123",
  "fileIds": [1001, 1002],
  "folderId": 5,
  "title": "Analysis of Q3 Reports"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | String | Yes | User identifier |
| fileIds | Long[] | No | Files associated with conversation |
| folderId | Long | No | Folder context |
| title | String | No | Auto-generated if empty |

**Response 201:**
```json
{
  "conversationId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user123",
  "folderId": 5,
  "title": "Analysis of Q3 Reports",
  "status": "ACTIVE",
  "createdAt": "2026-07-28T21:30:00"
}
```

---

### GET /conversations/{conversationId}
Get full conversation history with all messages.

**Response 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user123",
  "folderId": 5,
  "title": "Analysis of Q3 Reports",
  "status": "ACTIVE",
  "messages": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "userMessage": "What are the key findings?",
      "aiResponse": "The key findings include...",
      "tokensUsed": 256,
      "createdAt": "2026-07-28T21:31:00"
    }
  ],
  "createdAt": "2026-07-28T21:30:00",
  "updatedAt": "2026-07-28T21:31:00"
}
```

---

### POST /conversations/{conversationId}/messages
Send a message and get AI response within a conversation.

**Request:**
```json
{
  "message": "Can you elaborate on the revenue projections?",
  "type": "user"
}
```

**Response 200:**
```json
{
  "messageId": "660e8400-e29b-41d4-a716-446655440001",
  "userMessage": "Can you elaborate on the revenue projections?",
  "aiResponse": "Based on the document analysis, revenue projections show...",
  "timestamp": "2026-07-28T21:32:00"
}
```

---

### DELETE /conversations/{conversationId}
Delete a conversation and all its messages.

**Response 204:** No content

---

### GET /conversations/users/{userId}
Get all conversations for a user.

**Response 200:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "user123",
    "folderId": 5,
    "title": "Analysis of Q3 Reports",
    "status": "ACTIVE",
    "messages": [...],
    "createdAt": "2026-07-28T21:30:00",
    "updatedAt": "2026-07-28T21:31:00"
  }
]
```

---

## 3. File Movement Endpoints

### POST /files/move
Move files from one folder to another (calls external file-service).

**Request:**
```json
{
  "fileIds": [1001, 1002, 1003],
  "targetFolderId": 10
}
```

**Response 200:**
```json
{
  "success": true,
  "movedCount": 3,
  "errors": 0
}
```

---

### GET /files/available-folders
Get all available folders (from external folder-service).

**Response 200:**
```json
[
  {
    "id": 1,
    "name": "Q3 Reports",
    "parentId": null,
    "fileCount": 15
  },
  {
    "id": 2,
    "name": "Invoices",
    "parentId": 1,
    "fileCount": 42
  }
]
```

---

### POST /files/folders/to-ai
Move an entire folder to the AI service for batch analysis.

**Request:**
```json
{
  "folderId": 5
}
```

**Response 200:**
```json
{
  "success": true,
  "folderId": 5
}
```

---

### GET /files/folders/{folderId}/files
Get all files within a specific folder (from external file-service).

**Response 200:**
```json
[
  {
    "id": 1001,
    "name": "report.pdf",
    "type": "pdf",
    "size": 2048576,
    "folderId": 5
  }
]
```

---

## 4. Error Responses

All endpoints return consistent error format:

```json
{
  "status": 400,
  "message": "Validation failed",
  "errors": {
    "userId": "UserId is required",
    "fileIds": "File IDs list is required"
  },
  "timestamp": "2026-07-28T21:30:00"
}
```

### HTTP Status Codes Used
| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No content (successful delete) |
| 400 | Validation error / bad request |
| 404 | Resource not found |
| 422 | File processing error |
| 500 | Gemini API or internal error |
| 503 | External service unavailable |

### Error Types
| Exception | HTTP Status | Trigger |
|-----------|-------------|---------|
| Validation errors | 400 | Missing/invalid fields |
| ConversationNotFoundException | 404 | Invalid conversation ID |
| FileProcessingException | 422 | Invalid file type, size, or extraction failure |
| GeminiApiException | 500 | Gemini API failure or timeout |
| ServiceCommunicationException | 503 | file-service or folder-service unreachable |

---

## 5. Supported File Types

| Category | Extensions |
|----------|------------|
| Documents | pdf, docx, doc, txt |
| Spreadsheets | xlsx, xls, csv |
| Images | png, jpg, jpeg, gif, bmp, webp |

- **Max file size:** 50MB per file (configurable via `file.upload.max-size`)
- **Max request size:** 50MB

---

## 6. Frontend Flow Recommendations

### File Analysis Flow
```
1. User uploads file → POST /analyze (multipart/form-data)
2. Display loading state while Gemini processes
3. Show analysis result (summary + metadata)
4. Optionally create a conversation for follow-up questions
```

### Conversation Flow
```
1. User starts chat → POST /conversations (with fileIds for context)
2. Store conversationId in frontend state
3. User sends message → POST /conversations/{id}/messages
4. Display user message immediately (optimistic)
5. Replace with full response including AI answer
6. Load history on page refresh → GET /conversations/{id}
```

### Batch Analysis Flow
```
1. User selects multiple files → POST /analyze/batch
2. Check status of each: "COMPLETED" vs "PENDING"
3. For "PENDING" items, call POST /analyze individually
4. Refresh batch status as files get processed
```

### File Organization Flow
```
1. Load available folders → GET /files/available-folders
2. User drags files → POST /files/move (fileIds, targetFolderId)
3. Refresh file list → GET /files/folders/{folderId}/files
4. Move folder to AI → POST /files/folders/to-ai (folderId)
```

---

## 7. Key Implementation Notes

- **All file uploads** use `multipart/form-data`
- **Conversation IDs** are UUIDs (v4), not numeric
- **File IDs** are Long (numeric), managed by external file-service
- **Cross-origin:** CORS is enabled for all origins (configurable in `WebConfig.java`)
- **Streaming:** Currently not implemented on the backend side; responses are returned in full
- **Rate limiting:** Not yet implemented; can be added at the API gateway level
