import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, X, FileText } from 'lucide-react';
import { MOCK_PROPERTIES } from '@/hooks/useOwners';
import type { OwnerDocument } from '@/types/owner';

type DocEntry = Omit<OwnerDocument, 'id'> & { id?: string };

interface PropertiesDocumentsStepProps {
  linkedPropertyIds: string[];
  documents: DocEntry[];
  onPropertyChange: (ids: string[]) => void;
  onDocumentsChange: (docs: DocEntry[]) => void;
}

export default function PropertiesDocumentsStep({
  linkedPropertyIds,
  documents,
  onPropertyChange,
  onDocumentsChange,
}: PropertiesDocumentsStepProps) {
  const [tagInput, setTagInput] = useState<Record<number, string>>({});

  const toggleProperty = (id: string) => {
    onPropertyChange(
      linkedPropertyIds.includes(id)
        ? linkedPropertyIds.filter((p) => p !== id)
        : [...linkedPropertyIds, id]
    );
  };

  const addDocument = () => {
    const doc: DocEntry = {
      fileName: '',
      fileUrl: '#',
      tags: [],
      uploadedAt: new Date().toISOString(),
    };
    onDocumentsChange([...documents, doc]);
  };

  const updateDocName = (index: number, name: string) => {
    const updated = [...documents];
    updated[index] = { ...updated[index], fileName: name };
    onDocumentsChange(updated);
  };

  const addTag = (index: number) => {
    const tag = tagInput[index]?.trim();
    if (!tag) return;
    const updated = [...documents];
    if (!updated[index].tags.includes(tag)) {
      updated[index] = { ...updated[index], tags: [...updated[index].tags, tag] };
      onDocumentsChange(updated);
    }
    setTagInput((prev) => ({ ...prev, [index]: '' }));
  };

  const removeTag = (docIndex: number, tagIndex: number) => {
    const updated = [...documents];
    updated[docIndex] = {
      ...updated[docIndex],
      tags: updated[docIndex].tags.filter((_, i) => i !== tagIndex),
    };
    onDocumentsChange(updated);
  };

  const removeDocument = (index: number) => {
    onDocumentsChange(documents.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Properties */}
      <div>
        <Label className="mb-2 block">Link to Properties</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Select the properties this owner is associated with.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
          {MOCK_PROPERTIES.map((prop) => (
            <label
              key={prop.id}
              className="flex items-center gap-2 p-2 rounded-lg border border-border/50 bg-card cursor-pointer hover:bg-accent transition-colors"
            >
              <Checkbox
                checked={linkedPropertyIds.includes(prop.id)}
                onCheckedChange={() => toggleProperty(prop.id)}
              />
              <span className="text-sm">{prop.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Documents */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Documents</Label>
          <Button type="button" variant="outline" size="sm" onClick={addDocument}>
            <Upload className="h-4 w-4 mr-1" />
            Add Document
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Upload property management agreements or other documents.
        </p>

        {documents.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-border rounded-lg bg-card">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No documents yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc, i) => (
              <div key={i} className="p-3 rounded-lg border border-border/50 bg-card space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input
                    value={doc.fileName}
                    onChange={(e) => updateDocName(i, e.target.value)}
                    placeholder="Document name"
                    className="flex-1 h-8 text-sm"
                  />
                  <Input type="file" accept=".pdf,.doc,.docx" className="w-40 h-8 text-xs cursor-pointer" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => removeDocument(i)}
                  >
                    <X className="h-3.5 w-3.5 text-destructive-foreground" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {doc.tags.map((tag, ti) => (
                    <Badge
                      key={ti}
                      variant="outline"
                      className="text-xs gap-1 bg-background cursor-pointer"
                      onClick={() => removeTag(i, ti)}
                    >
                      {tag} <X className="h-3 w-3" />
                    </Badge>
                  ))}
                  <Input
                    value={tagInput[i] || ''}
                    onChange={(e) => setTagInput((prev) => ({ ...prev, [i]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        addTag(i);
                      }
                    }}
                    placeholder="Add tag..."
                    className="h-7 w-28 text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
