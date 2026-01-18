const { instagramGetUrl } = require('instagram-url-direct');

async function test() {
    try {
        // Use a known public reel URL
        const url = "https://www.instagram.com/reel/C7k5CKVx9_q/";
        const result = await instagramGetUrl(url);
        console.log("Keys:", Object.keys(result));
        console.log("Full Result:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error(e);
    }
}

test();
