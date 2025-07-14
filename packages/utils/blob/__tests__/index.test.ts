import { put } from '@vercel/blob';

import { uploadBlob } from '../index';

// Mock the @vercel/blob module
jest.mock('@vercel/blob', () => ({
  put: jest.fn(),
}));

const mockPut = jest.mocked(put);

describe('Blob Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('uploadBlob', () => {
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const mockBlob = new Blob(['test content'], { type: 'text/plain' });
    const mockPath = 'uploads/test.txt';

    const mockBlobResponse = {
      url: 'https://example.com/blob/test.txt',
      downloadUrl: 'https://example.com/blob/test.txt',
      pathname: 'test.txt',
      contentType: 'text/plain',
      contentDisposition: 'inline; filename="test.txt"',
      size: 12,
    };

    it('should upload a file successfully with default options', async () => {
      mockPut.mockResolvedValueOnce(mockBlobResponse);

      const result = await uploadBlob({
        file: mockFile,
        path: mockPath,
      });

      expect(mockPut).toHaveBeenCalledWith(mockPath, mockFile, {
        access: 'public',
        allowOverwrite: false,
      });
      expect(result).toEqual(mockBlobResponse);
    });

    it('should upload a blob successfully with custom options', async () => {
      mockPut.mockResolvedValueOnce(mockBlobResponse);

      const result = await uploadBlob({
        file: mockBlob,
        path: mockPath,
        allowOverwrite: true,
      });

      expect(mockPut).toHaveBeenCalledWith(mockPath, mockBlob, {
        access: 'public',
        allowOverwrite: true,
      });
      expect(result).toEqual(mockBlobResponse);
    });

    it('should handle upload errors and log them', async () => {
      const mockError = new Error('Upload failed');
      mockPut.mockRejectedValueOnce(mockError);

      await expect(
        uploadBlob({
          file: mockFile,
          path: mockPath,
        }),
      ).rejects.toThrow('Upload failed');

      expect(console.error).toHaveBeenCalledWith('Error uploading blob', mockError);
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockPut.mockRejectedValueOnce(networkError);

      await expect(
        uploadBlob({
          file: mockFile,
          path: mockPath,
          allowOverwrite: false,
        }),
      ).rejects.toThrow('Network error');

      expect(mockPut).toHaveBeenCalledWith(mockPath, mockFile, {
        access: 'public',
        allowOverwrite: false,
      });
    });

    it('should handle different file types', async () => {
      const imageFile = new File(['image data'], 'image.png', { type: 'image/png' });
      mockPut.mockResolvedValueOnce({ ...mockBlobResponse, contentType: 'image/png' });

      const result = await uploadBlob({
        file: imageFile,
        path: 'images/image.png',
      });

      expect(mockPut).toHaveBeenCalledWith('images/image.png', imageFile, {
        access: 'public',
        allowOverwrite: false,
      });
      expect(result).toEqual({ ...mockBlobResponse, contentType: 'image/png' });
    });

    it('should handle empty files', async () => {
      const emptyFile = new File([], 'empty.txt', { type: 'text/plain' });
      const emptyFileResponse = { ...mockBlobResponse, size: 0 };
      mockPut.mockResolvedValueOnce(emptyFileResponse);

      const result = await uploadBlob({
        file: emptyFile,
        path: 'empty/empty.txt',
      });

      expect(mockPut).toHaveBeenCalledWith('empty/empty.txt', emptyFile, {
        access: 'public',
        allowOverwrite: false,
      });
      expect(result).toEqual(emptyFileResponse);
    });

    it('should handle special characters in file paths', async () => {
      const specialPath = 'uploads/файл с пробелами & спецсимволами.txt';
      mockPut.mockResolvedValueOnce(mockBlobResponse);

      const result = await uploadBlob({
        file: mockFile,
        path: specialPath,
      });

      expect(mockPut).toHaveBeenCalledWith(specialPath, mockFile, {
        access: 'public',
        allowOverwrite: false,
      });
      expect(result).toEqual(mockBlobResponse);
    });

    it('should maintain backward compatibility with existing function signature', async () => {
      mockPut.mockResolvedValueOnce(mockBlobResponse);

      // Test that the function still works with the exact same parameters as before
      const legacyCall = uploadBlob({
        file: mockFile,
        path: mockPath,
        allowOverwrite: false,
      });

      await expect(legacyCall).resolves.toEqual(mockBlobResponse);
      expect(mockPut).toHaveBeenCalledWith(mockPath, mockFile, {
        access: 'public',
        allowOverwrite: false,
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle large file uploads', async () => {
      const largeContent = 'x'.repeat(1024 * 1024); // 1MB of content
      const largeFile = new File([largeContent], 'large.txt', { type: 'text/plain' });

      mockPut.mockResolvedValueOnce({
        url: 'https://example.com/blob/large.txt',
        downloadUrl: 'https://example.com/blob/large.txt',
        pathname: 'large.txt',
        contentType: 'text/plain',
        contentDisposition: 'inline; filename="large.txt"',
      });

      const result = await uploadBlob({
        file: largeFile,
        path: 'uploads/large.txt',
      });

      expect(mockPut).toHaveBeenCalledWith('uploads/large.txt', largeFile, {
        access: 'public',
        allowOverwrite: false,
      });
      expect(result.url).toBe('https://example.com/blob/large.txt');
    });

    it('should handle concurrent uploads', async () => {
      const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
      const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });

      mockPut
        .mockResolvedValueOnce({
          url: 'https://example.com/blob/file1.txt',
          downloadUrl: 'https://example.com/blob/file1.txt',
          pathname: 'file1.txt',
          contentType: 'text/plain',
          contentDisposition: 'inline; filename="file1.txt"',
        })
        .mockResolvedValueOnce({
          url: 'https://example.com/blob/file2.txt',
          downloadUrl: 'https://example.com/blob/file2.txt',
          pathname: 'file2.txt',
          contentType: 'text/plain',
          contentDisposition: 'inline; filename="file2.txt"',
        });

      const [result1, result2] = await Promise.all([
        uploadBlob({ file: file1, path: 'file1.txt' }),
        uploadBlob({ file: file2, path: 'file2.txt' }),
      ]);

      expect(result1.url).toBe('https://example.com/blob/file1.txt');
      expect(result2.url).toBe('https://example.com/blob/file2.txt');
      expect(mockPut).toHaveBeenCalledTimes(2);
    });
  });
});
