"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var VideosService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideosService = void 0;
const common_1 = require("@nestjs/common");
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const config_1 = require("../firestore/config");
const uuid_1 = require("uuid");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const util_1 = require("util");
const promises_1 = require("fs/promises");
const readdir = (0, util_1.promisify)(fs.readdir);
let VideosService = VideosService_1 = class VideosService {
    logger = new common_1.Logger(VideosService_1.name);
    async makeVideoFilesPublic(folderName) {
        try {
            this.logger.log(`Making files public for video: ${folderName}`);
            const [files] = await config_1.bucket.getFiles({
                prefix: `videos/${folderName}/`
            });
            if (files.length === 0) {
                throw new Error(`No files found for video: ${folderName}`);
            }
            this.logger.log(`Found ${files.length} files to make public`);
            const processedFiles = [];
            const errors = [];
            for (const file of files) {
                try {
                    const [metadata] = await file.getMetadata();
                    const isPublic = metadata.acl?.some(entry => entry.entity === 'allUsers' && entry.role === 'READER');
                    if (!isPublic) {
                        await file.makePublic();
                        this.logger.log(`✅ Made public: ${file.name}`);
                    }
                    else {
                        this.logger.log(`ℹ️ Already public: ${file.name}`);
                    }
                    processedFiles.push(file.name);
                }
                catch (fileError) {
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
        }
        catch (error) {
            this.logger.error(`Error making files public for ${folderName}:`, error);
            throw error;
        }
    }
    async makeAllVideosPublic() {
        try {
            this.logger.log('Making ALL videos public...');
            const [files] = await config_1.bucket.getFiles({
                prefix: 'videos/'
            });
            if (files.length === 0) {
                throw new Error('No video files found in storage');
            }
            const videoFolders = new Map();
            files.forEach(file => {
                const pathParts = file.name.split('/');
                if (pathParts.length >= 2) {
                    const folderName = pathParts[1];
                    if (!videoFolders.has(folderName)) {
                        videoFolders.set(folderName, []);
                    }
                    videoFolders.get(folderName).push(file.name);
                }
            });
            this.logger.log(`Found ${videoFolders.size} video folders`);
            const processedVideos = [];
            const errors = [];
            for (const [folderName, filePaths] of videoFolders) {
                try {
                    await this.makeVideoFilesPublic(folderName);
                    processedVideos.push(folderName);
                    this.logger.log(`✅ Processed video: ${folderName}`);
                }
                catch (folderError) {
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
        }
        catch (error) {
            this.logger.error('Error making all videos public:', error);
            throw error;
        }
    }
    async listVideoFolders() {
        try {
            const [files] = await config_1.bucket.getFiles({
                prefix: 'videos/'
            });
            const folders = new Set();
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
        }
        catch (error) {
            this.logger.error('Error listing video folders:', error);
            throw error;
        }
    }
    async checkVideoAccess(folderName) {
        try {
            const [files] = await config_1.bucket.getFiles({
                prefix: `videos/${folderName}/`
            });
            if (files.length === 0) {
                throw new Error(`No files found for video: ${folderName}`);
            }
            const publicFiles = [];
            const privateFiles = [];
            for (const file of files) {
                const [metadata] = await file.getMetadata();
                const isPublic = metadata.acl?.some(entry => entry.entity === 'allUsers' && entry.role === 'READER');
                if (isPublic) {
                    publicFiles.push(file.name);
                }
                else {
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
        }
        catch (error) {
            this.logger.error(`Error checking access for ${folderName}:`, error);
            throw error;
        }
    }
    async forceMakeVideoPublic(folderName, maxRetries = 3) {
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                this.logger.log(`Force making public attempt ${attempt}/${maxRetries} for: ${folderName}`);
                const result = await this.makeVideoFilesPublic(folderName);
                const accessCheck = await this.checkVideoAccess(folderName);
                if (!accessCheck.isPublic) {
                    throw new Error(`Files still not public after makePublic call: ${accessCheck.privateFiles.join(', ')}`);
                }
                this.logger.log(`✅ Successfully force made ${folderName} public on attempt ${attempt}`);
                return {
                    success: true,
                    message: `Video '${folderName}' is now publicly accessible with ${result.files.length} files`
                };
            }
            catch (error) {
                lastError = error;
                this.logger.warn(`Attempt ${attempt} failed: ${error.message}`);
                if (attempt < maxRetries) {
                    const retryDelay = 1000 * attempt;
                    this.logger.log(`Retrying in ${retryDelay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                }
            }
        }
        throw new Error(`Failed to make ${folderName} public after ${maxRetries} attempts: `);
    }
    async transcodeToHLSAndUpload(fileBuffer, filename) {
        const videoId = (0, uuid_1.v4)();
        const tempDir = path.join(os.tmpdir(), 'mboko-fit-uploads', videoId);
        const inputPath = path.join(tempDir, 'input.mp4');
        const outputDir = path.join(tempDir, 'hls');
        const outputPath = path.join(outputDir, 'output.m3u8');
        try {
            await fs.promises.mkdir(tempDir, { recursive: true });
            await fs.promises.mkdir(outputDir, { recursive: true });
            this.logger.log(`Created temp directory: ${tempDir}`);
            await fs.promises.writeFile(inputPath, fileBuffer);
            this.logger.log(`Input file written: ${inputPath} (${fileBuffer.length} bytes)`);
            await this.transcodeToHLS(inputPath, outputDir);
            const manifestUrl = await this.uploadHLSFiles(outputDir, videoId, filename);
            await this.cleanupTempDir(tempDir);
            return manifestUrl;
        }
        catch (error) {
            await this.cleanupTempDir(tempDir).catch(cleanupError => {
                this.logger.warn('Cleanup failed after error', cleanupError);
            });
            this.logger.error('Transcoding and upload failed', error);
            throw error;
        }
    }
    transcodeToHLS(inputPath, outputDir) {
        return new Promise((resolve, reject) => {
            const outputPath = path.join(outputDir, 'output.m3u8');
            this.logger.log(`Starting HLS transcoding from ${inputPath} to ${outputPath}`);
            const command = (0, fluent_ffmpeg_1.default)(inputPath)
                .addOptions([
                '-preset', 'veryfast',
                '-crf', '23',
                '-sc_threshold', '0',
                '-g', '48',
                '-keyint_min', '48',
                '-hls_time', '4',
                '-hls_list_size', '0',
                '-hls_playlist_type', 'vod',
                '-hls_segment_type', 'mpegts',
                '-hls_segment_filename', path.join(outputDir, 'segment%03d.ts'),
                '-c:v', 'libx264',
                '-profile:v', 'main',
                '-level', '3.1',
                '-pix_fmt', 'yuv420p',
                '-maxrate', '2M',
                '-bufsize', '4M',
                '-c:a', 'aac',
                '-ac', '2',
                '-b:a', '128k',
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
    async uploadHLSFiles(hlsDir, videoId, customName) {
        const files = await readdir(hlsDir);
        const uploadPromises = [];
        const folderName = customName || videoId;
        this.logger.log(`Starting upload of ${files.length} files to videos/${folderName}/`);
        for (const file of files) {
            const filePath = path.join(hlsDir, file);
            const remotePath = `videos/${folderName}/${file}`;
            const contentType = file.endsWith('.m3u8')
                ? 'application/vnd.apple.mpegurl'
                : 'video/mp2t';
            uploadPromises.push(this.uploadFileWithRetry(filePath, remotePath, contentType));
        }
        await Promise.all(uploadPromises);
        this.logger.log(`✅ Successfully uploaded ${uploadPromises.length} HLS files to videos/${folderName}/`);
        await this.makeHLSFilesPublic(folderName);
        return `https://storage.googleapis.com/${config_1.bucket.name}/videos/${folderName}/output.m3u8`;
    }
    async uploadFileWithRetry(filePath, remotePath, contentType, maxRetries = 3) {
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                this.logger.log(`Upload attempt ${attempt}/${maxRetries} for ${remotePath}`);
                const stats = await fs.promises.stat(filePath);
                this.logger.log(`Uploading ${remotePath} (${(stats.size / 1024).toFixed(2)} KB)`);
                await config_1.bucket.upload(filePath, {
                    destination: remotePath,
                    metadata: {
                        contentType,
                        cacheControl: 'public, max-age=31536000',
                    },
                });
                this.logger.log(`Successfully uploaded: ${remotePath}`);
                return;
            }
            catch (error) {
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
    async makeHLSFilesPublic(folderName) {
        try {
            const [files] = await config_1.bucket.getFiles({
                prefix: `videos/${folderName}/`
            });
            const makePublicPromises = files.map(file => {
                this.logger.log(`Making file public: ${file.name}`);
                return file.makePublic();
            });
            await Promise.all(makePublicPromises);
            this.logger.log(`✅ Made ${files.length} files publicly accessible in videos/${folderName}/`);
        }
        catch (error) {
            this.logger.error('Error making files public:', error);
            throw error;
        }
    }
    async cleanupTempDir(tempDir) {
        try {
            if (fs.existsSync(tempDir)) {
                await (0, promises_1.rm)(tempDir, { recursive: true, force: true });
                this.logger.log('🧹 Temp directory cleaned up');
            }
        }
        catch (error) {
            this.logger.warn('Failed to cleanup temp directory:', error);
        }
    }
    async getPublicUrl(remotePath) {
        const manifestFile = config_1.bucket.file(`videos/${remotePath}/output.m3u8`);
        return `https://storage.googleapis.com/${config_1.bucket.name}/${manifestFile.name}`;
    }
    async createHLSWithMultipleSegments(fileBuffer, filename) {
        const videoId = (0, uuid_1.v4)();
        const tempDir = path.join(os.tmpdir(), 'mboko-fit-uploads', videoId);
        const inputPath = path.join(tempDir, 'input.mp4');
        const outputDir = path.join(tempDir, 'hls');
        try {
            await fs.promises.mkdir(tempDir, { recursive: true });
            await fs.promises.mkdir(outputDir, { recursive: true });
            await fs.promises.writeFile(inputPath, fileBuffer);
            await new Promise((resolve, reject) => {
                (0, fluent_ffmpeg_1.default)(inputPath)
                    .outputOptions([
                    '-hls_time', '2',
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
            const files = await readdir(outputDir);
            const segmentFiles = files.filter(file => file.endsWith('.ts'));
            this.logger.log(`Created ${segmentFiles.length} segment files`);
            if (segmentFiles.length <= 1) {
                throw new Error(`Only ${segmentFiles.length} segment was created. Expected multiple segments.`);
            }
            const manifestUrl = await this.uploadHLSFiles(outputDir, videoId, filename);
            await this.cleanupTempDir(tempDir);
            return manifestUrl;
        }
        catch (error) {
            await this.cleanupTempDir(tempDir);
            throw error;
        }
    }
};
exports.VideosService = VideosService;
exports.VideosService = VideosService = VideosService_1 = __decorate([
    (0, common_1.Injectable)()
], VideosService);
//# sourceMappingURL=videos.service.js.map