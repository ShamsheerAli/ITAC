import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import mongoose from "mongoose";
import zlib from "zlib";
import fs from "fs";
import path from "path";

export const performBackup = async () => {
    const s3Client = new S3Client({
        region: process.env.AWS_REGION!,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        }
    });

    const bucketName = process.env.AWS_BUCKET_NAME!;
    console.log("🔄 Starting ITAC Portal Backup Process...");
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    try {
        if (mongoose.connection.readyState !== 1) {
            await new Promise((resolve) => mongoose.connection.once('open', resolve));
        }

        // --- PART 1: DATABASE BACKUP ---
        console.log("📦 Exporting MongoDB collections...");
        const db = mongoose.connection.db!;
        const collections = await db.collections();
        const backupData: Record<string, any[]> = {};

        for (const collection of collections) {
            backupData[collection.collectionName] = await collection.find({}).toArray();
        }

        console.log("🗜️ Compressing database backup...");
        const compressedBuffer = zlib.gzipSync(JSON.stringify(backupData, null, 2));

        const dbKey = `itac-backups/backup-${timestamp}.json.gz`;
        await s3Client.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: dbKey,
            Body: compressedBuffer,
            ContentType: "application/gzip",
        }));
        console.log(`✅ Database uploaded to S3: ${dbKey}`);

        // --- PART 2: UPLOADED CLIENT FILES SYNC ---
        const uploadsDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadsDir)) {
            console.log("ℹ️ No local uploads folder found to sync.");
            return;
        }

        console.log("📁 Syncing client documents to AWS S3...");

        // Fetch list of files already backed up in S3 so we don't re-upload duplicates
        const existingKeys = new Set<string>();
        let continuationToken: string | undefined;

        do {
            const listRes = await s3Client.send(new ListObjectsV2Command({
                Bucket: bucketName,
                Prefix: "itac-uploads/",
                ContinuationToken: continuationToken,
            }));
            listRes.Contents?.forEach(obj => {
                if (obj.Key) existingKeys.add(obj.Key);
            });
            continuationToken = listRes.NextContinuationToken;
        } while (continuationToken);

        const localFiles = fs.readdirSync(uploadsDir);
        let uploadedCount = 0;

        for (const fileName of localFiles) {
            const fullPath = path.join(uploadsDir, fileName);
            if (!fs.statSync(fullPath).isFile()) continue;

            const s3Key = `itac-uploads/${fileName}`;
            if (existingKeys.has(s3Key)) continue; // Already backed up

            await s3Client.send(new PutObjectCommand({
                Bucket: bucketName,
                Key: s3Key,
                Body: fs.createReadStream(fullPath),
            }));
            uploadedCount++;
        }

        console.log(`✅ File sync complete: ${uploadedCount} new file(s) uploaded to S3.`);
    } catch (error) {
        console.error("❌ Backup Process Failed:", error);
    }
};