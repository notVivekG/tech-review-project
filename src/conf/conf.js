const conf = {
    appwriteUrl: String(import.meta.env.VITE_APPWRITE_URL),
    appwriteProjectId: String(import.meta.env.VITE_APPWRITE_PROJECT_ID),
    appwriteDatabaseId: String(import.meta.env.VITE_APPWRITE_DATABASE_ID),
    appwriteTablesId: String(import.meta.env.VITE_APPWRITE_TABLES_ID),
    appwriteBucketId: String(import.meta.env.VITE_APPWRITE_BUCKET_ID),
    appwriteCommentsId: String(import.meta.env.VITE_APPWRITE_COMMENTS_ID),
    unsplashAccessKey: String(import.meta.env.VITE_UNSPLASH_ACCESS_KEY || ''),
}

export default conf;
