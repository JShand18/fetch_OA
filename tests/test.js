const request = require("supertest");
const app = require("../app");

const morningReceipt = {
    "retailer": "Walgreens",
    "purchaseDate": "2022-01-02",
    "purchaseTime": "08:13",
    "total": "2.65",
    "items": [
        { "shortDescription": "Pepsi - 12-oz", "price": "1.25" },
        { "shortDescription": "Dasani", "price": "1.40" }
    ]
}


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
    test("It should response the POST method", () => {
        return request(app)
            .post("/receipts/process")
            .send(morningReceipt)
            .then(res => {
                expect(res.statusCode).toBe(200);
                expect(res.body.id).toBe("b77ba577402049e95e310a040ab5728a");
            });
    });
});

describe("Test the receipts/:id/points path", () => {
    it("It should send a receipt payload then reponse GET method", async () => {
        const res = await request(app)
            .post("/receipts/process")
            .send(morningReceipt);
        return request(app)
            .get(`/receipts/${res.body.id}/points`)
            .then(response => {
                expect(response.statusCode).toBe(200);
                expect(response.body.points).toBe(15);
            });
    });
});
