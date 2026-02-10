import { useState } from 'react';
import { useFileManager } from '@/hooks/useFileManager';
import FolderTree from '@/components/files/FolderTree';
import FileList from '@/components/files/FileList';
import UploadDialog from '@/components/files/UploadDialog';
import NewFolderDialog from '@/components/files/NewFolderDialog';
import FilePreviewDialog from '@/components/files/FilePreviewDialog';
import TagManagerDialog from '@/components/files/TagManagerDialog';
import EditTagsDialog from '@/components/files/EditTagsDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Search, Upload, FolderPlus, Tag, LayoutList, LayoutGrid,
  ChevronRight, FolderTree as FolderTreeIcon, Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DMSFile } from '@/types/files';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Files() {
  const fm = useFileManager();
  const isMobile = useIsMobile();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [tagManagerOpen, setTagManagerOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<DMSFile | null>(null);
  const [editTagsFile, setEditTagsFile] = useState<DMSFile | null>(null);

  const breadcrumb = fm.selectedFolderId ? fm.getBreadcrumb(fm.selectedFolderId) : [];
  const isTrash = fm.selectedFolder?.isTrash === true;

  const treeContent = (
    <div className="h-full">
      <div className="px-3 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Folders</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { fm.setSelectedFolderId(null); setNewFolderOpen(true); }} title="New root folder">
          <FolderPlus className="h-4 w-4" />
        </Button>
      </div>
      <div className="overflow-y-auto px-1" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <FolderTree
          folders={fm.folders}
          selectedFolderId={fm.selectedFolderId}
          onSelect={fm.setSelectedFolderId}
          getChildren={fm.getChildren}
          onDeleteFolder={fm.deleteFolder}
          onRenameFolder={fm.renameFolder}
          onCreateSubfolder={(parentId) => {
            if (parentId) fm.setSelectedFolderId(parentId);
            setNewFolderOpen(true);
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-foreground">Files</h1>
        <div className="h-1 w-16 bg-secondary rounded-full mt-2" />
      </div>

      <div className="flex gap-4 min-h-[calc(100vh-220px)]">
        {/* Sidebar tree – desktop */}
        {!isMobile && (
          <aside className="w-60 shrink-0 card-elevated rounded-lg overflow-hidden">
            {treeContent}
          </aside>
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Toolbar */}
          <div className="card-elevated rounded-lg p-3 space-y-3">
            {/* Row 1: breadcrumb + mobile tree toggle */}
            <div className="flex items-center gap-2 text-sm">
              {isMobile && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 h-8 w-8">
                      <FolderTreeIcon className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 p-0">
                    {treeContent}
                  </SheetContent>
                </Sheet>
              )}
              <button
                onClick={() => fm.setSelectedFolderId(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Home className="h-4 w-4" />
              </button>
              {breadcrumb.map((folder, i) => (
                <span key={folder.id} className="flex items-center gap-1">
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  <button
                    onClick={() => fm.setSelectedFolderId(folder.id)}
                    className={cn(
                      'hover:text-foreground transition-colors truncate max-w-[120px]',
                      i === breadcrumb.length - 1 ? 'text-foreground font-medium' : 'text-muted-foreground'
                    )}
                  >
                    {folder.name}
                  </button>
                </span>
              ))}
            </div>

            {/* Row 2: search + actions */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files…"
                  value={fm.searchQuery}
                  onChange={(e) => fm.setSearchQuery(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>

              <SearchableSelect
                options={[{ value: 'all', label: 'All Tags' }, ...fm.tags.map((t) => ({ value: t.id, label: t.name }))]}
                value={fm.filterTag}
                onValueChange={fm.setFilterTag}
                placeholder="Tag"
                triggerClassName="w-28 h-9"
              />

              <SearchableSelect
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'pdf', label: 'PDF' },
                  { value: 'image', label: 'Image' },
                  { value: 'document', label: 'Document' },
                  { value: 'spreadsheet', label: 'Spreadsheet' },
                ]}
                value={fm.filterType}
                onValueChange={fm.setFilterType}
                placeholder="Type"
                triggerClassName="w-28 h-9"
              />

              <div className="flex gap-1">
                <Button
                  variant={fm.viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => fm.setViewMode('list')}
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
                <Button
                  variant={fm.viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => fm.setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-1.5 ml-auto">
                <Button variant="outline" size="sm" onClick={() => setNewFolderOpen(true)}>
                  <FolderPlus className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Folder</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => setTagManagerOpen(true)}>
                  <Tag className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Tags</span>
                </Button>
                <Button size="sm" onClick={() => setUploadOpen(true)} disabled={!fm.selectedFolderId || isTrash}>
                  <Upload className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Upload</span>
                </Button>
              </div>
            </div>
          </div>

          {/* File list / grid or empty state */}
          <div className="card-elevated rounded-lg p-3">
            {!fm.selectedFolderId ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <FolderTreeIcon className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">Select a folder</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Choose a folder from the tree to view its files.</p>
              </div>
            ) : (
              <FileList
                files={fm.files}
                tags={fm.tags}
                viewMode={fm.viewMode}
                isTrash={isTrash}
                onPreview={setPreviewFile}
                onRename={fm.renameFile}
                onDelete={fm.deleteFile}
                onRestore={fm.restoreFile}
                onPermanentDelete={fm.permanentDeleteFile}
                onEditTags={setEditTagsFile}
              />
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        tags={fm.tags}
        onUpload={(files, tagIds) => fm.uploadFiles(files, fm.selectedFolderId!, tagIds)}
      />
      <NewFolderDialog
        open={newFolderOpen}
        onOpenChange={setNewFolderOpen}
        parentFolderName={fm.selectedFolder?.name ?? null}
        onCreate={(name) => fm.createFolder(name, fm.selectedFolderId)}
      />
      <FilePreviewDialog file={previewFile} tags={fm.tags} onClose={() => setPreviewFile(null)} />
      <TagManagerDialog
        open={tagManagerOpen}
        onOpenChange={setTagManagerOpen}
        tags={fm.tags}
        onAddTag={fm.addTag}
        onDeleteTag={fm.deleteTag}
      />
      <EditTagsDialog
        file={editTagsFile}
        tags={fm.tags}
        onClose={() => setEditTagsFile(null)}
        onSave={fm.updateFileTags}
      />
    </div>
  );
}
