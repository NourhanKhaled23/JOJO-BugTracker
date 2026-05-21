import { Component, inject, signal, HostListener, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, LucideIconData, Search, Command, ArrowRight, Bug, Folder, Users, Settings } from 'lucide-angular';
import { BugsStore } from '../../../features/bugs/store/bugs.store';
import { ProjectsStore } from '../../../features/projects/store/projects.store';
import { CommandPaletteService } from '../../../core/services/command-palette.service';

@Component({
  selector: 'app-command-palette',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-bg-base/60 backdrop-blur-md animate-in fade-in duration-300" (click)="close()" tabindex="0" (keydown.enter)="close()" (keydown.space)="close()"></div>
        
        <!-- Modal -->
        <div class="relative w-full max-w-2xl glass-card p-0 overflow-hidden shadow-2xl border border-accent/20 animate-scale-in">
          <!-- Search Input -->
          <div class="flex items-center gap-4 px-6 py-4 border-b border-border/50 bg-bg-surface/50">
            <lucide-icon [name]="Search" [size]="20" class="text-text-muted"></lucide-icon>
            <input 
              #searchInput
              type="text" 
              class="flex-1 bg-transparent border-none outline-none text-lg text-text-primary placeholder:text-text-muted font-medium"
              placeholder="Search issues, projects, members..."
              [value]="query()"
              (input)="updateQuery($any($event.target).value)"
              (keydown.esc)="close()"
            >
            <div class="flex items-center gap-1.5 px-2 py-1 rounded-md bg-bg-elevated border border-border text-[10px] font-black text-text-muted uppercase">
              ESC
            </div>
          </div>

          <!-- Results -->
          <div class="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
            @if (filteredItems().length > 0) {
              <div class="space-y-1">
                @for (item of filteredItems(); track item.id) {
                  <button 
                    (click)="navigate(item)"
                    class="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-accent/10 transition-all group text-left"
                  >
                    <div class="w-10 h-10 rounded-lg bg-bg-elevated flex items-center justify-center text-text-muted group-hover:text-accent transition-colors">
                      <lucide-icon [name]="item.icon" [size]="18"></lucide-icon>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-bold text-text-primary truncate group-hover:text-accent transition-colors">{{ item.title }}</div>
                      <div class="text-[10px] font-medium text-text-muted uppercase tracking-wider">{{ item.type }}</div>
                    </div>
                    <lucide-icon [name]="ArrowRight" [size]="14" class="text-text-muted opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all"></lucide-icon>
                  </button>
                }
              </div>
            } @else {
              <div class="py-12 text-center">
                <lucide-icon [name]="Command" [size]="40" class="text-border mx-auto mb-4"></lucide-icon>
                <p class="text-sm text-text-muted font-medium tracking-tight">No results found for "<span class="text-text-primary">{{ query() }}</span>"</p>
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="px-6 py-3 border-t border-border/50 bg-bg-elevated/30 flex items-center justify-between">
            <div class="flex items-center gap-4 text-[10px] font-black text-text-muted uppercase tracking-widest">
              <span class="flex items-center gap-1"><span class="px-1.5 py-0.5 rounded bg-bg-surface border border-border">↑↓</span> Navigate</span>
              <span class="flex items-center gap-1"><span class="px-1.5 py-0.5 rounded bg-bg-surface border border-border">↵</span> Select</span>
            </div>
            <div class="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2">
              <lucide-icon [name]="Command" [size]="12"></lucide-icon> JOJO COMMAND
            </div>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; }
    .glass-card {
      background: rgba(var(--bg-surface-rgb), 0.85);
      backdrop-filter: blur(24px);
    }
  `]
})
export class CommandPalette {
  private readonly router = inject(Router);
  private readonly bugStore = inject(BugsStore);
  private readonly projectStore = inject(ProjectsStore);
  private readonly paletteService = inject(CommandPaletteService);

  readonly Search = Search;
  readonly Command = Command;
  readonly ArrowRight = ArrowRight;

  readonly isOpen = this.paletteService.isOpen;
  query = signal('');

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.paletteService.toggle();
      if (this.isOpen()) this.query.set('');
    }
    if (event.key === 'Escape' && this.isOpen()) {
      this.paletteService.close();
    }
  }

  toggle(): void {
    this.paletteService.toggle();
    if (this.isOpen()) this.query.set('');
  }

  close(): void {
    this.paletteService.close();
  }

  updateQuery(val: string): void {
    this.query.set(val);
  }

  filteredItems = computed(() => {
    const q = this.query().toLowerCase();
    const items: { id: string; title: string; type: string; icon: LucideIconData; route: string }[] = [
      { id: 'nav-dash', title: 'Dashboard', type: 'Navigation', icon: Command, route: '/dashboard' },
      { id: 'nav-projects', title: 'Projects', type: 'Navigation', icon: Folder, route: '/projects' },
      { id: 'nav-bugs', title: 'Issues Tracking', type: 'Navigation', icon: Bug, route: '/bugs' },
      { id: 'nav-members', title: 'Team Members', type: 'Navigation', icon: Users, route: '/members' },
      { id: 'nav-settings', title: 'System Settings', type: 'Navigation', icon: Settings, route: '/settings' },
    ];

    // Add projects
    this.projectStore.projects().forEach((p: { id: string; name: string }) => {
      items.push({ id: p.id, title: p.name, type: 'Project', icon: Folder, route: `/projects/${p.id}` });
    });

    // Add bugs
    this.bugStore.bugs().forEach((b: { id: string; title: string }) => {
      items.push({ id: b.id, title: b.title, type: 'Issue', icon: Bug, route: `/bugs/${b.id}` });
    });

    if (!q) return items.slice(0, 8);
    return items.filter(i => 
      i.title.toLowerCase().includes(q) || 
      i.type.toLowerCase().includes(q)
    ).slice(0, 10);
  });

  navigate(item: { route: string }): void {
    this.close();
    this.router.navigateByUrl(item.route);
  }
}
