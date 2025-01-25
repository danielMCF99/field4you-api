import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import app from '../app';
import { UserModel } from '../infrastructure/database/models/user.model';
import { JwtHelperImplementation } from '../infrastructure/jwt/jwtHelper';

describe('POST /auth/login', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  beforeEach(async () => {
    await UserModel.create({
      email: 'newUser@gmail.pt',
      password: await bcrypt.hash('password', 10),
      userType: 'user',
      firstName: 'User',
      lastName: 'Name',
      birthDate: '2024-11-26',
      lastAccessDate: new Date(),
      registerDate: new Date(),
    });
  });

  afterAll(async () => {
    // Close connection and stop in-memory server
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    // Clear database after each test
    await UserModel.deleteMany({});
  });

  it('should successfully login', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'newUser@gmail.pt', password: 'password' });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Login was successfull.');
    expect(response.body).toHaveProperty('token');
    expect(typeof response.body.token).toBe('string');
  });

  it('should return bad credentials on login', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'newUser@gmail.pt', password: 'wrongPassword' });

    // Assertions
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Invalid credentials');
  });
});

describe('DELETE /auth/:id', () => {
  const jwtHelper = JwtHelperImplementation.getInstance();
  let mongoServer: MongoMemoryServer;
  let authToken: string;
  let newUserId: string;

  beforeAll(async () => {
    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    authToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzUyMDM2OWFjNzVhNGQwOTMzNjljM2MiLCJ1c2VyVHlwZSI6InVzZXIiLCJlbWFpbCI6ImEzMzQ1NkBhbHVub3MuaXBjYS5wdCIsImlhdCI6MTczMzQzOTIwNiwiZXhwIjoxNzMzNDYwODA2fQ.cxJvhvLseZJB0npBzIbWng12VleHgDJN6RVu2gZqyRk';
  });

  beforeEach(async () => {
    // Create User in database to test delete mechanism
    const newUser = await UserModel.create({
      email: 'a33456@alunos.ipca.pt',
      password: await bcrypt.hash('password', 10),
      userType: 'user',
      firstName: 'User',
      lastName: 'Name',
      birthDate: '2024-11-26',
      lastAccessDate: new Date(),
      registerDate: new Date(),
    });

    newUserId = newUser._id.toString();
  });

  afterAll(async () => {
    // Close connection and stop in-memory server
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    // Clear database after each test
    await UserModel.deleteMany({});
  });

  it('should successfully delete', async () => {
    jest.spyOn(jwtHelper, 'decodeBearerToken').mockResolvedValue({
      userId: newUserId,
      email: 'a33456@alunos.ipca.pt',
      userType: 'user',
      exp: Date.now() + 1 * 60 * 60 * 1000,
      iat: Date.now(),
    });

    const response = await request(app)
      .delete(`/auth/${newUserId}`)
      .set('Authorization', `Bearer ${authToken}`);

    const deletedUser = await UserModel.findById(newUserId);

    // Assertions
    expect(response.status).toBe(200);
    expect(deletedUser).toBeNull();
  });

  it('should return bad credentials delete', async () => {
    jest.spyOn(jwtHelper, 'decodeBearerToken').mockResolvedValue({
      userId: newUserId,
      email: 'wrongEmail@gmail.com',
      userType: 'user',
      exp: 1,
      iat: 1,
    });

    const response = await request(app)
      .delete(`/auth/${newUserId}`)
      .set('Authorization', `Bearer ${authToken}`);

    // Assertions
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Authentication failed');
  });
});
