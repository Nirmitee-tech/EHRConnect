# Form Versioning API - Quick Reference

## Quick Solution to Your Error

### Error: "Cannot edit published form template"

**❌ What you tried (doesn't work):**
```http
PUT /api/forms/templates/013fe150-5ad5-4389-99b2-240629eac1dd
{
  "title": "Updated Mental Health Intake",
  "questionnaire": { ... }
}
```

**✅ What you should do instead:**
```http
# Step 1: Create a new version
POST /api/forms/templates/013fe150-5ad5-4389-99b2-240629eac1dd/versions
Content-Type: application/json

{
  "versionType": "minor",
  "changeNotes": "Added new optional fields"
}

# Response: Returns new draft version with new ID
{
  "id": "new-uuid-here",
  "status": "draft",
  "version": "1.1.0",
  "parent_version_id": "013fe150-5ad5-4389-99b2-240629eac1dd",
  ...
}

# Step 2: Edit the new draft version
PUT /api/forms/templates/{new-id}
{
  "questionnaire": { ... your changes ... }
}

# Step 3: Publish when ready
POST /api/forms/templates/{new-id}/publish
```

---

## All Versioning Endpoints

### 1. Create New Version
```http
POST /api/forms/templates/:id/versions
```

**Request Body:**
```json
{
  "versionType": "minor",      // "major", "minor", or "patch"
  "title": "Optional new title",
  "description": "Optional new description",
  "changeNotes": "Description of what changed"
}
```

**Response:**
```json
{
  "id": "uuid-of-new-version",
  "status": "draft",
  "version": "1.1.0",
  "parent_version_id": "uuid-of-original",
  "parent_version": "1.0.0",
  "change_notes": "Description of what changed",
  "questionnaire": { ... },
  ...
}
```

### 2. Get Version History
```http
GET /api/forms/templates/:id/versions
```

**Response:**
```json
{
  "versions": [
    {
      "id": "uuid-1",
      "version": "1.0.0",
      "status": "retired",
      "is_latest_version": false,
      "created_at": "2025-01-01T10:00:00Z",
      "published_at": "2025-01-01T11:00:00Z",
      "usage_count": 150
    },
    {
      "id": "uuid-2",
      "version": "1.1.0",
      "status": "active",
      "is_latest_version": true,
      "created_at": "2025-01-15T10:00:00Z",
      "published_at": "2025-01-15T12:00:00Z",
      "usage_count": 45
    }
  ]
}
```

### 3. Compare Versions
```http
GET /api/forms/templates/:id/versions/compare?compareWith=:otherId
```

**Response:**
```json
{
  "version1": {
    "id": "uuid-1",
    "version": "1.0.0",
    "updated_at": "2025-01-01T11:00:00Z"
  },
  "version2": {
    "id": "uuid-2",
    "version": "1.1.0",
    "updated_at": "2025-01-15T12:00:00Z"
  },
  "differences": {
    "added_questions": ["insurance-provider", "insurance-policy"],
    "removed_questions": [],
    "modified_questions": [],
    "metadata_changes": {
      "description": {
        "from": "Basic intake",
        "to": "Comprehensive intake with insurance"
      }
    },
    "summary": {
      "total_changes": 3,
      "breaking_changes": false
    }
  }
}
```

### 4. Retire Form
```http
POST /api/forms/templates/:id/retire
```

**Request Body:**
```json
{
  "reason": "Replaced by version 2.0.0"
}
```

**Response:**
```json
{
  "id": "uuid",
  "status": "retired",
  "retired_at": "2025-01-20T10:00:00Z",
  ...
}
```

### 5. Restore Archived Form
```http
POST /api/forms/templates/:id/restore
```

**Response:**
```json
{
  "id": "uuid",
  "status": "draft",  // Restored to draft
  ...
}
```

### 6. Publish Form
```http
POST /api/forms/templates/:id/publish
```

**Request Body (optional):**
```json
{
  "version": "1.0.0"  // Optional: specify version number
}
```

**Response:**
```json
{
  "id": "uuid",
  "status": "active",
  "published_at": "2025-01-01T11:00:00Z",
  ...
}
```

### 7. Archive Form
```http
POST /api/forms/templates/:id/archive
```

**Response:**
```json
{
  "id": "uuid",
  "status": "archived",
  ...
}
```

---

## Version Type Guide

### When to use PATCH (1.0.0 → 1.0.1)
- Fix typos in questions
- Update help text
- Change display order
- Style/theme updates
- Bug fixes that don't change structure

**Example:**
```json
{
  "versionType": "patch",
  "changeNotes": "Fixed typo in question 5"
}
```

### When to use MINOR (1.0.0 → 1.1.0)
- Add new optional questions
- Add new answer choices
- Add conditional logic (new paths)
- Add validation rules

**Example:**
```json
{
  "versionType": "minor",
  "changeNotes": "Added optional insurance information section"
}
```

### When to use MAJOR (1.0.0 → 2.0.0)
- Remove questions
- Change question types
- Make optional fields required
- Remove answer choices
- Restructure form significantly
- Breaking changes

**Example:**
```json
{
  "versionType": "major",
  "changeNotes": "Restructured form to align with new workflow"
}
```

---

## Complete Workflow Examples

### Example 1: Update Active Form

```bash
# Get current form
GET /api/forms/templates/abc-123

# Response shows: status = "active", version = "1.0.0"

# Create new version
POST /api/forms/templates/abc-123/versions
{
  "versionType": "minor",
  "changeNotes": "Adding emergency contact section"
}

# Response: New draft with id = "def-456", version = "1.1.0"

# Edit new version
PUT /api/forms/templates/def-456
{
  "questionnaire": {
    ... add new questions ...
  }
}

# Test the new version in UI...

# Publish when ready
POST /api/forms/templates/def-456/publish

# Optionally retire old version
POST /api/forms/templates/abc-123/retire
{
  "reason": "Replaced by version 1.1.0"
}
```

### Example 2: View Version History

```bash
# Get all versions
GET /api/forms/templates/abc-123/versions

# Response shows all versions:
# - v1.0.0 (retired)
# - v1.1.0 (retired)
# - v2.0.0 (active, latest)

# Compare versions
GET /api/forms/templates/abc-123/versions/compare?compareWith=def-456

# See what changed between versions
```

### Example 3: Fix Typo in Active Form

```bash
# For simple typo fixes, use patch version
POST /api/forms/templates/abc-123/versions
{
  "versionType": "patch",
  "changeNotes": "Fixed typo in question 3"
}

# Edit and fix typo
PUT /api/forms/templates/{new-id}
{ ... fix typo ... }

# Publish patch
POST /api/forms/templates/{new-id}/publish

# Auto-retire old patch version
POST /api/forms/templates/abc-123/retire
{
  "reason": "Fixed typo"
}
```

---

## Status Transitions Cheat Sheet

```
Draft → (publish) → Active
Active → (retire) → Retired
Any → (archive) → Archived
Archived → (restore) → Draft
```

**Allowed:**
- ✅ Edit Draft
- ✅ Publish Draft → Active
- ✅ Retire Active → Retired
- ✅ Archive Any Status
- ✅ Restore Archived → Draft

**Not Allowed:**
- ❌ Edit Active (must create version)
- ❌ Edit Retired
- ❌ Reactivate Retired (must create version)
- ❌ Delete Active/Retired

---

## Error Messages and Solutions

| Error | Meaning | Solution |
|-------|---------|----------|
| "Cannot edit published form template" | Trying to PUT to active form | Create new version with POST /versions |
| "Can only create versions of active templates" | Trying to version a draft | Publish it first |
| "Can only retire active templates" | Trying to retire draft/retired | Use archive instead |
| "Can only restore archived templates" | Trying to restore non-archived | Check status first |

---

## Testing Your Implementation

### Test 1: Create and Publish
```bash
# 1. Create draft
curl -X POST http://localhost:8000/api/forms/templates \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Form", "questionnaire": {...}}'

# 2. Try to edit (should work - it's draft)
curl -X PUT http://localhost:8000/api/forms/templates/{id} \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Test Form"}'

# 3. Publish
curl -X POST http://localhost:8000/api/forms/templates/{id}/publish

# 4. Try to edit (should fail with versioning message)
curl -X PUT http://localhost:8000/api/forms/templates/{id} \
  -H "Content-Type: application/json" \
  -d '{"title": "Should Fail"}'
```

### Test 2: Create Version
```bash
# Create new version
curl -X POST http://localhost:8000/api/forms/templates/{id}/versions \
  -H "Content-Type: application/json" \
  -d '{"versionType": "minor", "changeNotes": "Test version"}'

# Edit new version (should work - it's draft)
curl -X PUT http://localhost:8000/api/forms/templates/{new-id} \
  -H "Content-Type: application/json" \
  -d '{"title": "Version 1.1.0"}'

# Publish new version
curl -X POST http://localhost:8000/api/forms/templates/{new-id}/publish
```

### Test 3: Version History
```bash
# Get version history
curl http://localhost:8000/api/forms/templates/{any-version-id}/versions

# Should show all versions in the chain
```

---

## Integration with Frontend

### React Example
```typescript
// Create new version
const createVersion = async (templateId: string) => {
  const response = await fetch(
    `/api/forms/templates/${templateId}/versions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        versionType: 'minor',
        changeNotes: 'User requested changes'
      })
    }
  );

  const newVersion = await response.json();

  // Navigate to editor with new draft version
  router.push(`/forms/builder/${newVersion.id}`);
};

// Handle edit button click
const handleEditClick = async (template) => {
  if (template.status === 'active') {
    // Show dialog: "Create new version?"
    const confirmed = await showConfirmDialog(
      'This form is published. Create a new version to edit?'
    );

    if (confirmed) {
      await createVersion(template.id);
    }
  } else {
    // Direct edit for draft forms
    router.push(`/forms/builder/${template.id}`);
  }
};
```

---

## Need Help?

- See full guide: `docs/FORM_VERSIONING_GUIDE.md`
- Report issues: GitHub Issues
- Contact: Development Team
