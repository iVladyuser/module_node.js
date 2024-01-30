import mongoose from "mongoose";
import request from "supertest";
import { User } from "../models/user.js";
import app from "../app.js";

const { TEST_DB_HOST, PORT } = process.env;

describe("test api/user/register", () => {
	let server = null;

	beforeAll(async () => {
		await mongoose.connect(TEST_DB_HOST);
		server = app.listen(PORT);
	});

	afterAll(async () => {
		await mongoose.connection.close();
		server.close();
	});

	afterEach(async () => {
		await User.deleteMany({});
	});

	test("test register with correct data", async () => {
		const registerData = {
			password: "123456",
			email: "avatar@gmail.com",
		};
		const { statusCode, body } = await request
			.post("/api/users/register")
			.send(registerData);

		expect(statusCode).toBe(201);
		expect(body.user.subscription).toBe("starter");
		expect(body.user.email).toBe(registerData.email);

		const user = await User.findOne({ email: registerData.email });
		expect(user.subscription).toBe("starter");
	});
});
