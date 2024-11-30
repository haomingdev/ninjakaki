const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
}

export async function searchYouTubeVideos(query: string): Promise<YouTubeVideo[]> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(
        query + ' financial advice'
      )}&type=video&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('YouTube API request failed');
    }

    const data = await response.json();
    return data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description
    }));
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return [];
  }
}
