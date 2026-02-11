import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { PropertyGroup } from '@/types/propertyGroup';

const generateId = () => Math.random().toString(36).substring(2, 11);

export interface GroupHistoryEntry {
  id: string;
  groupId: string;
  timestamp: string;
  action: 'created' | 'updated' | 'linked' | 'unlinked' | 'deleted';
  details: string;
}

const MOCK_GROUPS: PropertyGroup[] = [
  { id: 'g1', name: 'Portland Portfolio', description: 'All Portland, OR properties', color: 'hsl(210,60%,82%)', tags: ['Portfolio', 'Urban'], createdAt: '2025-01-10' },
  { id: 'g2', name: 'Student Housing Cluster', description: 'University-area housing', color: 'hsl(280,40%,82%)', tags: ['Student', 'Residential'], createdAt: '2025-03-01' },
  { id: 'g3', name: 'High-Yield Investments', description: 'Properties with >8% cap rate', color: 'hsl(120,30%,77%)', tags: ['High-Yield'], createdAt: '2025-06-15' },
];

const MOCK_LINKS: Record<string, string[]> = {
  p1: ['g1'],
  p2: ['g1', 'g3'],
  p3: ['g1', 'g2'],
  p7: ['g3'],
};

const MOCK_HISTORY: GroupHistoryEntry[] = [
  { id: 'h1', groupId: 'g1', timestamp: '2025-01-10T10:00:00Z', action: 'created', details: 'Group "Portland Portfolio" created' },
  { id: 'h2', groupId: 'g1', timestamp: '2025-01-11T09:00:00Z', action: 'linked', details: 'Property "Riverside Apartments" linked' },
  { id: 'h3', groupId: 'g2', timestamp: '2025-03-01T14:00:00Z', action: 'created', details: 'Group "Student Housing Cluster" created' },
  { id: 'h4', groupId: 'g3', timestamp: '2025-06-15T11:00:00Z', action: 'created', details: 'Group "High-Yield Investments" created' },
];

interface PropertyGroupsContextType {
  groups: PropertyGroup[];
  addGroup: (name: string, description: string, color: string, tags?: string[]) => PropertyGroup;
  updateGroup: (id: string, data: Partial<Omit<PropertyGroup, 'id' | 'createdAt'>>) => void;
  deleteGroup: (id: string) => boolean;
  forceDeleteGroup: (id: string) => void;
  getGroupById: (id: string) => PropertyGroup | undefined;
  // Links
  getGroupsForProperty: (propertyId: string) => PropertyGroup[];
  getPropertyIdsForGroup: (groupId: string) => string[];
  getPropertyIdsForGroups: (groupIds: string[]) => string[];
  setPropertyGroups: (propertyId: string, groupIds: string[]) => void;
  setGroupProperties: (groupId: string, propertyIds: string[]) => void;
  bulkAssignGroup: (propertyIds: string[], groupId: string) => void;
  getGroupPropertyCount: (groupId: string) => number;
  // History
  history: GroupHistoryEntry[];
  getHistoryForGroup: (groupId: string) => GroupHistoryEntry[];
  addHistoryEntry: (groupId: string, action: GroupHistoryEntry['action'], details: string) => void;
}

const PropertyGroupsContext = createContext<PropertyGroupsContextType | undefined>(undefined);

