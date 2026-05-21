import { TestBed } from '@angular/core/testing';
import { AuthStore } from '../../../core/stores/auth.store';
import { User } from '../../../core/models/user.model';
import { Role } from '../../../core/enums/role';

describe('AuthStore', () => {
  let store: InstanceType<typeof AuthStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthStore]
    });
    store = TestBed.inject(AuthStore);
  });

  it('should initialize with no user', () => {
    expect(store.user()).toBeNull();
    expect(store.isAuthenticated()).toBeFalse();
  });

  it('should set user on login', () => {
    const user: User = {
      id: '1',
      fullName: 'Test User',
      email: 'test@test.com',
      avatarUrl: null,
      role: Role.Admin,
      createdAt: new Date().toISOString()
    };
    store.login('mock-token', user);
    expect(store.user()).toEqual(user);
    expect(store.isAuthenticated()).toBeTrue();
    expect(store.token()).toBe('mock-token');
  });
});
