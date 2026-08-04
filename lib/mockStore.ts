'use client';

import React, { useState, useEffect } from 'react';

type Listener = () => void;

class RealDataStore {
  private listeners: Set<Listener> = new Set();
  private initialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      setTimeout(() => this.initialize(), 50);
    }
  }

  public subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public notify() {
    this.listeners.forEach((l) => l());
  }

  public async initialize() {
    if (this.initialized) return;
    this.initialized = true;
    await this.fetchAll();
  }

  public async fetchAll() {
    this.notify();
  }
}

export const mockStore = new RealDataStore();
export const dataStore = mockStore;

export function useStoreSync() {
  const [, setTick] = useState(0);
  useEffect(() => {
    return mockStore.subscribe(() => setTick((t) => t + 1));
  }, []);
}
