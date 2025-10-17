import Dexie, { Table } from 'dexie';
import type { Incident, ChildProfile, CatalogItem } from '@/types/incident';

export class AppDB extends Dexie {
  incidents!: Table<Incident, string>;
  children!: Table<ChildProfile, string>;
  behaviors!: Table<CatalogItem, string>;
  antecedents!: Table<CatalogItem, string>;
  consequences!: Table<CatalogItem, string>;
  interventions!: Table<CatalogItem, string>;
  locations!: Table<CatalogItem, string>;

  constructor() {
    super('behavior-tracker');
    this.version(1).stores({
      incidents: 'id, childId, timestamp, behaviorId, intensity',
      children: 'id, name',
      behaviors: 'id, label',
      antecedents: 'id, label',
      consequences: 'id, label',
      interventions: 'id, label',
      locations: 'id, label',
    });
  }
}

export const db = new AppDB();

