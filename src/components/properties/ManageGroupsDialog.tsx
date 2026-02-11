import { useState } from 'react';
import { Trash2, Edit2, Check, X, Tag, Plus, Search, Link2, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { usePropertyGroupsContext } from '@/contexts/PropertyGroupsContext';
import { GROUP_COLOR_PRESETS } from '@/types/propertyGroup';
import AssignPropertiesDialog from './AssignPropertiesDialog';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ManageGroupsDialog({ open, onOpenChange }: Props) {
  const { toast } = useToast();
  const { groups, addGroup, updateGroup, deleteGroup, forceDeleteGroup, getGroupPropertyCount, getHistoryForGroup } = usePropertyGroupsContext();

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  // Create state
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newColor, setNewColor] = useState(GROUP_COLOR_PRESETS[0].value);
  const [newTags, setNewTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Search
  const [search, setSearch] = useState('');

  // Assign dialog
  const [assignGroupId, setAssignGroupId] = useState<string | null>(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; count: number } | null>(null);

  const TAG_SUGGESTIONS = ['Portfolio', 'High-Yield', 'Residential', 'Commercial', 'Student', 'Affordable', 'Urban', 'Suburban'];

  const filteredGroups = groups.filter(g =>
    !search.trim() || g.name.toLowerCase().includes(search.toLowerCase()) || g.description.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (id: string) => {
    const g = groups.find(x => x.id === id);
    if (!g) return;
    setEditingId(id);
    setEditName(g.name);
    setEditColor(g.color);
  };

  const saveEdit = () => {
    if (!editingId || !editName.trim()) return;
    if (groups.some(g => g.id !== editingId && g.name.toLowerCase() === editName.trim().toLowerCase())) {
      toast({ title: 'Group name already exists', variant: 'destructive' });
      return;
    }
    updateGroup(editingId, { name: editName.trim(), color: editColor });
    setEditingId(null);
    toast({ title: 'Group updated' });
  };

  const handleDeleteClick = (id: string) => {
    const g = groups.find(x => x.id === id);
    if (!g) return;
    const count = getGroupPropertyCount(id);
    if (count === 0) {
      deleteGroup(id);
      toast({ title: 'Group deleted' });
    } else {
      setDeleteTarget({ id, name: g.name, count });
    }
  };

  const confirmForceDelete = () => {
    if (!deleteTarget) return;
    forceDeleteGroup(deleteTarget.id);
    toast({ title: 'Group deleted', description: `${deleteTarget.count} properties unlinked.` });
    setDeleteTarget(null);
  };

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      toast({ title: 'Name is required', variant: 'destructive' });
      return;
    }
    if (groups.some(g => g.name.toLowerCase() === trimmed.toLowerCase())) {
      toast({ title: 'Group name already exists', variant: 'destructive' });
      return;
    }
    const newGroup = addGroup(trimmed, newDesc.trim(), newColor, newTags);
    toast({ title: 'Group created', description: `"${trimmed}" ready. Assign properties now.` });
    setNewName('');
    setNewDesc('');
    setNewColor(GROUP_COLOR_PRESETS[0].value);
    setNewTags([]);
    setAssignGroupId(newGroup.id);
  };

  const addTag = (tag?: string) => {
    const t = (tag || tagInput).trim();
    if (!t || newTags.includes(t)) return;
    setNewTags(prev => [...prev, t]);
    setTagInput('');
  };

  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return iso; }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              Manage Property Groups
            </DialogTitle>
            <DialogDescription>
              Create, edit, assign properties, and view history.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="all" className="flex-1 flex flex-col min-h-0">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="all">All Groups ({groups.length})</TabsTrigger>
              <TabsTrigger value="add">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add New
              </TabsTrigger>
            </TabsList>

            {/* All Groups Tab */}
            <TabsContent value="all" className="flex-1 overflow-hidden flex flex-col mt-3">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search groups..."
                  className="pl-9 h-9"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 max-h-[450px]">
                {filteredGroups.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {groups.length === 0 ? 'No groups created yet.' : 'No groups match your search.'}
                  </p>
                ) : (
                  filteredGroups.map(g => {
                    const count = getGroupPropertyCount(g.id);
                    const isEditing = editingId === g.id;
                    const history = getHistoryForGroup(g.id);

                    return (
                      <Accordion key={g.id} type="single" collapsible>
                        <AccordionItem value={g.id} className="border rounded-lg bg-muted/20">
                          <div className="flex items-center gap-3 p-3">
                            <div
                              className="h-7 w-7 rounded-full shrink-0 border border-border"
                              style={{ backgroundColor: isEditing ? editColor : g.color }}
                            />
                            <div className="flex-1 min-w-0">
                              {isEditing ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    className="h-8 text-sm"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                  />
                                  <div className="flex gap-1">
                                    {GROUP_COLOR_PRESETS.slice(0, 5).map(p => (
                                      <button
                                        key={p.value}
                                        className={`h-5 w-5 rounded-full border-2 ${editColor === p.value ? 'border-foreground' : 'border-transparent'}`}
                                        style={{ backgroundColor: p.value }}
                                        onClick={() => setEditColor(p.value)}
                                      />
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <p className="text-sm font-medium">{g.name}</p>
                                  {g.description && <p className="text-xs text-muted-foreground truncate">{g.description}</p>}
                                </div>
                              )}
                            </div>

                            <Badge variant="outline" className="text-xs shrink-0">{count} properties</Badge>

                            <div className="flex gap-1 shrink-0">
                              {isEditing ? (
                                <>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={saveEdit}>
                                    <Check className="h-3.5 w-3.5 text-primary" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingId(null)}>
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setAssignGroupId(g.id)} title="Assign properties">
                                    <Link2 className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(g.id)} title="Edit">
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteClick(g.id)} title="Delete">
                                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                  </Button>
                                </>
                              )}
                            </div>

                            <AccordionTrigger className="p-0 h-7 w-7 [&>svg]:h-3.5 [&>svg]:w-3.5" />
                          </div>

                          <AccordionContent className="px-3 pb-3">
                            {/* Tags */}
                            {g.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {g.tags.map(t => (
                                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                                ))}
                              </div>
                            )}

                            {/* Audit Log */}
                            <div className="space-y-1.5">
                              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" /> History
                              </p>
                              {history.length === 0 ? (
                                <p className="text-xs text-muted-foreground">No history yet.</p>
                              ) : (
                                history.slice(0, 5).map(h => (
                                  <div key={h.id} className="flex items-start gap-2 text-xs">
                                    <span className="text-muted-foreground shrink-0 w-32">{formatDate(h.timestamp)}</span>
                                    <Badge variant="outline" className="text-xs shrink-0">{h.action}</Badge>
                                    <span className="text-muted-foreground">{h.details}</span>
                                  </div>
                                ))
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    );
                  })
                )}
              </div>
            </TabsContent>

            {/* Add New Tab */}
            <TabsContent value="add" className="flex-1 overflow-y-auto mt-3">
              <div className="space-y-4 max-w-md">
                <div>
                  <Label>Group Name *</Label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Downtown Portfolio"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Optional description..."
                    rows={2}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {GROUP_COLOR_PRESETS.map(preset => (
                      <button
                        key={preset.value}
                        type="button"
                        className={`h-8 w-8 rounded-full border-2 transition-all ${
                          newColor === preset.value ? 'border-foreground scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: preset.value }}
                        onClick={() => setNewColor(preset.value)}
                        title={preset.label}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-1.5 block">Tags</Label>
                  <div className="flex gap-1.5">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                      placeholder="Add a tag..."
                      className="h-9"
                    />
                    <Button type="button" size="sm" variant="outline" onClick={() => addTag()} className="h-9 px-3 shrink-0">
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {tagInput && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {TAG_SUGGESTIONS.filter(s => !newTags.includes(s) && s.toLowerCase().includes(tagInput.toLowerCase())).slice(0, 5).map(s => (
                        <Badge key={s} variant="outline" className="text-xs cursor-pointer hover:bg-accent" onClick={() => addTag(s)}>
                          + {s}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {newTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {newTags.map(t => (
                        <Badge key={t} variant="secondary" className="text-xs gap-1 pr-1">
                          {t}
                          <button type="button" onClick={() => setNewTags(prev => prev.filter(x => x !== t))} className="hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Button onClick={handleCreate} className="gap-1.5 w-full">
                  <Plus className="h-4 w-4" /> Create Group
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Assign Properties Sub-Dialog */}
      {assignGroupId && (
        <AssignPropertiesDialog
          open={!!assignGroupId}
          onOpenChange={(o) => { if (!o) setAssignGroupId(null); }}
          groupId={assignGroupId}
        />
      )}

      {/* Force Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete "{deleteTarget?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This group has {deleteTarget?.count} linked properties. Deleting will unlink all properties from this group. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmForceDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Unlink All & Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
