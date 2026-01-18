declare module 'instagram-url-direct' {
    interface InstagramResponse {
        url_list: string[];
        results_number: number;
    }

    export function instagramGetUrl(url: string): Promise<InstagramResponse>;
}
