process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db")

const {createTestData} = require("../_testData.js")

// before each test, clear and reset data
beforeEach(createTestData);

afterAll(function() {
    db.end();
});

describe("GET /companies", function() {
    test("Gets a list of companies", async function() {
        const response = await request(app).get('/companies');
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            companies: [
                {code: "testCode1", name: "testName1", description: "testDescription1"}, 
                {code: "testCode2", name: "testName2", description: "testDescription2"}
            ]
        });
    });
});

describe("GET /companies/[code]", function() {
    test("Gets info for a single company", async function() {
        const response = await request(app).get(`/companies/testCode1`)
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
                code: "testCode1", 
                name: "testName1", 
                description: "testDescription1", 
                invoices: [1, 2]});
    });

    test("Responds with 404 for invalid code", async function() {
        const response = await request(app).get(`/companies/invalidCode`)
        expect(response.statusCode).toEqual(404);
    })
});

describe("POST /companies", function() {
    test("Creates a new company", async function() {
        const newCompany = {code: "fb", name: "Facebook", description: "Meta"}
        const response = await request(app).post('/companies').send(newCompany)
        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual({
            company: newCompany
        });
    });
});

describe("PATCH /companies/[code]", function() {
    test("Updates single company", async function() {
        const newInfo = {code: "testCode1", name: "TEST NEW NAME", description: "testDescription1"}
        const response = await request(app).patch(`/companies/testCode1`).send(newInfo)
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            company: {code: "testCode1", name: "TEST NEW NAME", description: "testDescription1"}
        });
    });

    test("Responds with 404 for invalid code", async function() {
        const newInfo = {code: "invalidCode", name: "TEST NEW NAME", description: "testDescription"}
        const response = await request(app).patch(`/companies/invalidCode`).send(newInfo)
        expect(response.statusCode).toEqual(404);
    })
});

describe("DELETE /companies/[code]", function() {
    test("Deletes single company", async function() {
        const response = await request(app).delete(`/companies/testCode1`)
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            message: `Deleted company with code: testCode1` 
        });
    });

    test("Responds with 404 for invalid code", async function() {
        const response = await request(app).delete(`/companies/invalidCode`)
        expect(response.statusCode).toEqual(404);
    })
});


