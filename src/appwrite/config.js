import conf from '../conf/conf.js';
import { Client, ID, Databases, Storage, Query, Permission, Role, Account } from "appwrite";

export class Service {
    client = new Client();
    databases;
    bucket;

    constructor() {
        this.client
        .setEndpoint(conf.appwriteUrl)
        .setProject(conf.appwriteProjectId);

        this.databases = new Databases(this.client);
        this.bucket = new Storage(this.client);

    }

    // Create a new post / review
    async createPost({
        title,
        slug,
        content,
        featuredImage,
        status,
        userId,
        productName,
        category,
        rating,
        reviewerName,
    }) {
        try {
        return await this.databases.createDocument({
            databaseId: conf.appwriteDatabaseId,
            collectionId: conf.appwriteTablesId,
            documentId: slug,
            data: {
            title,
            content,
            featuredImage,
            status,
            userId,
            productName,
            category,
            rating,
            reviewerName,
            },
            permissions: [
            Permission.read(Role.any()), 
            Permission.update(Role.user(userId)), 
            Permission.delete(Role.user(userId)), 
            ],
        });
        } catch (error) {
        console.log("Appwrite service :: createPost :: error", error);
        }
    }

    // Update an existing post / review
    async updatePost(slug, {
        title,
        slug: newSlug,
        content,
        featuredImage,
        status,
        productName,
        category,
        rating,
        reviewerName,
    }) {
        try {
        return await this.databases.updateDocument({
            databaseId: conf.appwriteDatabaseId,
            collectionId: conf.appwriteTablesId,
            documentId: slug,
            data: {
            title,
            content,
            featuredImage,
            status,
            productName,
            category,
            rating,
            reviewerName,
            },
        });
        } catch (error) {
        console.log("Appwrite service :: updatePost :: error", error);
        }
    }

    // Delete a post
    async deletePost(slug) {
        try {
        await this.databases.deleteDocument({
            databaseId: conf.appwriteDatabaseId,
            collectionId: conf.appwriteTablesId,
            documentId: slug,
        });
        return true;
        } catch (error) {
        console.log("Appwrite service :: deletePost :: error", error);
        return false;
        }
    }

    async getPost(slug) {
        try {
        return await this.databases.getDocument({
            databaseId: conf.appwriteDatabaseId,
            collectionId: conf.appwriteTablesId,
            documentId: slug,
        });
        } catch (error) {
        console.log("Appwrite service :: getPost :: error", error);
        }
    }

    async getPosts(queries = [Query.equal("status", "active")]) {
        try {
        return await this.databases.listDocuments({
            databaseId: conf.appwriteDatabaseId,
            collectionId: conf.appwriteTablesId,
            queries: queries,
        });
        } catch (error) {
        console.log("Appwrite service :: getPosts :: error", error);
        return false;
        }
    }

    // file upload service

    async uploadFile(file) {
        try {
        return await this.bucket.createFile({
            bucketId: conf.appwriteBucketId,
            fileId: ID.unique(),
            file: file,
        });
        } catch (error) {
        console.log("Appwrite service :: uploadFile :: error", error);
        }
    }

    async deleteFile(fileId) {
        try {
        await this.bucket.deleteFile({
            bucketId: conf.appwriteBucketId,
            fileId: fileId,
        });
        return true;
        } catch (error) {
        console.log("Appwrite service :: deleteFile :: error", error);
        return false;
        }
    }

    getFilePreview(fileId) {
        if (!fileId) return null;

        try {
        return this.bucket.getFileView({
            bucketId: conf.appwriteBucketId,
            fileId: fileId,
        });
        } catch (error) {
        console.log("Appwrite service :: getFilePreview :: error", error);
        return null;
        }
    }

    // ============ COMMENTS ============

    // Create a new comment
    async createComment({ postId, parentId = null, userId, userName, content }) {
        try {
            return await this.databases.createDocument({
                databaseId: conf.appwriteDatabaseId,
                collectionId: conf.appwriteCommentsId,
                documentId: ID.unique(),
                data: {
                    postId,
                    parentId,
                    userId,
                    userName,
                    content,
                },
                permissions: [
                    Permission.read(Role.any()),
                    Permission.update(Role.user(userId)),
                    Permission.delete(Role.user(userId)),
                ],
            });
        } catch (error) {
            console.log("Appwrite service :: createComment :: error", error);
            throw error;
        }
    }

    // Get all comments for a post
    async getComments(postId) {
        try {
            return await this.databases.listDocuments({
                databaseId: conf.appwriteDatabaseId,
                collectionId: conf.appwriteCommentsId,
                queries: [
                    Query.equal("postId", postId),
                    Query.orderAsc("$createdAt"),
                ],
            });
        } catch (error) {
            console.log("Appwrite service :: getComments :: error", error);
            return { documents: [] };
        }
    }

    // Delete a comment
    async deleteComment(commentId) {
        try {
            await this.databases.deleteDocument({
                databaseId: conf.appwriteDatabaseId,
                collectionId: conf.appwriteCommentsId,
                documentId: commentId,
            });
            return true;
        } catch (error) {
            console.log("Appwrite service :: deleteComment :: error", error);
            return false;
        }
    }
}

const service = new Service();
export default service;
