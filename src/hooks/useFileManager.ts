import { useState, useCallback } from 'react';
import type { DMSFolder, DMSFile, DMSTag } from '@/types/files';
import { MOCK_FOLDERS, MOCK_FILES, MOCK_TAGS } from '@/data/filesMockData';
import { useToast } from '@/hooks/use-toast';

export function useFileManager() {
  const { toast } = useToast();
  const [folders, setFolders] = useState<DMSFolder[]>(MOCK_FOLDERS);
  const [files, setFiles] = useState<DMSFile[]>(MOCK_FILES);
  const [tags, setTags] = useState<DMSTag[]>(MOCK_TAGS);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const selectedFolder = folders.find((f) => f.id === selectedFolderId) ?? null;

  const getChildren = useCallback(
    (parentId: string | null) => folders.filter((f) => f.parentId === parentId),
    [folders]
  );

  const getBreadcrumb = useCallback(
    (folderId: string | null): DMSFolder[] => {
      if (!folderId) return [];
      const folder = folders.find((f) => f.id === folderId);
      if (!folder) return [];
      return [...getBreadcrumb(folder.parentId), folder];
    },
    [folders]
  );

  const folderFiles = files.filter((f) => {
    if (selectedFolderId && f.folderId !== selectedFolderId) return false;
    if (!selectedFolderId) return false; // show nothing at root, user picks a folder
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = f.name.toLowerCase().includes(q);
      const matchTag = f.tags.some((tid) => {
        const tag = tags.find((t) => t.id === tid);
        return tag?.name.toLowerCase().includes(q);
      });
      if (!matchName && !matchTag) return false;
    }
    if (filterTag !== 'all' && !f.tags.includes(filterTag)) return false;
    if (filterType !== 'all' && f.fileType !== filterType) return false;
    return true;
  });

  const createFolder = useCallback(
    (name: string, parentId: string | null) => {
      const parent = parentId ? folders.find((f) => f.id === parentId) : null;
      const path = parent ? `${parent.path}/${name}` : name;
      const newFolder: DMSFolder = {
        id: `f-${Date.now()}`,
        name,
        parentId,
        path,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setFolders((prev) => [...prev, newFolder]);
      toast({ title: 'Folder created', description: `"${name}" created successfully.` });
      return newFolder;
    },
    [folders, toast]
  );

  const uploadFiles = useCallback(
    (fileList: { name: string; size: number; type: string }[], folderId: string, tagIds: string[]) => {
      const newFiles: DMSFile[] = fileList.map((f, i) => {
        let fileType: DMSFile['fileType'] = 'other';
        if (f.type.startsWith('image/')) fileType = 'image';
        else if (f.type === 'application/pdf') fileType = 'pdf';
        else if (f.type.includes('word') || f.type.includes('document')) fileType = 'document';
        else if (f.type.includes('sheet') || f.type.includes('excel')) fileType = 'spreadsheet';

        return {
          id: `file-${Date.now()}-${i}`,
          folderId,
          name: f.name,
          size: f.size,
          mimeType: f.type,
          fileType,
          uploadDate: new Date().toISOString().split('T')[0],
          lastModified: new Date().toISOString().split('T')[0],
          tags: tagIds,
          version: 1,
        };
      });
      setFiles((prev) => [...prev, ...newFiles]);
      toast({ title: 'Files uploaded', description: `${newFiles.length} file(s) uploaded successfully.` });
    },
    [toast]
  );

  const deleteFile = useCallback(
    (fileId: string) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, isDeleted: true, folderId: 'f-trash' } : f
        )
      );
      toast({ title: 'File moved to Trash' });
    },
    [toast]
  );

  const restoreFile = useCallback(
    (fileId: string) => {
      // restore to first non-trash folder (simplified)
      const original = MOCK_FILES.find((f) => f.id === fileId);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, isDeleted: false, folderId: original?.folderId ?? 'f-global' } : f
        )
      );
      toast({ title: 'File restored' });
    },
    [toast]
  );

  const permanentDeleteFile = useCallback(
    (fileId: string) => {
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      toast({ title: 'File permanently deleted' });
    },
    [toast]
  );

  const renameFile = useCallback(
    (fileId: string, newName: string) => {
      setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, name: newName } : f)));
      toast({ title: 'File renamed' });
    },
    [toast]
  );

  const renameFolder = useCallback(
    (folderId: string, newName: string) => {
      setFolders((prev) => prev.map((f) => (f.id === folderId ? { ...f, name: newName } : f)));
      toast({ title: 'Folder renamed' });
    },
    [toast]
  );

  const deleteFolder = useCallback(
    (folderId: string) => {
      // Recursively collect all descendant folder ids
      const getDescendantIds = (id: string): string[] => {
        const children = folders.filter((f) => f.parentId === id);
        return [id, ...children.flatMap((c) => getDescendantIds(c.id))];
      };
      const idsToRemove = new Set(getDescendantIds(folderId));
      // Move files to trash
      setFiles((prev) =>
        prev.map((f) =>
          idsToRemove.has(f.folderId) ? { ...f, isDeleted: true, folderId: 'f-trash' } : f
        )
      );
      setFolders((prev) => prev.filter((f) => !idsToRemove.has(f.id)));
      if (selectedFolderId && idsToRemove.has(selectedFolderId)) {
        setSelectedFolderId(null);
      }
      toast({ title: 'Folder deleted', description: 'Folder and its contents moved to Trash.' });
    },
    [folders, selectedFolderId, toast]
  );

  const updateFileTags = useCallback(
    (fileId: string, tagIds: string[]) => {
      setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, tags: tagIds } : f)));
    },
    []
  );

  const addTag = useCallback(
    (name: string) => {
      const colors = [
        'bg-primary/20 text-primary-foreground',
        'bg-secondary/20 text-secondary-foreground',
        'bg-warning/20 text-warning-foreground',
        'bg-accent text-accent-foreground',
      ];
      const tag: DMSTag = {
        id: `tag-${Date.now()}`,
        name,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
      setTags((prev) => [...prev, tag]);
      toast({ title: 'Tag created', description: `"${name}" tag added.` });
      return tag;
    },
    [toast]
  );

  const deleteTag = useCallback(
    (tagId: string) => {
      setTags((prev) => prev.filter((t) => t.id !== tagId));
      setFiles((prev) => prev.map((f) => ({ ...f, tags: f.tags.filter((t) => t !== tagId) })));
      toast({ title: 'Tag deleted' });
    },
    [toast]
  );

  return {
    folders, files: folderFiles, allFiles: files, tags,
    selectedFolderId, selectedFolder,
    setSelectedFolderId, searchQuery, setSearchQuery,
    filterTag, setFilterTag, filterType, setFilterType,
    viewMode, setViewMode,
    getChildren, getBreadcrumb,
    createFolder, uploadFiles, deleteFile, restoreFile, permanentDeleteFile,
    renameFile, renameFolder, deleteFolder, updateFileTags, addTag, deleteTag,
  };
}
