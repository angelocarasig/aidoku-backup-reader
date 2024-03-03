export interface Manga {
  id: string;
  title: string;
  sourceId: string;
}

export interface LibraryItem {
  mangaId: string;
  categories: string[];
  sourceId: string;
  dateAdded: number; // or Date if you convert the number to a Date object
}
