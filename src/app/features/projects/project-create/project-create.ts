import { Component, EventEmitter, Input, Output, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, LucideIconData, Rocket, Smartphone, Server, Users, Palette, Check, Layout, Code } from 'lucide-angular';
import { ToastService } from '../../../core/services/toast.service';
import { Modal } from '../../../shared/components/modal/modal';
import { ProjectsStore } from '../store/projects.store';
import { ProjectType } from '../../../core/models/project.model';
import { ActivityService } from '../../../core/services/activity.service';
import { AuthStore } from '../../auth/store/auth.store';

@Component({
  selector: 'app-project-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, Modal],
  templateUrl: './project-create.html',
  styleUrl: './project-create.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectCreate {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(ProjectsStore);
  private readonly toast = inject(ToastService);
  private readonly activity = inject(ActivityService);
  private readonly authStore = inject(AuthStore);


  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();

  projectForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.maxLength(200)]],
    type: ['web' as ProjectType, [Validators.required]],
    color: ['#7C3AED', [Validators.required]],
    icon: ['layout', [Validators.required]]
  });

  readonly projectTypes: { value: ProjectType, label: string, icon: LucideIconData }[] = [
    { value: 'web', label: 'Web Application', icon: Layout },
    { value: 'mobile', label: 'Mobile App', icon: Smartphone },
    { value: 'grad', label: 'Graduation Project', icon: Rocket },
    { value: 'team', label: 'Team Project', icon: Users },
    { value: 'other', label: 'Other', icon: Code }
  ];

  readonly colors = [
    '#7C3AED', // Violet
    '#10B981', // Emerald
    '#3B82F6', // Blue
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#8B5CF6'  // Purple
  ];

  readonly icons = [
    { name: 'layout', icon: Layout },
    { name: 'code', icon: Code },
    { name: 'smartphone', icon: Smartphone },
    { name: 'server', icon: Server },
    { name: 'palette', icon: Palette },
    { name: 'users', icon: Users },
    { name: 'rocket', icon: Rocket }
  ];

  // Icons for template
  readonly Check = Check;

  onSubmit(): void {
    if (this.projectForm.valid) {
      const user = this.authStore.user();
      const newProject = {
        ...this.projectForm.value,
        id: crypto.randomUUID().substring(0, 8),
        ownerId: user?.id || 'u1',
        memberIds: [user?.id || 'u1'],
        bugCount: 0,
        lastActivity: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isArchived: false
      };
      this.store.addProject(newProject);
      this.activity.log({
        type: 'project_created', entityId: newProject.id, entityTitle: newProject.name,
        userId: user?.id || 'me', userName: user?.fullName || 'You',
        description: `Created project "${newProject.name}"`
      });
      this.toast.show('New project created successfully!', 'success');
      this.onClose();
      this.projectForm.reset({ type: 'web', color: '#7C3AED', icon: 'layout' });
    }
  }

  onClose(): void {
    this.closed.emit();
  }

  selectType(type: ProjectType): void {
    this.projectForm.patchValue({ type });
  }

  selectColor(color: string): void {
    this.projectForm.patchValue({ color });
  }

  selectIcon(iconName: string): void {
    this.projectForm.patchValue({ icon: iconName });
  }
}
