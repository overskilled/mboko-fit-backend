export declare class VideosService {
    private readonly logger;
    makeVideoFilesPublic(folderName: string): Promise<{
        success: boolean;
        message: string;
        files: string[];
    }>;
    makeAllVideosPublic(): Promise<{
        success: boolean;
        message: string;
        processedVideos: string[];
    }>;
    listVideoFolders(): Promise<{
        success: boolean;
        folders: string[];
    }>;
    checkVideoAccess(folderName: string): Promise<{
        success: boolean;
        isPublic: boolean;
        publicFiles: string[];
        privateFiles: string[];
        message: string;
    }>;
    forceMakeVideoPublic(folderName: string, maxRetries?: number): Promise<{
        success: boolean;
        message: string;
    }>;
    transcodeToHLSAndUpload(fileBuffer: Buffer, filename: string): Promise<string>;
    private transcodeToHLS;
    private uploadHLSFiles;
    private uploadFileWithRetry;
    private makeHLSFilesPublic;
    private cleanupTempDir;
    getPublicUrl(remotePath: string): Promise<string>;
    createHLSWithMultipleSegments(fileBuffer: Buffer, filename: string): Promise<string>;
}
