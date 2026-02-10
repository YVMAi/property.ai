import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { PropertyGroup } from '@/types/propertyGroup';

const generateId = () => Math.random().toString(36).substring(2, 11);

const MOCK_GROUPS: PropertyGroup[] = [
  { id: 'g1', name: 'Portland Portfolio', description: 'All Portland, OR properties', color: 'hsl(210,60%,82%)', tags: ['Portfolio', 'Urban'], createdAt: '2025-01-10' },
  { id: 'g2', name: 'Student Housing Cluster', description: 'University-area housing', color: 'hsl(280,40%,82%)', tags: ['Student', 'Residential'], createdAt: '2025-03-01' },
  { id: 'g3', name: 'High-Yield Investments', description: 'Properties with >8% cap rate', color: 'hsl(120,30%,77%)', tags: ['High-Yield'], createdAt: '2025-06-15' },
];

// Many-to-many links: propertyId -> groupId[]
const MOCK_LINKS: Record<string, string[]> = {
  p1: ['g1'],
  p2: ['g1', 'g3'],
  p3: ['g1', 'g2'],
  p7: ['g3'],
};

interface PropertyGroupsContextType {
  groups: PropertyGroup[];
  addGroup: (name: string, description: string, color: string, tags?: string[]) => PropertyGroup;
  updateGroup: (id: string, data: Partial<Omit<PropertyGroup, 'id' | 'createdAt'>>) => void;
  deleteGroup: (id: string) => boolean;
  getGroupById: (id: string) => PropertyGroup | undefined;
  // Links
  getGroupsForProperty: (propertyId: string) => PropertyGroup[];
  getPropertyIdsForGroup: (groupId: string) => string[];
  getPropertyIdsForGroups: (groupIds: string[]) => string[];
  setPropertyGroups: (propertyId: string, groupIds: string[]) => void;
  getGroupPropertyCount: (groupId: string) => number;
}

const PropertyGroupsContext = createContext<PropertyGroupsContextType | undefined>(undefined);

export function PropertyGroupsProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<PropertyGroup[]>(MOCK_GROUPS);
  const [links, setLinks] = useState<Record<string, string[]>>(MOCK_LINKS);

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
    return newGroup;
  }, []);

  const updateGroup = useCallback((id: string, data: Partial<Omit<PropertyGroup, 'id' | 'createdAt'>>) => {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
  }, []);

  const deleteGroup = useCallback((id: string): boolean => {
    // Check if any properties are linked
    const hasLinks = Object.values(links).some(gids => gids.includes(id));
    if (hasLinks) return false;
    setGroups(prev => prev.filter(g => g.id !== id));
    return true;
  }, [links]);

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

  const getGroupPropertyCount = useCallback((groupId: string) => {
    return Object.values(links).filter(gids => gids.includes(groupId)).length;
  }, [links]);

  return (
    <PropertyGroupsContext.Provider value={{
      groups, addGroup, updateGroup, deleteGroup, getGroupById,
      getGroupsForProperty, getPropertyIdsForGroup, getPropertyIdsForGroups,
      setPropertyGroups, getGroupPropertyCount,
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
