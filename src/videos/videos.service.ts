import { Injectable, Logger } from '@nestjs/common';
import ffmpeg from 'fluent-ffmpeg';
import { bucket } from 'src/firestore/config';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { promisify } from 'util';
import { rm } from 'fs/promises';

const readdir = promisify(fs.readdir);

@Injectable()
export class VideosService {
  private readonly logger = new Logger(VideosService.name);

  /**
   * Make specific video folder files public
   */
  async makeVideoFilesPublic(folderName: string): Promise<{ success: boolean; message: string; files: string[] }> {
    try {
      this.logger.log(`Making files public for video: ${folderName}`);

      const [files] = await bucket.getFiles({
        prefix: `videos/${folderName}/`
      });

      if (files.length === 0) {
        throw new Error(`No files found for video: ${folderName}`);
      }

      this.logger.log(`Found ${files.length} files to make public`);

      const processedFiles: string[] = [];
      const errors: string[] = [];

      // Process each file to make it public
      for (const file of files) {
        try {
          // Check if file is already public
          const [metadata] = await file.getMetadata();
          const isPublic = metadata.acl?.some(entry =>
            entry.entity === 'allUsers' && entry.role === 'READER'
          );

          if (!isPublic) {
            await file.makePublic();
            this.logger.log(`✅ Made public: ${file.name}`);
          } else {
            this.logger.log(`ℹ️ Already public: ${file.name}`);
          }

          processedFiles.push(file.name);
        } catch (fileError) {
          const errorMsg = `Failed to make ${file.name} public: ${fileError.message}`;
          this.logger.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      if (errors.length > 0) {
        throw new Error(`Some files failed to become public: ${errors.join(', ')}`);
      }

      return {
        success: true,
        message: `Successfully made ${processedFiles.length} files public for video: ${folderName}`,
        files: processedFiles
      };

    } catch (error) {
      this.logger.error(`Error making files public for ${folderName}:`, error);
      throw error;
    }
  }

  /**
   * Make ALL videos public (use with caution)
   */
  async makeAllVideosPublic(): Promise<{ success: boolean; message: string; processedVideos: string[] }> {
    try {
      this.logger.log('Making ALL videos public...');

      const [files] = await bucket.getFiles({
        prefix: 'videos/'
      });

      if (files.length === 0) {
        throw new Error('No video files found in storage');
      }

      // Group files by video folder
      const videoFolders = new Map<string, string[]>();

      files.forEach(file => {
        const pathParts = file.name.split('/');
        if (pathParts.length >= 2) {
          const folderName = pathParts[1]; // videos/{folderName}/file.ext
          if (!videoFolders.has(folderName)) {
            videoFolders.set(folderName, []);
          }
          videoFolders.get(folderName)!.push(file.name);
        }
      });

      this.logger.log(`Found ${videoFolders.size} video folders`);

      const processedVideos: string[] = [];
      const errors: string[] = [];

      // Process each video folder
      for (const [folderName, filePaths] of videoFolders) {
        try {
          await this.makeVideoFilesPublic(folderName);
          processedVideos.push(folderName);
          this.logger.log(`✅ Processed video: ${folderName}`);
        } catch (folderError) {
          const errorMsg = `Failed to process ${folderName}: ${folderError.message}`;
          this.logger.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      if (errors.length > 0) {
        return {
          success: false,
          message: `Processed ${processedVideos.length} videos with ${errors.length} errors: ${errors.join(', ')}`,
          processedVideos
        };
      }

      return {
        success: true,
        message: `Successfully made ${processedVideos.length} videos public`,
        processedVideos
      };

    } catch (error) {
      this.logger.error('Error making all videos public:', error);
      throw error;
    }
  }

  /**
   * List all video folders available
   */
  async listVideoFolders(): Promise<{ success: boolean; folders: string[] }> {
    try {
      const [files] = await bucket.getFiles({
        prefix: 'videos/'
      });

      const folders = new Set<string>();

      files.forEach(file => {
        const pathParts = file.name.split('/');
        if (pathParts.length >= 2) {
          folders.add(pathParts[1]);
        }
      });

      const folderList = Array.from(folders);

      return {
        success: true,
        folders: folderList
      };

    } catch (error) {
      this.logger.error('Error listing video folders:', error);
      throw error;
    }
  }

  /**
   * Check if a video folder's files are public
   */
  async checkVideoAccess(folderName: string): Promise<{
    success: boolean;
    isPublic: boolean;
    publicFiles: string[];
    privateFiles: string[];
    message: string;
  }> {
    try {
      const [files] = await bucket.getFiles({
        prefix: `videos/${folderName}/`
      });

      if (files.length === 0) {
        throw new Error(`No files found for video: ${folderName}`);
      }

      const publicFiles: string[] = [];
      const privateFiles: string[] = [];

      for (const file of files) {
        const [metadata] = await file.getMetadata();
        const isPublic = metadata.acl?.some(entry =>
          entry.entity === 'allUsers' && entry.role === 'READER'
        );

        if (isPublic) {
          publicFiles.push(file.name);
        } else {
          privateFiles.push(file.name);
        }
      }

      const isFullyPublic = privateFiles.length === 0;

      return {
        success: true,
        isPublic: isFullyPublic,
        publicFiles,
        privateFiles,
        message: isFullyPublic
          ? `All ${publicFiles.length} files are public`
          : `${publicFiles.length} files are public, ${privateFiles.length} files are private`
      };

    } catch (error) {
      this.logger.error(`Error checking access for ${folderName}:`, error);
      throw error;
    }
  }

  /**
   * Force make files public with retry mechanism
   */
  async forceMakeVideoPublic(folderName: string, maxRetries: number = 3): Promise<{ success: boolean; message: string }> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`Force making public attempt ${attempt}/${maxRetries} for: ${folderName}`);

        const result = await this.makeVideoFilesPublic(folderName);

        // Double check that files are actually public
        const accessCheck = await this.checkVideoAccess(folderName);

        if (!accessCheck.isPublic) {
          throw new Error(`Files still not public after makePublic call: ${accessCheck.privateFiles.join(', ')}`);
        }

        this.logger.log(`✅ Successfully force made ${folderName} public on attempt ${attempt}`);
        return {
          success: true,
          message: `Video '${folderName}' is now publicly accessible with ${result.files.length} files`
        };

      } catch (error) {
        lastError = error;
        this.logger.warn(`Attempt ${attempt} failed: ${error.message}`);

        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          const retryDelay = 1000 * attempt;
          this.logger.log(`Retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    throw new Error(`Failed to make ${folderName} public after ${maxRetries} attempts: `);
  }

  /**
   * Transcode video to HLS format and upload to Firebase Storage
   */
  async transcodeToHLSAndUpload(fileBuffer: Buffer, filename: string): Promise<string> {
    const videoId = uuidv4();
    const tempDir = path.join(os.tmpdir(), 'mboko-fit-uploads', videoId);
    const inputPath = path.join(tempDir, 'input.mp4');
    const outputDir = path.join(tempDir, 'hls');
    const outputPath = path.join(outputDir, 'output.m3u8');

    try {
      // Create temp directories
      await fs.promises.mkdir(tempDir, { recursive: true });
      await fs.promises.mkdir(outputDir, { recursive: true });
      this.logger.log(`Created temp directory: ${tempDir}`);

      // Write input buffer to temp file
      await fs.promises.writeFile(inputPath, fileBuffer);
      this.logger.log(`Input file written: ${inputPath} (${fileBuffer.length} bytes)`);

      // Transcode to HLS with fixed settings
      await this.transcodeToHLS(inputPath, outputDir);

      // Upload all HLS files to Firebase Storage
      const manifestUrl = await this.uploadHLSFiles(outputDir, videoId, filename);

      // Cleanup temp files
      await this.cleanupTempDir(tempDir);

      return manifestUrl;
    } catch (error) {
      // Cleanup on error
      await this.cleanupTempDir(tempDir).catch(cleanupError => {
        this.logger.warn('Cleanup failed after error', cleanupError);
      });
      this.logger.error('Transcoding and upload failed', error);
      throw error;
    }
  }

  /**
   * Transcode video to HLS format using FFmpeg with proper segment creation
   */
  private transcodeToHLS(inputPath: string, outputDir: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const outputPath = path.join(outputDir, 'output.m3u8');

      this.logger.log(`Starting HLS transcoding from ${inputPath} to ${outputPath}`);

      const command = ffmpeg(inputPath)
        .addOptions([
          // HLS-specific options
          '-preset', 'veryfast',
          '-crf', '23',
          '-sc_threshold', '0',
          '-g', '48',
          '-keyint_min', '48',
          '-hls_time', '4', // Shorter segments to ensure multiple segments
          '-hls_list_size', '0',
          '-hls_playlist_type', 'vod',
          '-hls_segment_type', 'mpegts',
          '-hls_segment_filename', path.join(outputDir, 'segment%03d.ts'),

          // Video codec
          '-c:v', 'libx264',
          '-profile:v', 'main',
          '-level', '3.1',
          '-pix_fmt', 'yuv420p',
          '-maxrate', '2M',
          '-bufsize', '4M',

          // Audio codec
          '-c:a', 'aac',
          '-ac', '2',
          '-b:a', '128k',

          // Force output format
          '-f', 'hls'
        ])
        .output(outputPath);

      command
        .on('start', (commandLine) => {
          this.logger.log(`FFmpeg command: ${commandLine}`);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            this.logger.log(`Processing: ${Math.round(progress.percent)}% done`);
          }
        })
        .on('stderr', (stderrLine) => {
          this.logger.debug(`FFmpeg: ${stderrLine}`);
        })
        .on('error', (err, stdout, stderr) => {
          this.logger.error('FFmpeg error:', err);
          this.logger.error('FFmpeg stdout:', stdout);
          this.logger.error('FFmpeg stderr:', stderr);
          reject(new Error(`FFmpeg processing failed: ${err.message}`));
        })
        .on('end', (stdout, stderr) => {
          this.logger.log('HLS transcoding complete');
          if (stderr) {
            this.logger.debug('FFmpeg stderr on end:', stderr);
          }
          resolve();
        })
        .run();
    });
  }

  /**
   * Upload all HLS files to Firebase Storage
   */
  private async uploadHLSFiles(
    hlsDir: string,
    videoId: string,
    customName: string
  ): Promise<string> {
    const files = await readdir(hlsDir);
    const uploadPromises: Promise<void>[] = [];

    // Use custom name for the folder, fallback to videoId
    const folderName = customName || videoId;

    this.logger.log(`Starting upload of ${files.length} files to videos/${folderName}/`);

    for (const file of files) {
      const filePath = path.join(hlsDir, file);
      const remotePath = `videos/${folderName}/${file}`;

      const contentType = file.endsWith('.m3u8')
        ? 'application/vnd.apple.mpegurl'
        : 'video/mp2t';

      uploadPromises.push(
        this.uploadFileWithRetry(filePath, remotePath, contentType)
      );
    }

    // Wait for all uploads to complete
    await Promise.all(uploadPromises);

    this.logger.log(`✅ Successfully uploaded ${uploadPromises.length} HLS files to videos/${folderName}/`);

    // Make all files public and return public URL
    await this.makeHLSFilesPublic(folderName);

    return `https://storage.googleapis.com/${bucket.name}/videos/${folderName}/output.m3u8`;
  }

  /**
   * Upload file with retry mechanism
   */
  private async uploadFileWithRetry(
    filePath: string,
    remotePath: string,
    contentType: string,
    maxRetries: number = 3
  ): Promise<void> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`Upload attempt ${attempt}/${maxRetries} for ${remotePath}`);

        // Check file size
        const stats = await fs.promises.stat(filePath);
        this.logger.log(`Uploading ${remotePath} (${(stats.size / 1024).toFixed(2)} KB)`);

        await bucket.upload(filePath, {
          destination: remotePath,
          metadata: {
            contentType,
            cacheControl: 'public, max-age=31536000',
          },
        });

        this.logger.log(`Successfully uploaded: ${remotePath}`);
        return;

      } catch (error) {
        lastError = error;
        this.logger.warn(`Upload attempt ${attempt} failed for ${remotePath}: ${error.message}`);

        if (attempt < maxRetries) {
          const retryDelay = 2000 * attempt;
          this.logger.log(`Retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));

        }
      }
    }

    throw new Error(`Failed to upload ${remotePath} after ${maxRetries} attempts:`);
  }

  /**
   * Make all HLS files publicly accessible
   */
  private async makeHLSFilesPublic(folderName: string): Promise<void> {
    try {
      const [files] = await bucket.getFiles({
        prefix: `videos/${folderName}/`
      });

      const makePublicPromises = files.map(file => {
        this.logger.log(`Making file public: ${file.name}`);
        return file.makePublic();
      });

      await Promise.all(makePublicPromises);
      this.logger.log(`✅ Made ${files.length} files publicly accessible in videos/${folderName}/`);
    } catch (error) {
      this.logger.error('Error making files public:', error);
      throw error;
    }
  }

  /**
   * Cleanup temp directory
   */
  private async cleanupTempDir(tempDir: string): Promise<void> {
    try {
      if (fs.existsSync(tempDir)) {
        await rm(tempDir, { recursive: true, force: true });
        this.logger.log('🧹 Temp directory cleaned up');
      }
    } catch (error) {
      this.logger.warn('Failed to cleanup temp directory:', error);
    }
  }

  /**
   * Get public URL for HLS manifest
   */
  async getPublicUrl(remotePath: string): Promise<string> {
    const manifestFile = bucket.file(`videos/${remotePath}/output.m3u8`);
    return `https://storage.googleapis.com/${bucket.name}/${manifestFile.name}`;
  }

  /**
   * Alternative: Simple HLS transcoding with guaranteed multiple segments
   */
  async createHLSWithMultipleSegments(fileBuffer: Buffer, filename: string): Promise<string> {
    const videoId = uuidv4();
    const tempDir = path.join(os.tmpdir(), 'mboko-fit-uploads', videoId);
    const inputPath = path.join(tempDir, 'input.mp4');
    const outputDir = path.join(tempDir, 'hls');

    try {
      // Create temp directories
      await fs.promises.mkdir(tempDir, { recursive: true });
      await fs.promises.mkdir(outputDir, { recursive: true });

      // Write input file
      await fs.promises.writeFile(inputPath, fileBuffer);

      // Use simpler FFmpeg command that reliably creates multiple segments
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .outputOptions([
            '-hls_time', '2', // Very short segments to ensure multiple segments
            '-hls_list_size', '0',
            '-hls_segment_filename', path.join(outputDir, 'segment%03d.ts'),
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-f', 'hls'
          ])
          .output(path.join(outputDir, 'output.m3u8'))
          .on('end', resolve)
          .on('error', reject)
          .run();
      });

      // Verify segments were created
      const files = await readdir(outputDir);
      const segmentFiles = files.filter(file => file.endsWith('.ts'));
      this.logger.log(`Created ${segmentFiles.length} segment files`);

      if (segmentFiles.length <= 1) {
        throw new Error(`Only ${segmentFiles.length} segment was created. Expected multiple segments.`);
      }

      // Upload files
      const manifestUrl = await this.uploadHLSFiles(outputDir, videoId, filename);

      await this.cleanupTempDir(tempDir);
      return manifestUrl;

    } catch (error) {
      await this.cleanupTempDir(tempDir);
      throw error;
    }
  }
}