export function PropertyGroupsProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<PropertyGroup[]>(MOCK_GROUPS);
  const [links, setLinks] = useState<Record<string, string[]>>(MOCK_LINKS);
  const [history, setHistory] = useState<GroupHistoryEntry[]>(MOCK_HISTORY);

  const addHistoryEntry = useCallback((groupId: string, action: GroupHistoryEntry['action'], details: string) => {
    setHistory(prev => [...prev, {
      id: generateId(),
      groupId,
      timestamp: new Date().toISOString(),
      action,
      details,
    }]);
  }, []);

  const addGroup = useCallback((name: string, description: string, color: string, tags: string[] = []) => {
    const newGroup: PropertyGroup = {
      id: generateId(),
      name,
      description,
      color,
      tags,
      createdAt: new Date().toISOString(),
    };
    setGroups(prev => [...prev, newGroup]);
    addHistoryEntry(newGroup.id, 'created', `Group "${name}" created`);
    return newGroup;
  }, [addHistoryEntry]);

  const updateGroup = useCallback((id: string, data: Partial<Omit<PropertyGroup, 'id' | 'createdAt'>>) => {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
    const changes = Object.keys(data).join(', ');
    addHistoryEntry(id, 'updated', `Updated: ${changes}`);
  }, [addHistoryEntry]);

  const deleteGroup = useCallback((id: string): boolean => {
    const hasLinks = Object.values(links).some(gids => gids.includes(id));
    if (hasLinks) return false;
    setGroups(prev => prev.filter(g => g.id !== id));
    addHistoryEntry(id, 'deleted', 'Group deleted');
    return true;
  }, [links, addHistoryEntry]);

  const forceDeleteGroup = useCallback((id: string) => {
    // Unlink all properties first, then delete
    setLinks(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(pid => {
        next[pid] = next[pid].filter(gid => gid !== id);
      });
      return next;
    });
    setGroups(prev => prev.filter(g => g.id !== id));
    addHistoryEntry(id, 'deleted', 'Group force-deleted (all properties unlinked)');
  }, [addHistoryEntry]);

  const getGroupById = useCallback((id: string) => groups.find(g => g.id === id), [groups]);

  const getGroupsForProperty = useCallback((propertyId: string) => {
    const gids = links[propertyId] || [];
    return groups.filter(g => gids.includes(g.id));
  }, [groups, links]);

  const getPropertyIdsForGroup = useCallback((groupId: string) => {
    return Object.entries(links)
      .filter(([, gids]) => gids.includes(groupId))
      .map(([pid]) => pid);
  }, [links]);

  const getPropertyIdsForGroups = useCallback((groupIds: string[]) => {
    if (groupIds.length === 0) return [];
    const set = new Set<string>();
    Object.entries(links).forEach(([pid, gids]) => {
      if (gids.some(gid => groupIds.includes(gid))) set.add(pid);
    });
    return Array.from(set);
  }, [links]);

  const setPropertyGroups = useCallback((propertyId: string, groupIds: string[]) => {
    setLinks(prev => ({ ...prev, [propertyId]: groupIds }));
  }, []);

  const setGroupProperties = useCallback((groupId: string, propertyIds: string[]) => {
    setLinks(prev => {
      const next = { ...prev };
      // Remove groupId from all properties
      Object.keys(next).forEach(pid => {
        next[pid] = (next[pid] || []).filter(gid => gid !== groupId);
      });
      // Add groupId to selected properties
      propertyIds.forEach(pid => {
        next[pid] = [...(next[pid] || []), groupId];
      });
      return next;
    });
    addHistoryEntry(groupId, 'linked', `Properties set to: ${propertyIds.length} properties`);
  }, [addHistoryEntry]);

  const bulkAssignGroup = useCallback((propertyIds: string[], groupId: string) => {
    setLinks(prev => {
      const next = { ...prev };
      propertyIds.forEach(pid => {
        const existing = next[pid] || [];
        if (!existing.includes(groupId)) {
          next[pid] = [...existing, groupId];
        }
      });
      return next;
    });
    addHistoryEntry(groupId, 'linked', `${propertyIds.length} properties bulk-assigned`);
  }, [addHistoryEntry]);

  const getGroupPropertyCount = useCallback((groupId: string) => {
    return Object.values(links).filter(gids => gids.includes(groupId)).length;
  }, [links]);

  const getHistoryForGroup = useCallback((groupId: string) => {
    return history.filter(h => h.groupId === groupId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [history]);

  return (
    <PropertyGroupsContext.Provider value={{
      groups, addGroup, updateGroup, deleteGroup, forceDeleteGroup, getGroupById,
      getGroupsForProperty, getPropertyIdsForGroup, getPropertyIdsForGroups,
      setPropertyGroups, setGroupProperties, bulkAssignGroup, getGroupPropertyCount,
      history, getHistoryForGroup, addHistoryEntry,
    }}>
      {children}
    </PropertyGroupsContext.Provider>
  );
}

export function usePropertyGroupsContext() {
  const ctx = useContext(PropertyGroupsContext);
  if (!ctx) throw new Error('usePropertyGroupsContext must be used within PropertyGroupsProvider');
  return ctx;
}
