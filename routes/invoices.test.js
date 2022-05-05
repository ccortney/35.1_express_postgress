process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db")
const {createTestData}= require("../_testData.js")

// before each test, clear and reset data
beforeEach(createTestData);

afterAll(function() {
    db.end();
});

describe("GET /invoices", function() {
    test("Gets a list of invoices", async function() {
        const response = await request(app).get('/invoices');
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            invoices: [
                {comp_code: "testCode1", id: 1}, 
                {comp_code: "testCode1", id: 2}, 
                {comp_code: "testCode2", id: 3}
            ]
        });
    });
});

describe("GET /invoices/[id]", function() {
    test("Gets info for a single invoice", async function() {
        const response = await request(app).get(`/invoices/1`)
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            invoice: {
                id: 1, 
                amt: 100, 
                paid: false, 
                add_date: '2018-01-01T08:00:00.000Z', 
                paid_date: null,
                company: {
                    code: "testCode1", 
                    name: "testName1", 
                    description: "testDescription1"
                }
            }
        });
    });

    test("Responds with 404 for invalid ID", async function() {
        const response = await request(app).get(`/invoices/0`)
        expect(response.statusCode).toEqual(404);
    })
});

describe("POST /invoices", function() {
    test("Creates a new invoice", async function() {
        const newInvoice = {comp_code: "testCode1", amt: 222}
        const response = await request(app).post('/invoices').send(newInvoice)
        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual({
            invoice: { 
                id: 4, 
                amt: 222, 
                paid: false, 
                add_date: '2022-05-04T07:00:00.000Z', 
                paid_date: null,
                comp_code: "testCode1"
            }
        });
    });
});

describe("PATCH /invoices/[id]", function() {
    test("Updates single invoice", async function() {
        const newInfo = {code: "testCode1", amt: 555}
        const response = await request(app).patch(`/invoices/1`).send(newInfo)
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            invoice: { 
                id: 1, 
                amt: 555, 
                paid: false, 
                add_date: '2018-01-01T08:00:00.000Z', 
                paid_date: null,
                comp_code: "testCode1"
            }
        });
    });

    test("Responds with 404 for invalid code", async function() {
        const newInfo = {code: "testCode1", amt: 555}
        const response = await request(app).patch(`/invoices/0`).send(newInfo)
        expect(response.statusCode).toEqual(404);
    })
});

describe("DELETE /invoices/[id]", function() {
    test("Deletes single invoice", async function() {
        const response = await request(app).delete(`/invoices/1`)
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            message: `Deleted invoice with id: 1` 
        });
    });

    test("Responds with 404 for invalid id", async function() {
        const response = await request(app).delete(`/invoices/0`)
        expect(response.statusCode).toEqual(404);
    })
});


