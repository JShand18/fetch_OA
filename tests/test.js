const request = require("supertest");
const app = require("../app");
const examples = require("../examples/examples");



/** PATH RESPONSE TESTS */

describe("Test the root path", () => {
    test("It should response the GET method", () => {
        return request(app)
            .get("/")
            .then(response => {
                expect(response.statusCode).toBe(200);
            });
    });
});

describe("Test the receipts/process path", () => {
    test("It should response the 200 status code", () => {
        return request(app)
            .post("/receipts/process")
            .send(examples.morningReceipt)
            .then(res => {
                expect(res.statusCode).toBe(200);
            });
    });
});

describe("Test the receipts/process path", () => {
    test("It should response the 406 status code", () => {
        return request(app)
            .post("/receipts/process")
            .send()
            .then(res => {
                expect(res.statusCode).toBe(406);
            });
    });
});

describe("Test the receipts/:id/points path", () => {
    test("It should response the 200 status code", async () => {
        const res = await request(app)
            .post("/receipts/process")
            .send(examples.morningReceipt);
        return request(app)
            .get(`/receipts/${res.body.id}/points`)
            .then(response => {
                expect(response.statusCode).toBe(200);
            });
    });
});

/** POINT CALUCLATION TESTS */

describe("Test the receipts/:id/points point calculations", () => {
    test("It should send a receipt payload then reponse 15", async () => {
        const res = await request(app)
            .post("/receipts/process")
            .send(examples.morningReceipt);
        return request(app)
            .get(`/receipts/${res.body.id}/points`)
            .then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.body.points).toBe(15);
            });
    });
});

describe("Test the receipts/:id/points point calculations", () => {
    test("It should send a receipt payload then reponse 109", async () => {
        const res = await request(app)
            .post("/receipts/process")
            .send(examples.receiptPoints_109);
        return request(app)
            .get(`/receipts/${res.body.id}/points`)
            .then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.body.points).toBe(109);
            });
    });
});

describe("Test the receipts/:id/points point calculations", () => {
    test("It should send a receipt payload then reponse 28", async () => {
        const res = await request(app)
            .post("/receipts/process")
            .send(examples.receiptPoints_28);
        return request(app)
            .get(`/receipts/${res.body.id}/points`)
            .then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.body.points).toBe(28);
            });
    });
});


/** VALIDATION TESTING */

describe("Test the receipts/process purchaseDate validation", () => {
    test("It should response 406 error code and purchaseDate message", () => {
        return request(app)
            .post("/receipts/process")
            .send(examples.morningReceiptBadDate)
            .then(res => {
                expect(res.statusCode).toBe(406);
                expect(res.body.message).toBe("PurchaseDate not properly formatted: YYYY-MM-DD required");
            });
    });
});

describe("Test the receipts/process purchaseTime validation", () => {
    test("It should response 406 error code and purchaseTime error message", () => {
        return request(app)
            .post("/receipts/process")
            .send(examples.morningReceiptBadTime)
            .then(res => {
                expect(res.statusCode).toBe(406);
                expect(res.body.message).toBe("PurchaseTime not properly formatted: HH:MM required");
            });
    });
});

describe("Test the receipts/process total validation", () => {
    test("It should response 406 error code and total error message", () => {
        return request(app)
            .post("/receipts/process")
            .send(examples.morningReceiptBadTotal)
            .then(res => {
                expect(res.statusCode).toBe(406);
                expect(res.body.message).toBe("Total not properly formatted");
            });
    });
});

describe("Test the receipts/:id/points invalid id", () => {
    test("It should send a 500 error code and id error message", async () => {
        const res = await request(app)
            .post("/receipts/process")
            .send(examples.morningReceipt);
        return request(app)
            .get(`/receipts/notacapturedid2023/points`)
            .then(response => {
                expect(response.statusCode).toBe(500);
                expect(response.body.error).toBe("Receipt id not currently being tracked");
            });
    });
});
