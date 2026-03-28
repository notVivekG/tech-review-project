import conf from '../conf/conf';

/**
 * Search for product images using Unsplash API
 * @param {string} query - Product name to search for
 * @returns {Promise<Array>} - Array of image objects with urls
 */
export async function searchProductImages(query) {
    if (!conf.unsplashAccessKey) {
        throw new Error('Unsplash API key not configured');
    }

    const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query + ' product')}&per_page=6&orientation=landscape`,
        {
            headers: {
                Authorization: `Client-ID ${conf.unsplashAccessKey}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error('Failed to fetch images');
    }

    const data = await response.json();
    
    return data.results.map((img) => ({
        id: img.id,
        url: img.urls.regular,
        thumb: img.urls.thumb,
        alt: img.alt_description || query,
        photographer: img.user.name,
        photographerUrl: img.user.links.html,
    }));
}

/**
 * Download image from URL and convert to File object for upload
 * @param {string} imageUrl - URL of the image to download
 * @param {string} filename - Name for the file
 * @returns {Promise<File>} - File object ready for upload
 */
export async function urlToFile(imageUrl, filename = 'product-image.jpg') {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
}
