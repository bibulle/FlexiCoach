import axios from 'axios';
import {
  API_URL,
  TestUser,
  authHeaders,
  errorMessage,
  registerUser,
} from '../support/auth-helper';

/** Smallest valid PNG (1×1 pixel). */
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);
const IMAGE_URL =
  /^\/uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/;

describe('Uploads API (issue #173: images stored in the database)', () => {
  let user: TestUser;

  const upload = (
    content: Buffer,
    type: string,
    name: string,
    owner: TestUser | null = user,
  ) => {
    const form = new FormData();
    form.append('file', new Blob([new Uint8Array(content)], { type }), name);
    return axios.post(
      `${API_URL}/api/uploads/image`,
      form,
      owner ? authHeaders(owner) : undefined,
    );
  };
  const download = (imageUrl: string) =>
    axios.get(`${API_URL}${imageUrl}`, { responseType: 'arraybuffer' });

  beforeAll(async () => {
    user = await registerUser('uploads');
  });

  describe('POST /api/uploads/image', () => {
    it('should reject unauthenticated uploads', async () => {
      await expect(
        upload(PNG, 'image/png', 'pixel.png', null),
      ).rejects.toMatchObject({ response: { status: 401 } });
    });

    it('should store an image and return its public URL', async () => {
      const res = await upload(PNG, 'image/png', 'ma position.png');

      expect(res.status).toBe(201);
      expect(res.data.imageUrl).toMatch(IMAGE_URL);
      expect(res.data.originalName).toBe('ma position.png');
      expect(res.data.size).toBe(PNG.length);
    });

    it.each([
      ['image/jpeg', '.jpg'],
      ['image/png', '.png'],
      ['image/webp', '.webp'],
    ])('should accept %s and name the file %s', async (type, extension) => {
      const res = await upload(PNG, type, 'image');

      expect(res.data.imageUrl.endsWith(extension)).toBe(true);
    });

    it('should take the extension from the type, not from the file name', async () => {
      const res = await upload(PNG, 'image/png', 'evil.html');

      expect(res.data.imageUrl).toMatch(/\.png$/);
    });

    it('should reject a file that is not an image', async () => {
      try {
        await upload(Buffer.from('hello'), 'text/plain', 'note.txt');
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(errorMessage(error)).toContain('JPEG, PNG et WebP');
      }
    });

    it('should reject an image larger than 5 MB', async () => {
      const tooBig = Buffer.alloc(5 * 1024 * 1024 + 1);

      await expect(
        upload(tooBig, 'image/png', 'big.png'),
      ).rejects.toMatchObject({ response: { status: 413 } });
    });

    it('should reject a request without file', async () => {
      await expect(
        axios.post(
          `${API_URL}/api/uploads/image`,
          new FormData(),
          authHeaders(user),
        ),
      ).rejects.toMatchObject({ response: { status: 400 } });
    });
  });

  describe('GET /uploads/:filename', () => {
    let imageUrl: string;

    beforeAll(async () => {
      imageUrl = (await upload(PNG, 'image/png', 'pixel.png')).data.imageUrl;
    });

    it('should serve the uploaded image, byte for byte', async () => {
      const res = await download(imageUrl);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('image/png');
      expect(Number(res.headers['content-length'])).toBe(PNG.length);
      expect(Buffer.from(res.data).equals(PNG)).toBe(true);
    });

    it('should be readable without authentication (used by <img> tags)', async () => {
      const res = await axios.get(`${API_URL}${imageUrl}`, {
        responseType: 'arraybuffer',
        headers: {},
      });

      expect(res.status).toBe(200);
    });

    it('should let browsers cache the image', async () => {
      const res = await download(imageUrl);

      expect(res.headers['cache-control']).toBe(
        'public, max-age=31536000, immutable',
      );
    });

    it('should serve the declared type whatever the client file name was', async () => {
      const res = await upload(PNG, 'image/webp', 'page.html');

      const image = await download(res.data.imageUrl);

      expect(image.headers['content-type']).toBe('image/webp');
    });

    it('should keep each image separate', async () => {
      const other = Buffer.concat([PNG, Buffer.from('other')]);
      const otherUrl = (await upload(other, 'image/png', 'other.png')).data
        .imageUrl;

      expect(otherUrl).not.toBe(imageUrl);
      expect(Buffer.from((await download(otherUrl)).data).equals(other)).toBe(
        true,
      );
      expect(Buffer.from((await download(imageUrl)).data).equals(PNG)).toBe(
        true,
      );
    });

    it.each([
      ['an unknown image', '/uploads/00000000-0000-0000-0000-000000000000.png'],
      ['a malformed name', '/uploads/not-an-image.png'],
      [
        'an unexpected extension',
        '/uploads/00000000-0000-0000-0000-000000000000.js',
      ],
    ])('should answer 404 for %s', async (_label, path) => {
      await expect(download(path)).rejects.toMatchObject({
        response: { status: 404 },
      });
    });

    it('should not be exposed under the /api prefix', async () => {
      await expect(download(`/api${imageUrl}`)).rejects.toMatchObject({
        response: { status: 404 },
      });
    });
  });
});
