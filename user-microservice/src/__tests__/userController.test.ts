import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../app';
import { UserModel } from '../infrastructure/database/models/user.model';
import { JwtHelperImplementation } from '../infrastructure/jwt/jwtHelper';

describe('PUT /users/:id', () => {
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
    const newUser = await UserModel.create({
      authServiceUserId: 'id',
      userType: 'user',
      email: 'newUser@gmail.pt',
      phoneNumber: '987654321',
      firstName: 'User',
      lastName: 'Name',
      district: 'Braga',
      city: 'Barcelos',
      address: 'Rua de Barcelos',
      latitude: 10.0,
      longitude: 10.0,
      birthDate: '1999-05-08',
      registerDate: new Date(),
    });

    newUserId = newUser._id.toString();
    await UserModel.findByIdAndUpdate(newUserId, {
      authServiceUserId: newUserId,
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

  it('should update successfully', async () => {
    jest.spyOn(jwtHelper, 'decodeBearerToken').mockResolvedValue({
      userId: newUserId,
      email: 'newUser@gmail.pt',
      userType: 'user',
      exp: Date.now() + 1 * 60 * 60 * 1000,
      iat: Date.now(),
    });

    const updatePayload = {
      district: 'Porto',
    };

    const response = await request(app)
      .put(`/users/${newUserId}`)
      .send(updatePayload)
      .set('Authorization', `Bearer ${authToken}`);

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('email');
    expect(response.body).not.toBeNull();
    expect(response.body.district).toBe('Porto');
  });

  it('should not update for field not allowed to be updated', async () => {
    jest.spyOn(jwtHelper, 'decodeBearerToken').mockResolvedValue({
      userId: newUserId,
      email: 'newUser@gmail.pt',
      userType: 'user',
      exp: Date.now() + 1 * 60 * 60 * 1000,
      iat: Date.now(),
    });

    const updatePayload = {
      email: 'newEmail@gmail.com',
    };

    const response = await request(app)
      .put(`/users/${newUserId}`)
      .send(updatePayload)
      .set('Authorization', `Bearer ${authToken}`);

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body).not.toBeNull();
    expect(response.body.email).not.toBe('newEmail@gmail.com');
  });

  it('should return bad credentials update', async () => {
    jest.spyOn(jwtHelper, 'decodeBearerToken').mockResolvedValue({
      userId: newUserId,
      email: 'wrongEmail@gmail.com',
      userType: 'user',
      exp: Date.now() + 1 * 60 * 60 * 1000,
      iat: Date.now(),
    });

    const updatePayload = {
      district: 'Porto',
    };

    const response = await request(app)
      .put(`/users/${newUserId}`)
      .send(updatePayload)
      .set('Authorization', `Bearer ${authToken}`);

    // Assertions
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Authentication failed');
  });
});

describe('DELETE /users/:id', () => {
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
    const newUser = await UserModel.create({
      authServiceUserId: 'id',
      userType: 'user',
      email: 'newUser@gmail.pt',
      phoneNumber: '987654321',
      firstName: 'User',
      lastName: 'Name',
      district: 'Braga',
      city: 'Barcelos',
      address: 'Rua de Barcelos',
      latitude: 10.0,
      longitude: 10.0,
      birthDate: '1999-05-08',
      registerDate: new Date(),
    });

    newUserId = newUser._id.toString();
    await UserModel.findByIdAndUpdate(newUserId, {
      authServiceUserId: newUserId,
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

  it('should return bad credentials delete', async () => {
    jest.spyOn(jwtHelper, 'decodeBearerToken').mockResolvedValue({
      userId: newUserId,
      email: 'wrongEmail@gmail.com',
      userType: 'user',
      exp: 1,
      iat: 1,
    });

    const response = await request(app)
      .delete(`/users/${newUserId}`)
      .set('Authorization', `Bearer ${authToken}`);

    // Assertions
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Authentication failed');
  });
});
