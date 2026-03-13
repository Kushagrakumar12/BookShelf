const request = require('supertest');
const app = require('../src/server');
const { connectTestDB, disconnectTestDB, clearTestDB } = require('./setup');

beforeAll(async () => {
  await connectTestDB();
}, 15000);

afterAll(async () => {
  await disconnectTestDB();
}, 15000);

afterEach(async () => {
  await clearTestDB();
});

describe('Health Check', () => {
  it('GET /api/health should return status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Book CRUD Operations', () => {
  const sampleBook = {
    title: 'Test Book',
    author: 'Test Author',
    description: 'A test book description',
    publishedYear: 2024,
  };

  // ========== CREATE ==========
  describe('POST /api/books', () => {
    it('should create a new book', async () => {
      const res = await request(app).post('/api/books').send(sampleBook);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.title).toBe(sampleBook.title);
      expect(res.body.author).toBe(sampleBook.author);
      expect(res.body.description).toBe(sampleBook.description);
      expect(res.body.publishedYear).toBe(sampleBook.publishedYear);
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('updatedAt');
    });

    it('should fail to create a book without title', async () => {
      const res = await request(app)
        .post('/api/books')
        .send({ author: 'Author', publishedYear: 2024 });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/title/i);
    });

    it('should fail to create a book without author', async () => {
      const res = await request(app)
        .post('/api/books')
        .send({ title: 'Title', publishedYear: 2024 });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/author/i);
    });

    it('should fail to create a book without publishedYear', async () => {
      const res = await request(app)
        .post('/api/books')
        .send({ title: 'Title', author: 'Author' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/publishedYear/i);
    });

    it('should fail to create a book with negative publishedYear', async () => {
      const res = await request(app)
        .post('/api/books')
        .send({ ...sampleBook, publishedYear: -1 });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/at least 1/i);
    });

    it('should fail to create a book with publishedYear too far in the future', async () => {
      const futureYear = new Date().getFullYear() + 6;

      const res = await request(app)
        .post('/api/books')
        .send({ ...sampleBook, publishedYear: futureYear });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/cannot be greater than/i);
    });
  });

  // ========== READ ALL ==========
  describe('GET /api/books', () => {
    it('should return empty array when no books', async () => {
      const res = await request(app).get('/api/books');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should return all books', async () => {
      await request(app).post('/api/books').send(sampleBook);
      await request(app).post('/api/books').send({
        title: 'Second Book',
        author: 'Another Author',
        description: 'Second description',
        publishedYear: 2023,
      });

      const res = await request(app).get('/api/books');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it('should return books sorted by newest first', async () => {
      await request(app).post('/api/books').send(sampleBook);
      await request(app).post('/api/books').send({
        title: 'Newer Book',
        author: 'Author',
        description: 'Newer',
        publishedYear: 2025,
      });

      const res = await request(app).get('/api/books');

      expect(res.statusCode).toBe(200);
      expect(res.body[0].title).toBe('Newer Book');
    });
  });

  // ========== READ ONE ==========
  describe('GET /api/books/:id', () => {
    it('should return a single book by ID', async () => {
      const created = await request(app).post('/api/books').send(sampleBook);
      const bookId = created.body._id;

      const res = await request(app).get(`/api/books/${bookId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBe(bookId);
      expect(res.body.title).toBe(sampleBook.title);
    });

    it('should return 404 for non-existent book', async () => {
      const fakeId = '000000000000000000000000';
      const res = await request(app).get(`/api/books/${fakeId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Book not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await request(app).get('/api/books/invalid-id');

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Invalid book ID');
    });
  });

  // ========== UPDATE ==========
  describe('PUT /api/books/:id', () => {
    it('should update an existing book', async () => {
      const created = await request(app).post('/api/books').send(sampleBook);
      const bookId = created.body._id;

      const updates = {
        title: 'Updated Title',
        author: 'Updated Author',
        description: 'Updated description',
        publishedYear: 2025,
      };

      const res = await request(app).put(`/api/books/${bookId}`).send(updates);

      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe('Updated Title');
      expect(res.body.author).toBe('Updated Author');
      expect(res.body.description).toBe('Updated description');
      expect(res.body.publishedYear).toBe(2025);
    });

    it('should return 404 when updating non-existent book', async () => {
      const fakeId = '000000000000000000000000';
      const res = await request(app)
        .put(`/api/books/${fakeId}`)
        .send({ title: 'Ghost', author: 'None', publishedYear: 2024 });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Book not found');
    });
  });

  // ========== DELETE ==========
  describe('DELETE /api/books/:id', () => {
    it('should delete an existing book', async () => {
      const created = await request(app).post('/api/books').send(sampleBook);
      const bookId = created.body._id;

      const res = await request(app).delete(`/api/books/${bookId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Book deleted successfully');

      // Verify it's gone
      const check = await request(app).get(`/api/books/${bookId}`);
      expect(check.statusCode).toBe(404);
    });

    it('should return 404 when deleting non-existent book', async () => {
      const fakeId = '000000000000000000000000';
      const res = await request(app).delete(`/api/books/${fakeId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Book not found');
    });
  });

  // ========== FULL WORKFLOW ==========
  describe('Full CRUD Workflow', () => {
    it('should create, read, update, and delete a book', async () => {
      // Create
      const createRes = await request(app).post('/api/books').send(sampleBook);
      expect(createRes.statusCode).toBe(201);
      const bookId = createRes.body._id;

      // Read
      const readRes = await request(app).get(`/api/books/${bookId}`);
      expect(readRes.statusCode).toBe(200);
      expect(readRes.body.title).toBe(sampleBook.title);

      // Update
      const updateRes = await request(app)
        .put(`/api/books/${bookId}`)
        .send({ ...sampleBook, title: 'Updated Workflow Book' });
      expect(updateRes.statusCode).toBe(200);
      expect(updateRes.body.title).toBe('Updated Workflow Book');

      // Delete
      const deleteRes = await request(app).delete(`/api/books/${bookId}`);
      expect(deleteRes.statusCode).toBe(200);

      // Verify deleted
      const verifyRes = await request(app).get(`/api/books/${bookId}`);
      expect(verifyRes.statusCode).toBe(404);
    });
  });
});
