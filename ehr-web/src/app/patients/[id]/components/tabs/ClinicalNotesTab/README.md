# Clinical Notes Tab - Enhanced UI

Modern, feature-rich clinical notes interface with smart templates, search, filtering, and better organization.

## Components

### 1. **ClinicalNotesTab** (Main Component)
Displays all clinical notes with advanced filtering, search, and organization.

### 2. **ClinicalNoteEditor** (Drawer Component)
Modern form for creating/editing notes with templates and validation.

## Features

### ✨ **Smart Features**
- 🔍 **Full-text Search** - Search by content, author, type, category, or tags
- 🏷️ **Tagging System** - Add custom tags for better organization
- ⭐ **Favorites** - Mark important notes
- 📊 **Quick Stats** - Total notes, weekly count, favorites
- 🎯 **Smart Filters** - Filter by type (10+ types) and category (9 categories)
- 📝 **Templates** - SOAP Note and Progress Note templates
- ✅ **Validation** - Word count and character count
- 🎨 **Color-Coded** - Different colors for each note type
- 📅 **Date Sorting** - Sort by date or type (ascending/descending)

### 📋 **Note Types Supported**
1. Progress Note
2. SOAP Note
3. Consultation Note
4. Discharge Summary
5. History & Physical
6. Operative Note
7. Procedure Note
8. Follow-up Note
9. Telephone Encounter
10. Other

### 🏷️ **Categories**
- General
- Follow-up
- Pre-operative
- Post-operative
- Emergency
- Consultation
- Lab Results
- Imaging Results
- Other

## Usage Example

```tsx
import { ClinicalNotesTab } from './components/tabs/ClinicalNotesTab';
import { ClinicalNoteEditor } from './components/tabs/ClinicalNotesTab/ClinicalNoteEditor';
import { useState } from 'react';

function EncounterClinicalNotes() {
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<ClinicalNote | null>(null);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');

  const handleAddNote = () => {
    setEditingNote(null);
    setEditorMode('create');
    setShowEditor(true);
  };

  const handleEditNote = (note: ClinicalNote) => {
    setEditingNote(note);
    setEditorMode('edit');
    setShowEditor(true);
  };

  const handleSaveNote = async (note: ClinicalNote) => {
    if (editorMode === 'create') {
      // Create new note
      setNotes([...notes, { ...note, id: `note-${Date.now()}` }]);
    } else {
      // Update existing note
      setNotes(notes.map(n => n.id === note.id ? note : n));
    }
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(n => n.id !== noteId));
  };

  const handleToggleFavorite = (noteId: string) => {
    setNotes(notes.map(n =>
      n.id === noteId ? { ...n, isFavorite: !n.isFavorite } : n
    ));
  };

  return (
    <>
      <ClinicalNotesTab
        notes={notes}
        onAddNote={handleAddNote}
        onEditNote={handleEditNote}
        onDeleteNote={handleDeleteNote}
        onToggleFavorite={handleToggleFavorite}
      />

      <ClinicalNoteEditor
        open={showEditor}
        onOpenChange={setShowEditor}
        onSave={handleSaveNote}
        note={editingNote}
        mode={editorMode}
      />
    </>
  );
}
```

## Integration with FHIR

The notes should be stored as FHIR Encounter extensions:

```typescript
// Store as JSON array in extension
{
  resourceType: 'Encounter',
  extension: [
    {
      url: 'clinicalNotesList',
      valueString: JSON.stringify([
        {
          id: 'note-1',
          date: '2025-01-10T14:30:00',
          noteType: 'Progress Note',
          category: 'General',
          narrative: 'Patient presents with...',
          createdBy: 'practitioner-123',
          createdByName: 'Dr. Smith',
          tags: ['follow-up', 'hypertension'],
          isFavorite: false
        }
      ])
    }
  ]
}
```

## Styling

The components use Tailwind CSS with:
- Gradient headers (blue to purple)
- Color-coded note types
- Hover effects and transitions
- Responsive grid layouts
- Modern card-based design
- Shadow effects on hover

## Screenshots

### Main View
- Quick stats dashboard
- Search bar with filters
- Color-coded note cards
- Edit/delete actions on hover
- Favorite star indicator

### Editor
- Gradient header with template button
- Date/time picker
- Note type and category dropdowns
- Tag management
- Large textarea with word/char count
- Template quick-start
- Validation warnings

## Future Enhancements

1. **Rich Text Editor** - Add formatting toolbar
2. **Version History** - Track note revisions
3. **Export to PDF** - Download notes
4. **Voice Input** - Speech-to-text
5. **AI Assistance** - Auto-complete suggestions
6. **Collaborative Editing** - Real-time collaboration
7. **Note Templates Management** - Create custom templates
8. **Attachments** - Attach images/files to notes
