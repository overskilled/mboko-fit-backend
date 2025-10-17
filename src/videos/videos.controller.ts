import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Query,
  Get,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideosService } from './videos.service';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) { }

  @Get('public-url')
  async getSignedVideoUrl(@Query('name') name: string) {
    if (!name) {
      return { error: 'Video name is required' };
    }

    // Example: name = "my-video-folder/output.m3u8"
    const url = await this.videosService.getPublicUrl(name);
    return { url };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(@UploadedFile() file: any, @Query("fileName") fileName: string) {
    if (!file) throw new BadRequestException('File is required');
    return this.videosService.transcodeToHLSAndUpload(file.buffer, fileName);
  }

  /**
  * Make specific video files public
  */
  @Post('make-public')
  async makeVideoPublic(@Query('name') name: string) {
    if (!name) {
      throw new BadRequestException('Video name is required');
    }

    try {
      const result = await this.videosService.makeVideoFilesPublic(name);
      return {
        success: result.success,
        message: result.message,
        files: result.files,
        fileCount: result.files.length
      };
    } catch (error) {
      throw new HttpException(
        `Failed to make video public: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Force make video public with retries
   */
  @Post('force-make-public')
  async forceMakeVideoPublic(@Query('name') name: string) {
    if (!name) {
      throw new BadRequestException('Video name is required');
    }

    try {
      const result = await this.videosService.forceMakeVideoPublic(name);
      return {
        success: result.success,
        message: result.message
      };
    } catch (error) {
      throw new HttpException(
        `Failed to force make video public: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Make ALL videos public (use with caution)
   */
  @Post('make-all-public')
  async makeAllVideosPublic() {
    try {
      const result = await this.videosService.makeAllVideosPublic();
      return {
        success: result.success,
        message: result.message,
        processedVideos: result.processedVideos,
        processedCount: result.processedVideos.length
      };
    } catch (error) {
      throw new HttpException(
        `Failed to make all videos public: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * List all available video folders
   */
  @Get('list')
  async listVideos() {
    try {
      const result = await this.videosService.listVideoFolders();
      return {
        success: result.success,
        folders: result.folders,
        count: result.folders.length
      };
    } catch (error) {
      throw new HttpException(
        `Failed to list videos: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Check if a video is publicly accessible
   */
  @Get('check-access')
  async checkVideoAccess(@Query('name') name: string) {
    if (!name) {
      throw new BadRequestException('Video name is required');
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
    } catch (error) {
      throw new HttpException(
        `Failed to check video access: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
