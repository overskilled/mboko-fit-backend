"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideosController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const videos_service_1 = require("./videos.service");
let VideosController = class VideosController {
    videosService;
    constructor(videosService) {
        this.videosService = videosService;
    }
    async getSignedVideoUrl(name) {
        if (!name) {
            return { error: 'Video name is required' };
        }
        const url = await this.videosService.getPublicUrl(name);
        return { url };
    }
    async uploadVideo(file, fileName) {
        if (!file)
            throw new common_1.BadRequestException('File is required');
        return this.videosService.transcodeToHLSAndUpload(file.buffer, fileName);
    }
    async makeVideoPublic(name) {
        if (!name) {
            throw new common_1.BadRequestException('Video name is required');
        }
        try {
            const result = await this.videosService.makeVideoFilesPublic(name);
            return {
                success: result.success,
                message: result.message,
                files: result.files,
                fileCount: result.files.length
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to make video public: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async forceMakeVideoPublic(name) {
        if (!name) {
            throw new common_1.BadRequestException('Video name is required');
        }
        try {
            const result = await this.videosService.forceMakeVideoPublic(name);
            return {
                success: result.success,
                message: result.message
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to force make video public: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async makeAllVideosPublic() {
        try {
            const result = await this.videosService.makeAllVideosPublic();
            return {
                success: result.success,
                message: result.message,
                processedVideos: result.processedVideos,
                processedCount: result.processedVideos.length
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to make all videos public: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async listVideos() {
        try {
            const result = await this.videosService.listVideoFolders();
            return {
                success: result.success,
                folders: result.folders,
                count: result.folders.length
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to list videos: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async checkVideoAccess(name) {
        if (!name) {
            throw new common_1.BadRequestException('Video name is required');
        }
        try {
            const result = await this.videosService.checkVideoAccess(name);
            return {
                success: result.success,
                isPublic: result.isPublic,
                publicFiles: result.publicFiles,
                privateFiles: result.privateFiles,
                message: result.message,
                publicCount: result.publicFiles.length,
                privateCount: result.privateFiles.length
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to check video access: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.VideosController = VideosController;
__decorate([
    (0, common_1.Get)('public-url'),
    __param(0, (0, common_1.Query)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "getSignedVideoUrl", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Query)("fileName")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "uploadVideo", null);
__decorate([
    (0, common_1.Post)('make-public'),
    __param(0, (0, common_1.Query)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "makeVideoPublic", null);
__decorate([
    (0, common_1.Post)('force-make-public'),
    __param(0, (0, common_1.Query)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "forceMakeVideoPublic", null);
__decorate([
    (0, common_1.Post)('make-all-public'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "makeAllVideosPublic", null);
__decorate([
    (0, common_1.Get)('list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "listVideos", null);
__decorate([
    (0, common_1.Get)('check-access'),
    __param(0, (0, common_1.Query)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "checkVideoAccess", null);
exports.VideosController = VideosController = __decorate([
    (0, common_1.Controller)('videos'),
    __metadata("design:paramtypes", [videos_service_1.VideosService])
], VideosController);
//# sourceMappingURL=videos.controller.js.map