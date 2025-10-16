export declare class VideosService {
    private readonly logger;
    transcodeToHLSAndUpload(fileBuffer: Buffer, filename: string): Promise<string>;
    private transcodeToHLS;
    private uploadHLSFiles;
    private uploadFileWithRetry;
    private makeHLSFilesPublic;
    private cleanupTempDir;
    getPublicUrl(remotePath: string): Promise<string>;
    createHLSWithMultipleSegments(fileBuffer: Buffer, filename: string): Promise<string>;
}
