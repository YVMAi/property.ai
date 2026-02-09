import { useState } from 'react';
import { ChevronRight, Folder, FolderOpen, Trash2, Building, Users, Globe, MoreHorizontal, Pencil, FolderPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { DMSFolder } from '@/types/files';

interface FolderTreeProps {
  folders: DMSFolder[];
  selectedFolderId: string | null;
  onSelect: (id: string) => void;
  getChildren: (parentId: string | null) => DMSFolder[];
  onDeleteFolder: (folderId: string) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onCreateSubfolder: (parentId: string | null) => void;
}

const ROOT_ICONS: Record<string, React.ElementType> = {
  'f-properties': Building,
  'f-people': Users,
  'f-global': Globe,
  'f-trash': Trash2,
};

// Protected root folder ids that cannot be deleted
const PROTECTED_IDS = new Set(['f-properties', 'f-people', 'f-global', 'f-trash']);

function FolderNode({
  folder,
  getChildren,
  selectedFolderId,
  onSelect,
  onDeleteFolder,
  onRenameFolder,
  onCreateSubfolder,
  depth,
}: {
  folder: DMSFolder;
  getChildren: (id: string | null) => DMSFolder[];
  selectedFolderId: string | null;
  onSelect: (id: string) => void;
  onDeleteFolder: (id: string) => void;
  onRenameFolder: (id: string, name: string) => void;
  onCreateSubfolder: (parentId: string | null) => void;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const children = getChildren(folder.id);
  const hasChildren = children.length > 0;
  const isSelected = selectedFolderId === folder.id;
  const Icon = ROOT_ICONS[folder.id] ?? (expanded ? FolderOpen : Folder);
  const isProtected = PROTECTED_IDS.has(folder.id);

  return (
    <div>
      <div className="group flex items-center">
        <button
          onClick={() => {
            onSelect(folder.id);
            if (hasChildren) setExpanded((e) => !e);
          }}
          className={cn(
            'flex items-center gap-1.5 flex-1 text-left px-2 py-1.5 rounded-md text-sm transition-colors',
            isSelected
              ? 'bg-primary/15 text-foreground font-medium'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {hasChildren ? (
            <ChevronRight
              className={cn('h-3.5 w-3.5 shrink-0 transition-transform', expanded && 'rotate-90')}
            />
          ) : (
            <span className="w-3.5" />
          )}
          <Icon className={cn('h-4 w-4 shrink-0', folder.isTrash ? 'text-destructive-foreground' : 'text-primary')} />
          <span className="truncate">{folder.name}</span>
        </button>

        {!folder.isTrash && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mr-1"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onCreateSubfolder(folder.id)}>
                <FolderPlus className="h-4 w-4 mr-2" /> New Subfolder
              </DropdownMenuItem>
              {!isProtected && (
                <>
                  <DropdownMenuItem onClick={() => {
                    const newName = prompt('Rename folder:', folder.name);
                    if (newName?.trim()) onRenameFolder(folder.id, newName.trim());
                  }}>
                    <Pencil className="h-4 w-4 mr-2" /> Rename
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive-foreground"
                    onClick={() => {
                      if (confirm(`Delete "${folder.name}" and all its contents?`)) {
                        onDeleteFolder(folder.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {expanded && hasChildren && (
        <div>
          {children.map((child) => (
            <FolderNode
              key={child.id}
              folder={child}
              getChildren={getChildren}
              selectedFolderId={selectedFolderId}
              onSelect={onSelect}
              onDeleteFolder={onDeleteFolder}
              onRenameFolder={onRenameFolder}
              onCreateSubfolder={onCreateSubfolder}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FolderTree({
  folders, selectedFolderId, onSelect, getChildren,
  onDeleteFolder, onRenameFolder, onCreateSubfolder,
}: FolderTreeProps) {
  const rootFolders = getChildren(null);

  return (
    <nav className="space-y-0.5 py-2" aria-label="Folder tree">
      {rootFolders.map((folder) => (
        <FolderNode
          key={folder.id}
          folder={folder}
          getChildren={getChildren}
          selectedFolderId={selectedFolderId}
          onSelect={onSelect}
          onDeleteFolder={onDeleteFolder}
          onRenameFolder={onRenameFolder}
          onCreateSubfolder={onCreateSubfolder}
          depth={0}
        />
      ))}
    </nav>
  );
}
