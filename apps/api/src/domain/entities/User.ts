export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'ADMIN' | 'USER';
  createdAt: Date;
  updatedAt: Date;
}

export type PublicUser = Omit<User, 'password'>;
