import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import app from "../app";
import { BookingModel } from "../infrastructure/database/models/booking.model";
import { AuthMiddlewareImplementation } from "../infrastructure/middlewares/auth.middleware";

describe("POST /bookings/create", () => {
  let mongoServer: MongoMemoryServer;
  let token: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    const jwtHelper = AuthMiddlewareImplementation.getInstance();
    jest.spyOn(jwtHelper, "verifyToken").mockResolvedValue("mockedUserId");

    token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzUyMDM2OWFjNzVhNGQwOTMzNjljM2MiLCJ1c2VyVHlwZSI6InVzZXIiLCJlbWFpbCI6ImEzMzQ1NkBhbHVub3MuaXBjYS5wdCIsImlhdCI6MTczMzUzMTk3NSwiZXhwIjoxNzMzNTUzNTc1fQ.UNTZHdTdFCIwFRALYrrZMZGd128a9kTTsBb6irS0_9w";
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await BookingModel.deleteMany({});
  });

  it("should create a booking successfully", async () => {
    const bookingPayload = {
      sportsVenueId: "675389490221adfd1982f838",
      bookingType: "event",
      bookingStartDate: "2024-12-24 22:00:00",
      bookingEndDate: "2024-12-24 23:00:00",
      status: "active",
      title: "New Event",
      isPublic: true,
      invitedUsersIds: [],
    };

    const response = await request(app)
      .post("/bookings/create")
      .send(bookingPayload)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty(
      "message",
      "Booking created successfully"
    );
  });

  it("should fail when bookingStartDate is in the past", async () => {
    const bookingPayload = {
      sportsVenueId: "675389490221adfd1982f838",
      bookingType: "event",
      bookingStartDate: "2024-12-01 22:00:00",
      bookingEndDate: "2024-12-01 23:00:00",
      status: "active",
      title: "Past Event",
      isPublic: true,
      invitedUsersIds: [],
    };

    const response = await request(app)
      .post("/bookings/create")
      .send(bookingPayload)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error", "Error creating a booking");
  });
});

describe("PUT /bookings/:id", () => {
  let mongoServer: MongoMemoryServer;
  let token: string;
  let bookingId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    const jwtHelper = AuthMiddlewareImplementation.getInstance();
    jest
      .spyOn(jwtHelper, "verifyToken")
      .mockResolvedValue("67520369ac75a4d093369c3c");

    token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzUyMDM2OWFjNzVhNGQwOTMzNjljM2MiLCJ1c2VyVHlwZSI6InVzZXIiLCJlbWFpbCI6ImEzMzQ1NkBhbHVub3MuaXBjYS5wdCIsImlhdCI6MTczMzUzMTk3NSwiZXhwIjoxNzMzNTUzNTc1fQ.UNTZHdTdFCIwFRALYrrZMZGd128a9kTTsBb6irS0_9w";
    const bookingPayload = {
      sportsVenueId: "675389490221adfd1982f838",
      bookingType: "event",
      bookingStartDate: "2024-12-08 22:00:00",
      bookingEndDate: "2024-12-08 23:00:00",
      status: "active",
      title: "Past Event",
      isPublic: true,
      invitedUsersIds: [],
    };

    const bookingResponse = await request(app)
      .post("/bookings/create")
      .send(bookingPayload)
      .set("Authorization", `Bearer ${token}`);
    const getbooking = await request(app)
      .get("/bookings/all")
      .set("Authorization", `Bearer ${token}`);
    console.log(getbooking.body.bookings[0].id);
    bookingId = getbooking.body.bookings[0].id;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await BookingModel.deleteMany({});
  });

  it("should update a booking successfully", async () => {
    const updatePayload = {
      title: "Updated Event",
      status: "inactive",
    };

    const response = await request(app)
      .put(`/bookings/${bookingId}`)
      .send(updatePayload)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Booking update successfull"
    );
  });

  it("should fail with invalid booking ID format", async () => {
    const updatePayload = {
      title: "Invalid ID Event",
      status: "inactive",
    };

    const response = await request(app)
      .put("/bookings/invalid-id-format")
      .send(updatePayload)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Invalid ID format");
  });
});

describe("DELETE /bookings/:id", () => {
  let mongoServer: MongoMemoryServer;
  let token: string;
  let bookingId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    const jwtHelper = AuthMiddlewareImplementation.getInstance();
    jest
      .spyOn(jwtHelper, "verifyToken")
      .mockResolvedValue("67520369ac75a4d093369c3c");

    token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzUyMDM2OWFjNzVhNGQwOTMzNjljM2MiLCJ1c2VyVHlwZSI6InVzZXIiLCJlbWFpbCI6ImEzMzQ1NkBhbHVub3MuaXBjYS5wdCIsImlhdCI6MTczMzUzMTk3NSwiZXhwIjoxNzMzNTUzNTc1fQ.UNTZHdTdFCIwFRALYrrZMZGd128a9kTTsBb6irS0_9w";

    const newBooking = new BookingModel({
      sportsVenueId: "venue1232",
      bookingType: "event",
      bookingStartDate: "2024-12-06 22:00:00",
      bookingEndDate: "2024-12-06 23:00:00",
      status: "active",
      title: "Test Event",
      isPublic: true,
      invitedUsersIds: [],
      ownerId: "67520369ac75a4d093369c3c",
    });

    const savedBooking = await newBooking.save();
    bookingId = savedBooking._id.toString();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await BookingModel.deleteMany({});
  });

  it("should delete a booking successfully", async () => {
    const response = await request(app)
      .delete(`/bookings/${bookingId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Booking deleted");

    const deletedBooking = await BookingModel.findById(bookingId);
    expect(deletedBooking).toBeNull();
  });

  it("should fail with invalid booking ID format", async () => {
    const invalidBookingId = "invalid_id_format";

    const response = await request(app)
      .delete(`/bookings/${invalidBookingId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Invalid ID format");
  });
});
