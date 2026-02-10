import { useState, useCallback } from 'react';
import type { Property, PropertyFormData, PropertyStatus } from '@/types/property';
import { MOCK_PROPERTIES } from '@/data/propertiesMockData';

const generateId = () => Math.random().toString(36).substring(2, 11);

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);

  const activeProperties = properties.filter((p) => p.status !== 'deleted');
  const archivedProperties = properties.filter((p) => p.status === 'deleted');

  const addProperty = useCallback((data: PropertyFormData) => {
    const now = new Date().toISOString();
    const newProperty: Property = {
      id: generateId(),
      name: data.name,
      type: data.type,
      address: data.address,
      sqFt: Number(data.sqFt) || 0,
      yearBuilt: Number(data.yearBuilt) || 0,
      purchasePrice: Number(data.purchasePrice) || 0,
      purchaseDate: data.purchaseDate,
      description: data.description,
      photos: data.photos,
      status: 'active',
      ownerId: data.ownerId,
      mapCoords: { lat: 0, lng: 0 },
      bedrooms: data.bedrooms ? Number(data.bedrooms) : undefined,
      bathrooms: data.bathrooms ? Number(data.bathrooms) : undefined,
      amenities: data.amenities,
      hoaFees: data.hoaFees ? Number(data.hoaFees) : undefined,
      taxes: data.taxes ? Number(data.taxes) : undefined,
      insurance: data.insurance ? Number(data.insurance) : undefined,
      units: data.units.map((u) => ({ ...u, id: generateId() })),
      leases: [],
      documents: [],
      agreementIds: data.agreementIds,
      marketRentAvg: data.marketRentAvg ? Number(data.marketRentAvg) : undefined,
      createdAt: now,
      updatedAt: now,
    };
    setProperties((prev) => [...prev, newProperty]);
    return newProperty;
  }, []);

  const updateProperty = useCallback((id: string, data: Partial<PropertyFormData>) => {
    setProperties((prev) =>
      prev.map((p): Property => {
        if (p.id !== id) return p;
        const updated: Property = {
          ...p,
          name: data.name ?? p.name,
          type: data.type ?? p.type,
          address: data.address ?? p.address,
          sqFt: data.sqFt !== undefined ? Number(data.sqFt) || 0 : p.sqFt,
          yearBuilt: data.yearBuilt !== undefined ? Number(data.yearBuilt) || 0 : p.yearBuilt,
          purchasePrice: data.purchasePrice !== undefined ? Number(data.purchasePrice) || 0 : p.purchasePrice,
          purchaseDate: data.purchaseDate ?? p.purchaseDate,
          description: data.description ?? p.description,
          photos: data.photos ?? p.photos,
          ownerId: data.ownerId ?? p.ownerId,
          bedrooms: data.bedrooms !== undefined ? (Number(data.bedrooms) || undefined) : p.bedrooms,
          bathrooms: data.bathrooms !== undefined ? (Number(data.bathrooms) || undefined) : p.bathrooms,
          amenities: data.amenities ?? p.amenities,
          hoaFees: data.hoaFees !== undefined ? (Number(data.hoaFees) || undefined) : p.hoaFees,
          taxes: data.taxes !== undefined ? (Number(data.taxes) || undefined) : p.taxes,
          insurance: data.insurance !== undefined ? (Number(data.insurance) || undefined) : p.insurance,
          units: data.units ? data.units.map((u) => ({ ...u, id: (u as any).id || generateId() })) : p.units,
          agreementIds: data.agreementIds ?? p.agreementIds,
          marketRentAvg: data.marketRentAvg !== undefined ? (Number(data.marketRentAvg) || undefined) : p.marketRentAvg,
          updatedAt: new Date().toISOString(),
        };
        return updated;
      })
    );
  }, []);

  const changeStatus = useCallback((id: string, status: PropertyStatus) => {
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        // Prevent deleting with active leases
        if (status === 'deleted' && p.leases.some((l) => l.status === 'active')) {
          return p;
        }
        return { ...p, status, updatedAt: new Date().toISOString() };
      })
    );
  }, []);

  const softDeleteProperty = useCallback((id: string) => changeStatus(id, 'deleted'), [changeStatus]);
  const restoreProperty = useCallback((id: string) => changeStatus(id, 'active'), [changeStatus]);

  const getPropertyById = useCallback((id: string) => properties.find((p) => p.id === id), [properties]);

  const getPropertiesByOwner = useCallback((ownerId: string) => activeProperties.filter((p) => p.ownerId === ownerId), [activeProperties]);

  return {
    properties,
    activeProperties,
    archivedProperties,
    addProperty,
    updateProperty,
    changeStatus,
    softDeleteProperty,
    restoreProperty,
    getPropertyById,
    getPropertiesByOwner,
  };
}
