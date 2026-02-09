import { useState } from 'react';
import { ChevronRight, Folder, FolderOpen, Trash2, Building, Users, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DMSFolder } from '@/types/files';

interface FolderTreeProps {
  folders: DMSFolder[];
  selectedFolderId: string | null;
  onSelect: (id: string) => void;
  getChildren: (parentId: string | null) => DMSFolder[];
}

const ROOT_ICONS: Record<string, React.ElementType> = {
  'f-properties': Building,
  'f-people': Users,
  'f-global': Globe,
  'f-trash': Trash2,
};

function FolderNode({
  folder,
  getChildren,
  selectedFolderId,
  onSelect,
  depth,
}: {
  folder: DMSFolder;
  getChildren: (id: string | null) => DMSFolder[];
  selectedFolderId: string | null;
  onSelect: (id: string) => void;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const children = getChildren(folder.id);
  const hasChildren = children.length > 0;
  const isSelected = selectedFolderId === folder.id;
  const Icon = ROOT_ICONS[folder.id] ?? (expanded ? FolderOpen : Folder);

  return (
    <div>
      <button
        onClick={() => {
          onSelect(folder.id);
          if (hasChildren) setExpanded((e) => !e);
        }}
        className={cn(
          'flex items-center gap-1.5 w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors',
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
      {expanded && hasChildren && (
        <div>
          {children.map((child) => (
            <FolderNode
              key={child.id}
              folder={child}
              getChildren={getChildren}
              selectedFolderId={selectedFolderId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FolderTree({ folders, selectedFolderId, onSelect, getChildren }: FolderTreeProps) {
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
          depth={0}
        />
      ))}
    </nav>
  );
}
