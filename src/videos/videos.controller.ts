import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Query,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideosService } from './videos.service';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

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
}
