export interface SearchProps {
    onSearch: (query: string) => void;
  }
  
  export interface TagCloudProps {
    onTagClick: (tag: string) => void;
  }
  
  export interface ThreeSceneProps {
    triggerNewNode: boolean;
  }