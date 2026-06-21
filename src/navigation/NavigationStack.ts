import type { AppScreen } from '../types';

export type NavigationEntry = Readonly<{
  screen: AppScreen;
  instanceKey: string;
}>;

let instanceSequence = 0;

function createEntry(screen: AppScreen): NavigationEntry {
  instanceSequence += 1;
  return Object.freeze({ screen, instanceKey: `${screen}-${instanceSequence}` });
}

/**
 * Navigation stack bất biến cho prototype không dùng React Navigation.
 * Các entry giữ nguyên instanceKey khi back để màn trước không bị remount và giữ vị trí cuộn.
 */
export class NavigationStack {
  private constructor(private readonly entries: readonly NavigationEntry[]) {}

  static start(screen: AppScreen): NavigationStack {
    return new NavigationStack([createEntry(screen)]);
  }

  static path(screens: readonly AppScreen[]): NavigationStack {
    const safeScreens: readonly AppScreen[] = screens.length ? screens : ['home'];
    return new NavigationStack(safeScreens.map(createEntry));
  }

  get current(): NavigationEntry {
    return this.entries[this.entries.length - 1] ?? createEntry('home');
  }

  get items(): readonly NavigationEntry[] {
    return this.entries;
  }

  push(screen: AppScreen): NavigationStack {
    return new NavigationStack([...this.entries, createEntry(screen)]);
  }

  replace(screen: AppScreen): NavigationStack {
    return new NavigationStack([...this.entries.slice(0, -1), createEntry(screen)]);
  }

  reset(screen: AppScreen): NavigationStack {
    return NavigationStack.start(screen);
  }

  backPreservingState(): NavigationStack {
    if (this.entries.length <= 1) return this;
    return new NavigationStack(this.entries.slice(0, -1));
  }
}
