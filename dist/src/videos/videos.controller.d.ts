import { VideosService } from './videos.service';
export declare class VideosController {
    private readonly videosService;
    constructor(videosService: VideosService);
    getSignedVideoUrl(name: string): Promise<{
        error: string;
        url?: undefined;
    } | {
        url: string;
        error?: undefined;
    }>;
    uploadVideo(file: any, fileName: string): Promise<string>;
    makeVideoPublic(name: string): Promise<{
        success: boolean;
        message: string;
        files: string[];
        fileCount: number;
    }>;
    forceMakeVideoPublic(name: string): Promise<{
        success: boolean;
        message: string;
    }>;
    makeAllVideosPublic(): Promise<{
        success: boolean;
        message: string;
        processedVideos: string[];
        processedCount: number;
    }>;
    listVideos(): Promise<{
        success: boolean;
        folders: string[];
        count: number;
    }>;
    checkVideoAccess(name: string): Promise<{
        success: boolean;
        isPublic: boolean;
        publicFiles: string[];
        privateFiles: string[];
        message: string;
        publicCount: number;
        privateCount: number;
    }>;
}
