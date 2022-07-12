process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const Book = require("../models/book");

describe("Book Routes Test", function () {

    let baseBook;

    beforeEach(async function () {
        await db.query("DELETE FROM books");

        let response = await request(app)
            .post("/books")
            .send({
                "isbn": "0691161518",
                "amazon_url": "http://a.co/eobPtX2",
                "author": "Matthew Lane",
                "language": "english",
                "pages": 264,
                "publisher": "Princeton University Press",
                "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                "year": 2017
            });
        baseBook = response.body;
    });

    // Route Tests Section

    describe("GET Books Routes Tests", function () {
        test("GET all books", async function () {
            const response = await request(app)
                .get("/books");

            expect(response.body).toEqual({ books: [baseBook.book] });
            expect(response.body.books).toEqual([baseBook.book]);
        });

        test("GET one book", async function () {
            const response = await request(app)
                .get(`/books/${baseBook.book.isbn}`);

            expect(response.body).toEqual({ book: baseBook.book });
        });

        test("GET one book - ISBN not 10 or 13 digits", async function () {
            const response = await request(app)
                .get("/books/254656");

            expect(response.status).toEqual(404);
            expect(response.body).toEqual({ error: expect.any(Object), message: expect.any(String) });
        });
    });

    describe("POST / PUT / DELETE Route Tests", function () {
        test("POST - Create a new book", async function () {
            const response = await request(app)
                .post("/books")
                .send({
                    "isbn": "0695489678",
                    "amazon_url": "http://a.co/eobP3k4",
                    "author": "Brutus The Legend",
                    "language": "english",
                    "pages": 1337,
                    "publisher": "Princeton University Press",
                    "title": "Brutus The Legend: Mythic Proportions",
                    "year": 1003
                });

            expect(response.body).toEqual({
                book: {
                    "isbn": "0695489678",
                    "amazon_url": "http://a.co/eobP3k4",
                    "author": "Brutus The Legend",
                    "language": "english",
                    "pages": 1337,
                    "publisher": "Princeton University Press",
                    "title": "Brutus The Legend: Mythic Proportions",
                    "year": 1003
                }
            });
        });

        test("POST - Create a new book - Invalid ISBN", async function () {
            const response = await request(app)
                .post("/books")
                .send({
                    "isbn": "5489678",
                    "amazon_url": "http://a.co/eobP3k4",
                    "author": "Brutus The Legend",
                    "language": "english",
                    "pages": 1337,
                    "publisher": "Princeton University Press",
                    "title": "Brutus The Legend: Mythic Proportions",
                    "year": 1003
                });

            expect(response.status).toEqual(400);
            expect(response.body).toEqual({ error: expect.any(Object), message: expect.any(Array) });
        });

        test("PUT - Update an existing book", async function () {
            const response = await request(app)
                .put(`/books/${baseBook.book.isbn}`)
                .send({
                    "isbn": "0691161518",
                    "amazon_url": "http://a.co/eobPtX2",
                    "author": "Brutus The Legend",
                    "language": "english",
                    "pages": 1337,
                    "publisher": "Princeton University Press",
                    "title": "Brutus The Legend: Mythic Proportions",
                    "year": 1003
                });

            expect(response.body).toEqual({
                book: {
                    "isbn": "0691161518",
                    "amazon_url": "http://a.co/eobPtX2",
                    "author": "Brutus The Legend",
                    "language": "english",
                    "pages": 1337,
                    "publisher": "Princeton University Press",
                    "title": "Brutus The Legend: Mythic Proportions",
                    "year": 1003
                }
            });
        });

        test("PUT - Update an existing book - Invalid updated isbn", async function () {
            const response = await request(app)
                .put(`/books/${baseBook.book.isbn}`)
                .send({
                    "isbn": "161518",
                    "amazon_url": "http://a.co/eobPtX2",
                    "author": "Matthew Lane",
                    "language": "english",
                    "pages": 264,
                    "publisher": "Princeton University Press",
                    "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                    "year": 2017
                });

            expect(response.status).toEqual(400);
            expect(response.body).toEqual({ error: expect.any(Object), message: expect.any(Array) });
        });

        test("DELETE - Delete an existing book", async function () {
            const response = await request(app)
                .delete(`/books/${baseBook.book.isbn}`);

            expect(response.body).toEqual({ message: "Book deleted" });
        });

        test("DELETE - Delete an existing book - Invalid isbn", async function () {
            const response = await request(app)
                .delete("/books/213476123");

            expect(response.status).toEqual(404);
            expect(response.body).toEqual({ error: expect.any(Object), message: expect.any(String) });
        });
    });

    afterAll(async function () {
        await db.end();
    });

});