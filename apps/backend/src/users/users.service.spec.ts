import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from './users.service';
import { User, UserSchema, UserDocument } from '../schemas/user.schema';
import {
  rootMongooseTestModule,
  closeInMongodConnection,
} from '../test-utils/mongodb-test.module';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let moduleRef: TestingModule;
  let userModel: Model<UserDocument>;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      providers: [UsersService],
    }).compile();

    service = moduleRef.get<UsersService>(UsersService);
    userModel = moduleRef.get<Model<UserDocument>>(getModelToken(User.name));
  }, 30000);

  afterAll(async () => {
    await moduleRef.close();
    await closeInMongodConnection();
  });

  afterEach(async () => {
    // Clean up database between tests
    await userModel.deleteMany({});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedPassword123',
        displayName: 'Test User',
      };

      const user = await service.create(userData);

      expect(user).toBeDefined();
      expect(user._id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.password).toBe(userData.password);
      expect(user.displayName).toBe(userData.displayName);
      expect(user.tz).toBe('Europe/Paris'); // default value
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      await service.create({
        email: 'user1@example.com',
        password: 'password1',
      });
      await service.create({
        email: 'user2@example.com',
        password: 'password2',
      });

      const users = await service.findAll();

      expect(users).toHaveLength(2);
      expect(users[0].email).toBe('user1@example.com');
      expect(users[1].email).toBe('user2@example.com');
    });

    it('should return empty array when no users exist', async () => {
      const users = await service.findAll();
      expect(users).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should find user by ID', async () => {
      const created = await service.create({
        email: 'user@example.com',
        password: 'password',
      });

      const found = await service.findOne(created._id.toString());

      expect(found).toBeDefined();
      expect(found?._id.toString()).toBe(created._id.toString());
      expect(found?.email).toBe('user@example.com');
    });

    it('should return null for non-existent ID', async () => {
      const found = await service.findOne('507f1f77bcf86cd799439011');
      expect(found).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      await service.create({
        email: 'test@example.com',
        password: 'password',
        displayName: 'Test',
      });

      const user = await service.findByEmail('test@example.com');

      expect(user).toBeDefined();
      expect(user?.email).toBe('test@example.com');
      expect(user?.displayName).toBe('Test');
    });

    it('should not include password field by default', async () => {
      await service.create({
        email: 'test@example.com',
        password: 'password',
      });

      const user = await service.findByEmail('test@example.com');

      expect(user).toBeDefined();
      expect((user as any).password).toBeUndefined();
    });

    it('should return null for non-existent email', async () => {
      const user = await service.findByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });
  });

  describe('findByEmailWithPassword', () => {
    it('should include password field', async () => {
      await service.create({
        email: 'test@example.com',
        password: 'secretPassword',
      });

      const user = await service.findByEmailWithPassword('test@example.com');

      expect(user).toBeDefined();
      expect(user?.email).toBe('test@example.com');
      expect((user as any).password).toBe('secretPassword');
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const created = await service.create({
        email: 'test@example.com',
        password: 'password',
        displayName: 'Original Name',
      });

      const updated = await service.update(created._id.toString(), {
        displayName: 'Updated Name',
        tz: 'America/New_York',
      });

      expect(updated).toBeDefined();
      expect(updated?.displayName).toBe('Updated Name');
      expect(updated?.tz).toBe('America/New_York');
      expect(updated?.email).toBe('test@example.com'); // unchanged
    });

    it('should return null for non-existent ID', async () => {
      const updated = await service.update('507f1f77bcf86cd799439011', {
        displayName: 'Test',
      });
      expect(updated).toBeNull();
    });
  });

  describe('updateSettings', () => {
    it('should update user settings', async () => {
      const created = await service.create({
        email: 'test@example.com',
        password: 'password',
      });

      const settings = {
        theme: 'dark' as const,
        voiceRate: 1.2,
        sound: true,
      };

      const updated = await service.updateSettings(
        created._id.toString(),
        settings
      );

      expect(updated).toBeDefined();
      expect(updated?.settings?.theme).toBe('dark');
      expect(updated?.settings?.voiceRate).toBe(1.2);
      expect(updated?.settings?.sound).toBe(true);
    });
  });

  describe('updatePassword', () => {
    it('should hash and update password', async () => {
      const created = await service.create({
        email: 'test@example.com',
        password: 'oldPassword',
      });

      const newPassword = 'newPassword123';
      const updated = await service.updatePassword(
        created._id.toString(),
        newPassword
      );

      expect(updated).toBeDefined();

      // Verify password was hashed
      const userWithPassword = await service.findByEmailWithPassword(
        'test@example.com'
      );
      expect(userWithPassword).toBeDefined();

      const isMatch = await bcrypt.compare(
        newPassword,
        (userWithPassword as any).password
      );
      expect(isMatch).toBe(true);
    });
  });

  describe('remove', () => {
    it('should delete user', async () => {
      const created = await service.create({
        email: 'test@example.com',
        password: 'password',
      });

      const deleted = await service.remove(created._id.toString());

      expect(deleted).toBeDefined();
      expect(deleted?._id.toString()).toBe(created._id.toString());

      // Verify user is deleted
      const found = await service.findOne(created._id.toString());
      expect(found).toBeNull();
    });

    it('should return null for non-existent ID', async () => {
      const deleted = await service.remove('507f1f77bcf86cd799439011');
      expect(deleted).toBeNull();
    });
  });
});
