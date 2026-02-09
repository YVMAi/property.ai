import { FileText, Image, FileSpreadsheet, File, MoreVertical, Download, Pencil, Trash2, Tag, Eye, RotateCcw, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { DMSFile, DMSTag, FileType } from '@/types/files';

const FILE_ICONS: Record<FileType, React.ElementType> = {
  pdf: FileText,
  image: Image,
  document: FileText,
  spreadsheet: FileSpreadsheet,
  other: File,
};

const FILE_ICON_COLORS: Record<FileType, string> = {
  pdf: 'text-destructive-foreground',
  image: 'text-secondary-foreground',
  document: 'text-primary-foreground',
  spreadsheet: 'text-success-foreground',
  other: 'text-muted-foreground',
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

interface FileListProps {
  files: DMSFile[];
  tags: DMSTag[];
  viewMode: 'list' | 'grid';
  isTrash?: boolean;
  onPreview: (file: DMSFile) => void;
  onRename: (fileId: string, name: string) => void;
  onDelete: (fileId: string) => void;
  onRestore?: (fileId: string) => void;
  onPermanentDelete?: (fileId: string) => void;
  onEditTags: (file: DMSFile) => void;
}

export default function FileList({
  files, tags, viewMode, isTrash,
  onPreview, onRename, onDelete, onRestore, onPermanentDelete, onEditTags,
}: FileListProps) {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <File className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground font-medium">No files here yet</p>
        <p className="text-sm text-muted-foreground/70 mt-1">Upload files or create a folder to get started.</p>
      </div>
    );
  }

  const getTagsForFile = (file: DMSFile) => file.tags.map((tid) => tags.find((t) => t.id === tid)).filter(Boolean) as DMSTag[];

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {files.map((file) => {
          const Icon = FILE_ICONS[file.fileType];
          const fileTags = getTagsForFile(file);
          return (
            <div
              key={file.id}
              className="card-elevated p-3 flex flex-col gap-2 cursor-pointer hover:shadow-elevated transition-shadow group"
              onClick={() => onPreview(file)}
            >
              <div className="flex items-center justify-center h-20 bg-muted/50 rounded-md">
                <Icon className={cn('h-10 w-10', FILE_ICON_COLORS[file.fileType])} />
              </div>
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
              {fileTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {fileTags.slice(0, 2).map((t) => (
                    <Badge key={t.id} variant="secondary" className={cn('text-[10px] px-1.5 py-0', t.color)}>
                      {t.name}
                    </Badge>
                  ))}
                  {fileTags.length > 2 && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">+{fileTags.length - 2}</Badge>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead className="hidden sm:table-cell">Type</TableHead>
          <TableHead className="hidden md:table-cell">Size</TableHead>
          <TableHead className="hidden lg:table-cell">Tags</TableHead>
          <TableHead className="hidden sm:table-cell">Modified</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {files.map((file) => {
          const Icon = FILE_ICONS[file.fileType];
          const fileTags = getTagsForFile(file);
          return (
            <TableRow key={file.id} className="cursor-pointer" onClick={() => onPreview(file)}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Icon className={cn('h-4 w-4 shrink-0', FILE_ICON_COLORS[file.fileType])} />
                  <span className="truncate max-w-[200px] sm:max-w-[300px]">{file.name}</span>
                  {file.version > 1 && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0">v{file.version}</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell text-xs text-muted-foreground uppercase">{file.fileType}</TableCell>
              <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{formatSize(file.size)}</TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex flex-wrap gap-1">
                  {fileTags.map((t) => (
                    <Badge key={t.id} variant="secondary" className={cn('text-[10px] px-1.5 py-0', t.color)}>
                      {t.name}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{file.lastModified}</TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onPreview(file)}>
                      <Eye className="h-4 w-4 mr-2" /> Preview
                    </DropdownMenuItem>
                    {!isTrash && (
                      <>
                        <DropdownMenuItem onClick={() => {
                          const newName = prompt('Rename file:', file.name);
                          if (newName && newName.trim()) onRename(file.id, newName.trim());
                        }}>
                          <Pencil className="h-4 w-4 mr-2" /> Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditTags(file)}>
                          <Tag className="h-4 w-4 mr-2" /> Edit Tags
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" /> Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive-foreground" onClick={() => onDelete(file.id)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </>
                    )}
                    {isTrash && (
                      <>
                        <DropdownMenuItem onClick={() => onRestore?.(file.id)}>
                          <RotateCcw className="h-4 w-4 mr-2" /> Restore
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive-foreground" onClick={() => onPermanentDelete?.(file.id)}>
                          <X className="h-4 w-4 mr-2" /> Delete Permanently
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
