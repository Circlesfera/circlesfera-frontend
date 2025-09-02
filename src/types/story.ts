export interface Story {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
    fullName?: string;
  };
  type: 'image' | 'video' | 'text';
  content: {
    image?: {
      url: string;
      alt: string;
      width: number;
      height: number;
    };
    video?: {
      url: string;
      duration: number;
      thumbnail: string;
      width: number;
      height: number;
    };
    text?: {
      content: string;
      backgroundColor: string;
      textColor: string;
      fontSize: number;
      fontFamily: string;
    };
  };
  caption?: string;
  location?: {
    name: string;
    coordinates?: {
      type: string;
      coordinates: number[];
    };
  };
  views: Array<{
    user: string;
    viewedAt: string;
  }>;
  reactions: Array<{
    user: string;
    type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';
    createdAt: string;
  }>;
  replies: Array<{
    user: string;
    content: string;
    createdAt: string;
  }>;
  isPublic: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithStories {
  _id: string;
  username: string;
  avatar?: string;
  fullName?: string;
  latestStory: Story;
  storiesCount: number;
}
