import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import app from "../app";
import { SportsVenueModel } from "../infrastructure/database/models/sports-venueModel";
import { JwtHelperImplementation } from "../infrastructure/jwt/jwtHelper";

describe("POST /sports-venue/create", () => {
  let mongoServer: MongoMemoryServer;
  let token: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    const jwtHelper = JwtHelperImplementation.getInstance();
    jest
      .spyOn(jwtHelper, "verifyToken")
      .mockResolvedValue("67520369ac75a4d093369c3c");

    token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzUyM2Q1YjI3MmFjOGQwZTVmYTY2ODciLCJ1c2VyVHlwZSI6InVzZXIiLCJlbWFpbCI6ImExNjgxOEBhbHVub3MuaXBjYS5wdCIsImlhdCI6MTczMzU2ODQ5NywiZXhwIjoxNzMzNTkwMDk3fQ.j_XjUxASdM31oRkTga7Pi8XJfhJ5Twk2tua-G9IsruI";
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await SportsVenueModel.deleteMany({});
  });

  it("should create a new sports-venue", async () => {
    const sportsVenuePayload = {
      location: "Barcelos, Braga, Portugal",
      sportsVenueType: "11x11",
      status: "active",
      sportsVenueName: "City Sports Arena",
      bookingMinDuration: 60,
      bookingMinPrice: 25,
      sportsVenuePicture: "https://example.com/sports-venue.jpg",
      hasParking: true,
      hasShower: true,
      hasBar: true,
    };

    const response = await request(app)
      .post("/sports-venue/create")
      .set("Authorization", `Bearer ${token}`)
      .send(sportsVenuePayload);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty(
      "message",
      "Sports venue created successfully"
    );
  });

  it("should return 400 if required fields are missing", async () => {
    const sportsVenuePayload = {
      location: "Barcelos, Braga, Portugal",
      sportsVenueType: "11x11",
      status: "active",
      bookingMinDuration: 60,
      bookingMinPrice: 25,
      sportsVenuePicture: "https://example.com/sports-venue.jpg",
      hasParking: true,
      hasShower: true,
      hasBar: true,
    };

    const response = await request(app)
      .post("/sports-venue/create")
      .set("Authorization", `Bearer ${token}`)
      .send(sportsVenuePayload);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Missing required fields");
  });
});

describe("PUT /sports-venue/:id", () => {
  let mongoServer: MongoMemoryServer;
  let token: string;
  let sportsVenueId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    const jwtHelper = JwtHelperImplementation.getInstance();
    jest
      .spyOn(jwtHelper, "verifyToken")
      .mockResolvedValue("67520369ac75a4d093369c3c");
    token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzUyM2Q1YjI3MmFjOGQwZTVmYTY2ODciLCJ1c2VyVHlwZSI6InVzZXIiLCJlbWFpbCI6ImExNjgxOEBhbHVub3MuaXBjYS5wdCIsImlhdCI6MTczMzU2ODQ5NywiZXhwIjoxNzMzNTkwMDk3fQ.j_XjUxASdM31oRkTga7Pi8XJfhJ5Twk2tua-G9IsruI";

    const sportsVenuePayload = {
      ownerId: "67520369ac75a4d093369c3c",
      location: "Barcelos, Braga, Portugal",
      sportsVenueType: "11x11",
      status: "active",
      sportsVenueName: "City Sports Arena",
      bookingMinDuration: 60,
      bookingMinPrice: 25,
      sportsVenuePicture: "https://example.com/sports-venue.jpg",
      hasParking: true,
      hasShower: true,
      hasBar: true,
    };
    const newSportsVenue = await SportsVenueModel.create(sportsVenuePayload);
    sportsVenueId = newSportsVenue._id.toString();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await SportsVenueModel.deleteMany({});
  });

  it("should update status of a sports-venue", async () => {
    const updateSportVenuePauload = {
      status: "inactive",
    };

    const response = await request(app)
      .put(`/sports-venue/${sportsVenueId}`)
      .send(updateSportVenuePauload)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Sports venue updated successfully"
    );
  });

  it("should faul with invalid sports-venue id format", async () => {
    const updateSportVenuePauload = {
      status: "inactive",
    };

    const response = await request(app)
      .put(`/sports-venue/invalidId`)
      .send(updateSportVenuePauload)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Invalid ID format");
  });
});

describe("DELETE /sports-venue/:id", () => {
  let mongoServer: MongoMemoryServer;
  let token: string;
  let sportsVenueId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    const jwtHelper = JwtHelperImplementation.getInstance();
    jest
      .spyOn(jwtHelper, "verifyToken")
      .mockResolvedValue("67520369ac75a4d093369c3c");

    token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzUyM2Q1YjI3MmFjOGQwZTVmYTY2ODciLCJ1c2VyVHlwZSI6Im93bmVyIiwiZW1haWwiOiJhMTY4MThAYWx1bm9zLmlwY2EucHQiLCJpYXQiOjE3MzM1OTA2NjEsImV4cCI6MTczMzYxMjI2MX0.k-VGwn7ftkHgxt5poF0xTPVXZ2M-am6uy1VQ2K3kmMY";

    const newSportsVenue = new SportsVenueModel({
      ownerId: "67523d5b272ac8d0e5fa6687",
      location: "Barcelos, Braga, Portugal",
      sportsVenueType: "11x11",
      status: "active",
      sportsVenueName: "City Sports Arena",
      bookingMinDuration: 60,
      bookingMinPrice: 25,
      sportsVenuePicture: "https://example.com/sports-venue.jpg",
      hasParking: true,
      hasShower: true,
      hasBar: true,
    });

    const savedSportsVenue = await SportsVenueModel.create(newSportsVenue);
    sportsVenueId = savedSportsVenue._id.toString();
  });

  beforeEach(async () => {
    const newSportsVenue = new SportsVenueModel({
      ownerId: "67523d5b272ac8d0e5fa6687",
      location: "Barcelos, Braga, Portugal",
      sportsVenueType: "11x11",
      status: "active",
      sportsVenueName: "City Sports Arena",
      bookingMinDuration: 60,
      bookingMinPrice: 25,
      sportsVenuePicture: "https://example.com/sports-venue.jpg",
      hasParking: true,
      hasShower: true,
      hasBar: true,
    });

    const savedSportsVenue = await SportsVenueModel.create(newSportsVenue);
    sportsVenueId = savedSportsVenue._id.toString();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await SportsVenueModel.deleteMany({});
  });

  it("should delete a sports-venue", async () => {
    const response = await request(app)
      .delete(`/sports-venue/${sportsVenueId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Sports Venue Deleted");

    const deletedBooking = await SportsVenueModel.findById(sportsVenueId);
    expect(deletedBooking).toBeNull();
  });
});
